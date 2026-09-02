import React, { useEffect, useRef, useState } from 'react'
import styles from '../styles/ChangePassword.module.css'
import defaultProfileImage from '../assets/jack.png'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { toast } from 'sonner'
import { updatePassword } from '../api/user'
import Spinner from './Spinner'

const ChangePassword = () => {

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
    });
    const [canChange, setCanChange] = useState(false)
    const [isChanging, setIsChanging] = useState(false)
    const [errorMessages, setErrorMessages] = useState({
        currentError: "",
        confirmError: "",
        newError: "",
    })


    const handlePasswordChangesSave = async (e) => {
        e.preventDefault()
        setIsChanging(true)
        try {
            const response = await updatePassword(form.currentPassword, form.newPassword)
            setErrorMessages({ ...errorMessages, currentError: "" })
            setForm({
                ...form,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
            setCanChange(false)
            toast.success("Password updated successfully")
        } catch (error) {
            setErrorMessages({
                ...errorMessages,
                currentError: "Current password is incorrect"
            })
            toast.error(error.message)
        } finally {
            setIsChanging(false)
        }
    }

    const handleShowCurrent = () => {
        setForm({ ...form, showCurrent: !form.showCurrent })
    }

    const handleShowNew = () => {
        setForm({ ...form, showNew: !form.showNew })
    }

    const handleShowConfirm = () => {
        setForm({ ...form, showConfirm: !form.showConfirm })
    }

    const handleCurrentPasswordChange = (e) => {
        setForm({ ...form, currentPassword: e.target.value })
        setErrorMessages({ ...errorMessages, currentError: "" })
        if (e.target.value.length > 0) {
            if (form.newPassword.length >= 6 && form.newPassword === form.confirmPassword) {
                setCanChange(true)
            }
        } else {
            setCanChange(false)
        }
    }

    const handleConfirmPasswordChange = (e) => {
        setForm({ ...form, confirmPassword: e.target.value })
        if (form.newPassword.length > 0 && form.newPassword === e.target.value) {
            if (form.currentPassword.length > 0 && form.newPassword.length >= 6) {
                setCanChange(true)
            }
            setErrorMessages({ ...errorMessages, confirmError: "" })
        } else if (e.target.value.length > 0) {
            setCanChange(false)
            setErrorMessages({ ...errorMessages, confirmError: "Password didn't match with new password" })
        }
    }

    const handleNewPasswordChange = (e) => {
        setForm({ ...form, newPassword: e.target.value })

        if (e.target.value.length < 6) {
            setErrorMessages(prev => ({
                ...prev,
                newError: "Password must be at least 6 characters long"
            }));
        } else {
            setErrorMessages(prev => ({
                ...prev,
                newError: ""
            }));
        }

        if (form.newPassword.length > 0 && e.target.value === form.confirmPassword) {
            if (form.newPassword.length > 0 && e.target.value.length >= 6) {
                setCanChange(true)
            }
            setErrorMessages(prev => ({ ...prev, confirmError: "" }))
        } else if (form.newPassword.length > 0) {
            setCanChange(false)
            setErrorMessages(prev => ({ ...prev, confirmError: "Password didn't match with new password" }))
        }
    }

    return (
        <div className={styles.editSectionContainer}>
            <h2 className={styles.editSectionHeader}>
                Change Password
            </h2>
            <form className={styles.editPasswordForm} onSubmit={handlePasswordChangesSave}>
                <div className={styles.textField}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className={`${styles.passwordInput} ${errorMessages.currentError ? styles.errorInputStyles : ""}`}>
                        <input
                            type={form.showCurrent ?
                                "text" :
                                "password"}
                            id="currentPassword"
                            placeholder='Your current password'
                            value={form.currentPassword}
                            onChange={handleCurrentPasswordChange}
                        />
                        <div className={styles.visibilityIcon}>
                            {
                                form.showCurrent ?
                                    <BsEyeSlash onClick={handleShowCurrent} /> :
                                    <BsEye onClick={handleShowCurrent} />
                            }
                        </div>
                    </div>
                    <span>
                        {errorMessages.currentError}
                    </span>
                </div>
                <div className={styles.textField}>
                    <label htmlFor="newPassword">New Password</label>
                    <div className={`${styles.passwordInput} ${errorMessages.newError ? styles.errorInputStyles : ""}`}>
                        <input
                            type={form.showNew ?
                                "text" :
                                "password"}
                            id="newPassword"
                            placeholder='Your new password'
                            value={form.newPassword}
                            onChange={handleNewPasswordChange}
                        />
                        <div className={styles.visibilityIcon}>
                            {
                                form.showNew ?
                                    <BsEyeSlash onClick={handleShowNew} /> :
                                    <BsEye onClick={handleShowNew} />
                            }
                        </div>
                    </div>
                    <span>
                        {errorMessages.newError}
                    </span>
                </div>
                <div className={styles.textField}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className={`${styles.passwordInput} ${errorMessages.confirmError ? styles.errorInputStyles : ""}`}>
                        <input
                            type={form.showConfirm ?
                                "text" :
                                "password"}
                            id="confirmPassword"
                            placeholder='Confirm password'
                            value={form.confirmPassword}
                            onChange={handleConfirmPasswordChange}
                        />
                        <div className={styles.visibilityIcon}>
                            {
                                form.showConfirm ?
                                    <BsEyeSlash onClick={handleShowConfirm} /> :
                                    <BsEye onClick={handleShowConfirm} />
                            }
                        </div>
                    </div>
                    <span>
                        {errorMessages.confirmError}
                    </span>
                </div>
                <button type='submit' className={`${canChange ? "" : styles.noChange} ${styles.submitBtn}`}>
                    {isChanging ?
                        <>
                            Saving Password <Spinner />
                        </> :
                        "Save Changes"}
                </button>
            </form>
        </div>
    )
}

export default ChangePassword