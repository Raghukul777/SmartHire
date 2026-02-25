const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
exports.postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, type, requiredSkills } = req.body;

        const job = await Job.create({
            title,
            description,
            requirements,
            salary,
            location,
            type,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
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

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter only)
exports.getMyJobs = async (req, res) => {
    try {
        const Application = require('../models/Application');
        const jobs = await Job.find({ postedBy: req.user._id }).populate('postedBy', 'name companyName email').sort({ createdAt: -1 });
        // Attach application count to each job
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const count = await Application.countDocuments({ job: job._id });
            return { ...job.toObject(), applicantCount: count };
        }));
        res.json(jobsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only, own jobs)
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }
        const { title, description, requirements, salary, location, type, requiredSkills } = req.body;
        const updated = await Job.findByIdAndUpdate(
            req.params.id,
            { title, description, requirements, salary, location, type, requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [] },
            { new: true, runValidators: true }
        ).populate('postedBy', 'name companyName email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only, own jobs)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }
        await job.deleteOne();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};