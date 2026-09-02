import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js"

export const readNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const NotifiedUser = req.user;

        if (!NotifiedUser.notifications.some(userNotificationId => userNotificationId.toString() === notificationId)) {
            return res.status(404).json({
                success: false,
                message: "Couldn't find the notification you were looking for"
            })
        }

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                isRead: true
            },
            { new: true }
        )

        return res.status(201).json({
            success: true,
            message: "Notification updated successfully",
            notification
        })
        
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('notifications');
        const populatedNotifications = await Notification.populateReferences(user.notifications)
        
        return res.status(200).json(populatedNotifications)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}