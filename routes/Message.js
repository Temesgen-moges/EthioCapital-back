import express from 'express';
import { fetchMessages,conversationFetch,updateIsNewMessage,fetchUserMessages  } from '../controllers/chat/Message.js';
import { createComplaint, getComplaints, getComplaintById, addReply, updateIsNew, deleteComplaint } from '../controllers/chat/Compliant.js';
import { authenticate } from '../middleware/Authenticate.js';

const messageRouter = express.Router();

messageRouter.get('/fetch-messages/:conversationId/:ideaId',authenticate, fetchMessages);
messageRouter.get('/fetch-messages-for-user/:userId', authenticate,fetchUserMessages)
messageRouter.post('/update-isNew/:id',authenticate, updateIsNewMessage);
messageRouter.post('/conversation-fetch',authenticate, conversationFetch);
messageRouter.post('/compliant',authenticate, createComplaint)
messageRouter.get('/compliant',authenticate, getComplaints);
messageRouter.get('/compliant/:id',authenticate, getComplaintById);
messageRouter.post('/compliant/reply/:id',authenticate, addReply);
messageRouter.patch('/compliant-isNew/:id',authenticate, updateIsNew);
messageRouter.delete('/compliant/:id',authenticate, deleteComplaint);

export default messageRouter;