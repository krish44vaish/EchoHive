import styles from '../styles/SettingsBar.module.css'
import { Link, useNavigate } from 'react-router-dom'

const SettingsBar = () => {
  const navigate = useNavigate()
  return (
    <div className={styles.settingsBar}>
      <div className={styles.settingsTop}>
        <span onClick={() => navigate(-1)}>&lt;</span>
        <p>Settings</p>
      </div>
      <div className={styles.settingsItems}>
        <Link to='/settings/edit' className={styles.settingsItem}>
          Edit Profile
        </Link>
        <Link to='/settings/password' className={styles.settingsItem}>
          Change Password
        </Link>
        <Link to='/settings/notifications' className={styles.settingsItem}>
          Notifications
        </Link>
      </div>
    </div>
  )
}

export default SettingsBar