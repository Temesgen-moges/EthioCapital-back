import BusinessIdea from '../../models/BussinessIdea.js';
import User from '../../models/User.js';

export const submitIdea = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("userId:", userId);
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Parse req.body (some fields may be JSON strings)
    const parsedData = {};
    Object.entries(req.body).forEach(([key, value]) => {
      try {
        parsedData[key] = JSON.parse(value);
      } catch (error) {
        parsedData[key] = value;
      }
    });

    // Handle file uploads with relative paths
    const documents = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const match = file.fieldname.match(/documents\[(.+)\]/);
        if (match && match[1]) {
          const docKey = match[1];
          documents[docKey] = `uploads/documents/${file.filename}`;
        }
      });
    }
    parsedData.documents = { ...(parsedData.documents || {}), ...documents };

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create and save the new idea
    const newIdea = new BusinessIdea({
      ...parsedData,
      user: userId,
      approvalStatus: 'pending', // Explicitly set
    });
    await newIdea.save();

    console.log("Saved documents:", newIdea.documents);

    res.status(201).json({
      message: 'Business Idea submitted successfully! Sent to admin for approval.',
      idea: newIdea,
    });
  } catch (error) {
    console.error('Error submitting Business idea:', error);
    res.status(500).json({ message: 'An error occurred while submitting your Business idea.' });
  }
};

export const getIdeas = async (req, res) => {
  try {
    const ideas = await BusinessIdea.find()
      .populate('user', 'fullName')
      .select('-documents'); // Exclude sensitive documents
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error getting business ideas:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Business ideas.' });
  }
};

export const getIdeaById = async (req, res) => {
  try {
    const idea = await BusinessIdea.findById(req.params.id)
      .populate('user', 'fullName')
      .populate('likes', 'fullName'); // Populate likers' names
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea not found.' });
    }
    res.status(200).json(idea);
  } catch (error) {
    console.error('Error getting Business idea by ID:', error);
    res.status(500).json({ message: 'An error occurred while retrieving the Business idea.' });
  }
};

export const getIdeaByUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const ideas = await BusinessIdea.find({ user: userId })
      .populate('user', 'fullName');
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
      return res.status(404).json({ message: 'Business Idea not found.' });
    }

    // Ensure user owns the idea
    if (idea.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this idea.' });
    }

    await BusinessIdea.findByIdAndUpdate(id, changes, { new: true });

    res.status(200).json({
      message: 'Business Idea updated successfully!',
      updatedIdea: idea,
    });
  } catch (error) {
    console.error('Error updating Business idea:', error);
    res.status(500).json({ message: 'An error occurred while updating the Business idea.' });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await BusinessIdea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea not found.' });
    }

    // Ensure user owns the idea
    if (idea.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this idea.' });
    }

    await idea.deleteOne();

    res.status(200).json({
      message: 'Business Idea deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting Business idea:', error);
    res.status(500).json({ message: 'An error occurred while deleting the Business idea.' });
  }
};

export const approveIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, ranking } = req.body;

    // Verify user is admin
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve ideas.' });
    }

    const idea = await BusinessIdea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea not found.' });
    }

    // Update approval status and ranking
    idea.approvalStatus = approvalStatus;
    if (approvalStatus === 'approved' && ranking) {
      idea.ranking = ranking;
    } else if (approvalStatus !== 'approved') {
      idea.ranking = ''; // Reset ranking if not approved
    }

    await idea.save();

    res.status(200).json({
      message: `Business Idea ${approvalStatus} successfully!`,
      idea,
    });
  } catch (error) {
    console.error('Error approving Business idea:', error);
    res.status(500).json({ message: 'An error occurred while approving the Business idea.' });
  }
};

export const likeIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const idea = await BusinessIdea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Business Idea not found.' });
    }

    // Check if user already liked
    if (idea.likes.includes(userId)) {
      // Unlike: Remove user from likes
      idea.likes = idea.likes.filter((like) => like.toString() !== userId);
      await idea.save();
      return res.status(200).json({
        message: 'Business Idea unliked successfully!',
        idea,
      });
    }

    // Like: Add user to likes
    idea.likes.push(userId);
    await idea.save();

    res.status(200).json({
      message: 'Business Idea liked successfully!',
      idea,
    });
  } catch (error) {
    console.error('Error liking Business idea:', error);
    res.status(500).json({ message: 'An error occurred while liking the Business idea.' });
  }
};

export const getPendingIdeas = async (req, res) => {
  try {
    // Verify user is admin
    const user = await User.findById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view pending ideas.' });
    }

    const ideas = await BusinessIdea.find({ approvalStatus: 'pending' })
      .populate('user', 'fullName');
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error getting pending business ideas:', error);
    res.status(500).json({ message: 'An error occurred while retrieving pending Business ideas.' });
  }
};


// import BusinessIdea from '../../models/BussinessIdea.js';
// import User from '../../models/User.js';

// export const submitIdea = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     console.log("userId:", userId);
//     console.log("req.body:", req.body);
//     console.log("req.files:", req.files);

//     // Parse req.body (some fields may be JSON strings)
//     const parsedData = {};
//     Object.entries(req.body).forEach(([key, value]) => {
//       try {
//         parsedData[key] = JSON.parse(value);
//       } catch (error) {
//         parsedData[key] = value;
//       }
//     });

//     // Handle file uploads with relative paths
//     const documents = {};
//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file) => {
//         const match = file.fieldname.match(/documents\[(.+)\]/);
//         if (match && match[1]) {
//           const docKey = match[1];
//           documents[docKey] = `uploads/documents/${file.filename}`;
//         }
//       });
//     }
//     parsedData.documents = { ...(parsedData.documents || {}), ...documents };

//     // Verify user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Create and save the new idea
//     const newIdea = new BusinessIdea({
//       ...parsedData,
//       user: userId,
//       approvalStatus: 'pending', // Explicitly set
//     });
//     await newIdea.save();

//     console.log("Saved documents:", newIdea.documents);

//     res.status(201).json({
//       message: 'Business Idea submitted successfully! Sent to admin for approval.',
//       idea: newIdea,
//     });
//   } catch (error) {
//     console.error('Error submitting Business idea:', error);
//     res.status(500).json({ message: 'An error occurred while submitting your Business idea.' });
//   }
// };

// export const getIdeas = async (req, res) => {
//   try {
//     // Verify user is admin
//     const user = await User.findById(req.user.userId);
//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ message: 'Only admins can view ideas.' });
//     }

//     const { status } = req.query; // Get status query parameter
//     let query = {};

//     // Filter by approvalStatus if provided
//     if (status && status !== 'all') {
//       if (!['pending', 'approved', 'rejected'].includes(status)) {
//         return res.status(400).json({ message: 'Invalid status filter. Use pending, approved, rejected, or all.' });
//       }
//       query.approvalStatus = status;
//     }

//     const ideas = await BusinessIdea.find(query)
//       .populate('user', 'fullName')
//       .select('-documents'); // Exclude sensitive documents

//     res.status(200).json(ideas);
//   } catch (error) {
//     console.error('Error getting business ideas:', error);
//     res.status(500).json({ message: 'An error occurred while retrieving Business ideas.' });
//   }
// };

// export const getIdeaById = async (req, res) => {
//   try {
//     const idea = await BusinessIdea.findById(req.params.id)
//       .populate('user', 'fullName')
//       .populate('likes', 'fullName'); // Populate likers' names
//     if (!idea) {
//       return res.status(404).json({ message: 'Business Idea not found.' });
//     }
//     res.status(200).json(idea);
//   } catch (error) {
//     console.error('Error getting Business idea by ID:', error);
//     res.status(500).json({ message: 'An error occurred while retrieving the Business idea.' });
//   }
// };

// export const getIdeaByUser = async (req, res) => {
//   const { userId } = req.user;
//   try {
//     const ideas = await BusinessIdea.find({ user: userId })
//       .populate('user', 'fullName');
//     res.status(200).json(ideas);
//   } catch (error) {
//     console.error('Error getting Business ideas by user:', error);
//     res.status(500).json({ message: 'An error occurred while retrieving Business ideas by user.' });
//   }
// };

// export const updateIdea = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const changes = req.body;

//     const idea = await BusinessIdea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: 'Business Idea not found.' });
//     }

//     // Ensure user owns the idea
//     if (idea.user.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Unauthorized to update this idea.' });
//     }

//     const updatedIdea = await BusinessIdea.findByIdAndUpdate(id, changes, { new: true });

//     res.status(200).json({
//       message: 'Business Idea updated successfully!',
//       updatedIdea,
//     });
//   } catch (error) {
//     console.error('Error updating Business idea:', error);
//     res.status(500).json({ message: 'An error occurred while updating the Business idea.' });
//   }
// };

// export const deleteIdea = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const idea = await BusinessIdea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: 'Business Idea not found.' });
//     }

//     // Ensure user owns the idea
//     if (idea.user.toString() !== req.user.userId) {
//       return res.status(403).json({ message: 'Unauthorized to delete this idea.' });
//     }

//     await idea.deleteOne();

//     res.status(200).json({
//       message: 'Business Idea deleted successfully!',
//     });
//   } catch (error) {
//     console.error('Error deleting Business idea:', error);
//     res.status(500).json({ message: 'An error occurred while deleting the Business idea.' });
//   }
// };

// export const approveIdea = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { approvalStatus, ranking } = req.body;

//     // Verify user is admin
//     const user = await User.findById(req.user.userId);
//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ message: 'Only admins can approve ideas.' });
//     }

//     const idea = await BusinessIdea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: 'Business Idea not found.' });
//     }

//     // Update approval status and ranking
//     idea.approvalStatus = approvalStatus;
//     if (approvalStatus === 'approved' && ranking) {
//       idea.ranking = ranking;
//     } else {
//       idea.ranking = ''; // Reset ranking if not approved
//     }

//     await idea.save();

//     res.status(200).json({
//       message: `Business Idea ${approvalStatus} successfully!`,
//       idea,
//     });
//   } catch (error) {
//     console.error('Error approving Business idea:', error);
//     res.status(500).json({ message: 'An error occurred while approving the Business idea.' });
//   }
// };

// export const likeIdea = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.user;

//     const idea = await BusinessIdea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: 'Business Idea not found.' });
//     }

//     // Check if user already liked
//     if (idea.likes.includes(userId)) {
//       // Unlike: Remove user from likes
//       idea.likes = idea.likes.filter((like) => like.toString() !== userId);
//       await idea.save();
//       return res.status(200).json({
//         message: 'Business Idea unliked successfully!',
//         idea,
//       });
//     }

//     // Like: Add user to likes
//     idea.likes.push(userId);
//     await idea.save();

//     res.status(200).json({
//       message: 'Business Idea liked successfully!',
//       idea,
//     });
//   } catch (error) {
//     console.error('Error liking Business idea:', error);
//     res.status(500).json({ message: 'An error occurred while liking the Business idea.' });
//   }
// };

// export const getPendingIdeas = async (req, res) => {
//   try {
//     // Verify user is admin
//     const user = await User.findById(req.user.userId);
//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ message: 'Only admins can view pending ideas.' });
//     }

//     const ideas = await BusinessIdea.find({ approvalStatus: 'pending' })
//       .populate('user', 'fullName');
//     res.status(200).json(ideas);
//   } catch (error) {
//     console.error('Error getting pending business ideas:', error);
//     res.status(500).json({ message: 'An error occurred while retrieving pending Business ideas.' });
//   }
// };