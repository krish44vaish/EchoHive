import express from "express"
import multer from "multer"
import { 
    changePassword, 
    editUserProfile, 
    getFriends, 
    getUserProfile, 
    recommendedUsers, 
    searchUsers, 
    toggleFriend 
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const userRoutes = express.Router();
const upload = multer({ storage: multer.memoryStorage() })

// Profile specific routes
userRoutes.get('/recommended', protect, recommendedUsers)
userRoutes.get('/get-friends', protect, getFriends)
userRoutes.patch('/update-password', protect, changePassword)
userRoutes.get('/search', protect, searchUsers);
userRoutes.get('/', getUserProfile)
userRoutes.get('/:userId', getUserProfile)
userRoutes.patch('/:userId', protect, upload.single("image"), editUserProfile)

// Friend specific routes
userRoutes.post('/friends/:friendId', protect, toggleFriend);

export default userRoutes;