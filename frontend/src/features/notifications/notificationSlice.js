import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    readBool: false, //initially
    // when user comes to website no new notification
    // thing will be displayed
};

const chatSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        receiveNotification: (state, action) => {
            state.notifications.push(action.payload);
            state.readBool = true
        },
        setRead: (state) => {
            state.readBool = false
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload
        },
        markRead: (state, action) => {
            const notification = state.notifications.find(n => n._id === action.payload);
            if (notification) {
                notification.isRead = true;
            }        
        }
    },
});

export const { receiveNotification, setRead, setNotifications, markRead } = chatSlice.actions;
export default chatSlice.reducer;