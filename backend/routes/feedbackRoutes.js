import express from 'express'
import { submitFeedback, getFeedbackByHistory, deleteFeedback } from '../controllers/feedbackController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/addfeedback', authMiddleware, submitFeedback)
router.get('/getfeedback/:history_id', authMiddleware, getFeedbackByHistory)
router.delete('/deletefeedback/:id', authMiddleware, deleteFeedback)

export default router