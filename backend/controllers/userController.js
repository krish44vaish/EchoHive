import mongoose from "mongoose"
import { User } from "../models/User.model.js";
import { uploadFileToCloudinary } from "../services/uploadService.js";

export const getUserProfile = async (req, res) => {
    try {
        let { userId } = req.params;
        const { username } = req.query;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId)
                .select('-password -verificationCode -verificationCodeExpiry')
                .populate([
                    { path: 'collegeId', model: 'College', select: 'name' },
                    {
                        path: 'reactedPosts',
                        populate: {
                            path: 'post',
                            model: 'Post',
                            populate: {
                                path: 'pollId',
                                model: 'Poll'
                            }
                        },
                    },
                    { path: 'friends', model: 'User', select: 'name' },
                    { path: 'notifications', model: 'Notification' },
                    {
                        path: 'posts',
                        model: 'Post',
                        options: { sort: { createdAt: 1 } },
                        populate: [
                            {
                                path: 'pollId',
                                model: 'Poll'
                            },
                            {
                                path: 'userId',
                                model: 'User',
                                select: 'name avatar'
                            }
                        ]
                    },
                    {
                        path: 'comments',
                        model: 'Comment',
                        populate: {
                            path: 'userId',
                            model: 'User',
                            select: 'name avatar',
                        }
                    }
                ]);

            if (user) {
                return res.status(200).json({ success: true, user });
            }
        }

        const userByName = await User.findOne({ name: username })
            .select('-password -verificationCode -verificationCodeExpiry')
            .populate([
                { path: 'collegeId', model: 'College', select: 'name' },
                {
                    path: 'reactedPosts',
                    populate: {
                        path: 'post',
                        model: 'Post',
                        populate: [
                            {
                                path: 'pollId',
                                model: 'Poll'
                            },
                            {
                                path: 'userId',
                                model: 'User',
                                select: 'name avatar'
                            }
                        ]
                    },
                },
                { path: 'friends', model: 'User', select: 'name' },
                { path: 'notifications', model: 'Notification' },
                {
                    path: 'posts',
                    model: 'Post',
                    populate: [
                        {
                            path: 'pollId',
                            model: 'Poll'
                        },
                        {
                            path: 'userId',
                            model: 'User',
                            select: 'name avatar'
                        }
                    ]
                },
                {
                    path: 'comments',
                    model: 'Comment',
                    populate: {
                        path: 'userId',
                        model: 'User',
                        select: 'name avatar',
                    }
                },
            ]);

        if (!userByName) {
            return res.status(404).json({ success: false, message: "User not found" })
        } else {
            return res.status(200).json({ success: true, userByName });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const editUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, bio } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        const user = await User.findById(userId).select('-verificationCode -verificationCodeExpiry');

        let updatedMedia = null;
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (req.file) {
            const uploadResult = await uploadFileToCloudinary(req.file.buffer);
            updatedMedia = uploadResult.url;
        }
        user.avatar = updatedMedia || user.avatar;
        user.name = name || user.name;
        user.bio = bio || user.bio;

        await user.save();

        return res.status(200).json({ success: true, message: "User updated successfully", user });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const toggleFriend = async (req, res) => {
    try {

        const { friendId } = req.params;
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (friendId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot friend yourself" });
        }

        const newFriend = await User.findById(friendId);
        if (!newFriend) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const updateQuery = {};
        const updateQueryFriend = {};

        if (user.friends.some(friendId => newFriend._id.equals(friendId))) {
            updateQueryFriend.$pull = {}
            updateQueryFriend.$pull = { friendsOf: user._id }
            updateQuery.$pull = {}
            updateQuery.$pull = { friends: newFriend._id }
        } else {
            updateQueryFriend.$push = {}
            updateQueryFriend.$push = { friendsOf: user._id }
            updateQuery.$push = {}
            updateQuery.$push = { friends: newFriend._id }
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, updateQuery, { new: true });
        const updatedFriend = await User.findByIdAndUpdate(friendId, updateQueryFriend, { new: true });

        return res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User
            .findById(userId)
            .populate({
                path: 'friends',
                model: 'User',
                select: 'name'
            })

        return res.status(200).json({ success: true, friends: user.friends })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const skip = (page - 1) * limit;

        // Case-insensitive search for users whose name contains the query string
        const users = await User.find({
            name: { $regex: query, $options: 'i' },
            _id: { $ne: req.user._id } // Exclude the current user from results
        })
            .select('-password -verificationCode -verificationCodeExpiry -friendsOf -notifications -reactedPosts -comments')
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'collegeId',
                model: 'College',
                select: 'name'
            });

        const total = await User.countDocuments({
            name: { $regex: query, $options: 'i' },
            _id: { $ne: req.user._id }
        });

        return res.status(200).json({
            success: true,
            users,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Search users error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while searching users"
        });
    }
}

export const recommendedUsers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const recommendedUsers = await User.aggregate([
            { $match: { _id: { $nin: [...req.user.friends, req.user._id] } } },
            { $sample: { size: limit } },
            { $project: { _id: 1, name: 1, avatar: 1 } },
        ]);

        return res.status(200).json(recommendedUsers)

    } catch (error) {
        console.error("Search users error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error while searching users"
        });
    }
}