const express = require('express');
const { postJob, getAllJobs, getJobById } = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected Routes (Only Recruiters and Admins can post jobs)
router.post('/', protect, restrictTo('recruiter', 'admin'), postJob);

module.exports = router;