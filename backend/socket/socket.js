import { Server } from 'socket.io';
import express from "express";
import http from "http";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
}

const server = http.createServer(app);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true, // since axios instance has withCredentials: true, 
        // server must respond with access-control-allow-credentials: true or else request will be blocked
        allowedHeaders: ['Content-Type', 'Authorization'], // Required for credentials
    }
})

export const userSocketMap = {} // this map stores socket id corresponding the user id; userId --> socketId

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: UserId = ${userId}, SocketId = ${socket.id}`);
    }

    socket.on('disconnect', () => {
        if (userId) {
            console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
            delete userSocketMap[userId];
        }
    })
})

export { app, server, io };
