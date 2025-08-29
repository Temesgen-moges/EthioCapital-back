import Blog from "../../models/Blog.js";

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error getting blogs:", error);
    res.status(500).json({ message: "An error occurred while retrieving blogs." });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("Error getting blog by ID:", error);
    res.status(500).json({ message: "An error occurred while retrieving the blog." });
  }
};

export const createBlog = async (req, res) => {
  try {
    const newBlog = new Blog({
      ...req.body,
      author: "admin",
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully!",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "An error occurred while creating the blog." });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog with id " + id + " not found." });
    }

    // Update the blog with the changes
    await blog.update(changes);

    res.status(200).json({
      message: "Blog with id " + id + " updated successfully!",
      updatedBlog: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "An error occurred while updating the blog." });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog with id " + id + " not found." });
    }

    // Delete the blog
    await blog.remove();

    res.status(200).json({
      message: "Blog with id " + id + " deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "An error occurred while deleting the blog." });
  }
};  