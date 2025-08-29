import express from 'express';
import investmentController from '../controllers/Investment/Investment.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save-investment', authMiddleware, investmentController.saveInvestment);
router.get('/user-investments', authMiddleware, investmentController.getUserInvestments);
router.get('/investments-details/:projectId', authMiddleware, investmentController.getInvestmentDetails);
router.get('/investor-equity/:projectId', authMiddleware, investmentController.getInvestorEquity);
router.get('/chapa-callback', investmentController.handleChapaCallback);

export default router;