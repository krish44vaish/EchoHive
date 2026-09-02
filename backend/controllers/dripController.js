import mongoose from "mongoose";
import { Drip } from "../models/Drip.model.js";
import { Question } from "../models/Question.model.js";
import { QuestionResponse } from "../models/QuestionResponse.model.js";
import { User } from "../models/User.model.js";
import { QUESTIONS_POOL } from "../utils/questions.js";
import { io, userSocketMap } from "../socket/socket.js";
import { Notification } from "../models/Notification.model.js";

export const createDrip = async (userId) => {
    try {
        // i will not create a drip immendiatly after registration
        // it will be created first time after the user click on the drip page
        // we will check in frontend if a drip object already exists for the user
        // if it does not exist we will create a new drip object
        // and assign it with the user ki id
        const user = await User.findById(userId);
        const friendIds = user.friends;
        // need to create a new Drip
        const drip = await Drip.create({
            questions: []
        })

        user.dripId = drip._id;
        await user.save(); //saving the dripsId so that user can query drip when visiting the page
        // efficiently
        const questions = QUESTIONS_POOL.sort(() => Math.random() - 0.5).slice(0, 6);
        // creating questions
        try {
            const createdQuestions = await Promise.all(
                questions.map(async (questionText) => {
                    let options = [];
                    if (friendIds.length >= 4) {
                        options = friendIds.sort(() => Math.random() - 0.5).slice(0, 4);
                    } else {
                        const neededUsers = 4 - friendIds.length;
                        const randomUsers = await User.aggregate([
                            { $match: { _id: { $nin: [...friendIds, userId] } } },
                            { $sample: { size: neededUsers } }
                        ]);
                        options = [...friendIds, ...randomUsers.map(u => u._id)];
                    }

                    // Create the question
                    const question = await Question.create({
                        text: questionText,
                        options: options.map(uId => { return { "userId": uId } })
                    });

                    return question._id;
                })
            );

            // Add questions to Drip
            drip.questions = createdQuestions;
        } catch (error) {
            console.log("Error in creating questions for drip");
            console.error("Error message: ", error.message);
        }


        await drip.save();
        await drip.populate({
            path: "questions",
            model: "Question",
            populate: [
                {
                    path: 'options.userId',
                    model: 'User',
                    select: 'name',
                },
                {
                    path: 'questionResponse',
                    model: "QuestionResponse",
                    select: 'selectedOption',
                }
            ]
        })

        return drip;
    } catch (error) {
        console.error("Error creating drip:", error.message);
        throw error;
    }
}

export const updateDrip = async (req, res) => {
    try {
        const { dripId, questionIndex, selectedUserId } = req.params
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(dripId)) {
            return res.status(404).json({ success: false, message: "Drip not found" })
        }

        //Convert questionIndex to number and validate
        const index = parseInt(questionIndex);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: "Question index must be a positive number"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
            return res.status(404).json({ success: false, message: "Selected User not found" })
        }

        const drip = await Drip.findById(dripId).populate({
            path: 'questions',
            model: 'Question'
        })

        if (!req.user.dripId.equals(dripId)) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        if (!drip) {
            return res.status(404).json({ success: false, message: "Drip not found" })
        }

        if (questionIndex >= drip.questions.length) {
            return res.status(404).json({ success: false, message: "Question not found" })
        }

        if (Date.now() < drip.activityDate) {
            return res.status(400).json({ success: false, message: "Drip is not currently active" })
        }

        const question = await Question.findById(drip.questions[index]._id)

        if (question.questionResponse) {
            return res.status(400).json({ success: false, message: "Question has already been responded to" })
        }
        
        if (!question.options.some(({ userId }) => userId.equals(selectedUserId))) {
            return res.status(400).json({ success: false, message: "Selected user not found within question options" })
        }

        const questionResponse = await QuestionResponse.create({
            questionId: question._id,
            responderId: req.user._id,
            selectedOption: selectedUserId,
        })

        try {
            const notification = await Notification.create({
                notificationType: "QUESTION_RESPONSE",
                message: `Someone in college`,
                referenceId: questionResponse._id,
            })

            const selectedUser = await User.findById(selectedUserId);
            selectedUser.notifications.push(notification._id);
            await selectedUser.save();

            if (selectedUserId in userSocketMap) {
                io.to(userSocketMap[selectedUserId]).emit('newNotification', notification);
            }

        } catch (error) {
            console.log("Error in sending notifications to selected user");
            console.error("Error message: ", error.message);
        }

        question.questionResponse = questionResponse._id;
        await question.save();
        await drip.populate("questions")
        
        if (drip.questions.findIndex(dripQuestion => dripQuestion._id.equals(question._id)) === drip.questions.length - 1) {


            drip.activityDate = Date.now() + 1000 * 60 * 60

            const userId = req.user._id;
            const friendIds = req.user.friends;

            const questions = QUESTIONS_POOL.sort(() => Math.random() - 0.5).slice(0, 6);
            // creating questions
            try {
                const createdQuestions = await Promise.all(
                    questions.map(async (questionText) => {
                        let options = [];
                        if (friendIds.length >= 4) {
                            options = friendIds.sort(() => Math.random() - 0.5).slice(0, 4);
                        } else {
                            const neededUsers = 4 - friendIds.length;
                            const randomUsers = await User.aggregate([
                                { $match: { _id: { $nin: [...friendIds, userId] } } },
                                { $sample: { size: neededUsers } }
                            ]);
                            options = [...friendIds, ...randomUsers.map(u => u._id)];
                        }

                        // Create the question
                        const question = await Question.create({
                            text: questionText,
                            options: options.map(uId => { return { "userId": uId } })
                        });

                        return question._id;
                    })
                );

                // Add questions to Drip
                drip.questions = createdQuestions;
            } catch (error) {
                console.log("Error in creating questions for drip");
                console.error("Error message: ", error.message);
            }

            await drip.save();
        }

        await drip.populate({
            path: "questions",
            model: "Question",
            populate: [
                {
                    path: 'options.userId',
                    model: 'User',
                    select: 'name avatar',
                },
                {
                    path: 'questionResponse',
                    model: "QuestionResponse",
                    select: 'selectedOption',
                }
            ]
        })

        return res.status(200).json(drip);

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const skipLast = async (req, res) => {
    try {
        const { dripId } = req.params
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(dripId)) {
            return res.status(400).json({ success: false, message: "Drip not found" })
        }

        const drip = await Drip.findById(dripId).populate({
            path: 'questions',
            model: 'Question'
        })

        if (!req.user.dripId.equals(dripId)) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        if (!drip) {
            return res.status(400).json({ success: false, message: "Drip not found" })
        }

        if (Date.now() < drip.activityDate) {
            return res.status(400).json({ success: false, message: "Drip is not currently active" })
        }

        await drip.populate("questions")

        drip.activityDate = Date.now() + 1000 * 60 * 60

        const friendIds = req.user.friends;

        const questions = QUESTIONS_POOL.sort(() => Math.random() - 0.5).slice(0, 6);
        // creating questions
        try {
            const createdQuestions = await Promise.all(
                questions.map(async (questionText) => {
                    let options = [];
                    if (friendIds.length >= 4) {
                        options = friendIds.sort(() => Math.random() - 0.5).slice(0, 4);
                    } else {
                        const neededUsers = 4 - friendIds.length;
                        const randomUsers = await User.aggregate([
                            { $match: { _id: { $nin: [...friendIds, userId] } } },
                            { $sample: { size: neededUsers } }
                        ]);
                        options = [...friendIds, ...randomUsers.map(u => u._id)];
                    }

                    // Create the question
                    const question = await Question.create({
                        text: questionText,
                        options: options.map(uId => { return { "userId": uId } })
                    });

                    return question._id;
                })
            );

            // Add questions to Drip
            drip.questions = createdQuestions;
        } catch (error) {
            console.log("Error in creating questions for drip");
            console.error("Error message: ", error.message);
        }

        await drip.save();
        await drip.populate({
            path: "questions",
            model: "Question",
            populate: [
                {
                    path: 'options.userId',
                    model: 'User',
                    select: 'name avatar',
                },
                {
                    path: 'questionResponse',
                    model: "QuestionResponse",
                    select: 'selectedOption',
                }
            ]
        })

        return res.status(201).json(drip);

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getDrip = async (req, res) => {
    try {
        // for each user we will have a unique drip
        let drip;
        if (!req.user.dripId) {
            // create a new drip
            drip = await createDrip(req.user._id)
        } else {
            drip = await Drip.findById(req.user.dripId)
            await drip.populate({
                path: "questions",
                model: "Question",
                populate: [
                    {
                        path: 'options.userId',
                        model: 'User',
                        select: 'name avatar',
                    },
                    {
                        path: 'questionResponse',
                        model: "QuestionResponse",
                        select: 'selectedOption',
                    }
                ]
            })
        }
        
        return res.status(200).json(drip); //return the drip for the user
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getProblem = async (req, res) => {
    try {
        const { dripId, questionIndex } = req.params
        const userId = req.user._id;
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(dripId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Drip ID format"
            });
        }

        //Convert questionIndex to number and validate
        const index = parseInt(questionIndex);
        if (isNaN(index) || index < -1) {
            return res.status(400).json({
                success: false,
                message: "Question index must be a positive number"
            });
        }

        // Find drip with populated questions
        const drip = await Drip.findById(dripId)
            .populate({
                path: 'questions',
                select: '_id', // Only get IDs first for validation
                options: { lean: true }
            });

        if (!drip) {
            return res.status(404).json({
                success: false,
                message: "Drip not found"
            });
        }

        // Authorization check (compare drip's userId with requesting user)
        if (!req.user.dripId.equals(dripId)) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        // Validate question index range
        if (index >= drip.questions.length) {
            return res.status(404).json({
                success: false,
                message: `Question not found. Valid indexes: 0-${drip.questions.length - 1}`,
                totalQuestions: drip.questions.length
            });
        }
        
        // Check drip availability
        if (drip.activityDate && (new Date() < new Date(drip.activityDate)) && index === -1) {
            return res.status(200).json({
                success: true,
                message: "Drip is not active yet",
                activeAfter: drip.activityDate
            });
        }

        if (index === -1) {
            return res.status(200).json({
                success: true,
                message: "Poll is active",
            });
        }
        
        // Get full question with populated options
        const question = await Question.findById(drip.questions[index]._id)
            .populate([
                {
                    path: 'options.userId',
                    select: 'name avatar', // Only essential fields
                    model: 'User'
                }, {
                    path: 'questionResponse',
                    model: "QuestionResponse",
                    select: 'selectedOption',
                }
            ])
            .lean(); // Convert to plain JS object

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question data not found"
            });
        }

        return res.status(200).json({
            success: true,
            question,
            currentIndex: index,
            remainingQuestions: drip.questions.length - index - 1
        });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const shuffleOptions = async (req, res) => {
    try {
        const { dripId, questionIndex } = req.params
        const { newOptions } = req.body
        const userId = req.user._id;

        // Validating dripId
        if (!mongoose.Types.ObjectId.isValid(dripId)) {
            return res.status(400).json({ success: false, message: "Drip not found" })
        }

        // Find the drip with populated questions
        const drip = await Drip.findById(dripId).populate({
            path: 'questions',
            model: 'Question'
        })

        if (!drip) {
            return res.status(400).json({ success: false, message: "Drip not found" })
        }

        if (!req.user.dripId.equals(dripId)) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        //Convert questionIndex to number and validate
        const index = parseInt(questionIndex);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: "Question index must be a positive number"
            });
        }

        if (index < 0 || index >= drip.questions.length) {
            return res.status(400).json({ success: false, message: "Question not found" })
        }

        // Check drip activity status
        if (drip.activityDate && Date.now() < new Date(drip.activityDate).getTime()) {
            return res.status(400).json({
                success: false,
                message: "Drip is not currently active",
                nextActiveTime: drip.activityDate
            });
        }

        const question = await Question.findById(drip.questions[index]._id)

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Process new options
        let options = [];
        if (newOptions && newOptions.length > 0) {
            options = newOptions.map(id => new mongoose.Types.ObjectId(id));


            // Ensure user isn't including themselves as an option
            options = options.filter(optId => !optId.equals(userId));
        }

        if (options.length < 4) {
            const neededUsers = 4 - options.length;
            const randomUsers = await User.aggregate([
                { $match: { _id: { $nin: [...options, userId] } } },
                { $sample: { size: neededUsers } },
                { $project: { _id: 1 } },
            ]);

            options = [...options, ...randomUsers.map(u => u._id)];
        }

        // Update and save
        question.options = options.map(optId => ({ userId: optId })); // Match your schema structure
        await question.save();

        // Return populated question if needed
        const populatedQuestion = await Question.findById(drip.questions[index]._id)
            .populate([
                {
                    path: 'options.userId',
                    select: 'name avatar', // Only essential fields
                    model: 'User'
                }, {
                    path: 'questionResponse',
                    model: "QuestionResponse",
                    select: 'selectedOption',
                }
            ]).lean()

        return res.status(200).json(populatedQuestion);
    } catch (error) {
        console.error('Shuffle Error:', error);
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getActivity = async (req, res) => {
    try {
        const activityQuestionResponses = await QuestionResponse
            .find({ responderId: req.user._id })
            .populate([
                {
                    path: 'responderId',
                    model: 'User',
                    select: 'name avatar'
                },
                {
                    path: 'selectedOption',
                    model: 'User',
                    select: 'name avatar'
                },
                {
                    path: 'questionId',
                    model: 'Question',
                    select: 'text'
                },
            ])

        return res.status(200).json(activityQuestionResponses);

    } catch (error) {
        console.error('Error during fetching activity:', error);
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getInbox = async (req, res) => {
    try {
        const activityInboxResponses = await QuestionResponse
            .find({ selectedOption: req.user._id })
            .populate([
                {
                    path: 'responderId',
                    model: 'User',
                    select: 'collegeId',
                    populate:{
                        path: 'collegeId',
                        model: 'College',
                        select: 'name'
                    }
                },
                {
                    path: 'selectedOption',
                    model: 'User',
                    select: 'name avatar'
                },
                {
                    path: 'questionId',
                    model: 'Question',
                    select: 'text options',
                    populate: {
                        path: 'options.userId',
                        model: 'User',
                        select: 'name avatar'
                    }
                },
            ])

        return res.status(200).json(activityInboxResponses);

    } catch (error) {
        console.error('Error during fetching inbox:', error);
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}

export const getQuestionResponse = async (req, res) => {
    try {
        const { questionResponseId } = req.params;
        const QuestionResponses = await QuestionResponse
            .findById(questionResponseId)
            .populate([
                {
                    path: 'responderId',
                    model: 'User',
                    select: 'name avatar'
                },
                {
                    path: 'selectedOption',
                    model: 'User',
                    select: 'name avatar'
                },
                {
                    path: 'questionId',
                    model: 'Question',
                    populate: {
                        path: 'options',
                        model: 'User',
                        select: 'name avatar'
                    },
                    select: 'text options createdAt'
                },
            ])

        return res.status(200).json(activityInboxResponses);

    } catch (error) {
        console.error('Error during fetching question response:', error);
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
}