import axiosInstance from './axiosInstance'

export const getLatestPosts = async (isGlobal, page, user, postType = 'All') => {

    try {
        let apiCallUrl = '/posts?'

        if (isGlobal) {
            apiCallUrl += `isGlobal=true&page=${page}`
        } else {
            if (!user?.collegeId) {
                throw new Error('User college information not available');
            }
            apiCallUrl += `collegeId=${user.collegeId.toString()}&page=${page}`
        }
        if(postType){
            apiCallUrl += `&postType=${postType}`
        }
        const response = await axiosInstance.get(apiCallUrl)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch latest posts:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to fetch latest posts';

        throw new Error(errorMessage);
    }
}

export const getTrendingPosts = async (isGlobal, page, user, postType = 'All') => {
    try {

        let apiCallUrl = '/posts/trending?'

        if (isGlobal) {
            apiCallUrl += `isGlobal=true&page=${page}`
        } else {
            if (!user?.collegeId) {
                throw new Error('User college information not available');
            }
            apiCallUrl += `collegeId=${user.collegeId.toString()}&page=${page}`
        }
        if(postType){
            apiCallUrl += `&postType=${postType}`
        }

        const response = await axiosInstance.get(apiCallUrl)
        
        return response.data
    } catch (error) {
        console.error('Failed to fetch trending posts:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to fetch trending posts';

        throw new Error(errorMessage);
    }
}

export const votePost = async (postId, isUpvote) => {
    try {
        const response = await axiosInstance.put(`/posts/${postId}/vote`, { isUpvote })
        return response.data
    } catch (error) {
        console.error('Failed to vote post:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to vote post';

        throw new Error(errorMessage);
    }
}

export const getPost = async (postId) => {
    try {
        const response = await axiosInstance.get(`/posts/${postId}`)

        return response.data
    } catch (error) {
        console.error('Failed to fetch post:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to fetch post';

        throw new Error(errorMessage);
    }
}

export const createPost = async (formData) => {
    try {
        const response = await axiosInstance.post(`/posts`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return response.data
    } catch (error) {
        console.error('Failed to create post:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to create post';

        throw new Error(errorMessage);
    }
}

export const deletePost = async (postId) => {
    try {
        const response = await axiosInstance.delete(`/posts/${postId}`)

        return response.data
    } catch (error) {
        console.error('Failed to delete post:', error);

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to delete post';

        throw new Error(errorMessage);
    }
}

export const updatePost = async (formData,postId) => {
    try {
        
        const response = await axiosInstance.put(`/posts/${postId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update post');
    }
}; 