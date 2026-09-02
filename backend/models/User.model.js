import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String, //stores the url of User's profile picture avatar
        default: ""
    },
    bio: {
        type: String, //stores the bio of User
        default: ""
    },
    verificationCode: {
        type: String,
        required: true
    },
    verificationCodeExpiry: {
        type: Date,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        default: null
    }, // Links to college
    reactedPosts: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        voteType: {
            type: String,
            enum: ['upvote', 'downvote']
        }
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendsOf: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification"
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    dripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drip",
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

export const User = mongoose.model("User", UserSchema);
