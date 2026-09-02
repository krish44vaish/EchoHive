import axiosInstance from "./axiosInstance"

export const updateDrip = async (dripId, questionIndex, selectedUserId) => {
    try {
        const response = await axiosInstance.post(`/drips/update/${dripId}/${questionIndex}/${selectedUserId}`)
        
        return response.data
    } catch (error) {
        console.error('Failed to update drip:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to update drip';
        
        throw new Error(errorMessage);
    }
}

export const getDrip = async () => {
    try {
        const response = await axiosInstance.get(`/drips`)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch drip:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to fetch drip';
        
        throw new Error(errorMessage);
    }
}

export const getQuestion = async (dripId, questionIndex) => {
    try {
        const response = await axiosInstance.get(`/drips/problem/${dripId}/${questionIndex}`)
        
        return response.data.question || response.data
    } catch (error) {
        console.error('Failed to fetch question:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to fetch question';
        
        throw new Error(errorMessage);
    }
}

export const shuffleOptions = async (dripId, questionIndex, newOptions) => {
    try {
        const response = await axiosInstance.post(`/drips/update/${dripId}/${questionIndex}`, {
            newOptions
        })
        
        return response.data.options
    } catch (error) {
        console.error('Failed to shuffle options:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to shuffle options';
        
        throw new Error(errorMessage);
    }
}

export const getActivity = async () => {
    try {
        const response = await axiosInstance.get(`/drips/activity`)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch activity:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to fetch activity';
        
        throw new Error(errorMessage);
    }
}

export const getInbox = async () => {
    try {
        const response = await axiosInstance.get(`/drips/inbox`)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch inbox:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to fetch inbox';
        
        throw new Error(errorMessage);
    }
}

export const getQuestionResponse = async (questionResponseId) => {
    try {
        const response = await axiosInstance.get(`/drips/question-response/${questionResponseId}`)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch question response:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to fetch question response';
        
        throw new Error(errorMessage);
    }
}

export const skipLast = async (dripId) => {
    try {
        const response = await axiosInstance.post(`/drips/skip-last/${dripId}`)
        
        return response.data
    } catch (error) {
        console.error('Failed to skip Last:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to skip Last';
        
        throw new Error(errorMessage);
    }
}