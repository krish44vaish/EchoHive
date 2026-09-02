import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    questionResponse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionResponse",
        default: null
    },
    options: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const Question = mongoose.model("Question", QuestionSchema);