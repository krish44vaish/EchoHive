import React, { useEffect, useState } from 'react'
import styles from '../styles/Post.module.css'
import profileImage from '../assets/jack.png'
import { BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";   // Comment icon
import { FaArrowUp, FaArrowDown } from "react-icons/fa6"; // Upvote & Downvote icons
import moment from 'moment'
import { votePost } from '../api/post'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import PostPoll from './PostPoll';
import { useSelector } from 'react-redux';
import DeletePostModal from './DeletePostModal';
import ghostImage from '../assets/ghost.webp'

const Post = ({ post, innerRef, onDelete, handleEditPost, userVote }) => {
    const [localVote, setLocalVote] = useState(post.userVote || userVote);
    const [upvotes, setUpvotes] = useState(post.upvotes.length);
    const [downvotes, setDownvotes] = useState(post.downvotes.length);
    const navigate = useNavigate()
    const user = useSelector((state) => state.auth.user)
    const [showModal, setShowModal] = useState(false);
    const [isTall, setIsTall] = useState(false);

    const handleDelete = () => {
        onDelete(post._id);
        setShowModal(false);
    };

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        if (naturalHeight / naturalWidth >= 0.8) {
            setIsTall(true);
        }
    };

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
            const response = await votePost(post._id, isUpvote)

        } catch (error) {
            // Revert on error
            setLocalVote(post.userVote || userVote);
            setUpvotes(post.upvotes.length);
            setDownvotes(post.downvotes.length);
            console.error('Vote failed:', error);
        }
    };

    const handleGetPost = () => {
        navigate(`/posts/${post._id}`);
    };

    return (
        <div className={styles.post} ref={innerRef}>
            <div className={styles.postTopSection}>
                <div className={styles.postTopLeftSection}>
                    <div className={styles.postProfile}>
                        {
                            post.isAnonymous ?
                                <img src={ghostImage} alt="profile" className={styles.postProfileImage} /> :
                                <Link to={`/profile/${post.userId.name}/posts`} className={styles.linkStyles}>
                                    <img src={post.userId.avatar || profileImage} alt="profile" className={styles.postProfileImage} />
                                </Link>
                        }
                    </div>
                    <div className={styles.postProfileInfo}>
                        {
                            post.isAnonymous ?
                                <div>
                                    <p>Anonymous</p>
                                </div> :
                                <Link to={`/profile/${post.userId.name}/posts`} className={styles.linkStyles}>
                                    <p>{post.userId.name}</p>
                                </Link>
                        }
                        <div className={styles.postMeta}>
                            <span className={`${styles.postType} ${post.postType === 'confession' ?
                                styles.confession : post.postType === 'meme' ?
                                    styles.meme :
                                    styles.question}`}
                            >
                                {post.postType === 'confession' ?
                                    '❤️' : post.postType === 'meme'
                                        ? '😂'
                                        : '💡'} {post.postType}
                            </span>
                            <span>{moment(post.createdAt).fromNow()}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.postTopRightSection}>
                    <div className={styles.postOptionsMenu}>
                        <div className={styles.postOptionsIcon}>
                            <BsThreeDots size={20} />
                        </div>
                        <div className={styles.postOptions}>
                            <p className={styles.postOption}>Report</p>
                            <p className={styles.postOption}>Mute</p>
                            <p className={styles.postOption}>Block</p>
                            {
                                (post.userId._id || post.userId) === user._id &&
                                <>
                                    {onDelete && <p className={styles.postOption} onClick={() => setShowModal(true)}>Delete</p>}
                                    <p className={styles.postOption} onClick={() => handleEditPost(post)}>Edit</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.postTextContent}>
                {post.content}
            </div>
            {
                post.pollId && (
                    <PostPoll poll={post.pollId} />
                )
            }

            {
                (post.media) && (
                    <div className={`${styles.postImage} ${isTall ? styles.tall : ""}`}>
                        <img src={post.media.url} alt="post image" onLoad={handleImageLoad} />
                    </div>
                )
            }

            <div className={styles.postStats}>
                <div
                    className={`${styles.postStatsItem} ${styles.commentText}`}
                    onClick={handleGetPost}
                >
                    <FaRegComment size={20} style={{ color: "blue" }} />
                    {post.comments.length}
                </div>
                <div
                    className={`${styles.postStatsItem} ${styles.upvotesText} ${localVote === 'upvote' ? styles.upvotedStyles : ''
                        }`}
                    onClick={() => handleVote('upvote')}
                >
                    <FaArrowUp size={20} />
                    {upvotes}
                </div>

                <div
                    className={`${styles.postStatsItem} ${styles.downvotesText} ${localVote === 'downvote' ? styles.downvotedStyles : ''
                        }`}
                    onClick={() => handleVote('downvote')}
                >
                    <FaArrowDown size={20} />
                    {downvotes}
                </div>
            </div>

            <DeletePostModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDelete}
            />
        </div>
    )
}

export default Post