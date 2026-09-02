import React, { useEffect, useState } from 'react'
import styles from '../styles/ProfileLowerSection.module.css'
import { Link, useLocation } from 'react-router-dom'
import UserPosts from './UserPosts'
import UserComments from './UserComments'

const ProfileLowerSection = ({ username, user, handleEditPost, deletePostMutation }) => {
  const { pathname } = useLocation();
  const [comments, setComments] = useState(null)

  useEffect(()=>{
    setComments(user?.comments)
  },[user])

  return (
    <div className={styles.lowerSection}>
      <div className={styles.profilePageNav}>
        <Link className={styles.linkStyles} to={`/profile/${username}/posts`}>
          <span className={`${pathname.endsWith("posts") ? styles.selected : ""}`}>Posts</span>
        </Link>
        <Link className={styles.linkStyles} to={`/profile/${username}/likes`}>
          <span className={`${pathname.endsWith("likes") ? styles.selected : ""}`}>Likes</span>
        </Link>
        <Link className={styles.linkStyles} to={`/profile/${username}/comments`}>
          <span className={`${pathname.endsWith("comments") ? styles.selected : ""}`}>Comments</span>
        </Link>
      </div>
      {
        pathname.endsWith("likes") ?
          <UserPosts
            posts={user.reactedPosts?.map( (reactedPost) => {return reactedPost?.post}) || []}
            reactedPosts={user.reactedPosts || []}
            handleEditPost={handleEditPost}
            deletePostMutation={deletePostMutation}
          /> : pathname.endsWith("posts") ?
            <UserPosts
              posts={user.posts}
              reactedPosts={user.reactedPosts}
              handleEditPost={handleEditPost}
              deletePostMutation={deletePostMutation}
            /> :
            <UserComments 
            comments={comments} 
            setComments={setComments}
            />
      }
    </div>
  )
}

export default ProfileLowerSection