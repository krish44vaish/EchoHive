import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import styles from '../styles/UserComments.module.css'
import profileImage from '../assets/megan.png'
import { BsThreeDots } from "react-icons/bs";
import { FaArrowDown, FaArrowUp, FaRegComment } from 'react-icons/fa';
import Comment from './Comment';
import { deleteComment } from '../api/comment';
import { useSelector } from 'react-redux';

const UserComments = ({ comments, setComments }) => {
    const [menuOpenId, setMenuOpenId] = useState(null)
    const user = useSelector((state)=>state.auth.user)

    // useEffect(() => {
    //     console.log("commentcontainer", comments)
    // }, [comments])

    const handleCommentDelete = async (commentId,postId) => {
        try {
            const response = await deleteComment(postId, commentId)
            setComments(prev => prev.filter(comment => comment._id !== commentId))
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className={styles.commentsContainer}>
            <div className={styles.comments}>
                {
                    comments?.map((comment, index) => {
                        
                        if(comment.upvotes.includes(user._id)){
                            comment.uservote = 'upvote'
                        }
                        if(comment.downvotes.includes(user._id)){
                            comment.uservote = 'downvote'
                        }

                        return (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                isMenuOpen={menuOpenId === index}
                                postId={comment.postId}
                                handleCommentDelete={handleCommentDelete}
                                menuOpenToggle={() => setMenuOpenId(menuOpenId === index ? null : index)}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default UserComments