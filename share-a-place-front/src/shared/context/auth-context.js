import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false, 
  login: () => {
    AuthContext.isLoggedIn = true;
  }, 
  logout: () => {
    AuthContext.isLoggedIn = false;
  } 
});