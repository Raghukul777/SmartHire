import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import CreateJobModal from '../components/CreateJobModal';
import KanbanBoard from '../components/KanbanBoard';
import CandidateTimeline from '../components/CandidateTimeline';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Briefcase, ArrowLeft, Users } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    // State
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Recruiter Navigation State
    const [selectedJob, setSelectedJob] = useState(null); // If set, show Kanban
    const [jobApplications, setJobApplications] = useState([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Initial Fetch
    const initFetch = async () => {
        if (!user) return; // Wait for user
        setLoading(true);
        try {
            if (user.role === 'recruiter' || user.role === 'admin') {
                // Fetch Posted Jobs
                const { data } = await api.get('/jobs');
                // Filter client side as backup, but ideally backend handles this
                const myJobs = data.filter(job => job.postedBy?._id === user._id || job.postedBy === user._id);
                setJobs(myJobs);
            } else {
                // Fetch Candidate Data
                const [myAppsRes, recsRes] = await Promise.all([
                    api.get('/applications/me'),
                    api.get('/applications/recommendations')
                ]);

                const myApps = myAppsRes.data;
                let recs = recsRes.data;

                // Filter out jobs the user has already applied to
                const appliedJobIds = new Set(myApps.map(app => app.job?._id || app.job));
                recs = recs.filter(job => !appliedJobIds.has(job._id));

                setApplications(myApps);
                setRecommendations(recs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initFetch();
    }, [user]);

    // Recruiter: Fetch Applications for Selected Job
    const handleViewApplications = async (job) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/applications/job/${job._id}`);
            setJobApplications(data);
            setSelectedJob(job);
        } catch (error) {
            console.error(error);
            alert('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToJobs = () => {
        setSelectedJob(null);
        setJobApplications([]);
    };

    const refreshKanban = async () => {
        if (selectedJob) {
            const { data } = await api.get(`/applications/job/${selectedJob._id}`);
            setJobApplications(data);
        }
    };

    if (loading && !selectedJob) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-color))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%' }}></div>
            </div>
        );
    }

    // Safety check if user is still loading or null
    if (!user) return null;

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    {selectedJob && (
                        <button onClick={handleBackToJobs} className="flex items-center gap-2 text-sm text-gray-500 mb-2 hover:text-black">
                            <ArrowLeft size={16} /> Back to Jobs
                        </button>
                    )}
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {selectedJob ? `Managing: ${selectedJob.title}` : 'Dashboard'}
                    </h1>
                    <p style={{ color: 'hsl(var(--text-secondary))' }}>
                        Welcome back, <span style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>{user.name}</span>
                    </p>
                </div>

                {user.role === 'recruiter' && !selectedJob && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} /> Post New Job
                    </button>
                )}
            </div>

            {/* Recruiter View: Job List or Kanban */}
            {user.role === 'recruiter' && (
                <>
                    {selectedJob ? (
                        <KanbanBoard applications={jobApplications} onUpdate={refreshKanban} />
                    ) : (
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '1rem' }}>
                                Your Posted Jobs
                            </h2>
                            {(!jobs || jobs.length === 0) ? (
                                <p className="text-gray-500 text-center py-8">You haven't posted any jobs yet.</p>
                            ) : (
                                <div className="grid gap-4">
                                    {jobs.map(job => (
                                        <div key={job._id} className="card flex justify-between items-center p-6 hover:shadow-lg transition-all" style={{ padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{job.title}</h3>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <div className="text-2xl font-bold text-blue-600">{job.applicants?.length || 0}</div>
                                                    <div className="text-xs text-gray-500 uppercase">Applicants</div>
                                                </div>
                                                <button onClick={() => handleViewApplications(job)} className="btn btn-secondary">
                                                    Manage <Users size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Candidate View: Recommendations + Timeline */}
            {(user.role === 'candidate') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Column: Skills & Recommendations */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Skills Section */}
                        <div className="card bg-gradient-to-r from-blue-50 to-white border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">My Skills</h2>
                                    <p className="text-sm text-slate-500">Add skills to improve your job matches.</p>
                                </div>
                                <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {user.skills?.length || 0} Added
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(user.skills || []).map(skill => (
                                    <span key={skill} className="badge bg-white border border-blue-200 text-blue-700 flex items-center gap-1 shadow-sm px-3 py-1">
                                        {skill}
                                        <button onClick={async () => {
                                            const currentSkills = user.skills || [];
                                            const newSkills = currentSkills.filter(s => s !== skill);
                                            await api.put('/auth/profile', { skills: newSkills });
                                            window.location.reload();
                                        }} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5"><Users size={12} /></button>
                                    </span>
                                ))}
                                {(!user.skills || user.skills.length === 0) && (
                                    <span className="text-sm text-slate-400 italic">No skills added yet.</span>
                                )}
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const skill = e.target.skill.value.trim();
                                if (!skill) return;
                                const currentSkills = user.skills || [];
                                if (!currentSkills.includes(skill)) {
                                    await api.put('/auth/profile', { skills: [...currentSkills, skill] });
                                    window.location.reload();
                                }
                                e.target.reset();
                            }} className="flex gap-2">
                                <input name="skill" className="input-field flex-1" placeholder="e.g. React, Node.js, Design" />
                                <button type="submit" className="btn btn-primary whitespace-nowrap">Add Skill</button>
                            </form>
                        </div>

                        {/* Recommendations */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                Recommended for You
                            </h2>
                            <div className="grid gap-4">
                                {(!recommendations || recommendations.length === 0) ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500">No recommendations found yet.</p>
                                        <p className="text-sm text-slate-400">Try adding more skills to your profile.</p>
                                    </div>
                                ) : (
                                    recommendations.map(job => (
                                        <div key={job._id} className="card p-6 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{job?.title}</h3>
                                                    <p className="text-sm text-slate-500 mb-2 font-medium">{job?.postedBy?.companyName || 'Company Confidential'}</p>
                                                    <div className="flex gap-2 mb-3">
                                                        <span className="badge bg-slate-100 text-slate-600">{job?.type}</span>
                                                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">{job?.matchScore}% Match</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-slate-800">${job?.salary?.toLocaleString()}</div>
                                                    <div className="text-xs text-slate-500">per year</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{job?.description}</p>
                                            <div className="flex justify-end">
                                                <Link to={`/jobs/${job._id}`} className="btn btn-primary text-sm px-6 py-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">View Details</Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: My Applications */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            My Applications
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{applications?.length || 0}</span>
                        </h2>
                        <div className="flex flex-col gap-4">
                            {(!applications || applications.length === 0) ? (
                                <div className="card p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200">
                                    <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-slate-500 font-medium">No applications yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Start applying to jobs to see them here.</p>
                                </div>
                            ) : (
                                applications.map(app => (
                                    <CandidateTimeline key={app._id} application={app} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onJobCreated={initFetch}
            />
        </div>
    );
}
