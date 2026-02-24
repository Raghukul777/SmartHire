import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { ChevronDown, ChevronRight, User, Mail, FileText, GripVertical, ArrowRight, CheckCircle, Clock, XCircle, MoveRight } from 'lucide-react';
import { premiumEase, containerVariants, itemVariants, softSpring } from '../utils/motion';

const stages = [
    { key: 'APPLIED', label: 'Applied', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.06)', icon: <Clock size={14} /> },
    { key: 'SCREENING', label: 'Screening', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.06)', icon: <FileText size={14} /> },
    { key: 'TECHNICAL', label: 'Technical', color: '#34d399', bg: 'rgba(52, 211, 153, 0.06)', icon: <FileText size={14} /> },
    { key: 'INTERVIEW', label: 'Interview', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.06)', icon: <User size={14} /> },
    { key: 'HR', label: 'HR Review', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.06)', icon: <User size={14} /> },
    { key: 'OFFER', label: 'Offer', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.06)', icon: <CheckCircle size={14} /> },
    { key: 'HIRED', label: 'Hired', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)', icon: <CheckCircle size={14} /> },
    { key: 'REJECTED', label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.06)', icon: <XCircle size={14} /> },
];

export default function KanbanBoard({ applications, onUpdate }) {
    const [movingApp, setMovingApp] = useState(null);
    const [expandedStage, setExpandedStage] = useState(null);

    const moveApplication = async (applicationId, newStage) => {
        setMovingApp(applicationId);
        try {
            await api.put(`/applications/${applicationId}/stage`, { stage: newStage });
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setMovingApp(null);
        }
    };

    // Group applications by stage
    const columns = {};
    stages.forEach(s => { columns[s.key] = []; });
    (applications || []).forEach(app => {
        const stageKey = app.currentStage || 'APPLIED';
        if (columns[stageKey]) columns[stageKey].push(app);
        else columns['APPLIED'].push(app);
    });

    const totalApps = applications?.length || 0;

    return (
        <div>
            {/* Summary bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: premiumEase }}
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.75rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(30, 36, 51, 0.65)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                {stages.map(stage => {
                    const count = columns[stage.key]?.length || 0;
                    return (
                        <motion.button
                            key={stage.key}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setExpandedStage(expandedStage === stage.key ? null : stage.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '999px',
                                border: expandedStage === stage.key ? `1.5px solid ${stage.color}40` : '1px solid transparent',
                                background: expandedStage === stage.key ? stage.bg : 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: expandedStage === stage.key ? stage.color : '#718096',
                                transition: 'all 300ms',
                            }}
                        >
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: count > 0 ? stage.color : 'rgba(255, 255, 255, 0.15)',
                            }} />
                            {stage.label}
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: count > 0 ? stage.color : '#718096',
                            }}>
                                {count}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Kanban columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
            }}>
                {stages.map((stage, stageIdx) => {
                    const stageApps = columns[stage.key];
                    const isExpanded = expandedStage === null || expandedStage === stage.key;

                    if (!isExpanded && stageApps.length === 0) return null;

                    return (
                        <motion.div
                            key={stage.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isExpanded ? 1 : 0.4, y: 0 }}
                            transition={{ delay: stageIdx * 0.08, duration: 0.5, ease: premiumEase }}
                            style={{
                                background: stage.bg,
                                borderRadius: '1.25rem',
                                padding: '1.25rem',
                                border: `1px solid ${stage.color}15`,
                                minHeight: '200px',
                                transition: 'opacity 400ms',
                            }}
                        >
                            {/* Column header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: `1px solid ${stage.color}15`,
                            }}>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: stage.color }}>{stage.icon}</span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#e2e8f0',
                                    }}>
                                        {stage.label}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    color: stage.color,
                                    background: `${stage.color}15`,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '999px',
                                }}>
                                    {stageApps.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                            >
                                <AnimatePresence>
                                    {stageApps.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                color: '#718096',
                                                fontSize: '0.8rem',
                                                borderRadius: '0.875rem',
                                                border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            No candidates
                                        </motion.div>
                                    ) : (
                                        stageApps.map((app, i) => (
                                            <ApplicationCard
                                                key={app._id}
                                                app={app}
                                                stage={stage}
                                                index={i}
                                                isMoving={movingApp === app._id}
                                                onMove={(newStage) => moveApplication(app._id, newStage)}
                                                currentStageIndex={stages.findIndex(s => s.key === stage.key)}
                                                allStages={stages}
                                            />
                                        ))
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function ApplicationCard({ app, stage, index, isMoving, onMove, currentStageIndex, allStages }) {
    const [showActions, setShowActions] = useState(false);

    const nextStage = currentStageIndex < allStages.length - 2 ? allStages[currentStageIndex + 1] : null;
    const canReject = stage.key !== 'REJECTED' && stage.key !== 'HIRED';

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.2)' }}
            transition={{ duration: 0.4, ease: premiumEase }}
            onHoverStart={() => setShowActions(true)}
            onHoverEnd={() => setShowActions(false)}
            style={{
                background: 'rgba(30, 36, 51, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '0.875rem',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
                opacity: isMoving ? 0.5 : 1,
                transition: 'opacity 300ms',
            }}
        >
            {/* Candidate Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: stage.color,
                }}>
                    {app.applicant?.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
                        {app.applicant?.name || 'Unknown Candidate'}
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={10} /> {app.applicant?.email || 'No email'}
                    </p>
                </div>
            </div>

            {/* Resume link */}
            {app.resume && (() => {
                const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                const resumeUrl = app.resume.startsWith('http') ? app.resume : `${backendBase}/${app.resume.replace(/^\//, '')}`;
                return (
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#6366f1',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                            transition: 'color 300ms',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
                    >
                        <FileText size={12} /> View Resume
                    </a>
                );
            })()}

            {/* Action buttons  */}
            <AnimatePresence>
                {showActions && (nextStage || canReject) && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}
                    >
                        {nextStage && (
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onMove(nextStage.key)}
                                disabled={isMoving}
                                style={{
                                    flex: 1,
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '0.625rem',
                                    background: `${nextStage.color}12`,
                                    color: nextStage.color,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    border: `1px solid ${nextStage.color}25`,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.25rem',
                                    transition: 'all 200ms',
                                }}
                            >
                                <MoveRight size={12} /> {nextStage.label}
                            </motion.button>
                        )}
                        {canReject && (
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onMove('REJECTED')}
                                disabled={isMoving}
                                style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '0.625rem',
                                    background: 'rgba(239, 68, 68, 0.06)',
                                    color: '#ef4444',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    border: '1px solid rgba(239, 68, 68, 0.12)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    transition: 'all 200ms',
                                }}
                            >
                                <XCircle size={12} />
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
