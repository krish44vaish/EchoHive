import React, { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import ProfileUpperSection from '../components/ProfileUpperSection'
import ProfileLowerSection from '../components/ProfileLowerSection'
import styles from '../styles/ProfileSection.module.css'
import { getUserByName } from '../api/user'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../api/post'

const ProfileSection = () => {
  const { handleEditPost } = useOutletContext()

  const { username } = useParams()

  const queryClient = useQueryClient()

  const deletePostMutation = useMutation({
    mutationFn: ({ postId }) => deletePost(postId),
  
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries(['user', username])
  
      const previousUser = queryClient.getQueryData(['user', username])
  
      if (!previousUser) return
  
      // Optimistically update posts in user
      queryClient.setQueryData(['user', username], {
        ...previousUser,
        posts: previousUser.posts.filter(post => post._id !== postId)
      })
  
      return { previousUser }
    },
  
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user', username], context.previousUser)
      }
    },
  
    onSettled: () => {
      queryClient.invalidateQueries(['user', username])
    }
  })
  

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByName(username),
    onError: () => toast.error('Some error'),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading user</p>;

  return (
    <div className={styles.profileSection}>
      {
        user && <>
          <ProfileUpperSection 
          username={username} 
          user={user} 
          />
          <ProfileLowerSection 
          username={username} 
          user={user} 
          handleEditPost={handleEditPost} 
          deletePostMutation={deletePostMutation} 
          />
        </>
      }
    </div>
  )
}

export default ProfileSection