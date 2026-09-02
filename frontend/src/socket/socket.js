// socket/socket.ts
import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  socket = io("https://echohive-backend.onrender.com", {
    query: { userId },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;
