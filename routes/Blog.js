import express from "express";
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from "../controllers/blogs/BlogController.js";
import {authenticate }  from "../middleware/Authenticate.js";
const blogRouter = express.Router();

blogRouter.get("/blogs", authenticate, getBlogs);
blogRouter.get("/blogs/:id",authenticate, getBlogById);
blogRouter.post("/blogs",authenticate, createBlog);
blogRouter.put("/blogs/:id",authenticate, updateBlog);
blogRouter.delete("/blogs/:id",authenticate, deleteBlog);

export default blogRouter;