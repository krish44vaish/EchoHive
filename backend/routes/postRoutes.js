import express from "express"
import multer from "multer"
import { protect } from "../middleware/authMiddleware.js";
import { createPost, deletePost, editPost, getPost, getPosts, getTrendingPosts, votePost } from "../controllers/postController.js";
import { createComment, deleteComment, editComment, voteComment } from "../controllers/commentController.js";
import { votePoll } from "../controllers/pollController.js";
const postRoutes = express.Router()

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// create posts, [ get all college posts, get all global posts ](should be passed in query only)
// delete a post , get a single post

// Post Routes
postRoutes.post('/', protect, upload.single('image'), createPost);
postRoutes.get('/trending', protect, getTrendingPosts);
postRoutes.get('/', protect, getPosts);
postRoutes.get('/:postId', protect, getPost);
postRoutes.delete('/:postId', protect, deletePost);
postRoutes.put('/:postId', protect, upload.single('image'), editPost);
postRoutes.put('/:postId/vote', protect, votePost);

// Comment Routes
postRoutes.post('/:postId/comments', protect, createComment);
postRoutes.post('/:postId/comments/:commentId/vote', protect, voteComment);
postRoutes.delete('/:postId/comments/:commentId', protect, deleteComment);
postRoutes.put('/:postId/comments/:commentId', protect, editComment);

// Poll Routes
postRoutes.patch('/:postId/votepoll/:pollId/:index', protect, votePoll);

export default postRoutes;