import React from 'react'
import styles from '../styles/PostsContainer.module.css'
import Post from './Post'

const UserPosts = ({ posts, reactedPosts, handleEditPost, deletePostMutation }) => {

    return (
        <div className={styles.postsContainer}>
            {
                [...posts]?.reverse().map((post,index) => {
                    if(!post){
                        return ""
                    }
                    const userVote = reactedPosts?.find(p => p?.post?._id === post?._id)?.voteType;
                    return (
                        <Post
                            key={post._id}
                            post={post}

                            handleEditPost={handleEditPost}
                            userVote={userVote}
                            onDelete={(postId) => deletePostMutation.mutate({ postId })}
                        />
                    )
                })
            }
        </div>
    )
}

export default UserPosts