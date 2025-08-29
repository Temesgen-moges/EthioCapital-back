// // // import express from 'express';
// // // import cors from 'cors';
// // // import dotenv from 'dotenv';
// // // import { Server } from 'socket.io';
// // // import http from 'http';
// // // import path from 'path';
// // // import jwt from 'jsonwebtoken';
// // // import authRouter from './routes/Auth.js';
// // // import businessRouter from './routes/BusinessIdeas.js';
// // // import blogRouter from './routes/Blog.js';
// // // import userRouter from './routes/User.js';
// // // import messageRouter from './routes/Message.js';
// // // import messageController from './controllers/chat/Message.js';
// // // import connectDB from './util/ConnectDb.js';
// // // import verifyRouter from './routes/verificationRoutes.js';
// // // import documentAccessRouter from './routes/DocumentAccess.js';
// // // import investmentRouter from './routes/Investment.js';
// // // import studentApplicationRouter from './routes/StudentApplication.js';
// // // import boardRouter from './routes/board.js';
// // // import fundReleaseRouter from './routes/fundReleaseRoutes.js';

// // // dotenv.config();

// // // const app = express();
// // // const server = http.createServer(app);
// // // const io = new Server(server, {
// // //   cors: {
// // //     origin: 'http://localhost:3000',
// // //     methods: ['GET', 'POST'],
// // //     credentials: true,
// // //   },
// // // });

// // // // Middleware
// // // app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// // // app.use(express.json({ limit: '50mb' }));
// // // app.use(express.urlencoded({ limit: '50mb', extended: true }));
// // // app.use('/uploads', express.static(path.join(process.cwd(), 'Uploads')));
// // // app.use('/uploads/images', express.static(path.join(process.cwd(), 'Uploads/images')));
// // // app.use('/uploads/documents', express.static(path.join(process.cwd(), 'Uploads/documents')));

// // // // Request logging
// // // app.use((req, res, next) => {
// // //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
// // //     body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
// // //     headers: { authorization: req.headers.authorization?.substring(0, 20) + '...' },
// // //   });
// // //   next();
// // // });

// // // // Attach Socket.IO to app for controllers
// // // app.set('io', io); // Added for fundReleaseController.js

// // // // Keep req.io for backward compatibility
// // // app.use((req, res, next) => {
// // //   req.io = io;
// // //   next();
// // // });

// // // // MongoDB connection with error handling
// // // connectDB().catch((error) => {
// // //   console.error('[Server] MongoDB connection failed:', {
// // //     message: error.message,
// // //     stack: error.stack,
// // //   });
// // //   process.exit(1);
// // // });

// // // // Message controller
// // // const messageControllerInstance = messageController(io);
// // // const {
// // //   fetchMessages,
// // //   conversationFetch,
// // //   updateIsNewMessage,
// // //   fetchUserMessages,
// // //   sendMessage,
// // //   getConversationsByIdea,
// // // } = messageControllerInstance;

// // // // Routes
// // // app.use('/api/v1', authRouter);
// // // app.use('/api/v1', businessRouter);
// // // app.use('/api/v1', blogRouter);
// // // app.use('/api/v1', userRouter);
// // // app.use('/api/v1', verifyRouter);
// // // app.use('/api/v1', messageRouter({
// // //   fetchMessages,
// // //   conversationFetch,
// // //   updateIsNewMessage,
// // //   fetchUserMessages,
// // //   sendMessage,
// // //   getConversationsByIdea,
// // // }));
// // // app.use('/api/v1/document-access', documentAccessRouter);
// // // app.use('/api/v1', investmentRouter);
// // // app.use('/api/v1', studentApplicationRouter);
// // // app.use('/api/v1', boardRouter);
// // // app.use('/api/v1/fund-release', fundReleaseRouter);

// // // // Redirect for success page
// // // app.get('/success', (req, res) => {
// // //   res.redirect('http://localhost:3000/success');
// // // });

// // // // Error handling middleware
// // // app.use((err, req, res, next) => {
// // //   console.error(`[${new Date().toISOString()}] Server error:`, {
// // //     message: err.message,
// // //     stack: err.stack,
// // //   });
// // //   res.status(err.status || 500).json({
// // //     success: false,
// // //     message: err.message || 'Server error',
// // //   });
// // // });

// // // // Socket.IO connection
// // // io.on('connection', (socket) => {
// // //   console.log('[Socket.IO] New client connected:', socket.id);

// // //   const token = socket.handshake.auth.token;
// // //   if (token) {
// // //     try {
// // //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //       socket.userId = decoded.id; // Keep id for compatibility
// // //       socket.join(decoded.id);
// // //       console.log(`[Socket.IO] Socket ${socket.id} joined user room ${decoded.id}`);
// // //     } catch (error) {
// // //       console.error('[Socket.IO] Socket auth error:', {
// // //         message: error.message,
// // //         stack: error.stack,
// // //       });
// // //       socket.disconnect();
// // //     }
// // //   }

// // //   socket.on('joinUserRoom', (userId) => {
// // //     if (!userId) {
// // //       console.warn('[Socket.IO] joinUserRoom: No userId provided');
// // //       return;
// // //     }
// // //     socket.join(userId);
// // //     console.log(`[Socket.IO] Socket ${socket.id} joined user room ${userId}`);
// // //   });

// // //   socket.on('joinRoom', (conversationId) => {
// // //     if (!conversationId) {
// // //       console.warn('[Socket.IO] joinRoom: No conversationId provided');
// // //       return;
// // //     }
// // //     socket.join(conversationId);
// // //     console.log(`[Socket.IO] Socket ${socket.id} joined room ${conversationId}`);
// // //   });

// // //   socket.on('joinBusinessRoom', (businessIdeaId) => {
// // //     if (!businessIdeaId) {
// // //       console.warn('[Socket.IO] joinBusinessRoom: No businessIdeaId provided');
// // //       return;
// // //     }
// // //     const room = `business:${businessIdeaId}`;
// // //     socket.join(room);
// // //     console.log(`[Socket.IO] Socket ${socket.id} joined business room ${room}`);
// // //   });

// // //   socket.on('disconnect', () => {
// // //     console.log('[Socket.IO] Client disconnected:', socket.id);
// // //   });
// // // });

// // // const PORT = process.env.PORT || 3001;
// // // server.listen(PORT, () => {
// // //   console.log(`Server running at http://localhost:${PORT}/`);
// // // });

// // // export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import jwt from "jsonwebtoken";
import authRouter from "./routes/Auth.js";
import businessRouter from "./routes/BusinessIdeas.js";
import blogRouter from "./routes/Blog.js";
import userRouter from "./routes/User.js";
import messageRouter from "./routes/Message.js";
import messageController from "./controllers/chat/Message.js";
import connectDB from "./util/ConnectDb.js";
import verifyRouter from "./routes/verificationRoutes.js";
import documentAccessRouter from "./routes/DocumentAccess.js";
import investmentRouter from "./routes/Investment.js";
import studentApplicationRouter from "./routes/StudentApplication.js";
import boardRouter from "./routes/board.js";
import fundReleaseRouter from "./routes/fundReleaseRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "Uploads")));
app.use(
  "/uploads/images",
  express.static(path.join(process.cwd(), "Uploads/images"))
);
app.use(
  "/uploads/documents",
  express.static(path.join(process.cwd(), "Uploads/documents"))
);

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    body: req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    headers: {
      authorization: req.headers.authorization?.substring(0, 20) + "...",
    },
  });
  next();
});

// Attach Socket.IO to app for controllers
app.set("io", io);

// Keep req.io for backward compatibility
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB connection with error handling
connectDB().catch((error) => {
  console.error("[Server] MongoDB connection failed:", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Message controller (for user-to-user chat)
const messageControllerInstance = messageController(io);
const {
  fetchMessages,
  conversationFetch,
  updateIsNewMessage,
  fetchUserMessages,
  sendMessage,
  getConversationsByIdea,
} = messageControllerInstance;

// Routes
app.use("/api/v1", authRouter);
app.use("/api/v1", businessRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", verifyRouter);
app.use(
  "/api/v1",
  messageRouter({
    fetchMessages,
    conversationFetch,
    updateIsNewMessage,
    fetchUserMessages,
    sendMessage,
    getConversationsByIdea,
  })
);
app.use("/api/v1/document-access", documentAccessRouter);
app.use("/api/v1", investmentRouter);
app.use("/api/v1", studentApplicationRouter);
app.use("/api/v1", boardRouter);
console.log("[Server] Mounted boardRouter at /api/v1/board");
app.use("/api/v1/fund-release", fundReleaseRouter);

// Redirect for success page
app.get("/success", (req, res) => {
  res.redirect("http://localhost:3000/success");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, {
    message: err.message,
    stack: err.stack,
  });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("[Socket.IO] New client connected:", socket.id);

  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded.userId; // Support both id and userId
      if (!socket.userId) {
        throw new Error("No userId in JWT payload");
      }
      socket.join(socket.userId);
      console.log(
        `[Socket.IO] Socket ${socket.id} joined user room ${socket.userId}`
      );
    } catch (error) {
      console.error("[Socket.IO] Socket auth error:", {
        message: error.message,
        stack: error.stack,
      });
      socket.disconnect();
    }
  } else {
    console.warn("[Socket.IO] No token provided for socket:", socket.id);
  }

  socket.on("joinUserRoom", (userId) => {
    if (!userId) {
      console.warn("[Socket.IO] joinUserRoom: No userId provided");
      return;
    }
    socket.join(userId);
    console.log(`[Socket.IO] Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on("joinRoom", (room) => {
    if (!room) {
      console.warn("[Socket.IO] joinRoom: No room provided");
      return;
    }
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
  });

  socket.on("joinBusinessRoom", (businessIdeaId) => {
    if (!businessIdeaId) {
      console.warn("[Socket.IO] joinBusinessRoom: No businessIdeaId provided");
      return;
    }
    const room = `business:${businessIdeaId}`;
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined business room ${room}`);
  });

                                               socket.on("joinNotificationRoom", (userId) => {
                                              if (!userId) {
                                            console.error("No userId provided for notification room");
                                               return;
                                                 }
                                              socket.join(userId);
                                              console.log(`Socket ${socket.id} joined notification room ${userId}`);
                                                });

  socket.on("disconnect", () => {
    console.log("[Socket.IO] Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { Server } from 'socket.io';
// import http from 'http';
// import path from 'path';
// import authRouter from './routes/Auth.js';
// import businessRouter from './routes/BusinessIdeas.js';
// import blogRouter from './routes/Blog.js';
// import userRouter from './routes/User.js';
// import messageRouter from './routes/Message.js';
// import messageController from './controllers/chat/Message.js';
// import connectDB from './util/ConnectDb.js';
// import verifyRouter from './routes/verificationRoutes.js';
// import documentAccessRouter from './routes/DocumentAccess.js';
// import investmentRouter from './routes/Investment.js';
// import studentApplicationRouter from './routes/StudentApplication.js';
// import boardRouter from './routes/board.js';
// import jwt from 'jsonwebtoken';
// // import { setupNotificationWebSocket } from './controllers/chat/Notification.js';
// import notificationRouter from './routes/notification.js'; // Added notification routes

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use('/Uploads', express.static(path.join(process.cwd(), 'Uploads')));
// app.use('/uploads/images', express.static(path.join(process.cwd(), 'Uploads/images')));
// app.use('/uploads/documents', express.static(path.join(process.cwd(), 'Uploads/documents')));

// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// // Pass io to the WebSocket setup
// // setupNotificationWebSocket(io);

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// connectDB();

// const messageControllerInstance = messageController(io);
// const {
//   fetchMessages,
//   conversationFetch,
//   updateIsNewMessage,
//   fetchUserMessages,
//   sendMessage,
//   getConversationsByIdea,
// } = messageControllerInstance;

// // Routes
// app.use('/api/v1', authRouter);
// app.use('/api/v1', businessRouter);
// app.use('/api/v1', blogRouter);
// app.use('/api/v1', userRouter);
// app.use('/api/v1', verifyRouter);
// app.use('/api/v1', messageRouter({
//   fetchMessages,
//   conversationFetch,
//   updateIsNewMessage,
//   fetchUserMessages,
//   sendMessage,
//   getConversationsByIdea,
// }));
// app.use('/api/v1/document-access', documentAccessRouter);
// app.use('/api/v1', investmentRouter);
// app.use('/api/v1', studentApplicationRouter);
// app.use('/api/v1', boardRouter);
// app.use('/api/v1/notifications', notificationRouter); // Added notification routes

// app.get('/success', (req, res) => {
//   res.redirect('http://localhost:3000/success');
// });

// app.use((err, req, res, next) => {
//   console.error(`[${new Date().toISOString()}] Server error:`, err.stack);
//   res.status(500).json({ message: 'Server error', error: err.message });
// });

// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   const token = socket.handshake.auth.token;
//   console.log('Token received:', token);

//   if (!token) {
//     console.error('No token provided for socket:', socket.id);
//     socket.emit('error', { message: 'Authentication failed: No token provided' });
//     socket.disconnect();
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded.id;
//     socket.join(decoded.id);
//     console.log(`Socket ${socket.id} joined user room ${decoded.id}`);
//   } catch (error) {
//     console.error('Socket auth error:', error.message);
//     socket.emit('error', { message: 'Authentication failed: Invalid token' });
//     socket.disconnect();
//   }

//   socket.on('joinUserRoom', (userId) => {
//     if (!userId) return;
//     socket.join(userId);
//     console.log(`Socket ${socket.id} joined user room ${userId}`);
//   });

//   socket.on('joinRoom', (conversationId) => {
//     if (!conversationId) return;
//     socket.join(conversationId);
//     console.log(`Socket ${socket.id} joined conversation room ${conversationId}`);
//   });

//   socket.on('joinNotificationRoom', (userId) => {
//     if (!userId) {
//       console.error('No userId provided for notification room');
//       return;
//     }
//     socket.join(userId);
//     console.log(`Socket ${socket.id} joined notification room ${userId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { Server } from 'socket.io';
// import http from 'http';
// import path from 'path';
// import jwt from 'jsonwebtoken';
// import authRouter from './routes/Auth.js';
// import businessRouter from './routes/BusinessIdeas.js';
// import blogRouter from './routes/Blog.js';
// import userRouter from './routes/User.js';
// import messageRouter from './routes/Message.js';
// import messageController from './controllers/chat/Message.js';
// import connectDB from './util/ConnectDb.js';
// import verifyRouter from './routes/verificationRoutes.js';
// import documentAccessRouter from './routes/DocumentAccess.js';
// import investmentRouter from './routes/Investment.js';
// import studentApplicationRouter from './routes/StudentApplication.js';
// import boardRouter from './routes/board.js';
// import notificationRouter from './routes/notification.js';

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// app.use('/uploads/images', express.static(path.join(process.cwd(), 'Uploads/images')));

// // Protect document routes with authentication
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });
//   try {
//     jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };
// app.use('/uploads/documents', verifyToken, express.static(path.join(process.cwd(), 'Uploads/documents')));

// // Request logging
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
//     body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
//     headers: { authorization: req.headers.authorization?.substring(0, 20) + '...' },
//   });
//   next();
// });

// // Attach Socket.IO to app
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// // MongoDB connection
// connectDB().catch((error) => {
//   console.error('[Server] MongoDB connection failed:', {
//     message: error.message,
//     stack: error.stack,
//   });
//   process.exit(1);
// });

// const messageControllerInstance = messageController(io);
// const {
//   fetchMessages,
//   conversationFetch,
//   updateIsNewMessage,
//   fetchUserMessages,
//   sendMessage,
//   getConversationsByIdea,
// } = messageControllerInstance;

// // Routes
// app.use('/api/v1', authRouter);
// app.use('/api/v1', businessRouter);
// app.use('/api/v1', blogRouter);
// app.use('/api/v1', userRouter);
// app.use('/api/v1', verifyRouter);
// app.use('/api/v1', messageRouter({
//   fetchMessages,
//   conversationFetch,
//   updateIsNewMessage,
//   fetchUserMessages,
//   sendMessage,
//   getConversationsByIdea,
// }));
// app.use('/api/v1/document-access', documentAccessRouter);
// app.use('/api/v1', investmentRouter);
// app.use('/api/v1', studentApplicationRouter);
// app.use('/api/v1', boardRouter);
// app.use('/api/v1/notifications', notificationRouter);

// // Redirect for success page
// app.get('/success', (req, res) => {
//   res.redirect('http://localhost:3000/success');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(`[${new Date().toISOString()}] Server error:`, {
//     message: err.message,
//     stack: err.stack,
//   });
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Server error',
//   });
// });

// // Socket.IO connection
// io.on('connection', (socket) => {
//   console.log('[Socket.IO] New client connected:', socket.id);

//   const token = socket.handshake.auth.token;
//   if (!token) {
//     console.error('[Socket.IO] No token provided for socket:', socket.id);
//     socket.emit('error', { message: 'Authentication failed: No token provided' });
//     socket.disconnect();
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded.id;
//     socket.join(decoded.id);
//     console.log(`[Socket.IO] Socket ${socket.id} joined user room ${decoded.id}`);
//   } catch (error) {
//     console.error('[Socket.IO] Socket auth error:', {
//       message: error.message,
//       stack: error.stack,
//     });
//     socket.emit('error', { message: 'Authentication failed: Invalid token' });
//     socket.disconnect();
//   }

//   socket.on('joinUserRoom', (userId) => {
//     if (!userId) {
//       console.warn('[Socket.IO] joinUserRoom: No userId provided');
//       return;
//     }
//     socket.join(userId);
//     console.log(`[Socket.IO] Socket ${socket.id} joined user room ${userId}`);
//   });

//   socket.on('joinRoom', (conversationId) => {
//     if (!conversationId) {
//       console.warn('[Socket.IO] joinRoom: No conversationId provided');
//       return;
//     }
//     socket.join(conversationId);
//     console.log(`[Socket.IO] Socket ${socket.id} joined conversation room ${conversationId}`);
//   });

//   socket.on('joinNotificationRoom', (userId) => {
//     if (!userId) {
//       console.error('[Socket.IO] joinNotificationRoom: No userId provided');
//       return;
//     }
//     socket.join(userId);
//     console.log(`[Socket.IO] Socket ${socket.id} joined notification room ${userId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('[Socket.IO] Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });
