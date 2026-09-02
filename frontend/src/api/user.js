import axiosInstance from "./axiosInstance"

export const getUserByName = async (username) => {
    try {
        const response = await axiosInstance.get('/users', {
            params: { username }
        })
        
        return response.data.userByName
    } catch (error) {
        console.error('Failed to fecth user by name:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to fetch user by name';

        throw new Error(errorMessage);
    }
}

export const toggleFriend = async (friendId) => {
    try {
        const response = await axiosInstance.post(`/users/friends/${friendId}`)

        return response.data
    } catch (error) {
        console.error('Failed to toggle friend:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to toggle friend';

        throw new Error(errorMessage);
    }
}

export const getFriends = async () => {
    try {
        const response = await axiosInstance.get(`/users/get-friends`)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch friends:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to fetch friends';

        throw new Error(errorMessage);
    }
}


export const updateProfile = async (formData, userId) => {
    try {

        const response = await axiosInstance.patch(`/users/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

export const updatePassword = async (currentPassword, newPassword) => {
    try {

        const response = await axiosInstance.patch(`/users/update-password`, {
            currentPassword,
            newPassword
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update password');
    }
};

export const searchUsers = async (searchQuery) => {
    try {

        const response = await axiosInstance.get(`/users/search`, {
            params: {
                query: searchQuery
            }
        });

        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search users');
    }
};

export const getRecommendedUsers = async (searchQuery) => {
    try {

        const response = await axiosInstance.get(`/users/recommended`);

        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch recommended users');
    }
};

export const getNotifications = async () => {
    try {

        const response = await axiosInstance.get('/notifications')

        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
}

export const markNotificationRead = async (notificationId) => {
    try {

        const response = await axiosInstance.put(`/notifications/${notificationId}/read`)

        return response.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark notification read');
    }
}