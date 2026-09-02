import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://echohive-backend.onrender.com/api', // my base URL
    withCredentials: true, // this will send the cookie
})

// Add token automatically to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

export default axiosInstance;