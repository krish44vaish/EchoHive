// src/features/user/friendSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    friends: [], // This will store the friend list
    loading: false,
    error: null,
};

const friendSlice = createSlice({
    name: 'friend',
    initialState,
    reducers: {
        setFriends: (state, action) => {
            state.friends = action.payload;
        },
        toggleUserFriend: (state, action) => {
            const index = state.friends.findIndex(friend => friend._id === action.payload._id);
            
            if (index === -1) {
                state.friends.push(action.payload);
            } else {
                state.friends = state.friends.filter(friend => friend._id !== action.payload._id);
            }
        },
        clearFriends: (state) => {
            state.friends = [];
        },
    },
});

export const { setFriends, toggleUserFriend, clearFriends } = friendSlice.actions;
export default friendSlice.reducer;
