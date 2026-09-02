import React, { useState } from 'react'
import TopBar from '../components/TopBar'
import PostFilters from '../components/PostFilters'
import styles from '../styles/GlobalExplore.module.css'
import PostsContainer from '../components/PostsContainer'
import { useOutletContext } from 'react-router-dom'

const GlobalExplore = () => {
  const { handleEditPost } = useOutletContext()
  const [postType, setPostType] = useState('All')
  return (
    <div className={styles.exploreSection}>
      <TopBar/>
      <PostFilters 
      setPostType={setPostType}
      postType={postType}
      />
      <PostsContainer 
      handleEditPost={handleEditPost}
      postType={postType}
      />
    </div>
  )
}

export default GlobalExplore