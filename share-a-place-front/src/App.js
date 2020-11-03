import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Users from'./user/pages/Users';
import NewPlace from'./places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import PageAuth from './user/pages/PageAuth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';



const App = () => {
  const { token, login, logout, userId } = useAuth();  

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
