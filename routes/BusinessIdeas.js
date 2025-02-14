import express from 'express';
// import { submitIdea } from '../controllers/BusinessIdea/BussinessIdea.js'; // Import your controller
import { submitIdea, getIdeas, getIdeaById, getIdeaByUser,updateIdea, deleteIdea } from '../controllers/BusinessIdea/BussinessIdea.js'; // Import your controller
import multer from 'multer';
import { authenticate } from '../middleware/Authenticate.js';
import {uploadDocument} from '../middleware/multerConfig.js';

const businessRouter = express.Router();

// // Configure Multer to use diskStorage
// const storage = multer.diskStorage({
//     // Specify the destination folder for uploads
//     destination: function (req, file, cb) {
//       // Ensure this folder exists or create it before running your app
//       cb(null, 'uploads/');
//     },
//     // Customize the file name
//     filename: function (req, file, cb) {
//       // You can use the original name or generate a new one.
//       // Here, we're prepending the current timestamp to avoid name collisions.
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       // file.originalname might include spaces or special characters so consider sanitizing it in production.
//       cb(null, uniqueSuffix + '-' + file.originalname);
//     }
//   });
  
//   // Create the multer upload instance using the diskStorage engine
//   const upload = multer({ storage });
// // Set up multer for file upload
// const upload = multer({ dest: 'uploads/' });

// Route to submit idea
// Use the multer middleware on the route that handles file uploads
businessRouter.post('/submit-idea', authenticate, uploadDocument.any(), submitIdea);
businessRouter.get('/get-ideas', authenticate, getIdeas);
businessRouter.get('/get-idea/:id', authenticate, getIdeaById);
businessRouter.get('/get-ideas-by-user', authenticate, getIdeaByUser);
businessRouter.put('/update-idea/:id', authenticate, updateIdea);
businessRouter.delete('/delete-idea/:id', authenticate, deleteIdea);

export default businessRouter;
