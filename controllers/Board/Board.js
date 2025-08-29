import Board from '../../models/Board.js';
import BoardMemberDatabase from '../../models/BoardMemberDatabase.js';
import BusinessIdea from '../../models/BussinessIdea.js';
import User from '../../models/User.js';
import Investment from '../../models/Investment.js';

const boardController = {
  // Fetch board by boardId
  getBoard: async (req, res) => {
    try {
      const { boardId } = req.params;
      console.log(`[getBoard] Fetching board: ${boardId}`);
      const board = await Board.findById(boardId)
        .populate('businessIdea')
        .populate('members.user', 'fullName email')
        .populate('shareholders.user', 'fullName email');
      if (!board) {
        console.log(`[getBoard] No board found: ${boardId}`);
        return res.status(404).json({ message: 'Board not found' });
      }
      const isMember = board.members.some((member) => member.user._id.toString() === req.user._id.toString());
      if (!isMember) {
        console.log(`[getBoard] User ${req.user._id} is not a member of board ${boardId}`);
        return res.status(403).json({ message: 'Not a board member' });
      }
      console.log(`[getBoard] Board found: ${boardId}`);
      res.status(200).json(board);
    } catch (error) {
      console.error('[getBoard] Error:', error.stack);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Fetch board by businessIdeaId
  getBoardByBusinessIdea: async (req, res) => {
    try {
      const { businessIdeaId } = req.params;
      console.log(`[getBoardByBusinessIdea] Fetching board for businessIdea: ${businessIdeaId}`);
      let board = await Board.findOne({ businessIdea: businessIdeaId })
        .populate('businessIdea')
        .populate('members.user', 'fullName email')
        .populate('shareholders.user', 'fullName email');
      
      if (!board) {
        console.log(`[getBoardByBusinessIdea] No board found for businessIdea: ${businessIdeaId}`);
        return res.status(404).json({ message: 'Board not found' });
      }

      const isMember = board.members.some((member) => member.user._id.toString() === req.user._id.toString());
      if (!isMember) {
        console.log(`[getBoardByBusinessIdea] User ${req.user._id} is not a member of board ${board._id}`);
        return res.status(403).json({ message: 'Not a board member' });
      }
      
      console.log(`[getBoardByBusinessIdea] Board found: ${board._id}`);
      res.status(200).json(board);
    } catch (error) {
      console.error('[getBoardByBusinessIdea] Error:', error.stack);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Join or create a board
  joinBoard: async (req, res) => {
    try {
      const { businessIdeaId, userId } = req.body;
      console.log(`[joinBoard] Request: businessIdeaId=${businessIdeaId}, userId=${userId}`);

      if (!businessIdeaId || !userId) {
        console.error('[joinBoard] Missing businessIdeaId or userId');
        return res.status(400).json({ message: 'Business idea ID and user ID are required' });
      }

      const board = await createOrJoinBoard(businessIdeaId, userId, req.io);
      if (!board) {
        console.error('[joinBoard] Failed to create/join board');
        return res.status(500).json({ message: 'Failed to join or create board' });
      }

      res.status(201).json({ boardId: board._id });
    } catch (error) {
      console.error('[joinBoard] Error:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Fetch board member database
  getBoardMemberDatabase: async (req, res) => {
    try {
      const { businessIdeaId } = req.params;
      console.log(`[getBoardMemberDatabase] Fetching data for businessIdea: ${businessIdeaId}`);
      let entry = await BoardMemberDatabase.findOne({ businessIdea: businessIdeaId })
        .populate('entrepreneur.userId', 'fullName email')
        .populate('investors.userId', 'fullName email');
      
      if (!entry) {
        console.log(`[getBoardMemberDatabase] No data found for businessIdea: ${businessIdeaId}`);
        return res.status(404).json({ message: 'No board member data found' });
      }

      // Ensure userId fields are populated
      if (!entry.entrepreneur.userId || entry.investors.some((inv) => !inv.userId)) {
        console.warn(`[getBoardMemberDatabase] Missing userId, updating for businessIdea: ${businessIdeaId}`);
        await updateBoardMemberDatabase(businessIdeaId);
        entry = await BoardMemberDatabase.findOne({ businessIdea: businessIdeaId })
          .populate('entrepreneur.userId', 'fullName email')
          .populate('investors.userId', 'fullName email');
      }

      console.log(`[getBoardMemberDatabase] Data found for businessIdea: ${businessIdeaId}`);
      res.status(200).json(entry);
    } catch (error) {
      console.error('[getBoardMemberDatabase] Error:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};

// Helper function to create or join a board
async function createOrJoinBoard(businessIdeaId, userId, io) {
  try {
    console.log(`[createOrJoinBoard] Processing: businessIdeaId=${businessIdeaId}, userId=${userId}`);

    const businessIdea = await BusinessIdea.findById(businessIdeaId).populate('user');
    if (!businessIdea) {
      console.error(`[createOrJoinBoard] Business idea not found: ${businessIdeaId}`);
      return null;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`[createOrJoinBoard] User not found: ${userId}`);
      return null;
    }

    // Check eligibility using email if userId is missing
    const investment = await Investment.findOne({
      projectId: businessIdeaId,
      $or: [{ userId }, { email: user.email }],
    });
    const isEntrepreneur = businessIdea.user?.email === user.email;
    if (!investment && !isEntrepreneur) {
      console.error(`[createOrJoinBoard] User ${userId} is neither an investor nor entrepreneur`);
      return null;
    }

    let board = await Board.findOne({ businessIdea: businessIdeaId });
    if (!board) {
      console.log(`[createOrJoinBoard] Creating new board for businessIdea: ${businessIdeaId}`);
      const investments = await Investment.find({ projectId: businessIdeaId }).populate('userId');

      const topInvestors = await Promise.all(
        investments
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 4)
          .map(async (inv) => {
            const investorUser = inv.userId || (await User.findOne({ email: inv.email }));
            return {
              user: investorUser?._id || inv.email,
              role: 'Investor',
              shares: inv.shares || 0,
            };
          })
      );

      const members = [
        { user: businessIdea.user._id || businessIdea.user.email, role: 'Entrepreneur', shares: 0 },
        ...topInvestors,
      ].filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.user.toString() === member.user.toString())
      );

      board = new Board({
        businessIdea: businessIdeaId,
        members,
        shareholders: investments.map((inv) => ({
          user: inv.userId?._id || inv.email,
          shares: inv.shares || 0,
        })),
        votes: { releaseFunds: 0, extendTime: 0, refundInvestors: 0 },
        messages: [],
        currentFunds: businessIdea.fundingRaised || 0,
      });
      await board.save();
      console.log(`[createOrJoinBoard] New board created: ${board._id}`);

      if (io) {
        io.emit('boardCreated', { boardId: board._id, businessIdeaId });
      }
    } else {
      console.log(`[createOrJoinBoard] Board found: ${board._id}`);
      const isMember = board.members.some((member) => member.user.toString() === userId.toString());
      if (!isMember) {
        console.log(`[createOrJoinBoard] Adding user ${userId} to board ${board._id}`);
        board.members.push({
          user: userId,
          role: isEntrepreneur ? 'Entrepreneur' : 'Investor',
          shares: investment?.shares || 0,
        });
        await board.save();
      }
    }

    if (businessIdea.fundingRaised >= businessIdea.fundingNeeded) {
      console.log(`[createOrJoinBoard] Updating BoardMemberDatabase for fully funded idea: ${businessIdeaId}`);
      await updateBoardMemberDatabase(businessIdeaId);
    }

    return board;
  } catch (error) {
    console.error('[createOrJoinBoard] Error:', error.stack);
    return null;
  }
}

// Helper function to update BoardMemberDatabase
async function updateBoardMemberDatabase(businessIdeaId) {
  try {
    console.log(`[updateBoardMemberDatabase] Updating for businessIdea: ${businessIdeaId}`);
    const businessIdea = await BusinessIdea.findById(businessIdeaId).populate('user');
    if (!businessIdea || !businessIdea.user?.email) {
      console.error(`[updateBoardMemberDatabase] Invalid business idea or user: ${businessIdeaId}`);
      return;
    }

    const investments = await Investment.find({ projectId: businessIdeaId });
    const entrepreneurUser = await User.findOne({ email: businessIdea.user.email });
    if (!entrepreneurUser) {
      console.error(`[updateBoardMemberDatabase] Entrepreneur user not found for email: ${businessIdea.user.email}`);
      return;
    }

    const topInvestors = await Promise.all(
      investments
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4)
        .map(async (inv) => {
          const investorUser = await User.findOne({ email: inv.email });
          return {
            userId: investorUser?._id || null,
            fullName: investorUser?.fullName || inv.email || 'Unknown',
            email: inv.email || 'Unknown',
            amount: inv.amount || 0,
            shares: inv.shares || 0,
            equityPercentage: inv.equityPercentage || 0,
            timestamp: inv.createdAt || new Date(),
          };
        })
    );

    let boardMemberData = await BoardMemberDatabase.findOne({ businessIdea: businessIdeaId });
    if (!boardMemberData) {
      console.log(`[updateBoardMemberDatabase] Creating new BoardMemberDatabase entry`);
      boardMemberData = new BoardMemberDatabase({
        businessIdea: businessIdeaId,
        ideaDetails: {
          title: businessIdea.title || '',
          description: businessIdea.description || '',
          fundingNeeded: businessIdea.fundingNeeded || 0,
          fundingRaised: businessIdea.fundingRaised || 0,
          entrepreneurEquity: businessIdea.entrepreneurEquity || 0,
          investorEquity: businessIdea.investorEquity || 0,
        },
        entrepreneur: {
          userId: entrepreneurUser._id || null,
          fullName: businessIdea.user.fullName || 'Unknown',
          email: businessIdea.user.email || 'Unknown',
        },
        investors: topInvestors,
        status: 'selected',
      });
    } else {
      console.log(`[updateBoardMemberDatabase] Updating existing BoardMemberDatabase entry`);
      boardMemberData.investors = topInvestors;
      boardMemberData.ideaDetails = {
        title: businessIdea.title || '',
        description: businessIdea.description || '',
        fundingNeeded: businessIdea.fundingNeeded || 0,
        fundingRaised: businessIdea.fundingRaised || 0,
        entrepreneurEquity: businessIdea.entrepreneurEquity || 0,
        investorEquity: businessIdea.investorEquity || 0,
      };
      boardMemberData.entrepreneur = {
        userId: entrepreneurUser._id || null,
        fullName: businessIdea.user.fullName || 'Unknown',
        email: businessIdea.user.email || 'Unknown',
      };
      boardMemberData.status = 'selected';
    }

    await boardMemberData.save();
    console.log(`[updateBoardMemberDatabase] BoardMemberDatabase saved for businessIdea: ${businessIdeaId}`);
  } catch (error) {
    console.error('[updateBoardMemberDatabase] Error:', error.stack);
  }
}

export default boardController;