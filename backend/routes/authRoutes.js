import express from "express"
import { register, verifyCode, login, resendVerificationCode, logout } from '../controllers/authController.js'

const authRoutes = express.Router()

// all authRoutes have been integrated
authRoutes.post('/register', register);
authRoutes.post('/verify-code', verifyCode)
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.post('/resend-verify-code', resendVerificationCode);

export default authRoutes;