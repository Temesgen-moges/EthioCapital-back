import express from 'express';
import Student from '../models/Student.js';
import auth from '../middleware/auth.js';

const StudentRouter = express.Router();

// Create new student application
router.post('/', auth, async (req, res) => {
  try {
    const student = new Student({
      ...req.body,
      user: req.user.id
    });
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get logged-in user's student applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const students = await Student.find({ user: req.user.id });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Get single student application
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!student) return res.status(404).send();
    res.send(student);
  } catch (error) {
    res.status(500).send();
  }
});

// Admin get all student applications
router.get('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send();
  
  try {
    const students = await Student.find().populate('user', 'name email');
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

export default StudentRouter ;