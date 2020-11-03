import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Users from'./user/pages/Users';
import NewPlace from'./places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import PageAuth from './user/pages/PageAuth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';

const App = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);

  
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    // Generate a new object date that's based on the current time + 1 hour. Our token will expire 1h after creation
    // If we already have an expirationDate for the token, we keep it. Else, we create a new one.
    // We need that because when we refresh the page, it would generate a new 1h token and we don't want that
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    localStorage.setItem(
      'userData',
      JSON.stringify({ 
        userId: uid,
        token: token, 
        expiration: tokenExpirationDate.toISOString() 
      })
    );
    }, []);
    
    const logout = useCallback(() => {
      setToken(null);
      setUserId(null);
      localStorage.removeItem('userData');
    }, []);
    
    // useEffect with empty array [] will only runs once. It also runs after the render cycle
    // Here, there is a dependency (login), but thanks to useCallback(uid, token), login will run only once
    useEffect(() => {
      // JSON.parse converts JSON strings back to regular javascript data structures (like object)
      const storedData = JSON.parse(localStorage.getItem('userData'));
      if (
        storedData && 
        storedData.token && 
        // We check if the expiration date in our token is greater than the actual time. If yes, the token is still valid
        new Date(storedData.expiration) > new Date()
      ) {
        login(storedData.userId, storedData.token, new Date(storedData.expiration));
      }
    }, [login]);

    let routes;
    
    if (token) {
    routes = (
        <Switch>
          <Route path="/" exact>
            <Users />
          </Route>
          <Route path="/:userId/places" exact>
            <UserPlaces />
          </Route>
          <Route path="/places/new" exact>
              <NewPlace />
          </Route>
          <Route path="/places/:placeId" exact>
            <UpdatePlace />
          </Route>
          <Redirect to="/" />
        </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth" exact>
          <PageAuth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    // With context (AuthContext here), we can share state to all the components between the AuContext component
    <AuthContext.Provider 
      value={{ 
        isLoggedIn: !!token,
        token: token, 
        userId: userId, 
        login: login, 
        logout: logout 
      }}
    >
      <Router>
        <MainNavigation />
        <main>
            {/* Two ways to write a route */}
            {/* <Route path="/" component={Users} /> */}
            {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
