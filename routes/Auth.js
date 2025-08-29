import express from "express";
import { signup } from "../controllers/Auth/Signup.js";
import { login } from "../controllers/Auth/Login.js";
import { forgotPassword } from "../controllers/Auth/forgotPassword.js";
import { resetPassword } from "../controllers/Auth/ResetPassword.js";

const authRouter = express.Router();

console.log("Auth router initialized");

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;