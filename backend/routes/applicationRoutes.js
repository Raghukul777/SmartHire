const express = require('express');
const {
    applyForJob,
    getJobApplications,
    updateApplicationStage,
    getMyApplications,
    getRecommendedJobs
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Candidate Routes
router.get('/me', protect, restrictTo('candidate'), getMyApplications);
router.get('/recommendations', protect, restrictTo('candidate'), getRecommendedJobs);
router.post('/:jobId', protect, restrictTo('candidate'), upload.single('resume'), applyForJob);

// Recruiter/Admin Routes
router.get('/job/:jobId', protect, restrictTo('recruiter', 'admin'), getJobApplications);
router.put('/:id/stage', protect, restrictTo('recruiter', 'admin'), updateApplicationStage);

module.exports = router;