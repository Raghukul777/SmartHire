import React, { useState } from 'react';
import api from '../api/api';
import { ArrowRight, FileText } from 'lucide-react';

const STAGES = ['APPLIED', 'SCREENING', 'TECHNICAL', 'INTERVIEW', 'HR', 'OFFER', 'HIRED', 'REJECTED'];

export default function KanbanBoard({ applications, onUpdate }) {
    const [loadingMap, setLoadingMap] = useState({});

    const handleMove = async (appId, newStage) => {
        if (!window.confirm(`Move application to ${newStage}?`)) return;

        setLoadingMap(prev => ({ ...prev, [appId]: true }));
        try {
            await api.put(`/applications/${appId}/stage`, { stage: newStage });
            onUpdate(); // refresh data
        } catch (error) {
            console.error(error);
            alert('Failed to update stage');
        } finally {
            setLoadingMap(prev => ({ ...prev, [appId]: false }));
        }
    };

    const getColumns = () => {
        const columns = {};
        STAGES.forEach(stage => columns[stage] = []);
        if (applications && Array.isArray(applications)) {
            applications.forEach(app => {
                if (columns[app.currentStage]) {
                    columns[app.currentStage].push(app);
                }
            });
        }
        return columns;
    };

    const columns = getColumns();

    return (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', height: 'calc(100vh - 200px)' }}>
            {STAGES.map(stage => (
                <div key={stage} style={{ minWidth: '300px', background: '#f8fafc', borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>{stage}</h3>
                        <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: '#e2e8f0' }}>
                            {columns[stage].length}
                        </span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {columns[stage].map(app => (
                            <div key={app._id} className="card" style={{ padding: '1rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{app.applicant?.name || 'Unknown Candidate'}</span>
                                    <span style={{ fontSize: '0.75rem', color: app.matchScore > 70 ? 'green' : 'orange' }}>
                                        {app.matchScore}% Match
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', marginBottom: '1rem' }}>
                                    {app.applicant?.email || 'No Email'}
                                </div>

                                {app.resume && (
                                    <a
                                        href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/${app.resume.replace(/\\/g, '/')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#2563eb' }}
                                    >
                                        <FileText size={12} /> View Resume
                                    </a>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {loadingMap[app._id] ? (
                                        <span style={{ fontSize: '0.75rem' }}>Updating...</span>
                                    ) : (
                                        <>
                                            {stage !== 'HIRED' && stage !== 'REJECTED' && stage !== 'WITHDRAWN' && (
                                                <>
                                                    {/* Next Stage Button */}
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                        onClick={() => {
                                                            const currentIndex = STAGES.indexOf(stage);
                                                            if (currentIndex < STAGES.length - 1) {
                                                                handleMove(app._id, STAGES[currentIndex + 1]);
                                                            }
                                                        }}
                                                    >
                                                        Next <ArrowRight size={12} />
                                                    </button>

                                                    {/* Reject Button */}
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #fecaca' }}
                                                        onClick={() => handleMove(app._id, 'REJECTED')}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
