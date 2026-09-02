import mongoose from "mongoose"

const PollSchema = new mongoose.Schema({
    expiresAt: { 
        type: Date
    },
    options: [
        {
            text: { type: String, required: true },
            votes: { type: Number, default: 0 }  // Just store count
        }
    ],
    voters: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        optionIndex: { type: Number } // Index of the option they voted for
    }]
});

export const Poll = mongoose.model("Poll", PollSchema);