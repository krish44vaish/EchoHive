import mongoose from "mongoose";
import { Comment } from "../models/Comment.model.js";
import { Post } from "../models/Post.model.js";
import { User } from "../models/User.model.js";

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Comment must not be empty" })
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({ message: "Post not found" })
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        const user = await User.findById(userId);
        const comment = await Comment.create({
            postId: new mongoose.Types.ObjectId(postId),
            userId,
            content
        })

        user.comments.push(comment._id)
        await user.save()

        await comment.populate('userId')
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id }
        })

        return res.status(201).json(comment);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if (!comment.userId.equals(userId)) {
            return res.status(403).json({ message: "Unauthorized action" })
        }

        await User.findByIdAndUpdate(userId, {
            $pull: {
                comments: comment._id
            }
        })

        await Post.findByIdAndUpdate(comment.postId, {
            $pull: { comments: comment._id }
        })

        await Comment.findByIdAndDelete(comment._id);

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if (!comment.userId.equals(userId)) {
            return res.status(403).json({ message: "Unauthorized action" })
        }

        if (!content?.trim()) {
            return res.status(400).json({ message: "Comment content cannot be empty" });
        }

        comment.content = content || comment.content;
        await comment.save();

        return res.status(200).json({ message: "Comment updated successfully" });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const voteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { isUpvote } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const updateQuery = {
            $pull: {}
        }

        if (isUpvote) {
            if (comment.upvotes.includes(userId)) {
                updateQuery.$pull.upvotes = userId
            } else {
                updateQuery.$push = {}
                updateQuery.$pull.downvotes = userId
                updateQuery.$push.upvotes = userId
            }
        } else {
            if (comment.downvotes.includes(userId)) {
                updateQuery.$pull.downvotes = userId
            } else {
                updateQuery.$push = {}
                updateQuery.$pull.upvotes = userId
                updateQuery.$push.downvotes = userId
            }
        }
        await Comment.findByIdAndUpdate(comment._id, updateQuery, { new: true })

        return res.status(201).json("Comment voted successfully")

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message })
    }
}