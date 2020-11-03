import { useState, useCallback, useEffect } from 'react';

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);

  
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    // Generate a new object date that's based on the current time + 1 hour. Our token will expire 1h after creation
    // If we already have an expirationDate for the token, we keep it. Else, we create a new one.
    // We need that because when we refresh the page, it would generate a new 1h token and we don't want that
    const tokenDurationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenDurationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({ 
        userId: uid,
        token: token, 
        expiration: tokenDurationDate.toISOString() 
      })
    );
    }, []);
    
    const logout = useCallback(() => {
      setToken(null);
      setTokenExpirationDate(null);
      setUserId(null);
      localStorage.removeItem('userData');
    }, []);

    // Here, if the token changes, we want to work with our timer
    useEffect(() => {
      if (token && tokenExpirationDate) {
        const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
        logoutTimer = setTimeout(logout, remainingTime);
      } else {
        clearTimeout(logoutTimer);
      }
    }, [token, logout, tokenExpirationDate]);
    
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

    return { token, login, logout, userId };
}