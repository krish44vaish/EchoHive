import React, { useEffect, useRef, useState } from 'react'
import styles from '../styles/EditProfilePage.module.css'
import defaultProfileImage from '../assets/jack.png'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../api/user'
import { updateUserProfile } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

const EditProfilePage = () => {

  const [preview, setPreview] = useState("")
  const [file, setFile] = useState(null)
  const [bio, setBio] = useState("")
  const [isChange, setIsChange] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const avatarRef = useRef()
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()

  useEffect(() => {
    // console.log(user)
    setBio(user.bio)
    setPreview(user.avatar)
  }, [user])

  const handleAvatarUpload = (e) => {
    setIsChange(true)
    if (e.target.files.length > 0) {
      setFile(e.target.files[0])
      let fileReader = new FileReader()
      fileReader.onload = (e) => {
        const { result } = e.target;
        setPreview(result)
      }
      fileReader.readAsDataURL(e.target.files[0])
    }
  }

  const handleEditChangesSave = async (e) => {
    e.preventDefault()
    setIsChanging(true)
    try {
      
      const formData = new FormData()
      formData.append("bio", bio)
      if (file) {
        formData.append("image", file)
      }
      const response = await updateProfile(formData, user._id)
      setIsChange(!isChange)
      dispatch(updateUserProfile({ bio: response.user.bio, avatar: response.user.avatar }))
    } catch (error) {
      setIsChange(isChange)
      console.log(error.message)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className={styles.editSectionContainer}>
      <h2 className={styles.editSectionHeader}>
        Edit Profile
      </h2>
      <form className={styles.editProfileForm} onSubmit={handleEditChangesSave}>
        <div className={styles.avatarField}>
          <input
            type="file"
            name="avatar"
            ref={avatarRef}
            onChange={handleAvatarUpload}
            accept="image/png, image/jpeg, image/jpg"
            hidden
          />
          <img src={preview ? preview : user.avatar ? user.avatar : defaultProfileImage} alt="" />
          <p>{user.name}</p>
          <button
            type="button"
            onClick={() => avatarRef.current.click()}
            aria-label="Upload media"
          >
            Upload Photo
          </button>
        </div>
        <div className={`${styles.collegeField} ${styles.textField}`}>
          <label htmlFor="college">College</label>
          <textarea
            type="text"
            id='college'
            value={user.collegeName}
            readOnly={true}
          />
        </div>
        <div className={styles.textField}>
          <label htmlFor="bio">Bio</label>
          <textarea
            type="text"
            id='bio'
            value={bio}
            onChange={(e) => { setIsChange(true); setBio(e.target.value) }}
            placeholder='Enter your bio here'
          />
        </div>
        <button
          type='submit'
          className={`${(isChange && bio) ? "" : styles.noChange} ${styles.submitBtn}`}
          disabled={!bio}
        >
          {
            isChanging ?
            <>
            {"Saving Changes"}
            <Spinner/>
            </> :
            "Save Changes"
          }
        </button>
      </form>
    </div>
  )
}

export default EditProfilePage