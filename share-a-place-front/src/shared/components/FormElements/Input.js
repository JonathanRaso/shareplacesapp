import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

const inputReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators)
      };
    case 'TOUCH':
      return {
        ...state,
        isTouched: true
      }
    default:
      return state;  
  }
}

const Input = ({element, id, label, type, placeholder, rows, errorText, validators, onInput, ...props}) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || '', 
    isTouched: false,
    isValid: props.initialValid || false
  });

  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid)
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    dispatch({
      type: 'CHANGE',
      val: event.target.value, 
      validators: validators
    });
  };

  const touchHandler = () => {
    dispatch({
      type: 'TOUCH'
    });
  };

  const elementType = element === 'input' ? (
    <input
      id={id} 
      type={type} 
      placeholder={placeholder} 
      onChange={changeHandler}
      onBlur={touchHandler}
      value={inputState.value}
    /> 
  ) : (
    <textarea 
      id={id} 
      rows={rows || 3} 
      onChange={changeHandler}
      onBlur={touchHandler} 
      value={inputState.value}  
    />
  ); 

  return (
    <div 
      className={`form-control ${!inputState.isValid && inputState.isTouched && 'form-control--invalid'}`}
    >
      <label htmlFor={id}>{label}</label>
      {elementType}
  {!inputState.isValid && inputState.isTouched && <p>{errorText}</p>}
    </div>
  );
};

export default Input;