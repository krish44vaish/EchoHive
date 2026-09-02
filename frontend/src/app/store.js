import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice.js'
import friendReducer from '../features/user/friendSlice.js'
import notificationReducer from '../features/notifications/notificationSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        friend: friendReducer,
        notification: notificationReducer,
    },
})