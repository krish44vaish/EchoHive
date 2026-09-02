import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema({
    notificationType: {
        type: String,
        enum: ["QUESTION_RESPONSE", "NEW_USER_JOINED"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    }, // Points to QuestionResponse if type is QUESTION_RESPONSE
    // else it points to User if type is NEW_USER_JOINED
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

NotificationSchema.statics.populateReferences = async function (notifications) {
    return Promise.all(
        notifications.map(async (n) => {
            
            let referenceModel;

            if (n.notificationType === "QUESTION_RESPONSE") {
                referenceModel = 'QuestionResponse';
            } else {
                referenceModel = 'User';
            }

            const ref = await mongoose.model(referenceModel).findById(n.referenceId);

            // Check if 'n' is a Mongoose document
            const notificationObject = typeof n.toObject === 'function' ? n.toObject() : n;

            return {
                ...notificationObject,
                referenceId: ref
            };
        })
    );
};


export const Notification = mongoose.model("Notification", NotificationSchema)