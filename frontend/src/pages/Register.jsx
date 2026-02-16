import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate'
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during registration.');
        }
    };

    return (
        <div className="auth-grid">
            <div className="flex items-center justify-center p-8" style={{ background: 'white' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div className="mb-8">
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Get Started</h2>
                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem' }}>Create your account in seconds.</p>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">I am a...</label>
                            <select
                                name="role"
                                className="input-field"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="candidate">Candidate (Looking for jobs)</option>
                                <option value="recruiter">Recruiter (Hiring talent)</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            Create Account <ArrowRight size={18} />
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                        Already have an account? <Link to="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Log in</Link>
                    </p>
                </div>
            </div>

            <div className="auth-sidebar flex flex-col justify-center p-16" style={{ padding: '4rem' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', marginLeft: 'auto', textAlign: 'right' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Create Account
                    </h1>
                    <p style={{ fontSize: '1.5rem', opacity: 0.9, lineHeight: 1.6, fontWeight: 300, marginBottom: '3rem' }}>
                        Join the network of the future. Start hiring or get hired today.
                    </p>

                    <div className="flex flex-col gap-4 items-end">
                        <div className="flex items-center gap-3" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                            <span>Connect with top recruiters</span>
                            <CheckCircle size={24} />
                        </div>
                        <div className="flex items-center gap-3" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                            <span>Apply with one click</span>
                            <CheckCircle size={24} />
                        </div>
                        <div className="flex items-center gap-3" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                            <span>Track your applications</span>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
