import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  submitIdea,
  getIdeas,
  getIdeaById,
  getIdeaByUser,
  updateIdea,
  deleteIdea,
  approveIdea,
  likeIdea,
  getPendingIdeas,
} from '../controllers/BusinessIdea/BussinessIdea.js';
import { authenticate } from '../middleware/Authenticate.js';
import { uploadDocument } from '../middleware/multerConfig.js';

const businessRouter = express.Router();

businessRouter.post('/submit-idea', authenticate, uploadDocument.any(), submitIdea);
businessRouter.get('/get-ideas', authenticate, getIdeas);
businessRouter.get('/get-idea/:id', authenticate, getIdeaById);
businessRouter.get('/get-ideas-by-user', authenticate, getIdeaByUser);
businessRouter.put(
  '/update-idea/:id',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('overview').notEmpty().withMessage('Overview is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateIdea
);
businessRouter.delete('/delete-idea/:id', authenticate, deleteIdea);
businessRouter.put('/approve-idea/:id', authenticate, approveIdea);
businessRouter.post('/like-idea/:id', authenticate, likeIdea);
businessRouter.get('/get-pending-ideas', authenticate, getPendingIdeas);

export default businessRouter;