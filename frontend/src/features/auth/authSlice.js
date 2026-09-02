import { createSlice } from '@reduxjs/toolkit'
import { updateProfile } from '../../api/user';

const initialState = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isVerified: localStorage.getItem('isVerified') === 'true' || false,
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' || false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user, isVerified } = action.payload;
            state.token = token;
            state.user = user;
            state.isVerified = isVerified;
            state.isAuthenticated = true;

            // Persist all auth state
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isVerified', isVerified);
            localStorage.setItem('isAuthenticated', true);
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isVerified = null;
            state.isAuthenticated = null;

            // Remove all things from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isVerified');
            localStorage.removeItem('isAuthenticated');
        },
        setIsVerified: (state, action) => {
            state.isVerified = action.payload.isVerified;

            localStorage.setItem('isVerified', action.payload.isVerified);
        },
        updateUserProfile: (state, action) => {
            state.user.avatar = action.payload.avatar || state.user.avatar
            state.user.bio = action.payload.bio || state.user.bio

            // Persist changes in localStorage
            localStorage.setItem('user', JSON.stringify(state.user));
        }
    }
})

export const { setCredentials, logout, setIsVerified, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;