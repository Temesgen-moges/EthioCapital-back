import express from 'express';
import studentApplicationController from '../controllers/StudentApplication/StudentApplication.js';

const router = express.Router();

// Submit a new application
router.post('/student-applications', studentApplicationController.submitApplication);

// Get all applications (admin, entrepreneur, investor)
router.get('/student-applications', studentApplicationController.getApplications);

// Get a single application by ID
router.get('/student-applications/:id', studentApplicationController.getApplicationById);

// Approve an application (admin only)
router.patch('/student-applications/:id/approve', studentApplicationController.approveApplication);

// Reject an application (admin only)
router.patch('/student-applications/:id/reject', studentApplicationController.rejectApplication);

export default router;