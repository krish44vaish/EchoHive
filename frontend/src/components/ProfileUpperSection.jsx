import React, { useEffect, useState } from 'react'
import profileImage from '../assets/megan.png'
import styles from '../styles/ProfileUpperSection.module.css'
import { FaGraduationCap } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { toggleFriend } from '../api/user';
import { toggleUserFriend } from '../features/user/friendSlice';
import { Link } from 'react-router-dom';

const ProfileUpperSection = ({
    username,
    user
}) => {
    const friends = useSelector((state) => state.friend.friends)
    const dispatch = useDispatch()
    const [followers, setFollowers] = useState(user?.friends?.length)
    const [following, setFollowing] = useState(user?.friendsOf?.length)

    const loggedInUser = useSelector((state) => state.auth.user)
    const handleToggleFriend = async () => {
        const isFriend = friends?.some(friend => friend._id === user._id);

        try {
            await toggleFriend(user._id);

            // Update following count
            setFollowing(prev => isFriend ? prev - 1 : prev + 1);

            // Update Redux state
            dispatch(toggleUserFriend({ _id: user._id, name: user.name }));
        } catch (error) {
            console.error(error.message);
            // Optionally show an error toast here
        }
    };

    useEffect(() => {
        setFollowing(user.friendsOf?.length)
    }, [user.friendsOf])

    // useEffect(() => console.log(friends), [friends])

    return (
        <div className={styles.upperSection}>
            <div className={styles.profileAndFollow}>
                <img src={user.avatar || profileImage} alt="profile" className={styles.profileImage} />
                {
                    user._id === loggedInUser._id ? (
                        <Link to='/settings/edit' className={`${styles.editButton}`}>
                            Edit Profile
                        </Link>
                    ) : (
                        <button onClick={handleToggleFriend} className={`${styles.followButton} ${!friends?.find(friend => friend._id === user._id) ? styles.notfollowing : ""}`}>
                            {friends?.find(friend => friend._id === user._id) ? "Unfollow" : "Follow"}
                        </button>
                    )
                }
            </div>
            <div className={styles.profileInfo}>
                <p className={styles.username}>{username}</p>
                <p className={styles.userCollege}>
                    <FaGraduationCap size={23} />
                    <span>{user.collegeId.name}</span>
                </p>
                <span className={styles.userBio}>
                    {user.bio || (
                        <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
                            No bio added yet
                        </span>
                    )}
                </span>
                <div className={styles.friends}>
                    <p>
                        <span style={{ fontWeight: "800" }}>{user.friends.length}</span> Following
                    </p>
                    <p>
                        <span style={{ fontWeight: "800" }}>{following}</span> Followers
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileUpperSection