import axiosInstance from "./axiosInstance"

export const voteComment = async (isUpvote,postId,commentId) => {
    try {
        const response = await axiosInstance.post(`/posts/${postId}/comments/${commentId}/vote`, {
            isUpvote
        })
        return response.data
    } catch (error) {
        console.error('Failed to vote comment:', error);

        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to vote post';
        
        throw new Error(errorMessage);
    }
}

export const createComment = async (postId, content) => {
    try {
        // creating a comment 
        const response = await axiosInstance.post(`/posts/${postId}/comments`, {
            content
        })
        
        return response.data
    } catch (error) {
        console.error('Failed to create comment:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to create comment';
        
        throw new Error(errorMessage);
    }
}

export const editComment = async (postId, content, commentId) => {
    try {
        // editing a comment
        const response = await axiosInstance.put(`/posts/${postId}/comments/${commentId}`, {
            content
        })
        
        return response.data
    } catch (error) {
        console.error('Failed to edit comment:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to edit comment';
        
        throw new Error(errorMessage);
    }
}

export const deleteComment = async (postId, commentId) => {
    try {
        // deleting a comment
        const response = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`)
        
        return response.data
    } catch (error) {
        console.error('Failed to delete comment:', error);
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Failed to delete comment';
        
        throw new Error(errorMessage);
    }
}