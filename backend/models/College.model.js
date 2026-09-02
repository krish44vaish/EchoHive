import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    domains: [{ 
        type: String, 
        required: true, 
        unique: true 
    }], // e.g., "iitr.ac.in"
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }], // Users in this college
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const College = mongoose.model("College", CollegeSchema);