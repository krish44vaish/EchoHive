import axiosInstance from "./axiosInstance"

export const signUpUser = async (name, email, password) => {
    try {
        const response = await axiosInstance.post('/auth/register', {
            name,
            email,
            password
        })
        
        return response.data 
    } catch (error) {
        console.error('Signup failed:', error);
        throw error;
    }
}

export const loginUser = async ( email, password) => {
    try {
        const response = await axiosInstance.post('/auth/login', {
            email,
            password
        })
        
        return response.data 
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export const verifyUser = async (otp) => {
    try {
        const response = await axiosInstance.post('/auth/verify-code', {
            verificationCode: otp
        })
        
        return response.data 
    } catch (error) {
        console.error('Otp verification failed:', error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post('/auth/logout')
        return response.data 
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

export const resendOtp = async () => {
    try {
        const response = await axiosInstance.post('/auth/resend-verify-code')
        return response.data 
    } catch (error) {
        console.error('Resend Verification Code failed:', error);
        throw error;
    }
}