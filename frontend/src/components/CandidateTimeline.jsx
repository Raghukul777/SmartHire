import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const stages = ['APPLIED', 'SCREENING', 'TECHNICAL', 'INTERVIEW', 'HR', 'OFFER', 'HIRED'];

const stageColors = {
    APPLIED: { bg: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', ring: '#6366f1' },
    SCREENING: { bg: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', ring: '#a855f7' },
    TECHNICAL: { bg: 'rgba(52, 211, 153, 0.08)', color: '#34d399', ring: '#34d399' },
    INTERVIEW: { bg: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', ring: '#6366f1' },
    HR: { bg: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', ring: '#a855f7' },
    OFFER: { bg: 'rgba(34, 197, 94, 0.08)', color: '#22c55e', ring: '#22c55e' },
    HIRED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', ring: '#16a34a' },
    REJECTED: { bg: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', ring: '#ef4444' },
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
};

export default function CandidateTimeline({ application }) {
    if (!application) return null;

    const currentStage = application.currentStage || 'APPLIED';
    const currentStageIndex = stages.indexOf(currentStage);
    const isRejected = currentStage === 'REJECTED';
    const isHired = currentStage === 'HIRED';
    const progress = isHired ? 100 : isRejected ? (currentStageIndex / (stages.length - 1)) * 100 : (currentStageIndex / (stages.length - 1)) * 100;
    const sc = stageColors[currentStage] || stageColors.APPLIED;

    return (
        <motion.div
            whileHover={{
                y: -3,
                boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.2)',
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{
                padding: '1.25rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: sc.ring,
                opacity: 0.6,
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#e2e8f0',
                        marginBottom: '0.15rem',
                        letterSpacing: '-0.01em',
                    }}>
                        {application.job?.title || 'Position'}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 500 }}>
                        {application.job?.postedBy?.companyName || 'Company'}
                    </p>
                </div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: sc.bg,
                        color: sc.color,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {currentStage}
                </motion.div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '0.75rem' }}>
                <div style={{
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        style={{
                            height: '100%',
                            borderRadius: '999px',
                            background: isRejected
                                ? 'linear-gradient(90deg, #ef4444, #fca5a5)'
                                : isHired
                                    ? 'linear-gradient(90deg, #22c55e, #86efac)'
                                    : `linear-gradient(90deg, ${sc.ring}, ${sc.ring}88)`,
                            position: 'relative',
                        }}
                    />
                </div>
            </div>

            {/* Timeline Dots */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.15rem',
                marginBottom: '0.75rem',
            }}>
                {stages.map((stage, i) => {
                    const isCompleted = i < currentStageIndex || isHired;
                    const isCurrent = i === currentStageIndex && !isRejected;

                    return (
                        <div
                            key={stage}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 12 }}
                                style={{
                                    width: isCurrent ? '14px' : '8px',
                                    height: isCurrent ? '14px' : '8px',
                                    borderRadius: '50%',
                                    background: isCompleted ? sc.ring : isCurrent ? sc.ring : 'rgba(255, 255, 255, 0.12)',
                                    border: isCurrent ? `3px solid ${sc.ring}33` : 'none',
                                    transition: 'all 400ms',
                                    boxShadow: isCurrent ? `0 0 0 4px ${sc.ring}15` : 'none',
                                    animation: isCurrent ? 'progressPulse 2s ease-in-out infinite' : 'none',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={11} />
                    {formatDate(application.updatedAt || application.createdAt)}
                </span>
                <Link to={`/jobs/${application.job?._id || application.job}`}>
                    <motion.button
                        whileHover={{ x: 3 }}
                        style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Details <ArrowRight size={11} />
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
}
