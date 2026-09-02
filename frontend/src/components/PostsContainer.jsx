import { useEffect, useMemo, useState } from 'react'
import styles from '../styles/PostsContainer.module.css'
import { useInView } from 'react-intersection-observer'
import { useLocation } from 'react-router-dom'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost, getLatestPosts, getTrendingPosts } from '../api/post'
import { useSelector } from 'react-redux'
import Post from './Post'
import Spinner from './Spinner'

const PostsContainer = ({handleEditPost, postType}) => {

  const { ref, inView } = useInView({
    threshold: 1
  })
  // threshold-> fraction of innerRef component
  // that must be visible before inView becomes true
  
  const { pathname } = useLocation();
  const isGlobal = pathname.includes('global')
  const user = useSelector((state) => state.auth.user)


  const queryClient = useQueryClient()

  const deletePostMutation = useMutation({
    mutationFn: ({ postId }) => deletePost(postId),
    onMutate: async ({ postId }) => {
      // on mutate gets called event though our query has not settled

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['posts', isGlobal, pathname, postType])

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['posts', isGlobal, pathname, postType])

      // Optimistically update the cache
      queryClient.setQueryData(['posts', isGlobal, pathname, postType], (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((post) => post._id !== postId)
          ),
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Revert to previous data if mutation fails
      queryClient.setQueryData(['posts', isGlobal, pathname, postType], context.previousData)
    },
    onSettled: () => {
      // this thing runs after error or success
      // even after update or after error
      // we refetch data to ensure it stays up to date
      queryClient.invalidateQueries(['posts', isGlobal, pathname, postType])
    },
  })


  const {
    data,
    status,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['posts', isGlobal, pathname, postType],
    queryFn: ({ pageParam }) => {
      if (pathname.includes('trending')) {
        return getTrendingPosts(isGlobal, pageParam, user, postType)
      } else {
        return getLatestPosts(isGlobal, pageParam, user, postType)
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    }
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      // console.log('Fire!')
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])


  if (status === 'pending') {
    return <p>Loading...</p>
  }

  if (status === 'error') {
    return <p>Error: {error.message}</p>
  }

  return (
    <div className={styles.postsContainer}>
      {
        data?.pages.flatMap((group, i) =>
          group.map((post, index) => (
            <Post
              key={post._id}
              post={post}
              handleEditPost={handleEditPost}
              onDelete={(postId) => deletePostMutation.mutate({ postId })}
              innerRef={
                i === data.pages.length - 1 &&
                  index === group.length - 1 ?
                  ref :
                  null
              }
            />
          ))
        )
      }
      {
        isFetchingNextPage &&
        <div className={styles.spinnerStyles}>
          <Spinner />
        </div>
      }
    </div>
  )
}

export default PostsContainer