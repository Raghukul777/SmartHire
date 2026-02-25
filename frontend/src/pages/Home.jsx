import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Search, MapPin, DollarSign, ArrowRight, Briefcase, Sparkles, TrendingUp, Users, PlusCircle, Edit3, Trash2, ChevronDown, X, Check, Clock } from 'lucide-react';
import { containerVariants, itemVariants, softSpring, premiumEase } from '../utils/motion';
import { TiltCard, MagneticButton, useCursor, ParallaxLayer } from '../components/CursorEffects';
import KanbanBoard from '../components/KanbanBoard';
import CreateJobModal from '../components/CreateJobModal';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

/* ============================================
   Directional Staggered Card — Slides in alternately
   ============================================ */
function DirectionalCard({ children, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });
    const fromLeft = index % 2 === 0;

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                x: fromLeft ? -40 : 40,
                y: 30,
                filter: 'blur(6px)',
            }}
            animate={isInView ? {
                opacity: 1,
                x: 0,
                y: 0,
                filter: 'blur(0px)',
            } : {}}
            transition={{
                duration: 0.9,
                delay: index * 0.1,
                ease: premiumEase,
            }}
        >
            {children}
        </motion.div>
    );
}

/* ============================================
   Scroll-aware section title with horizontal drift
   ============================================ */
function DriftingSection({ children, direction = 'left' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });
    const drift = useTransform(
        scrollYProgress,
        [0, 1],
        direction === 'left' ? [-15, 15] : [15, -15]
    );

    return (
        <motion.div
            ref={ref}
            style={{ x: drift }}
            initial={{ opacity: 0, x: direction === 'left' ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: premiumEase }}
        >
            {children}
        </motion.div>
    );
}

export default function Home() {
    const [jobs, setJobs] = useState([]);
    const [recruiterJobs, setRecruiterJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    // Recruiter management state
    const [expandedJobId, setExpandedJobId] = useState(null);
    const [jobApplications, setJobApplications] = useState({});
    const [loadingApps, setLoadingApps] = useState({});
    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingJobId, setDeletingJobId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const heroRef = useRef(null);
    const cursor = useCursor();
    const { isDark } = useTheme();
    const { user, loading: authLoading } = useAuth();
    const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -50]);
    const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);

    /* Cursor-driven tilt for hero text area */
    const heroRotateX = (cursor.y - 0.5) * -4;
    const heroRotateY = (cursor.x - 0.5) * 4;

    const fetchRecruiterJobs = async () => {
        try {
            const { data } = await api.get('/jobs/my-jobs');
            setRecruiterJobs(data);
        } catch (error) {
            console.error('Failed to fetch recruiter jobs', error);
        }
    };

    useEffect(() => {
        // Wait until AuthContext has resolved the user from localStorage
        if (authLoading) return;
        const fetchJobs = async () => {
            setLoading(true);
            try {
                if (isRecruiter) {
                    await fetchRecruiterJobs();
                } else {
                    const { data } = await api.get('/jobs');
                    setJobs(data);
                }
            } catch (error) {
                console.error('Failed to fetch jobs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [authLoading, isRecruiter, user?._id]);

    const toggleJobExpand = async (jobId) => {
        if (expandedJobId === jobId) {
            setExpandedJobId(null);
            return;
        }
        setExpandedJobId(jobId);
        if (!jobApplications[jobId]) {
            setLoadingApps(prev => ({ ...prev, [jobId]: true }));
            try {
                const { data } = await api.get(`/applications/job/${jobId}`);
                setJobApplications(prev => ({ ...prev, [jobId]: data }));
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingApps(prev => ({ ...prev, [jobId]: false }));
            }
        }
    };

    const refreshApps = async (jobId) => {
        try {
            const { data } = await api.get(`/applications/job/${jobId}`);
            setJobApplications(prev => ({ ...prev, [jobId]: data }));
        } catch (e) { console.error(e); }
    };

    const openEdit = (job) => {
        setEditingJob(job._id);
        setEditForm({
            title: job.title,
            location: job.location,
            salary: job.salary,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
        });
    };

    const saveEdit = async () => {
        setSavingEdit(true);
        try {
            await api.put(`/jobs/${editingJob}`, editForm);
            setEditingJob(null);
            await fetchRecruiterJobs();
        } catch (e) {
            console.error(e);
        } finally {
            setSavingEdit(false);
        }
    };

    const deleteJob = async (jobId) => {
        setDeletingJobId(jobId);
        try {
            await api.delete(`/jobs/${jobId}`);
            setConfirmDeleteId(null);
            await fetchRecruiterJobs();
            if (expandedJobId === jobId) setExpandedJobId(null);
        } catch (e) {
            console.error(e);
        } finally {
            setDeletingJobId(null);
        }
    };


    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredRecruiterJobs = recruiterJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="home-page-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>

            {/* ============ HERO SECTION ============ */}
            <section
                ref={heroRef}
                style={{
                    position: 'relative',
                    padding: '8rem 0 7rem',
                    overflow: 'hidden',
                    minHeight: '88vh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* Floating ambient blobs — parallax with cursor */}
                <ParallaxLayer factor={-30} style={{
                    position: 'absolute', top: '-12%', right: '-6%',
                    width: '550px', height: '550px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--indigo"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.8, 0.6] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </ParallaxLayer>

                <ParallaxLayer factor={25} style={{
                    position: 'absolute', top: '25%', left: '-6%',
                    width: '400px', height: '400px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--violet"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    />
                </ParallaxLayer>

                <ParallaxLayer factor={20} style={{
                    position: 'absolute', bottom: '-8%', right: '18%',
                    width: '350px', height: '350px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--ice"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
                    />
                </ParallaxLayer>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
                        className="flex flex-col items-center"
                    >
                        {/* Hero text block — cursor tilt for depth */}
                        <div
                            style={{
                                textAlign: 'center',
                                maxWidth: '900px',
                                margin: '0 auto',
                                perspective: '1200px',
                            }}
                        >
                            <div
                                style={{
                                    transform: `perspective(1200px) rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
                                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    willChange: 'transform',
                                }}
                            >
                                {/* Top badge — slides from left */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 0.9, delay: 0.1, ease: premiumEase }}
                                    className="badge badge-indigo"
                                    style={{
                                        marginBottom: '1.75rem',
                                        padding: '0.45rem 1.35rem',
                                        fontSize: '0.75rem',
                                        display: 'inline-flex',
                                    }}
                                >
                                    <Sparkles size={12} style={{ marginRight: '0.4rem' }} />
                                    Smart Matching • AI-Powered
                                </motion.div>

                                {/* Hero heading — PRIMARY: Slides from LEFT */}
                                <motion.h1
                                    initial={{ opacity: 0, x: -80, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1.1, delay: 0.2, ease: premiumEase }}
                                    style={{
                                        fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)',
                                        marginBottom: '1.5rem',
                                        lineHeight: 1.06,
                                        fontWeight: 800,
                                        letterSpacing: '-0.045em',
                                        color: isDark ? '#e2e8f0' : '#111118',
                                    }}
                                >
                                    Find Your{' '}
                                    <span className="text-gradient">Dream Job</span>
                                    <br />
                                    With Intelligence
                                </motion.h1>

                                {/* Subtitle — SUPPORTING: Slides from RIGHT */}
                                <motion.p
                                    initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1, delay: 0.45, ease: premiumEase }}
                                    style={{
                                        fontSize: '1.2rem',
                                        color: isDark ? '#a0aec0' : '#555560',
                                        marginBottom: '2.5rem',
                                        maxWidth: '600px',
                                        margin: '0 auto 2.5rem',
                                        lineHeight: 1.8,
                                    }}
                                >
                                    Connect with leading companies through AI-powered matching.
                                    Your <span style={{ color: '#818cf8', fontWeight: 600 }}>next step</span> is just a search away.
                                </motion.p>
                            </div>

                            {/* Search bar — expands smoothly, magnetic response */}
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.9, delay: 0.6, ease: premiumEase }}
                                style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: searchFocused
                                            ? '0 8px 48px -4px rgba(99, 102, 241, 0.2), 0 0 0 3px rgba(99, 102, 241, 0.1)'
                                            : '0 8px 32px -4px rgba(0, 0, 0, 0.15)',
                                        scale: searchFocused ? 1.02 : 1,
                                    }}
                                    transition={softSpring}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: isDark ? 'rgba(20, 24, 32, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'blur(20px)',
                                        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                                        borderRadius: '999px',
                                        border: '1.5px solid',
                                        borderColor: searchFocused ? 'rgba(99, 102, 241, 0.4)' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.1)',
                                        transition: 'border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                >
                                    <Search
                                        size={20}
                                        style={{
                                            color: searchFocused ? '#818cf8' : '#718096',
                                            transition: 'color 400ms',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by title, company, or location..."
                                        style={{
                                            flex: 1,
                                            border: 'none',
                                            background: 'transparent',
                                            padding: '0.8rem 1rem',
                                            fontSize: '1rem',
                                            color: isDark ? '#e2e8f0' : '#111118',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                    />
                                    <MagneticButton
                                        className="btn btn-primary"
                                        strength={0.25}
                                        style={{
                                            borderRadius: '999px',
                                            padding: '0.7rem 1.75rem',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Search
                                    </MagneticButton>
                                </motion.div>
                            </motion.div>

                            {/* Stats row — staggered entrance from alternating directions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.85, ease: premiumEase }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '3rem',
                                    marginTop: '3.5rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {[
                                    { icon: <Briefcase size={16} />, label: '10K+ Jobs', color: '#818cf8' },
                                    { icon: <Users size={16} />, label: '5K+ Companies', color: '#a78bfa' },
                                    { icon: <TrendingUp size={16} />, label: '95% Match Rate', color: '#38bdf8' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: i === 0 ? -20 : i === 2 ? 20 : 0, y: 10 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.9 + i * 0.12, ease: premiumEase }}
                                        whileHover={{ y: -3, scale: 1.05 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: isDark ? '#a0aec0' : '#555560',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span style={{ color: stat.color }}>{stat.icon}</span>
                                        {stat.label}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============== CURVED SECTION TRANSITION ============== */}
            <div style={{
                position: 'relative',
                height: '80px',
                marginTop: '-80px',
                zIndex: 3,
                background: 'transparent',
                overflow: 'hidden',
            }}>
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <path
                        d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
                        fill="rgba(15, 18, 25, 0.4)"
                    />
                </svg>
            </div>

            {/* ============ JOBS SECTION ============ */}
            <section className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', position: 'relative', zIndex: 2 }}>
                {isRecruiter ? (
                    /* ---- RECRUITER VIEW: Manage Job Postings ---- */
                    (() => {
                        const cardBg = isDark ? 'rgba(20,24,34,0.7)' : 'rgba(255,255,255,0.7)';
                        const borderClr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
                        const textPrimary = isDark ? '#e2e8f0' : '#111118';
                        const textSub = isDark ? '#a0aec0' : '#555560';
                        const textMuted = isDark ? '#718096' : '#888890';
                        return (
                            <>
                                {/* Header */}
                                <DriftingSection direction="left">
                                    <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                                        <div>
                                            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.035em', color: textPrimary, marginBottom: '0.4rem' }}>
                                                Manage Job Postings
                                            </h2>
                                            <p style={{ color: textSub, fontSize: '0.95rem' }}>
                                                {recruiterJobs.length} job{recruiterJobs.length !== 1 ? 's' : ''} posted · click any row to manage applicants
                                            </p>
                                        </div>
                                        <MagneticButton
                                            onClick={() => setShowCreateModal(true)}
                                            className="btn"
                                            strength={0.2}
                                            style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#f7fafc', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
                                        >
                                            <PlusCircle size={16} /> Post a Job
                                        </MagneticButton>
                                    </div>
                                </DriftingSection>

                                {/* Create Job Modal */}
                                <CreateJobModal
                                    isOpen={showCreateModal}
                                    onClose={() => setShowCreateModal(false)}
                                    onJobCreated={() => { fetchRecruiterJobs(); setShowCreateModal(false); }}
                                />

                                {/* Edit Job Modal */}
                                <AnimatePresence>
                                    {editingJob && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                                            onClick={() => setEditingJob(null)}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
                                                onClick={e => e.stopPropagation()}
                                                style={{ background: isDark ? '#141822' : '#ffffff', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: `1px solid ${borderClr}`, boxShadow: '0 24px 64px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}
                                            >
                                                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: textPrimary }}>Edit Job</h3>
                                                    <button onClick={() => setEditingJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex' }}><X size={20} /></button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {[{ key: 'title', label: 'Job Title', type: 'text' }, { key: 'location', label: 'Location', type: 'text' }, { key: 'salary', label: 'Salary (USD/yr)', type: 'number' }].map(({ key, label, type }) => (
                                                        <div key={key}>
                                                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                                                            <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" style={{ width: '100%' }} />
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, display: 'block', marginBottom: '0.35rem' }}>Job Type</label>
                                                        <select value={editForm.type || ''} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                                                            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    {[{ key: 'description', label: 'Description' }, { key: 'requirements', label: 'Requirements' }].map(({ key, label }) => (
                                                        <div key={key}>
                                                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                                                            <textarea value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} rows={4} className="input-field" style={{ width: '100%', resize: 'vertical' }} />
                                                        </div>
                                                    ))}
                                                    <div className="flex" style={{ gap: '0.75rem', marginTop: '0.5rem' }}>
                                                        <MagneticButton onClick={saveEdit} disabled={savingEdit} className="btn" strength={0.15} style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', gap: '0.4rem', opacity: savingEdit ? 0.7 : 1 }}>
                                                            <Check size={15} /> {savingEdit ? 'Saving…' : 'Save Changes'}
                                                        </MagneticButton>
                                                        <MagneticButton onClick={() => setEditingJob(null)} className="btn btn-secondary" strength={0.15} style={{ flex: 1 }}>Cancel</MagneticButton>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Job list */}
                                {loading ? (
                                    <div className="flex justify-center py-16">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid rgba(226,232,240,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
                                    </div>
                                ) : recruiterJobs.length === 0 ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                        style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: `1.5px dashed ${borderClr}` }}>
                                        <Briefcase size={48} style={{ color: '#6366f1', margin: '0 auto 1rem', opacity: 0.6 }} />
                                        <p style={{ fontSize: '1.1rem', color: textSub, marginBottom: '1.25rem' }}>No job postings yet.</p>
                                    </motion.div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        {recruiterJobs.map((job, index) => (
                                            <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.5, ease: premiumEase }}>
                                                {/* Row header */}
                                                <div
                                                    onClick={() => toggleJobExpand(job._id)}
                                                    style={{
                                                        background: cardBg, backdropFilter: 'blur(16px)',
                                                        border: `1px solid ${expandedJobId === job._id ? 'rgba(99,102,241,0.4)' : borderClr}`,
                                                        borderRadius: expandedJobId === job._id ? '1rem 1rem 0 0' : '1rem',
                                                        padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                                        cursor: 'pointer', transition: 'all 300ms',
                                                        boxShadow: expandedJobId === job._id ? '0 0 0 1px rgba(99,102,241,0.15),0 8px 24px rgba(99,102,241,0.07)' : 'none',
                                                    }}
                                                >
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                                                        <Briefcase size={19} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textPrimary, marginBottom: '0.18rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</h3>
                                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: textMuted, flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} /> {job.location}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={11} /> ${Number(job.salary || 0).toLocaleString()}/yr</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {job.type}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '52px' }}>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818cf8', lineHeight: 1 }}>{job.applicantCount ?? job.applicants?.length ?? 0}</div>
                                                        <div style={{ fontSize: '0.62rem', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>applicants</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(job)} title="Edit"
                                                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.6rem', padding: '0.45rem', color: '#818cf8', cursor: 'pointer', display: 'flex' }}>
                                                            <Edit3 size={14} />
                                                        </motion.button>
                                                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmDeleteId(job._id)} title="Delete"
                                                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.6rem', padding: '0.45rem', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                                                            <Trash2 size={14} />
                                                        </motion.button>
                                                    </div>
                                                    <motion.div animate={{ rotate: expandedJobId === job._id ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ color: textMuted, flexShrink: 0 }}>
                                                        <ChevronDown size={17} />
                                                    </motion.div>
                                                </div>

                                                {/* Delete confirm bar */}
                                                <AnimatePresence>
                                                    {confirmDeleteId === job._id && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                                            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderTop: 'none', borderRadius: '0 0 1rem 1rem', padding: '0.9rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                                                                <p style={{ color: isDark ? '#fca5a5' : '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>Delete "{job.title}"? This cannot be undone.</p>
                                                                <div style={{ display: 'flex', gap: '0.45rem' }}>
                                                                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => deleteJob(job._id)} disabled={deletingJobId === job._id}
                                                                        style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 0.9rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: deletingJobId === job._id ? 0.6 : 1 }}>
                                                                        {deletingJobId === job._id ? 'Deleting…' : 'Delete'}
                                                                    </motion.button>
                                                                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setConfirmDeleteId(null)}
                                                                        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textSub, border: `1px solid ${borderClr}`, borderRadius: '0.6rem', padding: '0.4rem 0.9rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                                                        Cancel
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Expanded Kanban panel */}
                                                <AnimatePresence>
                                                    {expandedJobId === job._id && confirmDeleteId !== job._id && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                                            <div style={{ background: isDark ? 'rgba(15,18,27,0.6)' : 'rgba(248,248,252,0.85)', border: '1px solid rgba(99,102,241,0.2)', borderTop: 'none', borderRadius: '0 0 1rem 1rem', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
                                                                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: textSub, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <Users size={14} style={{ color: '#818cf8' }} />
                                                                    Applicant Pipeline
                                                                    <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                                        {(jobApplications[job._id] || []).length} total
                                                                    </span>
                                                                </h4>
                                                                {loadingApps[job._id] ? (
                                                                    <div className="flex justify-center py-8">
                                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ width: '30px', height: '30px', border: '2.5px solid rgba(226,232,240,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
                                                                    </div>
                                                                ) : (
                                                                    <KanbanBoard applications={jobApplications[job._id] || []} onUpdate={() => refreshApps(job._id)} />
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()
                ) : (
                    /* ---- CANDIDATE / GUEST VIEW: Latest Opportunities ---- */
                    <>
                        <DriftingSection direction="left">
                            <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.035em', color: isDark ? '#e2e8f0' : '#111118', marginBottom: '0.4rem' }}>
                                        Latest Opportunities
                                    </h2>
                                    <p style={{ color: isDark ? '#a0aec0' : '#555560', fontSize: '0.95rem' }}>
                                        Hand-picked roles matched to your profile
                                    </p>
                                </div>
                                <Link to="/jobs">
                                    <MagneticButton className="btn btn-secondary" strength={0.2} style={{ gap: '0.5rem' }}>
                                        View All <ArrowRight size={16} />
                                    </MagneticButton>
                                </Link>
                            </div>
                        </DriftingSection>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                    style={{ width: '40px', height: '40px', border: '3px solid rgba(226,232,240,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            <div className="job-grid">
                                {filteredJobs.map((job, index) => (
                                    <DirectionalCard key={job._id} index={index}>
                                        <TiltCard className="card" intensity={6} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.75rem', '--float-delay': index * 0.3 }}>
                                            <div className="flex justify-between items-start" style={{ marginBottom: '1.25rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                                                    <Briefcase size={22} />
                                                </div>
                                                <span className="badge badge-mint" style={{ fontSize: '0.65rem' }}>New</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#111118', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{job.title}</h3>
                                            <p style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>{job.postedBy?.companyName || 'Confidential Company'}</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                <div className="flex items-center gap-2" style={{ color: isDark ? '#a0aec0' : '#555560', fontSize: '0.875rem' }}>
                                                    <MapPin size={15} style={{ color: isDark ? '#cbd5e0' : '#444450' }} /> {job.location}
                                                </div>
                                                <div className="flex items-center gap-2" style={{ color: isDark ? '#a0aec0' : '#555560', fontSize: '0.875rem' }}>
                                                    <DollarSign size={15} style={{ color: isDark ? '#cbd5e0' : '#444450' }} /> ${job.salary?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 'auto' }}>
                                                <Link to={`/jobs/${job._id}`}>
                                                    <MagneticButton className="btn btn-secondary" strength={0.15} style={{ width: '100%', justifyContent: 'center', borderRadius: '0.75rem' }}>
                                                        View Details
                                                    </MagneticButton>
                                                </Link>
                                            </div>
                                        </TiltCard>
                                    </DirectionalCard>
                                ))}
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: premiumEase }}
                                style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '1.1rem', color: isDark ? '#a0aec0' : '#555560', marginBottom: '1rem' }}>No jobs found matching your search.</p>
                                <MagneticButton className="btn btn-primary" onClick={() => setSearchTerm('')}>Clear Search</MagneticButton>
                            </motion.div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
