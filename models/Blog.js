import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    location: { type: String },
    time: { type: String },
    effectiveDate: { type: Date },
    issuedBy: { type: String },
    summary: { type: String },
    content: { type: String },
    fileName: { type: String },
    fileContent: { type: String } // Consider storing files as GridFS or cloud storage instead
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;

