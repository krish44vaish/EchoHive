import React, { useState } from 'react'
import styles from '../styles/Signup.module.css'
import logo from '../assets/twitter.jpg'
import collegeImage from '../assets/college.png'
import bulbImage from '../assets/bulb.jpeg'
import { BsEyeSlash, BsEye } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'
import { loginUser } from '../api/auth'
import { toast } from 'sonner'

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await loginUser(email, password)
            if (response.success) {
                dispatch(setCredentials({
                    token: response.token,
                    user: response.user,
                    isVerified: response.user.isVerified,
                    isAuthenticated: true,
                }))
                toast.success("You logged in successfully")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    const handleShowPassword = () => {
        setShowPassword(!showPassword)
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
                    <p>Login</p>
                    <span>We have been waiting for you</span>
                </div>
                <div className={styles.signupForm}>
                    <form onSubmit={handleSubmit} className={styles.form}>
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
                            Log In
                        </button>
                    </form>
                    <div className={styles.signupLogin}>
                        <p>Don't have an account <span onClick={() => navigate('/signup')}> Register now </span> </p>
                    </div>
                    <div className={styles.bulbImage}>
                        <img src={bulbImage} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login