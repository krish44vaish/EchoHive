import React, { useContext, useState } from 'react';
import {
    FaHome,
    FaSearch,
    FaCompass,
    FaFilm,
    FaEnvelope,
    FaHeart,
    FaPlusSquare,
    FaUser,
    FaSignOutAlt,
    FaCog
} from 'react-icons/fa';
import styles from '../styles/Sidebar.module.css';
import { Link, useNavigate } from 'react-router-dom'
import { ModalContext } from '../context/modalContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { logoutUser } from '../api/auth';

const Sidebar = ({ toggleNotifications, toggleSearchbar, showSearchbar, setPostModalOpen, togglePostModalOpen }) => {
    const { setShowModal } = useContext(ModalContext);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { name } = useSelector((state) => state.auth.user)
    const readBool = useSelector((state) => state.notification.readBool)

    const handleLogout = async () => {
        try {
            const response = await logoutUser();
            dispatch(logout())
            navigate('/login')
        } catch (error) {
            toast.error("Logout failed")
        }
    }

    return (
        <div className={`${styles.sidebar} ${showSearchbar ? styles.searchBarOpen : ""}`} onClick={(() => setShowModal(false))}>
            <div className={styles.logo}>
                <h1>EchoHive</h1>
            </div>

            <nav className={styles.nav}>
                {/* <Link to="/" className={styles.navItem}>
                    <FaHome className={styles.icon} />
                    <span>Home</span>
                </Link> */}
                <div className={styles.navItem} onClick={toggleSearchbar}>
                    <FaSearch className={styles.icon} />
                    <span>Search</span>
                </div>
                <Link to="/explore/global" className={styles.navItem}>
                    <FaCompass className={styles.icon} />
                    <span>Explore</span>
                </Link>
                <Link to="/drips/poll" className={styles.navItem}>
                    <FaFilm className={styles.icon} />
                    <span>Drips</span>``
                </Link>
                <div className={styles.navItem} onClick={toggleNotifications}>
                    <FaHeart className={styles.icon} />
                    <span>Notifications</span>
                    {
                        readBool &&
                        <p style={{ marginLeft: "3px", height: "8px", width: "8px", borderRadius: "4px", background: "white" }}></p>
                    }
                </div>
                <div className={`${styles.navItem} ${styles.createPost}`} onClick={togglePostModalOpen}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="white" d="M23 3c-6.62-.1-10.38 2.42-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11z" />
                    </svg>
                    <span>Create Post</span>
                </div>
                <Link to={`/profile/${name}/posts`} className={styles.navItem}>
                    <FaUser className={styles.icon} />
                    <span>Profile</span>
                </Link>
            </nav>

            <div className={styles.bottomOptions}>
                <Link to='/settings/edit' className={`${styles.navItem} ${styles.settingsItem}`}>
                    <FaCog className={styles.icon} />
                    <span className={styles.settingsText}>Settings</span>
                </Link>
                <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>
                    <FaSignOutAlt className={styles.icon} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;