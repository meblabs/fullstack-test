import { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

import AuthContext, { AuthStatus } from '../../helpers/core/AuthContext';

const AuthRoute = ({ children, outlet = true }) => {
  const { authStatus } = useContext(AuthContext);
  const location = useLocation();
  if (authStatus !== AuthStatus.SignedIn) {
    return <Navigate to="/login" replace state={{ intended: location?.state?.intended || location.pathname }} />;
  }

  return (
    <>
      {outlet && <Outlet />}
      {children}
    </>
  );
};

export default AuthRoute;
