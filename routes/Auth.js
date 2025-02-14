import { signup } from "../controllers/Auth/Signup.js";
import { login } from "../controllers/Auth/Login.js";
import express from "express";
// export const signupRoutes = (app) => {
//   app.post("/signup", signup);
// };

const authRouter = express.Router();

console.log("auth router");

authRouter.post("/signup", signup);
authRouter.post("/login", login);
export default authRouter;