import express from 'express'
import {
    createSharedReport,
    viewSharedReport,
    getMySharedReports,
    deactivateSharedReport,
    regenerateSharedReport
} from '../controllers/sharedReportController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// protected routes
router.post('/createreport', authMiddleware, createSharedReport)
router.get('/myreports', authMiddleware, getMySharedReports)
router.patch('/:id/deactivate', authMiddleware, deactivateSharedReport)
router.patch('/:id/regenerate', authMiddleware, regenerateSharedReport)

// public route - no auth needed
router.get('/:slug', viewSharedReport)

export default router