import React, { useEffect, useState } from 'react'
import Post from '../components/Post'
import styles from '../styles/PostPage.module.css'
import { useLocation, useOutletContext, useParams } from 'react-router-dom'
import CommentsContainer from '../components/CommentsContainer'
import axios from 'axios'
import { getPost } from '../api/post'

const PostPage = () => {
  const { postId } = useParams()
  const { handleEditPost } = useOutletContext()

  // Get post from navigation state or fetch if direct URL access
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!post) {
      // Fetch post if not passed via state (direct URL access)
      const fetchPost = async () => {
        const response = await getPost(postId);
        setPost(response);
      };
      fetchPost();
    }

  }, [postId]);

  return (
    <div className={styles.postContainer}>
      {
        post &&
        <>
          <Post post={post} handleEditPost={handleEditPost} />
          <CommentsContainer post={post} />
        </>
      }
    </div>
  )
}

export default PostPage