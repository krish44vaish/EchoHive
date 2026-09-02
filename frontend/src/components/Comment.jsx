import React, { useEffect, useState } from 'react'
import profileImage from '../assets/megan.png'
import TextareaAutosize from 'react-textarea-autosize';
import { BsThreeDots } from "react-icons/bs";
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import styles from '../styles/Comment.module.css'
import moment from 'moment';
import { deleteComment, editComment, voteComment } from '../api/comment';
import { useSelector } from 'react-redux'
import { toast } from 'sonner'

const Comment = ({
    comment,
    postId,
    isMenuOpen,
    menuOpenToggle,
    handleCommentDelete
}) => {
    const [commentText, setCommentText] = useState("")
    const [newComment, setNewComment] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [localVote, setLocalVote] = useState(comment.uservote);
    const [upvotes, setUpvotes] = useState(comment.upvotes.length);
    const [downvotes, setDownvotes] = useState(comment.downvotes.length);
    const user = useSelector((state) => state.auth.user)

    const handleVote = async (voteType) => {
        try {

            // Optimistic UI update
            if (localVote === voteType) {
                // Undo vote
                setLocalVote(null);
                if (voteType === 'upvote') setUpvotes(upvotes - 1);
                else setDownvotes(downvotes - 1);
            } else {
                // Change vote
                const wasUpvoted = localVote === 'upvote';
                const wasDownvoted = localVote === 'downvote';

                setLocalVote(voteType);

                if (voteType === 'upvote') {
                    setUpvotes(upvotes + 1);
                    if (wasDownvoted) setDownvotes(downvotes - 1);
                } else {
                    setDownvotes(downvotes + 1);
                    if (wasUpvoted) setUpvotes(upvotes - 1);
                }
            }

            // Send API request
            const isUpvote = voteType === 'upvote';
            const response = await voteComment(isUpvote, postId, comment._id)

        } catch (error) {
            // Revert on error
            setLocalVote(comment.uservote);
            setUpvotes(comment.upvotes.length);
            setDownvotes(comment.downvotes.length);
            console.error('Vote failed:', error);
        }
    };

    const handleNewCommentSave = async () => {
        try {
            const response = await editComment(postId, newComment, comment._id)
            console.log("success")
            setCommentText(newComment)
            setIsEditing(false)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        setLocalVote(comment.uservote || null);
    }, [comment.uservote]);

    useEffect(() => {
        setCommentText(comment?.content)
        setNewComment(comment?.content)
    }, [comment])

    return (
        <>
            {
                isEditing ?
                    <div className={styles.selfComment}>
                        <div className={styles.selfCommentTop}>
                            <img src={user.avatar || profileImage} alt="" />
                            <TextareaAutosize
                                minRows={2}
                                maxRows={7}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className={styles.selfCommentBottom}>
                            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleNewCommentSave}
                                disabled={!newComment.length}
                            >Save</button>
                        </div>
                    </div> :
                    <div className={styles.otherComment}>
                        <div className={styles.otherCommentLeft}>
                            <img src={comment.userId.avatar || profileImage} alt="" />
                        </div>
                        <div className={styles.otherCommentRight}>
                            <div className={styles.commentTop}>
                                <div className={styles.commentTopLeft}>
                                    <p>{comment.userId.name}</p>
                                    <span>{moment(comment.createdAt).fromNow()}</span>
                                </div>
                                <div className={styles.commentTopRight} onClick={menuOpenToggle}>
                                    <BsThreeDots />
                                    {
                                        isMenuOpen &&
                                        <div className={styles.commentOptions}>
                                            <p className={styles.commentOption}>Report</p>
                                            {
                                                user._id === comment.userId._id ?
                                                    <>
                                                        <p className={styles.commentOption} onClick={() => setIsEditing(true)}>Edit</p>
                                                        <p className={styles.commentOption} onClick={() => handleCommentDelete(comment._id, comment.postId)}>Delete</p>
                                                    </>
                                                    :
                                                    ""
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className={styles.commentBottom}>
                                {commentText}
                            </div>
                            <div className={styles.commentStats}>
                                <div
                                    className={`
                                    ${styles.commentStatsItem} 
                                    ${styles.upvotesText}
                                    ${localVote === 'upvote' ? styles.upvotedStyles : ''}
                                `}
                                    onClick={() => handleVote('upvote')}
                                >
                                    <div className={styles.iconColor}>
                                        <FaArrowUp size={18} />
                                    </div>
                                    {upvotes}
                                </div>
                                <div
                                    className={`
                                    ${styles.commentStatsItem} 
                                    ${styles.downvotesText}
                                    ${localVote === 'downvote' ? styles.downvotedStyles : ''}
                                `}
                                    onClick={() => handleVote('downvote')}
                                >
                                    <FaArrowDown size={18} />
                                    {downvotes}
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default Comment