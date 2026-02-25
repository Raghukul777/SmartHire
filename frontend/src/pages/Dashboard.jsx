import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api/api';
import CreateJobModal from '../components/CreateJobModal';
import KanbanBoard from '../components/KanbanBoard';
import CandidateTimeline from '../components/CandidateTimeline';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants, softSpring, premiumEase } from '../utils/motion';
import { Plus, MapPin, Briefcase, ArrowLeft, Users, Sparkles, X, TrendingUp } from 'lucide-react';
import { TiltCard, MagneticButton, useCursor, ParallaxLayer } from '../components/CursorEffects';

export default function Dashboard() {
    const { user, updateUser } = useAuth();
    const { isDark } = useTheme();
    const cursor = useCursor();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchRecommendations = async (skillsOverride) => {
        try {
            // Use override skills (freshly updated) OR fall back to context user skills
            const skills = Array.isArray(skillsOverride) ? skillsOverride : (user?.skills || []);
            const params = skills.length > 0 ? `?skills=${encodeURIComponent(skills.join(','))}` : '';
            const { data: recs } = await api.get(`/applications/recommendations${params}`);
            // Filter out already-applied jobs
            let appsRes = { data: [] };
            try { appsRes = await api.get('/applications/me'); } catch (_) { }
            const appliedIds = new Set(appsRes.data.map(a => a.job?._id || a.job));
            const filtered = recs.filter(j => !appliedIds.has(j._id));
            setApplications(appsRes.data);
            // Always show something — if all filtered, show all
            setRecommendations(filtered.length > 0 ? filtered : recs);
        } catch (error) {
            console.error('fetchRecommendations failed:', error?.response?.data || error.message);
            // Set empty so no stale data shown
            setRecommendations([]);
        }
    };

    const initFetch = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (user.role === 'recruiter' || user.role === 'admin') {
                const { data } = await api.get('/jobs');
                const myJobs = data.filter(job => job.postedBy?._id === user._id || job.postedBy === user._id);
                setJobs(myJobs);
            } else {
                await fetchRecommendations();
            }
        } catch (error) {
            console.error('initFetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { initFetch(); }, [user]);

    const handleViewApplications = async (job) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/applications/job/${job._id}`);
            setJobApplications(data);
            setSelectedJob(job);
        } catch (error) {
            console.error(error);
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
            <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 72px)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(226, 232, 240, 0.15)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                    }}
                />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Ambient background — cursor-reactive floating blobs */}
            <ParallaxLayer factor={-22} style={{
                position: 'absolute', top: '-5%', right: '-5%',
                width: '450px', height: '450px',
            }}>
                <div
                    className="ambient-blob ambient-blob--indigo"
                    style={{ width: '100%', height: '100%', opacity: 0.4 }}
                />
            </ParallaxLayer>
            <ParallaxLayer factor={18} style={{
                position: 'absolute', bottom: '10%', left: '-5%',
                width: '350px', height: '350px',
            }}>
                <div
                    className="ambient-blob ambient-blob--violet"
                    style={{ width: '100%', height: '100%', opacity: 0.3 }}
                />
            </ParallaxLayer>

            <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
                {/* Header — slides in from left */}
                <motion.div
                    initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="flex justify-between items-center"
                    style={{ marginBottom: '2.5rem' }}
                >
                    <div>
                        {selectedJob && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleBackToJobs}
                                className="flex items-center gap-2"
                                style={{
                                    color: isDark ? '#718096' : '#888890',
                                    fontSize: '0.85rem',
                                    marginBottom: '0.75rem',
                                    fontWeight: 500,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'color 300ms',
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                                onMouseLeave={(e) => e.target.style.color = isDark ? '#718096' : '#888890'}
                            >
                                <ArrowLeft size={16} /> Back to Jobs
                            </motion.button>
                        )}
                        <h1 style={{
                            fontSize: '2rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#111118',
                            marginBottom: '0.35rem', letterSpacing: '-0.03em',
                        }}>
                            {selectedJob ? `Managing: ${selectedJob.title}` : 'Dashboard'}
                        </h1>
                        <p style={{ color: isDark ? '#a0aec0' : '#555560', fontSize: '0.95rem' }}>
                            Welcome back,{' '}
                            <span className="text-gradient-subtle" style={{ fontWeight: 700 }}>
                                {user.name}
                            </span>
                        </p>
                    </div>

                    {user.role === 'recruiter' && !selectedJob && (
                        <MagneticButton
                            className="btn btn-primary"
                            onClick={() => setIsCreateModalOpen(true)}
                            strength={0.2}
                            style={{ gap: '0.5rem' }}
                        >
                            <Plus size={18} /> Post New Job
                        </MagneticButton>
                    )}
                </motion.div>

                {/* ========= RECRUITER VIEW ========= */}
                {user.role === 'recruiter' && (
                    <AnimatePresence mode="wait">
                        {selectedJob ? (
                            <motion.div
                                key="kanban"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.6, ease: premiumEase }}
                            >
                                <KanbanBoard applications={jobApplications} onUpdate={refreshKanban} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="joblist"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <TiltCard
                                    className="card"
                                    intensity={3}
                                    style={{ padding: '2rem' }}
                                >
                                    <h2 style={{
                                        fontSize: '1.2rem', fontWeight: 700,
                                        marginBottom: '1.5rem', paddingBottom: '1rem',
                                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                        color: isDark ? '#e2e8f0' : '#111118',
                                    }}>
                                        Your Posted Jobs
                                    </h2>

                                    {(!jobs || jobs.length === 0) ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                                            <Briefcase size={32} style={{ margin: '0 auto 1rem', color: '#a0aec0' }} />
                                            <p style={{ fontWeight: 500 }}>No jobs posted yet.</p>
                                            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#718096' }}>
                                                Create your first listing above.
                                            </p>
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                        >
                                            {jobs.map((job, i) => (
                                                <motion.div
                                                    key={job._id}
                                                    variants={itemVariants}
                                                    whileHover={{ y: -4, boxShadow: '0 12px 40px -4px rgba(0, 0, 0, 0.2), 0 0 30px -8px rgba(99, 102, 241, 0.1)' }}
                                                    className="card"
                                                    style={{
                                                        padding: '1.5rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        '--float-delay': i * 0.5,
                                                    }}
                                                    onClick={() => handleViewApplications(job)}
                                                >
                                                    <div>
                                                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#111118', marginBottom: '0.35rem' }}>
                                                            {job.title}
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: isDark ? '#a0aec0' : '#555560' }}>
                                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                                            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>
                                                                {job.applicants?.length || 0}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: isDark ? '#718096' : '#888890', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                Applicants
                                                            </div>
                                                        </div>
                                                        <MagneticButton
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.85rem' }}
                                                            strength={0.15}
                                                            onClick={(e) => { e.stopPropagation(); handleViewApplications(job); }}
                                                        >
                                                            Manage <Users size={14} />
                                                        </MagneticButton>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </TiltCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* ========= CANDIDATE VIEW ========= */}
                {user.role === 'candidate' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
                        {/* Main Column */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            {/* Skills Panel — floating dashboard panel */}
                            <motion.div variants={itemVariants}>
                                <TiltCard className="card" intensity={4} style={{ padding: '2rem' }}>
                                    <div className="flex justify-between items-start" style={{ marginBottom: '1.25rem' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#111118', marginBottom: '0.25rem' }}>
                                                My Skills
                                            </h2>
                                            <p style={{ fontSize: '0.85rem', color: isDark ? '#718096' : '#888890' }}>
                                                Add skills to improve your matches.
                                            </p>
                                        </div>
                                        <span className="badge badge-indigo" style={{ fontWeight: 700 }}>
                                            {user.skills?.length || 0} Added
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
                                        {(user.skills || []).map(skill => (
                                            <motion.span
                                                key={skill}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    padding: '0.35rem 0.85rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: 'rgba(99, 102, 241, 0.08)',
                                                    color: '#818cf8',
                                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                                }}
                                            >
                                                {skill}
                                                <button
                                                    onClick={async () => {
                                                        const newSkills = (user.skills || []).filter(s => s !== skill);
                                                        const { data } = await api.put('/auth/profile', { skills: newSkills });
                                                        updateUser(data);
                                                        await fetchRecommendations(newSkills);
                                                    }}
                                                    style={{
                                                        color: '#718096',
                                                        cursor: 'pointer',
                                                        transition: 'color 200ms',
                                                        display: 'flex',
                                                        padding: '0.15rem',
                                                        borderRadius: '50%',
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#f87171'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#718096'; }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </motion.span>
                                        ))}
                                        {(!user.skills || user.skills.length === 0) && (
                                            <span style={{ fontSize: '0.85rem', color: '#718096', fontStyle: 'italic' }}>
                                                No skills added yet.
                                            </span>
                                        )}
                                    </div>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const skill = e.target.skill.value.trim();
                                        if (!skill) return;
                                        const currentSkills = user.skills || [];
                                        if (!currentSkills.includes(skill)) {
                                            const newSkills = [...currentSkills, skill];
                                            const { data } = await api.put('/auth/profile', { skills: newSkills });
                                            updateUser(data);
                                            // Pass newSkills directly — no timing issues
                                            await fetchRecommendations(newSkills);
                                        }
                                        e.target.reset();
                                    }} style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input
                                            name="skill"
                                            className="input-field"
                                            placeholder="e.g. React, Node.js, Design"
                                            style={{ flex: 1 }}
                                        />
                                        <MagneticButton
                                            type="submit"
                                            className="btn btn-primary"
                                            strength={0.15}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            Add Skill
                                        </MagneticButton>
                                    </form>
                                </TiltCard>
                            </motion.div>

                            {/* Recommendations — floating cards */}
                            <motion.div variants={itemVariants}>
                                <h2 style={{
                                    fontSize: '1.4rem', fontWeight: 800,
                                    color: isDark ? '#e2e8f0' : '#111118', marginBottom: '1.5rem',
                                    display: 'flex', alignItems: 'center',
                                    gap: '0.5rem', letterSpacing: '-0.02em',
                                }}>
                                    <Sparkles size={20} style={{ color: '#818cf8' }} />
                                    Recommended for You
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {(!recommendations || recommendations.length === 0) ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '3rem',
                                            borderRadius: 'var(--radius-xl)',
                                            border: '1.5px dashed rgba(255, 255, 255, 0.08)',
                                            background: 'var(--surface-card)',
                                        }}>
                                            <p style={{ color: '#718096', fontWeight: 500 }}>No recommendations yet.</p>
                                            <p style={{ fontSize: '0.85rem', color: '#4a5568', marginTop: '0.25rem' }}>
                                                Add more skills to improve matches.
                                            </p>
                                        </div>
                                    ) : (
                                        recommendations.map((job, i) => (
                                            <TiltCard
                                                key={job._id}
                                                className="card"
                                                intensity={5}
                                                style={{
                                                    padding: '1.5rem',
                                                    cursor: 'pointer',
                                                    '--float-delay': i * 0.4,
                                                }}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1, duration: 0.6, ease: premiumEase }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#111118', marginBottom: '0.25rem' }}>
                                                                {job?.title}
                                                            </h3>
                                                            <p style={{ fontSize: '0.85rem', color: isDark ? '#718096' : '#888890', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                                {job?.postedBy?.companyName || 'Confidential'}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#718096', fontSize: '0.65rem' }}>
                                                                    {job?.type}
                                                                </span>
                                                                <span className="badge badge-mint" style={{ fontSize: '0.65rem' }}>
                                                                    {job?.matchScore}% Match
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#111118' }}>
                                                                ${job?.salary?.toLocaleString()}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: isDark ? '#718096' : '#888890' }}>per year</div>
                                                        </div>
                                                    </div>
                                                    <p style={{
                                                        fontSize: '0.85rem', color: isDark ? '#a0aec0' : '#555560',
                                                        lineHeight: 1.7, marginTop: '0.75rem',
                                                        marginBottom: '1rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {job?.description}
                                                    </p>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Link to={`/jobs/${job._id}`}>
                                                            <MagneticButton
                                                                className="btn btn-primary"
                                                                strength={0.15}
                                                                style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                                                            >
                                                                View Details
                                                            </MagneticButton>
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            </TiltCard>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Sidebar: Applications — slides from right */}
                        <motion.div
                            initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{ delay: 0.3, duration: 0.8, ease: premiumEase }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            <h2 style={{
                                fontSize: '1.15rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#111118',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}>
                                My Applications
                                <span className="badge badge-indigo">{applications?.length || 0}</span>
                            </h2>

                            {(!applications || applications.length === 0) ? (
                                <div className="card" style={{
                                    padding: '2.5rem', textAlign: 'center',
                                    border: '1.5px dashed rgba(255, 255, 255, 0.08)',
                                }}>
                                    <Briefcase size={28} style={{ margin: '0 auto 0.75rem', color: '#a0aec0' }} />
                                    <p style={{ color: isDark ? '#718096' : '#888890', fontWeight: 500, fontSize: '0.9rem' }}>No applications yet</p>
                                    <p style={{ fontSize: '0.8rem', color: isDark ? '#4a5568' : '#888890', marginTop: '0.25rem' }}>
                                        Start applying to see them here.
                                    </p>
                                </div>
                            ) : (
                                applications.map((app, i) => (
                                    <motion.div
                                        key={app._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.5, ease: premiumEase }}
                                    >
                                        <CandidateTimeline application={app} />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </div>
                )}

                <CreateJobModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onJobCreated={initFetch}
                />
            </div>
        </div>
    );
}
