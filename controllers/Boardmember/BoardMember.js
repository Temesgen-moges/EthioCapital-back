import mongoose from 'mongoose';
import BoardMember from '../../models/BoardMember.js';
import User from '../../models/User.js';
import BusinessIdea from '../../models/BusinessIdea.js';
import Board from '../../models/Board.js';

export const addDefaultBoardMembers = async (req, res) => {
  try {
    const { businessIdeaId } = req.body; // Get business ID from request

    // Check if the BusinessIdea exists
    const businessIdea = await BusinessIdea.findById(businessIdeaId);
    if (!businessIdea) {
      return res.status(404).json({ message: "Business Idea not found." });
    }

    // Predefined users (Replace these with actual user IDs from your database)
    const users = await User.find().limit(5); // Get 5 users from the DB
    if (users.length < 5) {
      return res.status(400).json({ message: "Not enough users in the system." });
    }

    const boardMembers = [
      { 
        userId: users[0]._id, name: "Temesgen Moges", role: "Chairman (Entrepreneur)", shares: "30%", 
        status: "online", image: "👨‍💼", bio: "Tech entrepreneur with 10 years experience", 
        contact: "+251 911 234 567", accountDetails: "1234-5678-9012-3456", bankName: "Commercial Bank of Ethiopia"
      },
      { 
        userId: users[1]._id, name: "Sarah Johnson", role: "Lead Investor", shares: "20%", 
        status: "online", image: "👩‍💼", bio: "Angel investor with focus on tech startups", 
        contact: "+251 922 345 678"
      },
      { 
        userId: users[2]._id, name: "Michael Chen", role: "Board Member", shares: "15%", 
        status: "offline", image: "👨‍💼", bio: "Financial advisor and venture capitalist", 
        contact: "+251 933 456 789"
      },
      { 
        userId: users[3]._id, name: "Emma Williams", role: "Board Member", shares: "12%", 
        status: "online", image: "👩‍💼", bio: "Investment banker with startup experience", 
        contact: "+251 944 567 890"
      },
      { 
        userId: users[4]._id, name: "David Brown", role: "Board Member", shares: "10%", 
        status: "online", image: "👨‍💼", bio: "Serial investor and business consultant", 
        contact: "+251 955 678 901"
      }
    ];

    // Check if board members already exist for this business
    const existingBoardMembers = await BoardMember.find({ businessId: businessIdeaId });
    if (existingBoardMembers.length > 0) {
      return res.status(400).json({ message: "Board members already assigned to this business." });
    }

    // Assign businessId to each member
    const boardMembersWithBusinessId = boardMembers.map(member => ({
      ...member,
      businessId: businessIdeaId,
    }));

    // Save to the database
    await BoardMember.insertMany(boardMembersWithBusinessId);
    res.status(201).json({ message: "Board members added successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBoardByBusinessIdea = async (req, res, next) => {
  try {
    const { businessIdeaId } = req.params;
    const userId = req.user?._id;

    console.log('[getBoardByBusinessIdea] Request:', { businessIdeaId, userId });

    // Validate businessIdeaId
    if (!mongoose.Types.ObjectId.isValid(businessIdeaId)) {
      console.log('[getBoardByBusinessIdea] Invalid businessIdeaId format:', businessIdeaId);
      res.status(400);
      throw new Error('Invalid business idea ID format');
    }

    // Check if BusinessIdea exists
    const businessIdea = await BusinessIdea.findById(businessIdeaId);
    if (!businessIdea) {
      console.log('[getBoardByBusinessIdea] Business idea not found:', businessIdeaId);
      res.status(404);
      throw new Error('Business idea not found');
    }

    // Find the board associated with the businessIdeaId
    const board = await Board.findOne({ businessIdea: businessIdeaId })
      .populate('businessIdea', 'title')
      .populate('members.userId', 'fullName email');

    if (!board) {
      console.log('[getBoardByBusinessIdea] Board not found for businessIdeaId:', businessIdeaId);
      res.status(404);
      throw new Error('Board not found for this business idea');
    }

    // Check if the user is a board member
    const isMember = board.members.some(member => 
      member.userId._id.toString() === userId.toString()
    );
    if (!isMember) {
      // Check if the user is a BoardMember for this business
      const boardMember = await BoardMember.findOne({ 
        businessId: businessIdeaId, 
        userId: userId 
      });
      if (!boardMember) {
        console.log('[getBoardByBusinessIdea] User not authorized:', userId);
        res.status(403);
        throw new Error('Not authorized to access this board');
      }
    }

    console.log('[getBoardByBusinessIdea] Board found:', {
      boardId: board._id,
      businessIdeaId: board.businessIdea._id,
      members: board.members.map(m => m.userId.email)
    });

    res.status(200).json({
      _id: board._id,
      businessIdea: board.businessIdea,
      members: board.members,
      votes: board.votes || { releaseFunds: 0, extendTime: 0, refundInvestors: 0 },
      currentFunds: board.currentFunds || 0
    });
  } catch (error) {
    console.error('[getBoardByBusinessIdea] Error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(error.status || 500).json({ message: error.message });
    next(error);
  }
};
// import BoardMember from "../../models/BoardMember.js";
// import User from "../../models/User.js";
// import BusinessIdea from "../../models/BusinessIdea.js";

// export const addDefaultBoardMembers = async (req, res) => {
//   try {
//     const { businessIdeaId } = req.body; // Get business ID from request

//     // Check if the BusinessIdea exists
//     const businessIdea = await BusinessIdea.findById(businessIdeaId);
//     if (!businessIdea) {
//       return res.status(404).json({ message: "Business Idea not found." });
//     }

//     // Predefined users (Replace these with actual user IDs from your database)
//     const users = await User.find().limit(5); // Get 5 users from the DB
//     if (users.length < 5) {
//       return res.status(400).json({ message: "Not enough users in the system." });
//     }

//     const boardMembers = [
//       { 
//         userId: users[0]._id, name: "Temesgen Moges", role: "Chairman (Entrepreneur)", shares: "30%", 
//         status: "online", image: "👨‍💼", bio: "Tech entrepreneur with 10 years experience", 
//         contact: "+251 911 234 567", accountDetails: "1234-5678-9012-3456", bankName: "Commercial Bank of Ethiopia"
//       },
//       { 
//         userId: users[1]._id, name: "Sarah Johnson", role: "Lead Investor", shares: "20%", 
//         status: "online", image: "👩‍💼", bio: "Angel investor with focus on tech startups", 
//         contact: "+251 922 345 678"
//       },
//       { 
//         userId: users[2]._id, name: "Michael Chen", role: "Board Member", shares: "15%", 
//         status: "offline", image: "👨‍💼", bio: "Financial advisor and venture capitalist", 
//         contact: "+251 933 456 789"
//       },
//       { 
//         userId: users[3]._id, name: "Emma Williams", role: "Board Member", shares: "12%", 
//         status: "online", image: "👩‍💼", bio: "Investment banker with startup experience", 
//         contact: "+251 944 567 890"
//       },
//       { 
//         userId: users[4]._id, name: "David Brown", role: "Board Member", shares: "10%", 
//         status: "online", image: "👨‍💼", bio: "Serial investor and business consultant", 
//         contact: "+251 955 678 901"
//       }
//     ];

//     // Check if board members already exist for this business
//     const existingBoardMembers = await BoardMember.find({ businessId: businessIdeaId });
//     if (existingBoardMembers.length > 0) {
//       return res.status(400).json({ message: "Board members already assigned to this business." });
//     }

//     // Assign businessId to each member
//     const boardMembersWithBusinessId = boardMembers.map(member => ({
//       ...member,
//       businessId: businessIdeaId,
//     }));

//     // Save to the database
//     await BoardMember.insertMany(boardMembersWithBusinessId);
//     res.status(201).json({ message: "Board members added successfully!" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
