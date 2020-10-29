import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false, 
  userId: null,
  login: () => {
    AuthContext.isLoggedIn = true;
  }, 
  logout: () => {
    AuthContext.isLoggedIn = false;
  } 
});