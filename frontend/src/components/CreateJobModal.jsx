import React, { useState } from 'react';
import api from '../api/api';
import { X } from 'lucide-react';

export default function CreateJobModal({ isOpen, onClose, onJobCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        type: 'Full-time'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/jobs', formData);
            onJobCreated();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="card modal-content" style={{ padding: '2rem' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Post a New Job</h2>
                    <button onClick={onClose} className="btn" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Job Title</label>
                        <input
                            className="input-field"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Senior Frontend Engineer"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Job responsibilities and details..."
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Requirements</label>
                        <textarea
                            className="input-field"
                            rows="3"
                            required
                            value={formData.requirements}
                            onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="Skills and qualifications needed..."
                        />
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Salary ($/year)</label>
                            <input
                                type="number"
                                className="input-field"
                                required
                                value={formData.salary}
                                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                placeholder="80000"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Location</label>
                            <input
                                className="input-field"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="San Francisco, CA (Remote)"
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label">Employment Type</label>
                        <select
                            className="input-field"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            style={{ cursor: 'pointer' }}
                        >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
