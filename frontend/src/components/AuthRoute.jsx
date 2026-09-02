import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
    const { token, isVerified } = useSelector((state) => state.auth);

    if (!token) {
        return <Navigate to="/signup" />;
    }

    if (!isVerified) {
        return <Navigate to="/verify" />;
    }

    return <Outlet />;
};

export const GuestRoute = () => {
    const { token, isVerified } = useSelector((state) => state.auth);
    return (token && isVerified === true) ? <Navigate to="/explore/global" /> : token ? <Navigate to='/verify'/> : <Outlet />;
};