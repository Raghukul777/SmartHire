import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during login.');
        }
    };

    return (
        <div className="auth-grid">
            <div className="flex items-center justify-center p-8" style={{ background: 'white' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div className="mb-8">
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Welcome Back</h2>
                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem' }}>Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            Sign In <ArrowRight size={18} />
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Sign up for free</Link>
                    </p>
                </div>
            </div>

            <div className="auth-sidebar flex flex-col justify-center p-16" style={{ padding: '4rem' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        SmartHire
                    </h1>
                    <p style={{ fontSize: '1.5rem', opacity: 0.9, lineHeight: 1.6, fontWeight: 300 }}>
                        Join thousands of professionals finding their dream careers and companies building the future.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>10k+</div>
                            <div style={{ opacity: 0.8 }}>Active Jobs</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>500+</div>
                            <div style={{ opacity: 0.8 }}>Companies</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
