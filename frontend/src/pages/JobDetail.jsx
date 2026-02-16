import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, DollarSign, Briefcase, Clock, ChevronLeft, Upload, CheckCircle, FileText, Share2, ArrowRight, Building2, Calendar } from 'lucide-react';
import { fadeIn, containerVariants, itemVariants } from '../utils/motion';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const Section = ({ children, delay = 0 }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn('up', delay)}
        className="relative"
    >
        {children}
    </motion.div>
);

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resume, setResume] = useState(null);
    const [myApplication, setMyApplication] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchJobAndApplication = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    api.get(`/jobs/${id}`),
                    user && user.role === 'candidate' ? api.get('/applications/me') : Promise.resolve({ data: [] })
                ]);

                setJob(jobRes.data);

                // key could be populated job object or just id depending on backend
                const existingApp = appsRes.data.find(app => (app.job?._id || app.job) === id);
                setMyApplication(existingApp);

            } catch (error) {
                console.error(error);
                if (error.response?.status === 404) setError('Job not found');
            } finally {
                setLoading(false);
            }
        };
        fetchJobAndApplication();
    }, [id, user]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!resume) return alert('Please upload a resume');
        if (!user) return navigate('/login');

        const formData = new FormData();
        formData.append('resume', resume);

        setUploading(true);
        setError('');
        try {
            const { data } = await api.post(`/applications/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Application submitted successfully!');
            setMyApplication(data?.application || data); // update local state to show status
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to apply');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full"
            />
        </div>
    );

    if (!job) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-800">Job not found</h2>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Back to Home
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob" />
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group text-sm">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Opportunities
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Column */}
                    <motion.div
                        className="lg:col-span-8 space-y-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Hero Header Card */}
                        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active Hiring
                                    </span>
                                    {job.type && (
                                        <span className="bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-700/10 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                            {job.type}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                                    {job.title}
                                </h1>

                                <div className="flex items-center gap-3 text-lg font-medium text-slate-600 mb-8">
                                    <Building2 size={20} className="text-indigo-500" />
                                    <span>{job.postedBy?.companyName || 'Confidential Company'}</span>
                                    <CheckCircle size={16} className="text-blue-500 fill-blue-50" />
                                </div>

                                {/* Bento Grid for Key Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 hover:bg-indigo-50/30 transition-colors group/stat">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-xl shadow-sm group-hover/stat:scale-110 transition-transform text-indigo-500">
                                                <MapPin size={18} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg">{job.location}</p>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 hover:bg-emerald-50/30 transition-colors group/stat">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-xl shadow-sm group-hover/stat:scale-110 transition-transform text-emerald-500">
                                                <DollarSign size={18} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salary</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg">{job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Competitive'}</p>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 hover:bg-purple-50/30 transition-colors group/stat">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white rounded-xl shadow-sm group-hover/stat:scale-110 transition-transform text-purple-500">
                                                <Clock size={18} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Posted</span>
                                        </div>
                                        <p className="font-bold text-slate-800 text-lg">{formatDate(job.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description Section */}
                        <Section delay={0.2}>
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    Job Description
                                </h2>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.description}
                                </div>
                            </div>
                        </Section>

                        {/* Requirements Section */}
                        <Section delay={0.3}>
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <CheckCircle size={20} />
                                    </div>
                                    Requirements
                                </h2>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </div>
                        </Section>
                    </motion.div>

                    {/* Sidebar / Sticky Application */}
                    <div className="lg:col-span-4 relative">
                        <motion.div
                            className="sticky top-24 space-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            {/* Application Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 relative overflow-hidden ring-1 ring-slate-900/5">

                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    {myApplication ? 'My Application' : 'Apply Now'}
                                </h3>

                                <AnimatePresence mode='wait'>
                                    {myApplication ? (
                                        <motion.div
                                            key="status"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mb-4" />

                                            <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                                <Briefcase size={28} />
                                            </div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Status</div>
                                            <div className="text-2xl font-extrabold text-slate-900 mb-6">{myApplication.currentStage}</div>

                                            <div className="space-y-3 text-sm border-t border-slate-200/60 pt-4">
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Applied</span>
                                                    <span className="font-semibold text-slate-700">{formatDate(myApplication.createdAt)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                    <span className="text-slate-500 flex items-center gap-2"><Clock size={14} /> Updated</span>
                                                    <span className="font-semibold text-slate-700">{formatDate(myApplication.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        user && user.role === 'candidate' ? (
                                            success ? (
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center border border-emerald-100"
                                                >
                                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                                                        <CheckCircle size={24} />
                                                    </div>
                                                    <h4 className="font-bold mb-1 text-lg">Sent!</h4>
                                                    <p className="text-sm opacity-90">{success}</p>
                                                </motion.div>
                                            ) : (
                                                <motion.form
                                                    key="form"
                                                    onSubmit={handleApply}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-6"
                                                >
                                                    {error && (
                                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                                                            <div className="mt-0.5"><div className="w-4 h-4 bg-red-200 rounded-full flex items-center justify-center text-[10px] font-bold">!</div></div>
                                                            <div>{error}</div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-bold text-slate-700">Resume / CV</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="file"
                                                                accept=".pdf"
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                                onChange={(e) => setResume(e.target.files[0])}
                                                                required
                                                            />
                                                            <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${resume ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'} group-hover:scale-[1.02]`}>
                                                                {resume ? (
                                                                    <>
                                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2 text-emerald-600">
                                                                            <FileText size={20} />
                                                                        </div>
                                                                        <span className="text-sm font-bold text-emerald-700 truncate max-w-full px-2">{resume.name}</span>
                                                                        <span className="text-xs text-emerald-600 mt-1">Ready to upload</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                                                                            <Upload size={20} />
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-600">Upload Resume</span>
                                                                        <span className="text-xs text-slate-400 mt-1">PDF up to 5MB</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        type="submit"
                                                        disabled={uploading}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-slate-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-base"
                                                    >
                                                        {uploading ? (
                                                            <>
                                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Submit Application <ArrowRight size={18} />
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </motion.form>
                                            )
                                        ) : (
                                            !user ? (
                                                <div className="text-center py-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                                                    <p className="text-slate-600 mb-6 font-medium">Please log in to apply for this position.</p>
                                                    <div className="space-y-4 px-4">
                                                        <button
                                                            onClick={() => navigate('/login')}
                                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                                                        >
                                                            Log In
                                                        </button>
                                                        <div className="text-sm text-slate-400">
                                                            New here? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create account</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-100 p-6 rounded-2xl text-center text-slate-500 text-sm font-medium">
                                                    Recruiters cannot apply to jobs.
                                                </div>
                                            )
                                        )
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Share Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white border border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:border-slate-300 transition-colors shadow-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                            >
                                <Share2 size={18} /> Share this Opportunity
                            </motion.button>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
