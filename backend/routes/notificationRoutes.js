import express from "express"
import { getNotifications, readNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
const notificationRoutes = express.Router();


// Marking a notification as Read nothing else we can update for this notification
notificationRoutes.put('/:notificationId/read', protect, readNotification);

// Getting all the notifications initiallt
notificationRoutes.get('/', protect, getNotifications);

export default notificationRoutes;