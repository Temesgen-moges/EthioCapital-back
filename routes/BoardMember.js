import express from "express";
import { addDefaultBoardMembers } from "../controllers/Boardmember/BoardMember.js";

const boardRouter = express.Router();

boardRouter.post("/add-default", addDefaultBoardMembers);

export default boardRouter;
