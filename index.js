// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/Auth.js";
import businessRouter from "./routes/BusinessIdeas.js";
import blogRouter from "./routes/Blog.js";
import userRouter from "./routes/User.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";
import messageRouter from "./routes/Message.js";
import connectDB from "./util/ConnectDb.js"; // Updated import for Mongoose connection

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB via Mongoose
connectDB();

// Set up socket.io connection handlers
io.on("connection", (socket) => {
    console.log("new client connected: ", socket.id);

    socket.on("joinRoom", (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("sendMessage", async (data) => {
        console.log("message sent: ", data);
        try {
            const message = new Message(data);
            await message.save();
            console.log("message saved: ", message);
            io.to(message.conversationId).emit("message", message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("receiveMessage", (data) => {
        console.log("received message: ", data);
    });

    socket.on("disconnect", () => {
        console.log("client disconnected: ", socket.id);
    });
});

app.use("/api/v1", authRouter);
app.use("/api/v1", businessRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", )


const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
