import React, { useEffect, useState } from 'react'
import styles from '../styles/VerifyCode.module.css'
import OtpInput from 'react-otp-input';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'
import { resendOtp, verifyUser } from '../api/auth';
import { setIsVerified } from '../features/auth/authSlice.js'
import Spinner from '../components/Spinner.jsx';

const VerifyCode = () => {
    const [otp, setOtp] = useState('');
    const { token, isVerified } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [resend, setResend] = useState(false)

    const handleOtpSubmit = async () => {
        try {
            const response = await verifyUser(otp)
            if (response.success) {
                dispatch(setIsVerified({
                    isVerified: true
                }))
                toast.success(response.message)
                navigate('/explore/global')
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    const handleResendotp = async () => {
        setResend(true)
        try {
            const response = await resendOtp()
            if(response.success){
                toast.success(response.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        } finally {
            setResend(false)
        }
    }

    if (!token) {
        return (
            <Navigate to='/signup' />
        )
    }
    
    if (isVerified === true) {
        return (
            <Navigate to='/explore/global' />
        )
    }

    return (
        <div className={styles.verifyPage}>
            <div className={styles.formContainer}>
                <div className={styles.verifyForm}>
                    <div className={styles.verifyText}>
                        <p>
                            Verification Code
                        </p>
                        <span>
                            Enter the 6-digit code we've sent to your email
                        </span>
                    </div>
                    <div className={styles.otpInput}>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderInput={(props) => <input {...props} />}
                        />
                    </div>
                    <div className={styles.resendCode}>
                        <div>
                            Didn't get the code? 
                            <span onClick={handleResendotp}>Click to resend</span>
                            {
                                resend && <Spinner/>
                            }
                        </div>
                    </div>
                    <button onClick={handleOtpSubmit} className={styles.btnStyles}>
                        Verify
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyCode