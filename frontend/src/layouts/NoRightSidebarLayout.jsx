import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import styles from '../styles/NoRightSidebarLayout.module.css';
import ShrinkedSidebar from '../components/ShrinkedSidebar';
import SettingsBar from '../components/SettingsBar';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice.js'

const NoRightSidebarLayout = () => {
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(auth.token);
  const [checkingAuth, setCheckingAuth] = useState(true);   // handle initial load/render edge case
  const dispatch=useDispatch()

  // Checking whether user is logged in or not
    useEffect(() => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const isVerified = localStorage.getItem('isVerified') === 'true';
  
      if (token && user) {
        // Redux hasn't restored but localStorage has valid data
        dispatch(setCredentials({ token, user, isVerified }));
        setCheckingAuth(false);
      } else if (!auth.token && !token) {
        // no auth anywhere
        setCheckingAuth(false);
      } else {
        // redux already has token
        setCheckingAuth(false);
      }
    }, [dispatch]);

  if (checkingAuth) return <p> Loading </p>; // or a loading spinner

  if (!isLoggedIn) {
    return <Navigate to="/signup" />;
  }

  return (
    <div className={styles.appLayout}>
      <ShrinkedSidebar/>

      <SettingsBar />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default NoRightSidebarLayout;