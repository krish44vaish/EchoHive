import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import styles from '../styles/MainLayout.module.css';
import RightSidebar from '../components/RightSidebar';
import NotificationSidebar from '../components/NotificationSidebar'; // New component
import { ModalContext } from '../context/modalContext';
import SearchSidebar from '../components/SearchSidebar';
import CreatePostModal from '../components/CreatePostModal';
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import EditPostModal from '../components/EditPostModal';
import { getFriends, getNotifications, getRecommendedUsers } from '../api/user';
import { setFriends } from '../features/user/friendSlice';
import { setCredentials } from '../features/auth/authSlice';
import { initSocket } from '../socket/initSocket.js'
import { setNotifications, setRead } from '../features/notifications/notificationSlice.js'

const MainLayout = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchbar, setShowSearchbar] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const { showModal } = useContext(ModalContext);
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(auth.token);
  const [checkingAuth, setCheckingAuth] = useState(true);   // handle initial load/render edge case
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const dispatch = useDispatch()

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSearchbar(false);
    setPostModalOpen(false);
    setEditModalOpen(false);
    dispatch(setRead())
    document.body.classList.toggle(styles.sidebarOpen, !showNotifications);
  };

  const toggleSearchbar = () => {
    setShowSearchbar(!showSearchbar);
    setShowNotifications(false);
    setPostModalOpen(false);
    setEditModalOpen(false);
    document.body.classList.toggle(styles.sidebarOpen, !showSearchbar);
  };

  const togglePostModalOpen = () => {
    setPostModalOpen(!postModalOpen)
    setShowNotifications(false);
    setShowSearchbar(false);
    setEditModalOpen(false);
    document.body.classList.toggle(styles.sidebarOpen, !postModalOpen);
  }

  const toggleEditModalOpen = () => {
    setEditModalOpen(!editModalOpen);
    setShowNotifications(false);
    setShowSearchbar(false);
    setPostModalOpen(false)
    document.body.classList.toggle(styles.sidebarOpen, !editModalOpen);
  }

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setEditModalOpen(true);
    // sidebarOpen actually sets overflow to hidden that is why adding this class
    // though not the best practice
    document.body.classList.add(styles.sidebarOpen);
  };

  // Fetching friends and storing in redux state on initial render
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriends()
        dispatch(setFriends(response.friends))
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchFriends()
  }, [])

  // Fetching recommended friends and storing in redux state on initial render
  useEffect(() => {
    const fetchRecommendedFriends = async () => {
      try {
        const response = await getRecommendedUsers()
        setRecommended(response)
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchRecommendedFriends()
  }, [])

  // Fetching notifications and storing in redux state on initial render
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications()
        dispatch(setNotifications(response))
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchNotifications()
  }, [])

  // Close notifications bar on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showNotifications) {
        toggleNotifications();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotifications]);

  // Checking whether user is logged in or not
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isVerified = localStorage.getItem('isVerified') === 'true';

    if (token && user) {
      // Redux hasn't restored but localStorage has valid data
      dispatch(setCredentials({ token, user, isVerified }));
      setCheckingAuth(false);
    } else if (!auth.token && !token) {
      // no auth anywhere
      setCheckingAuth(false);
    } else {
      // redux already has token
      setCheckingAuth(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user._id) {
      initSocket(dispatch, user._id)
    }
  }, [])

  if (checkingAuth) return <p> Loading </p>; // or a loading spinner

  if (!isLoggedIn) {
    return <Navigate to="/signup" />;
  }

  return (
    <div className={styles.appLayout}>
      <Sidebar
        toggleNotifications={toggleNotifications}
        toggleSearchbar={toggleSearchbar}
        togglePostModalOpen={togglePostModalOpen}
        showSearchbar={showSearchbar}
        setPostModalOpen={setPostModalOpen}
      />

      <main className={`${styles.mainContent} ${showNotifications || showModal || showSearchbar ? styles.blurred : ''}`}>
        <Outlet
          context={{ handleEditPost }}
        />
      </main>

      <div className={`${styles.rightBar} ${showNotifications || showModal || showSearchbar ? styles.blurred : ''}`}>
        <RightSidebar recommended={recommended} />
      </div>

      {showNotifications && (
        <>
          <div className={`${styles.notificationOverlay} ${showNotifications || showSearchbar ? styles.visible : ''}`} onClick={toggleNotifications} />
          <NotificationSidebar onClose={toggleNotifications} />
        </>
      )}

      {showSearchbar && (
        <>
          <div className={`${styles.notificationOverlay} ${showNotifications || showSearchbar ? styles.visible : ''}`} onClick={toggleSearchbar} />
          <SearchSidebar onClose={toggleSearchbar} />
        </>
      )}

      {postModalOpen && (
        <>
          <div className={`${styles.notificationOverlay} ${postModalOpen ? styles.visible : ''}`} onClick={togglePostModalOpen} />
          <CreatePostModal
            onClose={togglePostModalOpen}
            togglePostModalOpen={togglePostModalOpen}
          />
        </>
      )}

      {editModalOpen && (
        <>
          <div className={`${styles.notificationOverlay} ${editModalOpen ? styles.visible : ''}`}
            onClick={toggleEditModalOpen} />
          <EditPostModal
            post={postToEdit}
            toggleEditModalOpen={toggleEditModalOpen}
            onPostUpdated={(updatedPost) => {
              // Update your posts state here if needed
            }}
          />
        </>)}
    </div>
  );
};

export default MainLayout;