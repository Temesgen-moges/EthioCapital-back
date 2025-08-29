// import Complaint from "../../models/Compliant.js";

// // Create a new complaint
// export const createComplaint = async (req, res) => {
//   try {
//     const { responseText } = req.body;
//     const { userId } = req.user;

//     const complaint = new Complaint({
//       userId: userId,
//       description: responseText,
//     });
//     await complaint.save();

//     // Emit real-time event to all connected clients (e.g., admin dashboard)
//     req.io.emit("newComplaint", complaint);

//     res.status(201).json(complaint);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get all complaints (admin only)
// export const getComplaints = async (req, res) => {
//   try {
//     // Check if user is admin (assuming role is in req.user)
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Unauthorized: Admin only" });
//     }
//     const complaints = await Complaint.find().populate("userId replies.userId");
//     res.status(200).json(complaints);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single complaint by ID (user or admin)
// export const getComplaintById = async (req, res) => {
//   try {
//     const complaint = await Complaint.findById(req.params.id).populate(
//       "userId replies.userId"
//     );
//     if (!complaint)
//       return res.status(404).json({ message: "Complaint not found" });

//     // Allow only the complaint owner or admin to view
//     if (
//       req.user.role !== "admin" &&
//       complaint.userId.toString() !== req.user.userId
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }
//     res.status(200).json(complaint);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add a reply to a complaint (admin only)
// export const addReply = async (req, res) => {
//   const { responseText } = req.body;

//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Unauthorized: Admin only" });
//     }

//     const complaint = await Complaint.findById(req.params.id);
//     if (!complaint)
//       return res.status(404).json({ message: "Complaint not found" });

//     complaint.replies.push({
//       userId: req.user.userId, // Admin replying
//       message: responseText,
//     });

//     await complaint.save();

//     // Emit real-time event to the complaint owner
//     req.io.to(complaint.userId.toString()).emit("newReply", complaint);

//     res.status(200).json(complaint);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update complaint status (mark as read, admin only)
// export const updateIsNew = async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Unauthorized: Admin only" });
//     }

//     const { id } = req.params;
//     const complaint = await Complaint.findById(id);
//     if (!complaint)
//       return res.status(404).json({ message: "Complaint not found" });

//     complaint.isNew = false;
//     await complaint.save();

//     // Emit real-time update to the complaint owner
//     req.io.to(complaint.userId.toString()).emit("complaintUpdated", complaint);

//     res.status(200).json(complaint);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a complaint (user who created it or admin)
// export const deleteComplaint = async (req, res) => {
//   try {
//     const complaint = await Complaint.findById(req.params.id);
//     if (!complaint)
//       return res.status(404).json({ message: "Complaint not found" });

//     // Allow only the complaint owner or admin to delete
//     if (
//       req.user.role !== "admin" &&
//       complaint.userId.toString() !== req.user.userId
//     ) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     await Complaint.findByIdAndDelete(req.params.id);

//     // Emit real-time event to all connected clients
//     req.io.emit("complaintDeleted", req.params.id);

//     res.status(200).json({ message: "Complaint deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
import Complaint from "../../models/Compliant.js";

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { responseText } = req.body;
    const { userId } = req.user;

    const complaint = new Complaint({
      userId: userId,
      description: responseText,
    });
    await complaint.save();

    // Emit real-time event to all connected clients (e.g., admin dashboard)
    req.io.emit("newComplaint", complaint);

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all complaints (admin only)
export const getComplaints = async (req, res) => {
  try {
    // Check if user is admin (assuming role is in req.user)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin only" });
    }
    const complaints = await Complaint.find().populate("userId replies.userId");
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single complaint by ID (user or admin)
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "userId replies.userId"
    );
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // Allow only the complaint owner or admin to view
    if (
      req.user.role !== "admin" &&
      complaint.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a reply to a complaint (admin only)
export const addReply = async (req, res) => {
  const { responseText } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin only" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    complaint.replies.push({
      userId: req.user.userId, // Admin replying
      message: responseText,
    });

    await complaint.save();

    // Emit real-time event to the complaint owner
    req.io.to(complaint.userId.toString()).emit("newReply", complaint);

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint status (mark as read, admin only)
export const updateIsNew = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin only" });
    }

    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    complaint.isNew = false;
    await complaint.save();

    // Emit real-time update to the complaint owner
    req.io.to(complaint.userId.toString()).emit("complaintUpdated", complaint);

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a complaint (user who created it or admin)
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // Allow only the complaint owner or admin to delete
    if (
      req.user.role !== "admin" &&
      complaint.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    // Emit real-time event to all connected clients
    req.io.emit("complaintDeleted", req.params.id);

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
