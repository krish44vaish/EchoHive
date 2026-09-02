import React, { useEffect } from 'react';
import styles from '../styles/NotificationSidebar.module.css';
import profileImage from '../assets/megan.png'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import { toggleUserFriend } from '../features/user/friendSlice';
import { markRead } from '../features/notifications/notificationSlice';
import { markNotificationRead, toggleFriend } from '../api/user';

const NotificationSidebar = ({ onClose }) => {
  const notifications = useSelector((state) => state.notification.notifications)
  const friends = useSelector((state) => state.friend.friends)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // useEffect(()=>console.log(notifications),notifications)
  
  const handleToggleFriend = async (notification) => {
    try {
      await toggleFriend(notification.referenceId._id);
      dispatch(toggleUserFriend({
        _id: notification.referenceId._id,
        name: notification.referenceId.name,
      }))
      if(!notification.isRead) {
        await markNotificationRead(notification._id);
        dispatch(markRead(notification._id));
      }
    } catch (error) {
      console.error('Failed to add/remove friend')
    }
  }

  const handleViewInbox = async (notification) => {
    try {
      if(!notification.isRead) {
        await markNotificationRead(notification._id);
        dispatch(markRead(notification._id));
      }
      onClose();
      navigate('/drips/inbox')
    } catch (error) {
      console.error('Failed to add/remove friend')
    }
  }

  const handleDirectUserNotification = async (notification) => {
    try {
      if(!notification.isRead) {
        await markNotificationRead(notification._id);
        dispatch(markRead(notification._id));
      }
      onClose();
      navigate(`profile/${notification.referenceId.name}/posts`)
    } catch (error) {
      console.error('Error in directing user')
    }
  }

  return (
    <div className={styles.notificationSidebar}>
      <div className={styles.notificationHeader}>
        <h3>Notifications</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      <div className={styles.notificationContent}>
        {/* Map through your notifications here */}
        {
          [...notifications]?.reverse().map(notification => {
            return notification.notificationType === "NEW_USER_JOINED" ? (
              <div className={styles.notificationItem} key={notification._id}>
                <div onClick={()=>handleDirectUserNotification(notification)} className={styles.notificationAvatar}>
                  <img src={notification.referenceId.avatar || profileImage} alt="User" />
                </div>
                <div className={styles.notificationDetails}>
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>{moment(notification.createdAt).fromNow()} {notification.isRead === false ? <span className={styles.notificationCircle}></span> : ""}</span>
                  </div>
                  <p className={styles.notificationMessage}>
                    {notification.referenceId.name}, Just joined your college community
                  </p>
                  <button onClick={() => handleToggleFriend(notification)}>
                    {
                      friends.find(friend => friend._id === notification.referenceId._id) ?
                      "Remove" : 
                      "Add"
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.notificationItem} key={notification._id}>
                <div className={styles.notificationAvatar}>
                  <img src={profileImage} alt="User" />
                </div>
                <div className={styles.notificationDetails}>
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>{moment(notification.createdAt).fromNow()}</span>
                  </div>
                  <p className={styles.notificationMessage}>
                    Somebody Slickin
                  </p>
                  <button onClick={()=>handleViewInbox(notification)}>View</button>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
};

export default NotificationSidebar;