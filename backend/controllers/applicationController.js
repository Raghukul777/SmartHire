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

// Calculate Match Score (Simple keyword matching)
const calculateMatchScore = (jobRequirements, userSkills) => {
    if (!jobRequirements || !userSkills || userSkills.length === 0) return 0;

    // Normalize and split requirements
    const requiredSkills = jobRequirements.toLowerCase().split(/[\s,]+/).filter(s => s.length > 2);
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));

    let matches = 0;
    requiredSkills.forEach(skill => {
        if (userSkillSet.has(skill)) matches++;
    });

    return requiredSkills.length > 0 ? Math.round((matches / requiredSkills.length) * 100) : 0;
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
        const matchScore = calculateMatchScore(job.requirements, user.profile?.skills || []);

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
exports.getRecommendedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const userSkills = user.profile?.skills || [];

        if (userSkills.length === 0) {
            // Fallback: Return latest jobs if no skills
            const jobs = await Job.find().sort({ createdAt: -1 }).limit(10).populate('postedBy', 'companyName');
            return res.json(jobs);
        }

        const jobs = await Job.find().populate('postedBy', 'companyName');

        // Calculate scores
        const scoredJobs = jobs.map(job => {
            const score = calculateMatchScore(job.requirements, userSkills);
            return { ...job.toObject(), matchScore: score };
        });

        // Sort by score
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        res.json(scoredJobs.slice(0, 10)); // Top 10
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};