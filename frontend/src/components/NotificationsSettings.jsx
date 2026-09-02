import React, { useRef, useState } from 'react'
import styles from '../styles/NotificationsSettings.module.css'
import defaultProfileImage from '../assets/jack.png'

const NotificationsSettings = () => {

  const [notifyOnNewCollegeUser, setNotifyOnNewCollegeUser] = useState(false)
  const [notifyOnDripSelect, setNotifyOnDripSelect] = useState(false);

  return (
    <div className={styles.editNotificationsSectionContainer}>
      <h2 className={styles.editNotificationsSectionHeader}>
        Notifications
      </h2>
      <div className={styles.editNotifications}>
        <div className={styles.editNotificationItem}>
          <div className={styles.editNotificationItemLeft}>
            <p>
              New user from your college
            </p>
            <span className={styles.longerDescription}>
              Receive a notification whenever someone from your college joins the platform.
            </span>
          </div>
          <div className={`${styles.toggleSwitch} ${notifyOnNewCollegeUser ? styles.toggleSwitchFilled : ""}`} onClick={() => setNotifyOnNewCollegeUser(!notifyOnNewCollegeUser)}>
            <div className={`${styles.toggleCircle} ${notifyOnNewCollegeUser ? styles.NotifyOnNewCollegeUser : ""}`}>
            </div>
          </div>
        </div>
        <div className={styles.editNotificationItem}>
          <div className={styles.editNotificationItemLeft}>
            <p>
              Selected in Drip response
            </p>
            <span className={styles.longerDescription}>
              Get notified when someone chooses you as an answer to a Drip question.
            </span>
          </div>
          <div className={`${styles.toggleSwitch} ${notifyOnDripSelect ? styles.toggleSwitchFilled : ""}`} onClick={() => setNotifyOnDripSelect(!notifyOnDripSelect)}>
            <div className={`${styles.toggleCircle} ${notifyOnDripSelect ? styles.NotifyOnNewCollegeUser : ""}`}>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsSettings