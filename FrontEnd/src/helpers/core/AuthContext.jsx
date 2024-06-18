/* eslint-disable no-param-reassign */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Api from './Api';

export const AuthStatus = {
  Loading: 0,
  SignedIn: 1,
  SignedOut: -1
};

let refreshTokenPromise = false;

const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [authStatus, setAuthStatus] = useState(AuthStatus.Loading);
  const [logged, setLogged] = useState({});

  const signIn = useCallback(
    (email, password, afterSignIn = () => {}) =>
      Api.post('/auth/login', { email, password }).then(async res => {
        setLogged(res.data);
        setAuthStatus(AuthStatus.SignedIn);
        return afterSignIn();
      }),
    []
  );

  const signOut = useCallback(async (afterSignOut = () => {}) => {
    setAuthStatus(AuthStatus.SignedOut);
    setLogged({});
    await Api.get('/auth/logout');
    return afterSignOut();
  }, []);

  const retryRT = (prevRequest, error) => {
    try {
      prevRequest.__isRetryRequest = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = Api.get('/auth/rt')
          .then(async res => {
            if (!res) {
              refreshTokenPromise = false;
              return Promise.reject(error);
            }

            refreshTokenPromise = false;
            return res;
          })
          .catch(err => Promise.reject(error));
      }

      return refreshTokenPromise.then(() => Api(prevRequest));
    } catch (err) {
      return signOut();
    }
  };

  const refreshTokenInterceptor = error => {
    const prevRequest = error?.config;
    const statusCode = error?.response?.status;
    const customErrorCode = error?.response?.data?.error;

    if (customErrorCode === 306 || customErrorCode === 307 || customErrorCode === 308) return signOut();

    if (statusCode === 401 && !prevRequest?.__isRetryRequest) return retryRT(prevRequest, error);

    return Promise.reject(error);
  };

  const resInterceptor = useMemo(() => Api.interceptors.response.use(res => res, refreshTokenInterceptor), []);

  const checkUserStatus = () =>
    Api.get('/auth/check')
      .then(res => {
        if (res.data) {
          setLogged(res.data);
          setAuthStatus(AuthStatus.SignedIn);
        }
      })
      .catch(() => {
        setAuthStatus(AuthStatus.SignedOut);
      });

  useEffect(() => () => Api.interceptors.request.eject(resInterceptor), []);

  useEffect(() => {
    if (authStatus === AuthStatus.Loading) checkUserStatus();
  }, [authStatus]);

  useEffect(() => {
    if (logged?.lang) i18n.changeLanguage(logged.lang.toLowerCase());
  }, [logged]);

  const exportedValue = useMemo(
    () => ({
      signOut,
      signIn,
      logged,
      setLogged,
      setAuthStatus,
      authStatus
    }),
    [logged, authStatus]
  );

  return <AuthContext.Provider value={exportedValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
