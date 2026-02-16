const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
exports.postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, type } = req.body;

        const job = await Job.create({
            title,
            description,
            requirements,
            salary,
            location,
            type,
            postedBy: req.user._id // The user ID from the authMiddleware
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name companyName email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name companyName email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};