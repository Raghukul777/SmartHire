const express = require('express');
const { postJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/', getAllJobs);

// Protected Routes (Only Recruiters and Admins)
// NOTE: /my-jobs MUST be before /:id to avoid being matched as an ID
router.get('/my-jobs', protect, restrictTo('recruiter', 'admin'), getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, restrictTo('recruiter', 'admin'), postJob);
router.put('/:id', protect, restrictTo('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, restrictTo('recruiter', 'admin'), deleteJob);

module.exports = router;