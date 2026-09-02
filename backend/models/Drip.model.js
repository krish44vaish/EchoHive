import mongoose from "mongoose"

const DripSchema = new mongoose.Schema({
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        }
    ],
    activityDate: {
        type: Date,
        default: Date.now,
    }
});

export const Drip = mongoose.model("Drip", DripSchema);