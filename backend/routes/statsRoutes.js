const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');

const router = express.Router();

// GET /api/stats — returns real-time platform statistics
router.get('/', async (req, res) => {
    try {
        const [totalUsers, totalJobs] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
        ]);

        res.json({
            totalUsers,
            totalJobs,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Failed to retrieve stats' });
    }
});

module.exports = router;
