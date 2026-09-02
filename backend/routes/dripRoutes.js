import express from "express"
import { getActivity, getDrip, getInbox, getProblem, getQuestionResponse, shuffleOptions, skipLast, updateDrip } from "../controllers/dripController.js";
import { protect } from "../middleware/authMiddleware.js";
const dripRoutes = express.Router()

// when user responds to a question
dripRoutes.post('/update/:dripId/:questionIndex/:selectedUserId', protect, updateDrip)

// skip the last question
dripRoutes.post('/skip-last/:dripId', protect, skipLast)

// when user gets a poll
dripRoutes.get('/', protect, getDrip)

// when user gets a problem
dripRoutes.get('/problem/:dripId/:questionIndex', protect, getProblem)

// when user shuffles questions for a problem
dripRoutes.post('/update/:dripId/:questionIndex', protect, shuffleOptions)

// to get activity section
dripRoutes.get('/activity', protect, getActivity)

// to get inbox section
dripRoutes.get('/inbox', protect, getInbox)

// to get question response
dripRoutes.get('/question-response/:questionResponseId', protect, getQuestionResponse)

export default dripRoutes;