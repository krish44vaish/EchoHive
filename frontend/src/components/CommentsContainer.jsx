import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import styles from '../styles/commentsContainer.module.css'
import profileImage from '../assets/megan.png'
import Comment from './Comment';
import { useSelector } from 'react-redux';
import { createComment, deleteComment } from '../api/comment';
import { toast } from 'sonner'

const CommentsContainer = ({ post }) => {
    const [newComment, setNewComment] = useState('')
    const [addedComments, setAddedComments] = useState([])
    const [comments, setComments] = useState(post.comments)
    const [menuOpenId, setMenuOpenId] = useState(null)
    const user = useSelector((state) => state.auth.user)

    const handleCreateComment = async () => {
        try {
            const comment = await createComment(post._id, newComment)
            setAddedComments(prev => [comment, ...prev]) // push ye nayi waali comment
            setNewComment('')
        } catch (error) {
            console.log(error.message)
        }
    }



    const handleCommentDelete = async (commentId,postId) => {
        try {
            const response = await deleteComment(post._id, commentId)
            setAddedComments(prev => prev.filter(comment => comment._id !== commentId))
            setComments(prev => prev.filter(comment => comment._id !== commentId))
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        setComments(post.comments)
    }, [post.comments])

    return (
        <div className={styles.commentsContainer}>
            <div className={styles.comments}>
                <div className={styles.selfComment}>
                    <div className={styles.selfCommentTop}>
                        <img src={user?.avatar || profileImage} alt="" />
                        <TextareaAutosize
                            minRows={2}
                            maxRows={7}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className={styles.selfCommentBottom}>
                        <button disabled={!newComment.length} onClick={handleCreateComment}>Comment</button>
                    </div>
                </div>
                {
                    addedComments.map((comment, index) => {

                        if (comment.upvotes.includes(user._id.toString())) {
                            comment.uservote = 'upvote'
                        }
                        if (comment.downvotes.includes(user._id.toString())) {
                            comment.uservote = 'downvote'
                        }
                        return (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                isMenuOpen={menuOpenId === index}
                                postId={post._id}
                                handleCommentDelete={handleCommentDelete}
                                menuOpenToggle={() => setMenuOpenId(menuOpenId === index ? null : index)}
                            />
                        )
                    })
                }
                {
                    comments?.map((comment, index) => {

                        if (comment.upvotes.includes(user._id.toString())) {
                            comment.uservote = 'upvote'
                        }
                        if (comment.downvotes.includes(user._id.toString())) {
                            comment.uservote = 'downvote'
                        }
                        return (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                isMenuOpen={menuOpenId === index + addedComments.length}
                                postId={post._id}
                                handleCommentDelete={handleCommentDelete}
                                menuOpenToggle={() => setMenuOpenId(menuOpenId === index + addedComments.length ? null : index + addedComments.length)}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default CommentsContainer