import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    content: { 
        type: String, 
        required: true 
    },  // Post text content
    postType: { 
        type: String, 
        enum: ["confession", "meme", "question"], 
        required: true 
    },
    collegeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "College", 
        default: null 
    }, // Null means global
    isGlobal: { 
        type: Boolean, 
        default: false 
    }, // If true, visible to all
    media: { 
        url: String, 
        mediaType: { 
            type: String, 
            enum: ["image", "gif"] 
        } 
    }, // Single media file
    pollId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Poll", 
        default: null 
    },
    upvotes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],  // Users who upvoted
    downvotes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }], // Users who downvoted
    comments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Comment" 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const Post = mongoose.model("Post", PostSchema);