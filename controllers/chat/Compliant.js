import Complaint from '../../models/Compliant.js';

// Create a new complaint
export const createComplaint = async (req, res) => {
    try {
      const {responseText}= req.body;
      const { userId } = req.user;

      console.log("compliant ",req.body);
      console.log("compliant ",userId);

        const complaints = new Complaint({
            userId: userId,
            description: responseText
        });
        await complaints.save();
        res.status(201).json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all complaints
export const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('userId replies.userId');
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single complaint by ID
export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate('userId replies.userId');
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a reply to a complaint
export const addReply = async (req, res) => {
    console.log(req.params);
    console.log(req.body);
    const {responseText}= req.body
    
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        complaint.replies.push({
            userId: complaint.userId,
            message: responseText
        });
        
        await complaint.save();
        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update complaint status
export const updateIsNew = async (req, res) => {
    try {
      const {id}= req.params;
      console.log("id",id)
      
        const complaint = await Complaint.findById(id );
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        complaint.isNew = false;
        await complaint.save();
        res.status(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a complaint
export const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};