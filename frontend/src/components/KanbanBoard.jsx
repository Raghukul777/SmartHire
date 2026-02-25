import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/api';
import { ChevronDown, ChevronRight, User, Mail, FileText, GripVertical, ArrowRight, CheckCircle, Clock, XCircle, MoveRight } from 'lucide-react';
import { premiumEase, containerVariants, itemVariants, softSpring } from '../utils/motion';

const stages = [
    { key: 'APPLIED', label: 'Applied', icon: <Clock size={14} /> },
    { key: 'SCREENING', label: 'Screening', icon: <FileText size={14} /> },
    { key: 'TECHNICAL', label: 'Technical', icon: <FileText size={14} /> },
    { key: 'INTERVIEW', label: 'Interview', icon: <User size={14} /> },
    { key: 'HR', label: 'HR Review', icon: <User size={14} /> },
    { key: 'OFFER', label: 'Offer', icon: <CheckCircle size={14} /> },
    { key: 'HIRED', label: 'Hired', icon: <CheckCircle size={14} /> },
    { key: 'REJECTED', label: 'Rejected', icon: <XCircle size={14} /> },
];

/* Unified indigo/violet palette — each stage gets a subtle shade shift */
function getStageTheme(key, isDark) {
    const palette = {
        APPLIED: { accent: '#818cf8', hue: 'rgba(129, 140, 248,' },
        SCREENING: { accent: '#a78bfa', hue: 'rgba(167, 139, 250,' },
        TECHNICAL: { accent: '#7c3aed', hue: 'rgba(124, 58, 237,' },
        INTERVIEW: { accent: '#6366f1', hue: 'rgba(99, 102, 241,' },
        HR: { accent: '#8b5cf6', hue: 'rgba(139, 92, 246,' },
        OFFER: { accent: '#6366f1', hue: 'rgba(99, 102, 241,' },
        HIRED: { accent: '#818cf8', hue: 'rgba(129, 140, 248,' },
        REJECTED: { accent: '#94a3b8', hue: 'rgba(148, 163, 184,' },
    };
    const p = palette[key] || palette.APPLIED;
    return {
        accent: p.accent,
        columnBg: isDark
            ? `${p.hue} 0.06)`
            : `${p.hue} 0.045)`,
        columnBgSolid: isDark
            ? 'rgba(17, 20, 30, 0.92)'
            : 'rgba(248, 248, 252, 0.94)',
        border: isDark
            ? `${p.hue} 0.12)`
            : `${p.hue} 0.14)`,
        badgeBg: isDark
            ? `${p.hue} 0.12)`
            : `${p.hue} 0.1)`,
    };
}

export default function KanbanBoard({ applications, onUpdate }) {
    const { isDark } = useTheme();
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

    /* Shared tokens */
    const textPrimary = isDark ? '#e2e8f0' : '#1a1a2e';
    const textSub = isDark ? '#a0aec0' : '#555560';
    const textMuted = isDark ? '#718096' : '#888890';
    const summaryBg = isDark ? 'rgba(17, 20, 30, 0.88)' : 'rgba(255, 255, 255, 0.92)';
    const summaryBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

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
                    background: summaryBg,
                    backdropFilter: 'blur(16px)',
                    borderRadius: '1rem',
                    border: `1px solid ${summaryBorder}`,
                }}
            >
                {stages.map(stage => {
                    const count = columns[stage.key]?.length || 0;
                    const t = getStageTheme(stage.key, isDark);
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
                                border: expandedStage === stage.key ? `1.5px solid ${t.border}` : '1px solid transparent',
                                background: expandedStage === stage.key ? t.badgeBg : 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: expandedStage === stage.key ? t.accent : textMuted,
                                transition: 'all 300ms',
                            }}
                        >
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: count > 0 ? t.accent : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'),
                            }} />
                            {stage.label}
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: count > 0 ? t.accent : textMuted,
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
                    const t = getStageTheme(stage.key, isDark);

                    if (!isExpanded && stageApps.length === 0) return null;

                    return (
                        <motion.div
                            key={stage.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isExpanded ? 1 : 0.4, y: 0 }}
                            transition={{ delay: stageIdx * 0.08, duration: 0.5, ease: premiumEase }}
                            style={{
                                background: t.columnBgSolid,
                                borderRadius: '1.25rem',
                                padding: '1.25rem',
                                border: `1px solid ${t.border}`,
                                minHeight: '200px',
                                transition: 'opacity 400ms',
                                boxShadow: isDark
                                    ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                                    : '0 4px 24px -4px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            {/* Column header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: `1px solid ${t.border}`,
                            }}>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: t.accent }}>{stage.icon}</span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: textPrimary,
                                    }}>
                                        {stage.label}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    color: t.accent,
                                    background: t.badgeBg,
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
                                                color: textMuted,
                                                fontSize: '0.8rem',
                                                borderRadius: '0.875rem',
                                                border: `1.5px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                            }}
                                        >
                                            No candidates
                                        </motion.div>
                                    ) : (
                                        stageApps.map((app, i) => (
                                            <ApplicationCard
                                                key={app._id}
                                                app={app}
                                                stageKey={stage.key}
                                                index={i}
                                                isMoving={movingApp === app._id}
                                                onMove={(newStage) => moveApplication(app._id, newStage)}
                                                currentStageIndex={stages.findIndex(s => s.key === stage.key)}
                                                allStages={stages}
                                                isDark={isDark}
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

function ApplicationCard({ app, stageKey, index, isMoving, onMove, currentStageIndex, allStages, isDark }) {
    const [showActions, setShowActions] = useState(false);
    const t = getStageTheme(stageKey, isDark);

    const nextStage = currentStageIndex < allStages.length - 2 ? allStages[currentStageIndex + 1] : null;
    const canReject = stageKey !== 'REJECTED' && stageKey !== 'HIRED';

    const cardBg = isDark ? 'rgba(22, 26, 40, 0.95)' : 'rgba(255, 255, 255, 0.96)';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textPrimary = isDark ? '#e2e8f0' : '#1a1a2e';
    const textMuted = isDark ? '#718096' : '#888890';

    return (
        <motion.div
            variants={itemVariants}
            layout
            whileHover={{
                y: -2, boxShadow: isDark
                    ? '0 8px 24px -4px rgba(0, 0, 0, 0.3), 0 0 20px -8px rgba(99, 102, 241, 0.1)'
                    : '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 0 20px -8px rgba(99, 102, 241, 0.06)',
            }}
            transition={{ duration: 0.4, ease: premiumEase }}
            onHoverStart={() => setShowActions(true)}
            onHoverEnd={() => setShowActions(false)}
            style={{
                background: cardBg,
                backdropFilter: 'blur(12px)',
                borderRadius: '0.875rem',
                padding: '1rem',
                border: `1px solid ${cardBorder}`,
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
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.12))'
                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: t.accent,
                }}>
                    {app.applicant?.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPrimary, letterSpacing: '-0.01em' }}>
                        {app.applicant?.name || 'Unknown Candidate'}
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                        {nextStage && (() => {
                            const nt = getStageTheme(nextStage.key, isDark);
                            return (
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => onMove(nextStage.key)}
                                    disabled={isMoving}
                                    style={{
                                        flex: 1,
                                        padding: '0.45rem 0.75rem',
                                        borderRadius: '0.625rem',
                                        background: nt.badgeBg,
                                        color: nt.accent,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        border: `1px solid ${nt.border}`,
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
                            );
                        })()}
                        {canReject && (
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onMove('REJECTED')}
                                disabled={isMoving}
                                style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '0.625rem',
                                    background: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.1)',
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)'}`,
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
