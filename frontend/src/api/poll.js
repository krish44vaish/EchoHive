import axiosInstance from "./axiosInstance"


export const votePoll = async (postId, pollId, index) => {
    try {
        const response = await axiosInstance.patch(`/posts/${postId}/votepoll/${pollId}/${index}`)
        
        
        return response.data
    } catch (error) {
        console.error('Failed to vote poll:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to vote poll';
        
        throw new Error(errorMessage); 
    }
}