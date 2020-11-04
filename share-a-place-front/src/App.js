import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// We need to comment/suppress this imports when we use React.lazy()
// import Users from'./user/pages/Users';
// import NewPlace from'./places/pages/NewPlace';
// import UserPlaces from './places/pages/UserPlaces';
// import UpdatePlace from './places/pages/UpdatePlace';
// import PageAuth from './user/pages/PageAuth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// Here, we split our code and we will download each chunk when we need it. So, the page will load faster.
// Not really useful with this small app, but with larger map it can be great to do so.
// Users will load all the time so we could let this route without React.lazy, but we use it for example.
const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const PageAuth = React.lazy(() => import('./user/pages/PageAuth'));

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
  
  // With context (AuthContext here), we can share state to all the components between the AuContext component
  // If we use React.lazy for splitting our code, we need to wrap our routes inside <Suspense> component
  // fallback will display the loading spinner if our page is too long to load
  // Two ways to write a route
  // <Route path="/" component={Users} />

  return (
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
            <Suspense 
              fallback={
                <div className="center">
                  <LoadingSpinner />
                </div>}
              >
                {routes}
            </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
