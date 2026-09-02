import { Poll } from "../models/Poll.model.js";
import { Post } from "../models/Post.model.js";
import { Comment } from "../models/Comment.model.js";
import { User } from "../models/User.model.js";
import { uploadFileToCloudinary } from "../services/uploadService.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const collegeId = req.user.collegeId;
        const { isAnonymous, content, postType, isGlobal, poll } = req.body;
        let media = null;
        let pollDoc = null;

        // Handle media upload
        if (req.file) {
            media = await uploadFileToCloudinary(req.file.buffer);
        }

        // Handle poll creation
        if (poll && poll.length > 0) {
            pollDoc = await Poll.create({
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
                options: poll.map(optionText => ({ text: optionText, votes: 0 })), // Store vote count
            });
        }

        // Create the post
        const post = await Post.create({
            userId,
            isAnonymous,
            content,
            postType,
            collegeId,
            isGlobal,
            media,
            pollId: pollDoc ? pollDoc._id : null, // Store poll ID if poll exists
            upvotes: [],
            downvotes: [],
            comments: [],
        });

        const user = await User.findById(userId);
        user.posts.push(post._id);
        await user.save();

        return res.status(201).json(post); // Send response
    } catch (error) {
        console.log(error.message);

        res.status(500).json({ error: error.message });
    }
};

export const getPost = async (req, res) => {

    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid postId format" });
        }

        const post = await Post.findById(postId).populate([
            { path: 'pollId', model: 'Poll' },
            {
                path: 'comments',
                model: 'Comment',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'userId',
                    model: 'User'
                },
            },
            { path: 'userId', model: 'User' },
        ]).lean();

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const postWithVote = {
            ...post,
            userVote: req.user.reactedPosts.findIndex((reactedPost) => reactedPost.post.equals(post._id)) != -1 ?
                req.user.reactedPosts[req.user.reactedPosts.findIndex((reactedPost) => reactedPost.post.equals(post._id))].voteType :
                null
        }

        return res.status(200).json(postWithVote);
    } catch (error) {
        console.log(error.message);

        return res.status(500).json({ error: error.message });
    }
};


export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({ error: "Post not found" });
        }

        const post = await Post.findById(postId);


        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (!post.userId.equals(req.user._id)) {
            return res.status(403).json({ error: "Unauthorized action" })
        }

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { posts: post._id }
        })

        if (post.pollId) {
            await Poll.deleteOne({ _id: post.pollId });
        }

        await Post.deleteOne({ _id: post._id });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const editPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const collegeId = req.user.collegeId;
        const { isAnonymous, content, postType, isGlobal, poll, removeImage } = req.body;
        let media = null;
        let pollDoc = null;
        const { postId } = req.params;

        // Handle media upload
        if (req.file) {
            media = await uploadFileToCloudinary(req.file.buffer);
        }


        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({ error: "Post not found" });
        }

        //find existing post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // only owner can edit 
        if (!post.userId.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not authorized to edit this post" });
        }

        // Handle poll updation
        if (poll && poll.length > 0 && post.pollId) {
            pollDoc = await Poll.findByIdAndUpdate(post.pollId, {
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
                options: poll.map(optionText => ({ text: optionText, votes: 0 })), // Store vote count
                voters: []
            });
        }

        // Handle poll creation
        if (poll && poll.length > 0 && !post.pollId) {
            pollDoc = await Poll.create({
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
                options: poll.map(optionText => ({ text: optionText, votes: 0 })), // Store vote count
            });
            post.pollId = pollDoc._id;
        }

        // Handle poll deletion
        if ((!poll || poll?.length === 0) && post.pollId) {
            await Poll.findByIdAndDelete(post.pollId)
            post.pollId = null;
        }

        let updatedMedia = {}
        if (req.file) {
            const uploadResult = await uploadFileToCloudinary(req.file.buffer);
            updatedMedia = {
                url: uploadResult.url,
                mediaType: uploadResult.mediaType
            }
        } else if (removeImage === 'true' || removeImage === true) {
            updatedMedia = null;
        } else {
            updatedMedia = {
                url: post.media.url,
                mediaType: post.media.mediaType
            }
        }

        post.content = content || post.content;
        post.postType = postType || post.postType;
        post.media = updatedMedia;
        post.isAnonymous = isAnonymous || post.isAnonymous;
        post.isGlobal = isGlobal || post.isGlobal;

        await post.save();

        return res.status(200).json({ message: "Post updated successfully", post });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
};

export const votePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { isUpvote } = req.body;

        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid postId format" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (isUpvote == undefined) {
            return res.status(400).json({ error: "Invalid voting state" });
        }

        const userId = req.user._id;
        const postObjectId = new mongoose.Types.ObjectId(postId);

        // First remove any existing vote for this post
        await User.findByIdAndUpdate(userId, {
            $pull: {
                reactedPosts: {
                    post: postObjectId
                }
            }
        });

        // Then add the new vote if needed
        if (isUpvote) {
            // Upvote logic
            if (post.upvotes.includes(userId)) {
                // Already upvoted - just remove (handled above)
                await Post.findByIdAndUpdate(postId, {
                    $pull: { upvotes: userId }
                });
            } else {
                // Add upvote
                await Post.findByIdAndUpdate(postId, {
                    $push: { upvotes: userId },
                    $pull: { downvotes: userId }
                });
                await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        reactedPosts: {
                            post: postObjectId,
                            voteType: 'upvote'
                        }
                    }
                });
            }
        } else {
            // Downvote logic
            if (post.downvotes.includes(userId)) {
                // Already downvoted - just remove (handled above)
                await Post.findByIdAndUpdate(postId, {
                    $pull: { downvotes: userId }
                });
            } else {
                // Add downvote
                await Post.findByIdAndUpdate(postId, {
                    $push: { downvotes: userId },
                    $pull: { upvotes: userId }
                });
                await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        reactedPosts: {
                            post: postObjectId,
                            voteType: 'downvote'
                        }
                    }
                });
            }
        }

        return res.status(200).json({ message: "Vote updated successfully" });
    } catch (error) {
        console.error("Vote error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const getPosts = async (req, res) => {
    try {
        let { isGlobal, collegeId, page, postType } = req.query;
        let itemsPerPage = 10;

        if (collegeId && !mongoose.Types.ObjectId.isValid(collegeId)) {
            return res.status(400).json({ error: "Invalid collegeId format" });
        }

        // Convert isGlobal to a proper boolean
        isGlobal = isGlobal === "true";

        // Get all user votes in ONE query (not per post)
        const userVotes = await User.aggregate([
            {
                $match: {
                    _id: req.user._id
                }
            },
            {
                $unwind: "$reactedPosts"
            },
            {
                $project: {
                    _id: 0,
                    postId: "$reactedPosts.post",
                    voteType: "$reactedPosts.voteType"
                }
            }
        ]);

        if (isGlobal) {
            const filters = { isGlobal: true };
            if (!(postType === 'All')) {
                filters.postType = postType
            }
            const posts = await Post
                .find(filters)
                .sort({ createdAt: -1 })
                .skip(itemsPerPage * (page - 1))
                .limit(itemsPerPage)
                .populate('userId pollId')
                .lean();

            // Map votes to posts
            const postsWithVotes = posts.map(post => ({
                ...post,
                userVote: userVotes.find(v => v.postId.equals(post._id))?.voteType || null
            }));

            return res.status(200).json(postsWithVotes);
        }

        if (!collegeId) {
            return res.status(400).json({ message: "Please enter a valid query paramter" });
        }

        // Ensure collegeId is converted to an ObjectId
        if (!req.user.collegeId.equals(new mongoose.Types.ObjectId(collegeId))) {
            return res.status(403).json({ message: "Access Denied" });
        }

        const filters = { collegeId: new mongoose.Types.ObjectId(collegeId) };
        if (!(postType === 'All')) {
            filters.postType = postType
        }

        const posts = await Post
            .find(filters)
            .sort({ createdAt: -1 })
            .skip(itemsPerPage * (page - 1))
            .limit(itemsPerPage)
            .populate('userId pollId')
            .lean();

        // Map votes to posts
        const postsWithVotes = posts.map(post => ({
            ...post,
            userVote: userVotes.find(v => v.postId.equals(post._id))?.voteType || null
        }));

        return res.status(200).json(postsWithVotes);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
};

export const getTrendingPosts = async (req, res) => {
    try {
        let { isGlobal, collegeId, page, postType } = req.query;
        let itemsPerPage = 10;
        if (collegeId && !mongoose.Types.ObjectId.isValid(collegeId)) {
            return res.status(400).json({ error: "Invalid collegeId format" });
        }

        // Convert isGlobal to a proper boolean
        isGlobal = isGlobal === "true";

        const fetchQuery = {};

        // Ensure collegeId is converted to an ObjectId1
        if (collegeId && !req.user.collegeId.equals(new mongoose.Types.ObjectId(collegeId))) {
            return res.status(403).json({ message: "Access Denied" });
        } else {
            if (collegeId)
                fetchQuery.collegeId = collegeId;
        }

        if (isGlobal) {
            fetchQuery.isGlobal = true;
        }

        if (!(postType === 'All')) {
            fetchQuery.postType = postType
        }

        if (Object.keys(fetchQuery).length === 0) {
            return res.status(400).json({ message: "Please give a valid query" })
        }
        const posts = await Post.find(fetchQuery)
            .populate([
                {
                    path: 'userId',
                    model: 'User'
                },
                {
                    path: 'pollId',
                    model: 'Poll'
                },
                {
                    path: 'comments',
                    model: 'Comment'
                }
            ])
            .sort({ createdAt: -1 })
            .lean(); // Get recent posts


        // Get all user votes in ONE query (not per post)3
        const userVotes = await User.aggregate([
            {
                $match: {
                    _id: req.user._id
                }
            },
            {
                $unwind: "$reactedPosts"
            },
            {
                $project: {
                    _id: 0,
                    postId: "$reactedPosts.post",
                    voteType: "$reactedPosts.voteType"
                }
            }
        ]);

        const now = new Date();
        // Calculate trending score for each post
        const trendingPosts = posts.map((post, index) => {
            const timeDiff = (now - post.createdAt) / (1000 * 60 * 60); // Time in hours
            const votes = post.upvotes.length - post.downvotes.length;
            const comments = post.comments.length;

            // Apply the trending formula
            const score = (votes * 2 + comments * 3) / Math.pow(timeDiff + 2, 1.5);

            return { ...post, score };
        });

        // Sort posts by trending score (descending order)
        trendingPosts.sort((a, b) => b.score - a.score);


        const startIdx = Math.min(itemsPerPage * (page - 1), trendingPosts.length);
        const endIdx = Math.min(startIdx + itemsPerPage, trendingPosts.length);
        const paginatedTrendingPosts = trendingPosts.slice(startIdx, endIdx);

        // Map votes to posts
        const postsWithVotes = paginatedTrendingPosts.map(post => ({
            ...post,
            userVote: userVotes.find(v => v.postId.equals(post._id))?.voteType || null
        }));


        res.status(200).json(postsWithVotes); // Return 10 pages for each request
    } catch (error) {
        console.error("Error fetching trending posts:", error.message);
        res.status(500).json({ error: "Failed to fetch trending posts" });
    }
};