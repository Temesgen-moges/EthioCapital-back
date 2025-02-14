// import BusinessIdea from '../models/BusinessIdea.js'; // Import the BusinessIdea model
import BusinessIdea from '../../models/BussinessIdea.js';
import User from '../../models/User.js';

export const submitIdea = async (req, res) => {
  try {
    const { userId } = req.user; // Assume userId is set by your authentication middleware
    console.log("userId", userId);
    console.log("req.body", req.body);
    console.log("req.files", req.files);

    console.log("accepting idea");
    

    // Parse each key in req.body (they were stringified on the client)
    const parsedData = {};
    Object.entries(req.body).forEach(([key, value]) => {
      try {
        parsedData[key] = JSON.parse(value);
      } catch (error) {
        // If parsing fails, use the raw value
        parsedData[key] = value;
      }
    });

    // Process file uploads from req.files and integrate them into the documents field.
    // This example assumes that the client sends file fields with names like "documents.businessRegistration"
    // Adjust the logic based on your file storage approach.
    const documents = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // If fieldname is like "documents.businessRegistration"
        const [group, docKey] = file.fieldname.split('.');
        if (group === 'documents' && docKey) {
          // Here we store a placeholder; in a real app you might store the file path or URL after saving the file.
          documents[docKey] = file.buffer ? file.buffer.toString('base64') : file.path;
        }
      });
    }
    // Merge the documents with any data already present in parsedData.documents
    parsedData.documents = { ...(parsedData.documents || {}), ...documents };

    // (Optional) Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with id ' + userId + ' not found.' });
    }

    // Create the new Business Idea using the parsed data and the authenticated user
    const newIdea = new BusinessIdea({
      ...parsedData, // All the idea details
      user: userId,  // Associate this idea with the user
    });

    await newIdea.save();

    res.status(201).json({
      message: 'Business Idea submitted successfully!',
      idea: newIdea,
    });
  } catch (error) {
    console.error('Error submitting Business idea:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while submitting your Business idea.' });
  }
};

export const getIdeas = async (req, res) => {
  try {
    const ideas = await BusinessIdea.find().populate('user', 'fullName'); // Only include fullName from the user document
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error getting business ideas:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Business ideas.' });
  }
};

export const getIdeaById = async (req, res) => {
  try {
    console.log("getting idea by id");
    
    const idea = await BusinessIdea.findById(req.params.id).populate('user', 'fullName');
    console.log("idea", idea);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea not found.' });
    }
    res.status(200).json(idea);
  } catch (error) {
    console.error('Error getting Business idea by ID:', error);
    res.status(500).json({ message: 'An error occurred while retrieving the Business idea.' });
  }
};

export const  getIdeaByUser = async (req, res) => {
  const { userId } = req.user; 
  try {
    const ideas = await BusinessIdea.find({ user: userId });
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error getting Business ideas by user:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Business ideas by user.' });
  }
};

export const updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;

    const idea = await BusinessIdea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea with id ' + id + ' not found.' });
    }

    // Update the idea with the changes
    await idea.update(changes);

    res.status(200).json({
      message: 'Business Idea with id ' + id + ' updated successfully!',
      updatedIdea: idea,
    });
  } catch (error) { // Catch any errors that occur during the update process
    console.error('Error updating Business idea:', error);
    res.status(500).json({ message: 'An error occurred while updating the Business idea.' });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await BusinessIdea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea with id ' + id + ' not found.' });
    }

    // Delete the idea
    await idea.remove();

    res.status(200).json({
      message: 'Business Idea with id ' + id + ' deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting Business idea:', error);
    res.status(500).json({ message: 'An error occurred while deleting the Business idea.' });
  }
};