import { useContext, useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext, { AuthStatus } from '../../helpers/core/AuthContext';

const GuestRoute = ({ children, outlet = true, forceLogout = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authStatus, signOut } = useContext(AuthContext);

  const [fl, setFl] = useState(forceLogout);

  useEffect(() => {
    // il force logout deve essere fatto solo la prima volta al caricamento del componente e poi disabilitato
    if (authStatus === AuthStatus.SignedIn) {
      if (fl) signOut();
      else {
        const redirectUrl = location?.state?.intended ?? '/';
        navigate(redirectUrl, { replace: true });
      }
    }

    setFl(false);
  }, [authStatus, fl]);

  return (
    <>
      {outlet && <Outlet />}
      {children}
    </>
  );
};

export default GuestRoute;
