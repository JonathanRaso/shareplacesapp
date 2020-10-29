import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback (async (url, method = 'GET', body = null, headers = {}) => {
    setIsLoading(true);
    // Logic added in order to stop http request if user change page while the request is sent but not done yet
    const httpAbortCtrl = new AbortController();
    activeHttpRequest.current.push(httpAbortCtrl);

    try {
      const response = fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal
      });
  
      const responseData = await response.json();
          // .ok is a property that exists in the response object. So if there is a 4.. or 5.. http code, we want to throw an error.
          // With fetch(), this codes will not go into our catch block and we are redirected because of the auth.login();
          // So, we need this if block in order to take care of these 4.. or 5.. codes
      if (!response.ok) {
        throw new Error(responseData.message);
      }

      return responseData;
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);   
  }, []);

  const clearError = () => {
    setError(null);
  };

  // Logic added in order to stop http request if user change page while the request is sent but not done yet
  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abort());
    }
  }, []);

  return { isLoading, error, sendRequest, clearError };
};