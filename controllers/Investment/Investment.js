import Investment from "../../models/Investment.js";
import BusinessIdea from "../../models/BussinessIdea.js";
import BoardMemberDatabase from "../../models/BoardMemberDatabase.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

// Helper function to parse currency strings with decimals
const parseCurrency = (value) => {
  if (!value) return 0;
  const cleanedValue = value.toString().replace(/,/g, "");
  const num = Number(cleanedValue);
  return isNaN(num) ? 0 : num;
};

const investmentController = {
  saveInvestment: async (req, res) => {
    console.log("=== ENTERING saveInvestment ===");
    console.log("Investment data:", req.body);
    console.log("Authenticated user:", req.user);

    try {
      const {
        txRef,
        fullName,
        email,
        projectId,
        projectName,
        amount,
        shares,
        equityPercentage,
        sharePrice,
        timestamp,
      } = req.body;
      const userId = req.user._id;

      // Validate input
      if (
        !txRef ||
        !fullName ||
        !email ||
        !projectId ||
        !projectName ||
        !amount ||
        !shares ||
        !equityPercentage ||
        !timestamp
      ) {
        console.error("Missing fields:", req.body);
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newAmount = Number(amount);
      const newShares = Number(shares);
      const newEquityPercentage = Number(equityPercentage); // Expect decimal (e.g., 0.1975248)
      const newSharePrice = Number(sharePrice) || 1000; // Default share price
      if (
        isNaN(newAmount) ||
        newAmount <= 0 ||
        isNaN(newShares) ||
        newShares <= 0 ||
        isNaN(newEquityPercentage) ||
        newEquityPercentage <= 0
      ) {
        console.error("Invalid numeric fields:", {
          amount,
          shares,
          equityPercentage,
        });
        return res.status(400).json({
          message: "Invalid investment amount, shares, or equity percentage",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error("Invalid email format:", email);
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate timestamp
      const parsedTimestamp = new Date(timestamp);
      if (isNaN(parsedTimestamp.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return res.status(400).json({ message: "Invalid timestamp" });
      }

      // Fetch BusinessIdea
      const businessIdea = await BusinessIdea.findById(projectId).populate(
        "user"
      );
      if (!businessIdea) {
        console.error("Business Idea not found for ID:", projectId);
        return res.status(404).json({ message: "Business Idea not found" });
      }

      // Parse string fields to numbers with decimal support
      const fundingNeeded = parseCurrency(businessIdea.fundingNeeded);
      const fundingRaised = parseCurrency(businessIdea.fundingRaised);
      const investorEquity = Number(businessIdea.investorEquity) / 100; // e.g., "79.01" → 0.7901
      const entrepreneurEquity =
        Number(businessIdea.entrepreneurEquity) / 100 || 0.3;
      const remainingFunding = fundingNeeded - fundingRaised;

      console.log("Parsed BusinessIdea data:", {
        fundingNeeded,
        fundingRaised,
        investorEquity,
        entrepreneurEquity,
        remainingFunding,
        rawFundingNeeded: businessIdea.fundingNeeded,
        rawFundingRaised: businessIdea.fundingRaised,
        rawInvestorEquity: businessIdea.investorEquity,
      });

      // Validate funding data
      if (fundingNeeded <= 0 || isNaN(fundingNeeded)) {
        console.error("Invalid fundingNeeded:", fundingNeeded);
        return res
          .status(400)
          .json({ message: "Invalid funding needed amount" });
      }
      if (remainingFunding < 0) {
        console.error("Negative remaining funding:", {
          fundingNeeded,
          fundingRaised,
          remainingFunding,
        });
        return res.status(400).json({
          message:
            "Project has exceeded its funding goal. No further investments allowed.",
        });
      }

      // Validate investment amount against remaining funding
      if (newAmount > remainingFunding) {
        console.error("Investment exceeds remaining funding:", {
          newAmount,
          remainingFunding,
        });
        return res.status(400).json({
          message: `Investment amount (${newAmount} ETB) exceeds remaining funding (${remainingFunding} ETB)`,
        });
      }

      // Minimum investment validation
      const MIN_INVESTMENT = 3000;
      if (newAmount < MIN_INVESTMENT && newAmount !== remainingFunding) {
        console.error("Investment below minimum:", {
          newAmount,
          MIN_INVESTMENT,
          remainingFunding,
        });
        return res.status(400).json({
          message: `Minimum investment is ${MIN_INVESTMENT} ETB, unless covering the exact remaining amount (${remainingFunding} ETB)`,
        });
      }

      // Calculate valuation and verify equity
      const valuation =
        investorEquity > 0 ? fundingNeeded / investorEquity : Infinity;
      const calculatedEquityPercentage =
        valuation > 0 ? newAmount / valuation : 0;
      if (
        Math.abs(calculatedEquityPercentage - newEquityPercentage) > 0.000001
      ) {
        console.error("Equity percentage mismatch:", {
          provided: newEquityPercentage,
          calculated: calculatedEquityPercentage,
          valuation,
          newAmount,
        });
        return res
          .status(400)
          .json({ message: "Invalid equity percentage provided" });
      }

      // Calculate shares (match frontend precision: 5 decimals)
      const calculatedShares = Number((newAmount / newSharePrice).toFixed(5));
      if (Math.abs(calculatedShares - newShares) > 0.00001) {
        console.error("Shares mismatch:", {
          provided: newShares,
          calculated: calculatedShares,
          newAmount,
          newSharePrice,
        });
        return res.status(400).json({
          message: `Invalid shares provided. Expected approximately ${calculatedShares} shares for amount ${newAmount} ETB at ${newSharePrice} ETB per share`,
        });
      }

      // Check investor's prior equity and enforce 25% cap
      const maxEquityPerInvestor = investorEquity / 4;
      let priorEquity = 0;
      const priorInvestments = await Investment.find({
        projectId,
        userId,
        paymentStatus: "completed",
      });
      priorEquity = priorInvestments.reduce(
        (sum, inv) => sum + (inv.equityPercentage || 0),
        0
      );
      const totalEquity = priorEquity + newEquityPercentage;

      console.log("Equity cap validation:", {
        investorEquity,
        maxEquityPerInvestor,
        priorEquity,
        newEquityPercentage,
        totalEquity,
        maxInvestment: (maxEquityPerInvestor - priorEquity) * valuation,
      });

      if (totalEquity > maxEquityPerInvestor) {
        const maxInvestment = (maxEquityPerInvestor - priorEquity) * valuation;
        console.error("Exceeds 25% equity cap:", {
          priorEquity,
          newEquityPercentage,
          totalEquity,
          maxInvestment,
        });
        return res.status(400).json({
          message: `Total equity (${
            totalEquity * 100
          }%) exceeds 25% cap. You can invest up to ${maxInvestment.toFixed(
            2
          )} ETB more.`,
        });
      }

      // Check for duplicate txRef
      const existingInvestment = await Investment.findOne({ txRef });
      if (existingInvestment) {
        console.error("Duplicate transaction reference:", txRef);
        return res
          .status(400)
          .json({ message: "Transaction reference already exists" });
      }

      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Create and save investment
        const investment = new Investment({
          txRef,
          fullName,
          email,
          projectId,
          projectName,
          amount: newAmount,
          shares: newShares,
          equityPercentage: newEquityPercentage,
          sharePrice: newSharePrice,
          timestamp: parsedTimestamp,
          paymentStatus: "pending",
          fundingRaised: fundingRaised + newAmount,
          fundingNeeded,
          userId,
        });
        await investment.save({ session });

        // Update BusinessIdea
        businessIdea.fundingRaised = (fundingRaised + newAmount).toString();
        const investorContribution = businessIdea.investorContributions.find(
          (c) => c.user.toString() === userId.toString()
        );
        if (investorContribution) {
          investorContribution.equityPercentage = totalEquity;
        } else {
          businessIdea.investorContributions.push({
            user: userId,
            equityPercentage: newEquityPercentage,
          });
        }
        await businessIdea.save({ session });

        // Commit transaction
        await session.commitTransaction();

        console.log("Investment saved:", investment);
        console.log("Updated BusinessIdea:", {
          fundingRaised: businessIdea.fundingRaised,
          fundingNeeded: businessIdea.fundingNeeded,
          investorContributions: businessIdea.investorContributions,
        });

        // Emit Socket.IO event
        if (req.io) {
          req.io.to(projectId).emit("fundingUpdated", {
            ideaId: projectId,
            fundingRaised: fundingRaised + newAmount,
            fundingNeeded,
          });
          console.log("Emitted fundingUpdated event for ideaId:", projectId);
        }

        // Check if funding goal is met and create board members
        if (
          fundingRaised + newAmount >= fundingNeeded &&
          !businessIdea.boardCreated
        ) {
          await investmentController.createBoardMembers(
            businessIdea,
            fundingNeeded,
            investorEquity * 100, // Convert back to percentage
            entrepreneurEquity * 100,
            req.io
          );
          businessIdea.boardCreated = true;
          await businessIdea.save();
          console.log(
            "Board members created and boardCreated flag set for project:",
            projectId
          );
        }

        return res
          .status(200)
          .json({ message: "Investment saved", investment });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error("Save error:", error.message, error.stack);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  // Update createBoardMembers to use parseCurrency
  createBoardMembers: async (
    businessIdea,
    fundingNeeded,
    investorEquity,
    entrepreneurEquity,
    io
  ) => {
    try {
      console.log("=== Creating board members for project:", businessIdea._id);

      const projectId = businessIdea._id.toString();

      // Aggregate investments to find top 4 investors by total investment amount
      const topInvestors = await Investment.aggregate([
        { $match: { projectId, paymentStatus: "pending" } },
        {
          $group: {
            _id: "$userId",
            totalAmount: { $sum: "$amount" },
            totalEquity: { $sum: "$equityPercentage" },
            totalShares: { $sum: "$shares" },
            fullName: { $first: "$fullName" },
            email: { $first: "$email" },
            lastTimestamp: { $max: "$timestamp" },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 4 },
      ]);

      // Fetch entrepreneur details
      const entrepreneur = businessIdea.user;
      if (!entrepreneur) {
        console.error("Entrepreneur not found for businessIdea:", projectId);
        throw new Error("Entrepreneur not found");
      }

      // Prepare investors array
      const investors = [];
      for (const investor of topInvestors) {
        const user = await User.findById(investor._id);
        if (!user) {
          console.warn("User not found for ID:", investor._id);
          continue;
        }
        investors.push({
          userId: investor._id,
          fullName: investor.fullName,
          email: investor.email,
          amount: investor.totalAmount,
          shares: investor.totalShares,
          equityPercentage: investor.totalEquity,
          timestamp: investor.lastTimestamp,
        });
      }

      // Create BoardMemberDatabase document
      const boardMemberData = new BoardMemberDatabase({
        businessIdea: businessIdea._id,
        ideaDetails: {
          title: businessIdea.title,
          fundingNeeded,
          fundingRaised: parseCurrency(businessIdea.fundingRaised),
          entrepreneurEquity,
          investorEquity,
          description: businessIdea.overview || "",
        },
        entrepreneur: {
          userId: entrepreneur._id,
          fullName: entrepreneur.fullName,
          email: entrepreneur.email,
        },
        investors,
        status: "selected",
      });

      await boardMemberData.save();
      console.log("Board members saved:", boardMemberData);

      // Emit Socket.IO event
      if (100) {
        io.to(projectId).emit("boardCreated", {
          projectId,
          entrepreneur: {
            userId: entrepreneur._id,
            fullName: entrepreneur.fullName,
            email: entrepreneur.email,
          },
          investors: investors.map((inv) => ({
            userId: inv.userId,
            fullName: inv.fullName,
            email: inv.email,
            amount: inv.amount,
            shares: inv.shares,
            equityPercentage: inv.equityPercentage,
          })),
        });
        console.log("Emitted boardCreated event for projectId:", projectId);
      }
    } catch (error) {
      console.error(
        "Error creating board members:",
        error.message,
        error.stack
      );
      throw error;
    }
  },

  handleChapaCallback: async (req, res) => {
    console.log("=== ENTERING handleChapaCallback ===");
    console.log("Callback data:", req.query);
    try {
      const { tx_ref, status } = req.query;
      if (!tx_ref || !status) {
        console.error("Missing tx_ref or status in callback");
        return res
          .status(400)
          .json({ message: "Missing transaction reference or status" });
      }

      const investment = await Investment.findOne({ txRef: tx_ref });
      if (!investment) {
        console.error("Investment not found for tx_ref:", tx_ref);
        return res.status(404).json({ message: "Investment not found" });
      }

      if (status === "success") {
        investment.paymentStatus = "completed";
        await investment.save();
        console.log("Investment payment confirmed:", investment);

        // Emit Socket.IO event for payment confirmation
        if (req.io) {
          req.io.to(investment.projectId).emit("paymentConfirmed", {
            ideaId: investment.projectId,
            investmentId: investment._id,
            status: "completed",
          });
          console.log(
            "Emitted paymentConfirmed event for ideaId:",
            investment.projectId
          );
        }
      } else {
        investment.paymentStatus = "failed";
        await investment.save();
        console.log("Investment payment failed:", investment);
      }

      return res.status(200).json({ message: "Callback processed" });
    } catch (error) {
      console.error("Callback error:", error.message);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  getUserInvestments: async (req, res) => {
    console.log("Fetching investments for:", req.query.email);
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const investments = await Investment.find({
        email,
        paymentStatus: "completed",
      });
      const totalAmount = investments.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
      );
      const totalEquity = investments.reduce(
        (sum, inv) => sum + (inv.equityPercentage || 0),
        0
      );

      console.log("Investments found:", investments.length);
      return res.status(200).json({
        investments,
        totalAmount,
        totalEquity,
      });
    } catch (error) {
      console.error("Fetch error:", error.message);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  getInvestorEquity: async (req, res) => {
    console.log("Fetching investor equity for:", {
      userId: req.user._id,
      projectId: req.params.projectId,
    });
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      const businessIdea = await BusinessIdea.findById(projectId);
      if (!businessIdea) {
        return res.status(404).json({ message: "Business Idea not found" });
      }

      if (!Array.isArray(businessIdea.investorContributions)) {
        businessIdea.investorContributions = [];
        await businessIdea.save();
      }

      const contribution = businessIdea.investorContributions.find(
        (c) => c.user.toString() === userId.toString()
      );
      const equityPercentage = contribution ? contribution.equityPercentage : 0;

      return res.status(200).json({ equityPercentage });
    } catch (error) {
      console.error("Error fetching investor equity:", error.message);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  getInvestmentDetails: async (req, res) => {
    console.log(
      "Fetching investment details for project:",
      req.params.projectId
    );
    try {
      const { projectId } = req.params;

      // Check if the business idea exists
      const businessIdea = await BusinessIdea.findById(projectId);
      if (!businessIdea) {
        return res.status(404).json({ message: "Business Idea not found" });
      }

      // Parse fundingNeeded as a number (ensure it's properly formatted)
      const fundingNeeded = parseFloat(businessIdea.fundingNeeded) || 0;

      // Get all investments for the given projectId
      const investments = await Investment.find({ projectId });

      // Sum up the total funding raised
      const fundingRaised = investments.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      // Calculate remaining funding
      const remainingFunding = fundingNeeded - fundingRaised;

      return res.status(200).json({
        fundingNeeded,
        fundingRaised,
        remainingFunding,
        totalInvestors: investments.length,
        investments,
      });
    } catch (error) {
      console.error("Error fetching investment details:", error.message);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
};

const saveBoardMemberData = async (businessIdea, io) => {
  try {
    const investments = await Investment.find({
      projectId: businessIdea._id,
      paymentStatus: "completed",
    }).populate("userId");
    if (investments.length === 0) {
      console.log("No completed investments found for board creation");
      return;
    }

    const entrepreneur = await User.findById(businessIdea.user._id);
    if (!entrepreneur) {
      console.log("Entrepreneur not found");
      return;
    }

    // Sort investments by equityPercentage
    const sortedInvestments = investments.sort(
      (a, b) => b.equityPercentage - a.equityPercentage
    );

    let boardMemberEntry = await BoardMemberDatabase.findOne({
      businessIdea: businessIdea._id,
    });
    if (!boardMemberEntry) {
      boardMemberEntry = new BoardMemberDatabase({
        businessIdea: businessIdea._id,
        ideaDetails: {
          title: businessIdea.title,
          fundingNeeded: businessIdea.fundingNeeded,
          fundingRaised: businessIdea.fundingRaised,
          entrepreneurEquity: businessIdea.entrepreneurEquity,
          investorEquity: businessIdea.investorEquity,
          description: businessIdea.overview || "No overview provided",
          investmentTimeline: businessIdea.investmentTimeline || "2 months",
        },
        entrepreneur: {
          userId: entrepreneur._id,
          fullName: entrepreneur.fullName || "Unknown",
          email: entrepreneur.email,
          role: "Chairman",
        },
        investors: sortedInvestments.map((inv) => ({
          userId: inv.userId?._id || "unknown",
          fullName: inv.fullName,
          email: inv.email,
          amount: inv.amount,
          shares: inv.shares,
          equityPercentage: inv.equityPercentage,
          timestamp: inv.timestamp,
          role: inv.equityPercentage >= 10 ? "Board Member" : "Shareholder",
        })),
        status: "pending",
      });
    } else {
      boardMemberEntry.ideaDetails = {
        title: businessIdea.title,
        fundingNeeded: businessIdea.fundingNeeded,
        fundingRaised: businessIdea.fundingRaised,
        entrepreneurEquity: businessIdea.entrepreneurEquity,
        investorEquity: businessIdea.investorEquity,
        description: businessIdea.overview || "No overview provided",
        investmentTimeline: businessIdea.investmentTimeline || "2 months",
      };
      boardMemberEntry.investors = sortedInvestments.map((inv) => ({
        userId: inv.userId?._id || "unknown",
        fullName: inv.fullName,
        email: inv.email,
        amount: inv.amount,
        shares: inv.shares,
        equityPercentage: inv.equityPercentage,
        timestamp: inv.timestamp,
        role: inv.equityPercentage >= 10 ? "Board Member" : "Shareholder",
      }));
      boardMemberEntry.status = "pending";
    }
    await boardMemberEntry.save();
    console.log("BoardMemberDatabase saved:", boardMemberEntry);

    if (io) {
      io.to(businessIdea._id).emit("boardMemberDataSaved", {
        boardMemberEntryId: boardMemberEntry._id,
        businessIdeaId: businessIdea._id,
        title: businessIdea.title,
      });
      console.log(
        "Emitted boardMemberDataSaved event for businessIdeaId:",
        businessIdea._id
      );
    }
  } catch (error) {
    console.error(
      "Error saving board member data:",
      error.message,
      error.stack
    );
  }
};

export default investmentController;
