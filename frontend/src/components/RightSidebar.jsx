import React, { useEffect, useState } from 'react'
import profileImage from '../assets/jack.png'
import styles from '../styles/RightSidebar.module.css'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from './Spinner'
import { toggleFriend } from '../api/user'
import { toggleUserFriend } from '../features/user/friendSlice'

const RightSidebar = ({ recommended }) => {
    const [showAll, setShowAll] = useState(false)
    // stop showing show more when all of the data is displayed
    const [displayedUsers, setDisplayedUsers] = useState([])
    const [count, setCount] = useState(4)
    const friends = useSelector((state) => state.friend.friends)
    const dispatch = useDispatch()

    useEffect(() => {
        setDisplayedUsers(recommended?.slice(0, count))
        if (count >= recommended?.length) {
            setShowAll(true)
        }
    }, [count,recommended])

    
    const handleToggleFriend = async (user) => {
        try {
            await toggleFriend(user._id);
            dispatch(toggleUserFriend({
                _id: user._id,
                name: user.name,
            }))
        } catch (error) {
            console.error('Failed to add/remove friend')
        }
    }


    return (
        <div className={styles.rightSidebar}>
            <div className={styles.recommendedUsers}>
                <div className={styles.header}>
                    People you may know
                </div>
                {
                    recommended ?
                        (
                            <div className={styles.recommendedUsersList}>
                                {
                                    displayedUsers?.map((user, index) => {
                                        return (
                                            <div key={user._id} className={styles.recommendedUser}>
                                                <Link to={`/profile/${user.name}/posts`} className={styles.linkStyles}>
                                                    <div className={styles.recommendedUserLeft}>
                                                        <div className={styles.profile}>
                                                            <img src={user.avatar || profileImage} alt="profile" className={styles.profileImage} />
                                                        </div>
                                                        <div className={styles.profileInfo}>
                                                            <p>{user.name}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <div className={styles.recommendedUserRight}>
                                                    <button onClick={() => handleToggleFriend(user)}>
                                                        {
                                                            friends.find(friend => friend._id === user._id) ?
                                                                "Remove" :
                                                                "Add"
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    !showAll &&
                                    <span onClick={() => setCount(prev => Math.min(prev + 4, recommended?.length))}>Show more</span>
                                }
                            </div>
                        )
                        : <Spinner/>
                }
            </div>
        </div>
    )
}

export default RightSidebar