import React, { useState } from 'react'
import styles from '../styles/Signup.module.css'
import logo from '../assets/twitter.jpg'
import collegeImage from '../assets/college.png'
import bulbImage from '../assets/bulb.jpeg'
import { BsEyeSlash, BsEye } from 'react-icons/bs'
import { Navigate, useNavigate } from 'react-router-dom'
import { signUpUser } from '../api/auth'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice.js'
import { toast } from 'sonner'

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = localStorage.getItem('token')


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await signUpUser(name, email, password)
      if (response.success) {
        dispatch(setCredentials({
          token: response.token,
          user: response.user,
          isVerified: response.user.isVerified,
          isAuthenticated: false,
        }))
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  if(token) {
    return (
      <Navigate to='/verify'/>
    )
  }
  

  return (
    <div className={styles.signupPage}>
      <div className={styles.formContainer}>
        <div className={styles.collegeImage}>
          <img src={collegeImage} alt="" />
        </div>
        <div className={styles.logoContainer}>
          <img src={logo} alt="logo" className={styles.logo} />
          <p>EchoHive</p>
        </div>
        <div className={styles.signupText}>
          <p>Sign Up</p>
          <span>Join the community today</span>
        </div>
        <div className={styles.signupForm}>
          <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.inputField}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" placeholder='Enter your name' value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.inputField}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder='Enter your university email' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.inputField}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInput}>
                <input type={showPassword ? "text" : "password"} id="password" placeholder='Create a strong password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className={styles.visibilityIcon}>
                  {
                    showPassword ?
                      <BsEyeSlash onClick={handleShowPassword} /> :
                      <BsEye onClick={handleShowPassword} />
                  }
                </div>
              </div>
            </div>
            <button type='submit' className={styles.btnStyles}>
              Sign Up
            </button>
          </form>
          <div className={styles.signupLogin}>
            <p>Already have an account <span onClick={() => { navigate('/login') }}> Log in </span></p>
          </div>
          <div className={styles.bulbImage}>
            <img src={bulbImage} alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup