import React, { useState } from 'react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin, DollarSign, FileText, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import { premiumEase, softSpring } from '../utils/motion';

export default function CreateJobModal({ isOpen, onClose, onJobCreated }) {
    const [form, setForm] = useState({
        title: '', description: '', requirements: '',
        location: '', salary: '', type: 'full-time',
        requiredSkills: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const jobData = {
                ...form,
                salary: Number(form.salary),
                requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            };
            await api.post('/jobs', jobData);
            onJobCreated();
            onClose();
            setForm({ title: '', description: '', requirements: '', location: '', salary: '', type: 'full-time', requiredSkills: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: '0.875rem',
        border: '1.5px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(20, 24, 32, 0.85)',
        fontSize: '0.9rem',
        color: '#e2e8f0',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const inputFocusHandler = (e) => {
        e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.06), 0 0 20px -4px rgba(99, 102, 241, 0.1)';
    };
    const inputBlurHandler = (e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '0.4rem',
        color: '#a0aec0',
        letterSpacing: '0.02em',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 18, 25, 0.45)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{ duration: 0.5, ease: premiumEase }}
                        style={{
                            width: '100%',
                            maxWidth: '640px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: 'rgba(20, 24, 32, 0.97)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.3), 0 0 60px -20px rgba(99, 102, 241, 0.08)',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.75rem 2rem 1.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            background: 'inherit',
                            borderRadius: '1.75rem 1.75rem 0 0',
                            zIndex: 10,
                        }}>
                            <div>
                                <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Plus size={14} color="#f7fafc" strokeWidth={3} />
                                    </div>
                                    <h2 style={{
                                        fontSize: '1.35rem',
                                        fontWeight: 800,
                                        color: '#e2e8f0',
                                        letterSpacing: '-0.02em',
                                    }}>
                                        Post New Job
                                    </h2>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#718096' }}>
                                    Create a new listing and find great talent.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#718096',
                                    background: 'rgba(30, 36, 51, 0.5)',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* Form Body */}
                        <div style={{ padding: '1.5rem 2rem 2rem' }}>
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.06)',
                                            color: '#fca5a5',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            marginBottom: '1.25rem',
                                            border: '1px solid rgba(239, 68, 68, 0.1)',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Job Title</label>
                                        <input name="title" style={inputStyle} placeholder="e.g. Senior React Developer" value={form.title} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Location</label>
                                        <input name="location" style={inputStyle} placeholder="e.g. San Francisco, CA" value={form.location} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Salary (USD/yr)</label>
                                        <input name="salary" type="number" style={inputStyle} placeholder="e.g. 120000" value={form.salary} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Job Type</label>
                                        <select name="type" style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler}>
                                            <option value="full-time">Full-time</option>
                                            <option value="part-time">Part-time</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea name="description" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Describe the role, responsibilities, and team..." value={form.description} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} required />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Requirements</label>
                                    <textarea name="requirements" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Key qualifications and experience needed..." value={form.requirements} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} required />
                                </div>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <label style={labelStyle}>Required Skills (comma-separated)</label>
                                    <input name="requiredSkills" style={inputStyle} placeholder="e.g. React, Node.js, TypeScript" value={form.requiredSkills} onChange={handleChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onClose}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.875rem',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#a0aec0',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            borderRadius: '0.875rem',
                                            background: loading ? '#4a5568' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                            color: '#f7fafc',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            border: 'none',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                        }}
                                    >
                                        {loading ? 'Creating...' : 'Publish Job'} <Sparkles size={15} />
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
