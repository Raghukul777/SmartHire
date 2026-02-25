const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Valid State Transitions
const validTransitions = {
    'APPLIED': ['SCREENING', 'REJECTED', 'WITHDRAWN'],
    'SCREENING': ['TECHNICAL', 'REJECTED', 'WITHDRAWN'],
    'TECHNICAL': ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
    'INTERVIEW': ['HR', 'REJECTED', 'WITHDRAWN'],
    'HR': ['OFFER', 'REJECTED', 'WITHDRAWN'],
    'OFFER': ['HIRED', 'REJECTED', 'WITHDRAWN'],
    'HIRED': [],
    'REJECTED': [],
    'WITHDRAWN': []
};

// Start: Workflow Engine Helpers
const validateTransition = (current, next) => {
    const validNextStages = validTransitions[current];
    if (!validNextStages) return false;
    return validNextStages.includes(next);
};

// Calculate Match Score
const calculateMatchScore = (job, userSkills) => {
    if (!job || !userSkills || userSkills.length === 0) return 0;

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

    // --- Strategy 1: Structured requiredSkills array (set by recruiter) ---
    // Score = how many of the REQUIRED skills the user has
    if (job.requiredSkills && job.requiredSkills.length > 0) {
        const requiredNormalized = job.requiredSkills.map(s => s.toLowerCase().trim());
        let matches = 0;
        requiredNormalized.forEach(reqSkill => {
            if (normalizedUserSkills.some(us => us === reqSkill || us.includes(reqSkill) || reqSkill.includes(us))) {
                matches++;
            }
        });
        return Math.round((matches / requiredNormalized.length) * 100);
    }

    // --- Strategy 2: Freeform text fallback ---
    // Score = how many of the USER's skills appear anywhere in the job text
    const jobText = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    let matches = 0;
    normalizedUserSkills.forEach(skill => {
        if (jobText.includes(skill)) matches++;
    });
    return Math.round((matches / normalizedUserSkills.length) * 100);
};
// End: Workflow Engine Helpers

// @desc    Apply for a job
exports.applyForJob = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a resume (PDF)' });
        }

        const jobId = req.params.jobId;
        const applicantId = req.user._id;

        const existingApplication = await Application.findOne({ job: jobId, applicant: applicantId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const user = await User.findById(applicantId);

        // Calculate match score
        const matchScore = calculateMatchScore(job, user.profile?.skills || []);

        const application = await Application.create({
            job: jobId,
            applicant: applicantId,
            resume: req.file.path,
            currentStage: 'APPLIED',
            stageHistory: [{
                stage: 'APPLIED',
                enteredAt: new Date(),
                comments: 'Application submitted'
            }],
            matchScore: matchScore
        });

        await Job.findByIdAndUpdate(jobId, { $push: { applicants: applicantId } });

        // Notify Recruiter
        await Notification.create({
            user: job.postedBy,
            message: `New application for ${job.title} from ${user.name}`,
            type: 'APPLICATION_UPDATE'
        });

        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Application error:', error);

        // Handle duplicate application error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        res.status(500).json({ message: error.message || 'Failed to submit application' });
    }
};

// @desc    Update Application Stage (Workflow Transition)
exports.updateApplicationStage = async (req, res) => {
    try {
        const { stage, comments, interviewDetails, offerDetails } = req.body;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Validate Transition
        if (!validateTransition(application.currentStage, stage)) {
            return res.status(400).json({
                message: `Invalid transition from ${application.currentStage} to ${stage}`
            });
        }

        // Update Fields
        application.currentStage = stage;
        application.stageHistory.push({
            stage: stage,
            enteredAt: new Date(),
            updatedBy: req.user._id,
            comments: comments || ''
        });

        // Handle Specific Stage Logic
        if (stage === 'INTERVIEW' && interviewDetails) {
            application.interview = {
                ...interviewDetails,
                scheduledBy: req.user._id
            };
        }

        if (stage === 'OFFER' && offerDetails) {
            application.offer = {
                ...offerDetails,
                status: 'PENDING'
            };
        }

        await application.save();

        // Notify Applicant
        await Notification.create({
            user: application.applicant,
            message: `Your application for has moved to ${stage}`,
            type: stage === 'INTERVIEW' ? 'INTERVIEW' : stage === 'OFFER' ? 'OFFER' : 'APPLICATION_UPDATE'
        });

        res.status(200).json({ message: `Application moved to ${stage}`, application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applications for a Job (Recruiter)
exports.getJobApplications = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email profile')
            .sort({ matchScore: -1 }); // Sort by best match
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Applications (Candidate)
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('job', 'title companyName location salary type')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Recommended Jobs (Candidate)
// GET /applications/recommendations?skills=Java,Spring+Boot
exports.getRecommendedJobs = async (req, res) => {
    try {
        // 1. Try skills from query param (sent by frontend - always up to date)
        let userSkills = [];
        if (req.query.skills && req.query.skills.trim()) {
            userSkills = req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        // 2. Fall back to DB if no query skills provided
        if (userSkills.length === 0) {
            const user = await User.findById(req.user._id);
            userSkills = user.profile?.skills || [];
        }

        // 3. Always fetch all jobs and score them
        const jobs = await Job.find().populate('postedBy', 'companyName');

        const scoredJobs = jobs.map(job => {
            const score = userSkills.length > 0 ? calculateMatchScore(job, userSkills) : 0;
            return { ...job.toObject(), matchScore: score };
        });

        // Sort highest match first
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        res.json(scoredJobs.slice(0, 10));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};