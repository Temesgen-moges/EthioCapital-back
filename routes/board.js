import express from 'express';
import boardController from '../controllers/Board/Board.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch board by boardId
router.get('/:boardId', authMiddleware, boardController.getBoard);

// Fetch board by businessIdeaId
router.get('/by-business-idea/:businessIdeaId', authMiddleware, boardController.getBoardByBusinessIdea);

// Join or create a board
router.post('/join', authMiddleware, boardController.joinBoard);

// Fetch board member database by businessIdeaId
router.get('/board-member-database/:businessIdeaId', authMiddleware, boardController.getBoardMemberDatabase);

export default router;