import express from 'express';
import { analyzeQuery, getHistory, getHistoryById } from '../controllers/queryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', authMiddleware, analyzeQuery);
router.get('/history', authMiddleware, getHistory);
router.get('/history/:id', authMiddleware, getHistoryById);

export default router;