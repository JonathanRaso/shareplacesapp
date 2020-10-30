import React, { useState, useContext } from 'react';

import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from'../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from'../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './PageAuth.css';

const PageAuth = () => {
  const auth = useContext(AuthContext);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    true
  );
  
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        }, 
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData({
        ...formState.inputs,
        name: {
          value: '',
          isValid: false
        },
        image: {
          value: null,
          isValid: false
        }
      }, false);
    }
    setIsLoginMode(!isLoginMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (isLoginMode) {
      try{
        const responseData = await sendRequest(
          'http://localhost:5000/api/users/login',
          'POST',
          // JSON.stringify will take regular javascript data and convert it to json. Our back expect a body in json format.
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            'Content-Type': 'application/json'
          }
        );  
        auth.login(responseData.user.id);
      } catch (err) {

      }
    } else {
      try {
        // Allow us to send text AND file, we need this here because JSON.stringify only accepts text
        const formData = new FormData();
        formData.append('name', formState.inputs.name.value)
        formData.append('email', formState.inputs.email.value)
        formData.append('password', formState.inputs.password.value)
        formData.append('image', formState.inputs.image.value)
        const responseData = await sendRequest(
          'http://localhost:5000/api/users/signup',
          'POST',
          // formData automatically sets headers, so we don't need to specify 'Content-Type': 'multipart/form-data' for example .
          formData
        );

        auth.login(responseData.user.id);
      } catch (err) {}
    }
  };

  return (
    <>
    <ErrorModal error={error} onClear={clearError}/>
    <Card className="authentication">
      {isLoading && <LoadingSpinner asOverlay/>}
      <h2>{isLoginMode ? 'Login' : 'Signup'}</h2>
      <hr />
      <form onSubmit={authSubmitHandler}>
        {!isLoginMode && (
          <Input 
            element="input" 
            id="name" 
            type="text" 
            label="Your Name" 
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please, enter a name."
            onInput={inputHandler}
          />
        )}
        {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} />}
        <Input 
          id="email"
          element="input"
          type="email"
          label="Email"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email"
          onInput={inputHandler}
        />
        <Input 
          id="password"
          element="input"
          type="password"
          label="Password"
          validators={[VALIDATOR_MINLENGTH(6)]}
          errorText="Please enter a valid password, at least 6 characters"
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          {isLoginMode === true ? 'Login' : 'Signup'}
        </Button>
      </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
    </Card>  
    </>
  );
};

export default PageAuth;