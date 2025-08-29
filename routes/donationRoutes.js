import express from 'express';
import donationController from '../controllers/donationController/donationController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Assuming you have authentication middleware

const router = express.Router();

// Submit a new donation (authenticated investors only)
router.post('/student-donations', authMiddleware, donationController.submitDonation);

// Handle Chapa callback (public endpoint, no auth required for Chapa)
router.post('/student-callback', donationController.handleChapaCallback);

export default router;