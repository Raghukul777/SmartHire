import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Briefcase, ChevronRight, Calendar } from 'lucide-react';

const STAGES = ['APPLIED', 'SCREENING', 'TECHNICAL', 'INTERVIEW', 'HR', 'OFFER', 'HIRED'];

export default function CandidateTimeline({ application }) {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!application) return null;

    const currentStageIndex = STAGES.indexOf(application.currentStage);
    const totalStages = STAGES.length;
    const progressPercentage = Math.max(5, ((currentStageIndex + 1) / totalStages) * 100);

    const isRejected = application.currentStage === 'REJECTED';
    const isWithdrawn = application.currentStage === 'WITHDRAWN';
    const isHired = application.currentStage === 'HIRED';

    // Status Colors & Text
    let statusColor = 'bg-blue-500';
    let statusBg = 'bg-blue-50';
    let statusText = 'text-blue-600';

    if (isRejected) {
        statusColor = 'bg-red-500';
        statusBg = 'bg-red-50';
        statusText = 'text-red-600';
    } else if (isHired) {
        statusColor = 'bg-green-500';
        statusBg = 'bg-green-50';
        statusText = 'text-green-600';
    } else if (isWithdrawn) {
        statusColor = 'bg-gray-500';
        statusBg = 'bg-gray-50';
        statusText = 'text-gray-600';
    }

    return (
        <div className="card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 overflow-hidden relative">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${statusBg} rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`} />

            {/* Header */}
            <div className="relative z-10 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                            {application.job?.title || 'Unknown Role'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <Briefcase size={14} />
                            <span>{application.job?.postedBy?.companyName || 'Company Confidential'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${statusText}`}>
                        {application.currentStage}
                    </span>
                    <span className="text-xs text-slate-400">
                        Stage {currentStageIndex + 1} of {totalStages}
                    </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${statusColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: animate ? `${progressPercentage}%` : '0%' }}
                    />
                </div>

                {/* Contextual Footer */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Updated {new Date(application.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {/* Action Hint */}
                    <button
                        onClick={() => navigate(`/jobs/${application.job?._id || application.job}`)}
                        className="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline"
                    >
                        Details <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}
