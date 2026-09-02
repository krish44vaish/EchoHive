import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import cookieParser from "cookie-parser"
import authRoutes from './routes/authRoutes.js'
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import { app, server } from "./socket/socket.js";
import dripRoutes from "./routes/dripRoutes.js";

dotenv.config();

connectDb()

app.use(cookieParser());

app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({ extended: true }))

// Routes setting
app.use('/api/auth', authRoutes) // for authentication these are the routes
app.use('/api/posts', postRoutes) // for creating posts and comments as well
app.use('/api/notifications', notificationRoutes) // for notification related updates
app.use('/api/users', userRoutes) // for user profile
app.use('/api/drips', dripRoutes) // for drips and all


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));