import express from 'express';
import {
  submitFundRelease,
  voteFundRelease,
  getFundRelease,
  getAdminFundReleases,
  getFundReleasesByBusiness,
  getFundReleasesByStatus, // New import
  updateFundReleaseStatus, // New import
} from '../controllers/fundRelease/fundReleaseController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

console.log('[FundReleaseRoutes] Router initialized');

router.get('/test', (req, res) => {
  console.log('[FundReleaseRoutes] Test route reached');
  res.status(200).json({ message: 'Fund release test route working' });
});

router.post('/', authMiddleware, (req, res, next) => {
  console.log("[FundReleaseRoutes] POST /fund-release reached");
  submitFundRelease(req, res, next);
});

router.post('/vote', authMiddleware, voteFundRelease);
router.get('/:id', authMiddleware, getFundRelease);
router.get('/admin', authMiddleware, getAdminFundReleases);
router.get('/business/:businessIdeaId', authMiddleware, getFundReleasesByBusiness);
router.get('/status/:status', authMiddleware, getFundReleasesByStatus); // New route
router.put('/:fundReleaseId/:action', authMiddleware, updateFundReleaseStatus); // New route

console.log('[FundReleaseRoutes] Routes registered:', [
  'GET /test',
  'POST /',
  'POST /vote',
  'GET /:id',
  'GET /admin',
  'GET /business/:businessIdeaId',
  'GET /status/:status',
  'PUT /:fundReleaseId/:action',
]);

export default router;