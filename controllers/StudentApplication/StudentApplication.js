import mongoose from 'mongoose';
import StudentApplication from '../../models/StudentApplication.js';

const studentApplicationController = {
  // Submit application
  submitApplication: async (req, res) => {
    console.log('[submitApplication] Processing application for user:', req.user);
    try {
      const {
        fullName,
        dateOfBirth,
        contactEmail,
        educationHistory,
        fundingPurpose,
        fundingAmount,
        financialNeedsDescription,
        documents,
      } = req.body;

      if (
        !fullName ||
        !dateOfBirth ||
        !contactEmail ||
        !educationHistory ||
        !fundingAmount ||
        !financialNeedsDescription
      ) {
        console.log('[submitApplication] Missing required fields:', req.body);
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const maxBase64Size = 10 * 1024 * 1024; // 10MB
      if (documents) {
        if (
          (documents.academicTranscripts && Buffer.byteLength(documents.academicTranscripts) > maxBase64Size) ||
          (documents.researchProposal && Buffer.byteLength(documents.researchProposal) > maxBase64Size)
        ) {
          console.log('[submitApplication] Document size exceeds 10MB');
          return res.status(400).json({ message: 'One or more documents exceed 10MB' });
        }

        if (documents.additionalDocuments) {
          for (const doc of documents.additionalDocuments) {
            if (Buffer.byteLength(doc) > maxBase64Size) {
              console.log('[submitApplication] Additional document exceeds 10MB');
              return res.status(400).json({ message: 'An additional document exceeds 10MB' });
            }
          }
        }
      }

      if (!req.user?.userId || !mongoose.Types.ObjectId.isValid(req.user.userId)) {
        console.log('[submitApplication] Invalid user authentication:', req.user);
        return res.status(401).json({ message: 'Invalid or missing user authentication' });
      }

      const application = new StudentApplication({
        fullName,
        dateOfBirth,
        contactEmail,
        educationHistory,
        fundingPurpose,
        fundingAmount,
        financialNeedsDescription,
        documents,
        userId: new mongoose.Types.ObjectId(req.user.userId),
        status: 'pending',
      });

      await application.save();
      console.log('[submitApplication] Application saved:', application._id);

      if (req.io) {
        req.io.emit('newApplication', {
          id: application._id,
          fullName,
          createdAt: application.createdAt,
        });
        console.log('[submitApplication] Emitted newApplication event:', application._id);
      }

      return res.status(201).json({ message: 'Application submitted', applicationId: application._id });
    } catch (error) {
      console.error('[submitApplication] Error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  getApplicationById: async (req, res) => {
    console.log('[getApplicationById] Fetching application:', {
      id: req.params.id,
      user: req.user
    });
    try {
      if (!['admin', 'entrepreneur', 'investor'].includes(req.user.role)) {
        console.log('[getApplicationById] Access denied: User role not authorized', {
          userId: req.user.userId,
          role: req.user.role
        });
        return res.status(403).json({ message: 'Admin, entrepreneur, or investor access required' });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.log('[getApplicationById] Invalid ID format:', req.params.id);
        return res.status(400).json({ message: 'Invalid application ID' });
      }

      const application = await StudentApplication.findById(req.params.id)
        .populate('userId', 'email fullName');
      if (!application) {
        console.log('[getApplicationById] Application not found:', req.params.id);
        return res.status(404).json({ message: 'Application not found' });
      }

      // Non-admins can only see approved applications
      if (req.user.role !== 'admin' && application.status !== 'approved') {
        console.log('[getApplicationById] Access denied: Application not approved', {
          id: req.params.id,
          status: application.status
        });
        return res.status(403).json({ message: 'Access denied: Application not approved' });
      }

      console.log('[getApplicationById] Application found:', application._id);
      return res.status(200).json(application);
    } catch (error) {
      console.error('[getApplicationById] Error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  // Get all applications (admin, entrepreneur, investor)
  getApplications: async (req, res) => {
    console.log('[getApplications] User accessing route:', req.user);
    try {
      // Allow admin, entrepreneur, and investor roles
      if (!['admin', 'entrepreneur', 'investor'].includes(req.user.role)) {
        console.log('[getApplications] Access denied: User role not authorized', {
          userId: req.user.userId,
          role: req.user.role
        });
        return res.status(403).json({ message: 'Admin, entrepreneur, or investor access required' });
      }

      const { status } = req.query;
      console.log('[getApplications] Querying with:', { status });
      const startTime = Date.now();
      
      // Restrict non-admin users to only see approved applications
      const query = req.user.role === 'admin' ? (status ? { status } : {}) : { status: 'approved' };
      
      const applications = await StudentApplication.find(query)
        .populate('userId', 'email fullName')
        .sort({ createdAt: -1 });
      const queryTime = Date.now() - startTime;
      console.log('[getApplications] Found applications:', applications.length, `Query took ${queryTime}ms`);

      return res.status(200).json(applications);
    } catch (error) {
      console.error('[getApplications] Error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Approve application
  approveApplication: async (req, res) => {
    console.log('[approveApplication] Approving application:', {
      id: req.params.id,
      user: req.user
    });
    try {
      if (req.user.role !== 'admin') {
        console.log('[approveApplication] Access denied: User is not admin', {
          userId: req.user.userId,
          role: req.user.role
        });
        return res.status(403).json({ message: 'Admin access required' });
      }

      const application = await StudentApplication.findById(req.params.id);
      if (!application) {
        console.log('[approveApplication] Application not found:', req.params.id);
        return res.status(404).json({ message: 'Application not found' });
      }

      application.status = 'approved';
      await application.save();
      console.log('[approveApplication] Application approved:', application._id);

      if (req.io) {
        req.io.to(application.userId.toString()).emit('applicationStatus', {
          id: application._id,
          status: 'approved',
        });
        console.log('[approveApplication] Emitted applicationStatus event:', application._id);
      }

      return res.status(200).json({ message: 'Application approved', application });
    } catch (error) {
      console.error('[approveApplication] Error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Reject application
  rejectApplication: async (req, res) => {
    console.log('[rejectApplication] Rejecting application:', {
      id: req.params.id,
      user: req.user
    });
    try {
      if (req.user.role !== 'admin') {
        console.log('[rejectApplication] Access denied: User is not admin', {
          userId: req.user.userId,
          role: req.user.role
        });
        return res.status(403).json({ message: 'Admin access required' });
      }

      const application = await StudentApplication.findById(req.params.id);
      if (!application) {
        console.log('[rejectApplication] Application not found:', req.params.id);
        return res.status(404).json({ message: 'Application not found' });
      }

      application.status = 'rejected';
      await application.save();
      console.log('[rejectApplication] Application rejected:', application._id);

      if (req.io) {
        req.io.to(application.userId.toString()).emit('applicationStatus', {
          id: application._id,
          status: 'rejected',
        });
        console.log('[rejectApplication] Emitted applicationStatus event:', application._id);
      }

      return res.status(200).json({ message: 'Application rejected', application });
    } catch (error) {
      console.error('[rejectApplication] Error:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};

export default studentApplicationController;