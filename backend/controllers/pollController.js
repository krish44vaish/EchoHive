import mongoose from "mongoose";
import { Poll } from "../models/Poll.model.js";

export const votePoll = async (req, res) => {
    try {
        const { pollId } = req.params;
        const index = Number(req.params.index);
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(pollId)) {
            return res.status(404).json({ success: false, message: "No poll found" })
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: "No poll found" })
        }

        if (poll.voters.some(({ userId: votersId }) => votersId.equals(userId))) {
            return res.status(409).json({ success: false, message: "You have already voted on this post" })
        }

        if (Date.now() > new Date(poll.expiresAt)) {
            return res.status(400).json({ success: false, message: "Poll has already expired" })
        }

        if (index < 0 || index >= poll.options.length) {
            return res.status(400).json({ success: false, message: "Not a valid option index" })
        }

        poll.options[index].votes += 1;
        poll.voters.push({ userId, optionIndex:index });
        await poll.save();

        return res.status(200).json({ sucess: true, message: "Poll updated successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}