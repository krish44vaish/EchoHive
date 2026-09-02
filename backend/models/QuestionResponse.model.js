import mongoose from "mongoose";

const QuestionResponseSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The selected friend from the options
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Question Response will be send in the notification
// responder will have his own responses visible in his acitivity
// the selected option guy will get a notification and on clicking that
// details of the question will be visible

export const QuestionResponse = mongoose.model("QuestionResponse", QuestionResponseSchema);