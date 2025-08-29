import express from "express";
import { getUsers, getUserById,getEntrepreneursProfile,getUserProfile,createProfile,updateProfile,deleteProfile } from "../controllers/user/User.js";
import { authenticate } from "../middleware/Authenticate.js";
const userRouter = express.Router();
import { uploadFiles } from "../middleware/multerConfig.js";

userRouter.get("/users",authenticate, getUsers);
userRouter.get("/user",authenticate, getUserById);
userRouter.get("/user-profile",authenticate, getUserProfile);
userRouter.get("/entrepreneur-profile",authenticate, getEntrepreneursProfile);
userRouter.post("/user-profile",authenticate, uploadFiles.fields([{name: "photo", maxCount: 1},{name: "documents", maxCount: 5}]), createProfile);
userRouter.put("/user-profile",authenticate,uploadFiles.fields([{name: "photo", maxCount: 1},{name: "documents", maxCount: 5}]), updateProfile);
userRouter.delete("/user-profile",authenticate, deleteProfile);
export default userRouter;