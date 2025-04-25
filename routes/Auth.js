import express from "express";
import { signup } from "../controllers/Auth/Signup.js";
import { login } from "../controllers/Auth/Login.js";

const authRouter = express.Router();

console.log("Auth router initialized");

authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;