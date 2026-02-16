const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    currentStage: {
        type: String,
        enum: ['APPLIED', 'SCREENING', 'TECHNICAL', 'INTERVIEW', 'HR', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'],
        default: 'APPLIED'
    },
    stageHistory: [{
        stage: { type: String, required: true },
        enteredAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comments: String
    }],
    interview: {
        scheduledAt: Date,
        link: String,
        notes: String,
        scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    offer: {
        salary: Number,
        currency: { type: String, default: 'USD' },
        joiningDate: Date,
        status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'] }
    },
    matchScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);