import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { softSpring, premiumEase } from '../utils/motion';
import { MagneticButton, useCursor, ParallaxLayer } from '../components/CursorEffects';

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { isDark } = useTheme();
    const cursor = useCursor();

    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsSignUp(location.pathname === '/register');
        setError('');
    }, [location.pathname]);

    const toggleMode = () => {
        const newMode = !isSignUp;
        setIsSignUp(newMode);
        navigate(newMode ? '/register' : '/login', { replace: true });
    };

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(loginEmail, loginPassword);
            if (result.success) navigate('/dashboard');
            else setError(result.message);
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    // Register state
    const [registerData, setRegisterData] = useState({
        name: '', email: '', password: '', role: 'candidate'
    });

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await register(registerData);
            if (result.success) navigate('/dashboard');
            else setError(result.message);
        } catch (err) {
            setError('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1.125rem',
        borderRadius: '0.875rem',
        border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}`,
        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
        fontSize: '0.925rem',
        color: isDark ? '#e2e8f0' : '#222220',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const inputFocusHandler = (e) => {
        e.target.style.borderColor = isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.4)';
        e.target.style.boxShadow = isDark ? '0 0 0 4px rgba(99, 102, 241, 0.1), 0 0 24px -4px rgba(99, 102, 241, 0.2)' : '0 0 0 4px rgba(79, 70, 229, 0.08), 0 0 24px -4px rgba(79, 70, 229, 0.12)';
        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.8)';
    };
    const inputBlurHandler = (e) => {
        e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
        e.target.style.boxShadow = 'none';
        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '0.4rem',
        color: isDark ? '#a0aec0' : '#6b6b65',
        letterSpacing: '0.02em',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                minHeight: 'calc(100vh - 72px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Ambient background blobs — cursor reactive via ParallaxLayer */}
            <ParallaxLayer factor={-25} style={{
                position: 'absolute', top: '-10%', right: '-8%',
                width: '500px', height: '500px',
            }}>
                <div
                    className="ambient-blob ambient-blob--indigo"
                    style={{ width: '100%', height: '100%', opacity: 0.5 }}
                />
            </ParallaxLayer>
            <ParallaxLayer factor={25} style={{
                position: 'absolute', bottom: '-15%', left: '-5%',
                width: '400px', height: '400px',
            }}>
                <div
                    className="ambient-blob ambient-blob--violet"
                    style={{ width: '100%', height: '100%', opacity: 0.4 }}
                />
            </ParallaxLayer>
            <div
                className="ambient-blob ambient-blob--ice"
                style={{
                    width: '300px',
                    height: '300px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.12,
                }}
            />

            {/* Main Container — floating glass panel */}
            <motion.div
                initial={{ y: 24, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 0.1, ease: premiumEase }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1100px',
                    minHeight: '640px',
                    background: isDark ? 'rgba(20, 24, 32, 0.55)' : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(28px)',
                    borderRadius: '2rem',
                    boxShadow: isDark
                        ? '0 24px 80px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                        : '0 24px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                }}
            >
                {/* ========= Login Form ========= */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        display: 'flex',
                        transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: isSignUp ? 0 : 1,
                        pointerEvents: isSignUp ? 'none' : 'auto',
                        transform: isSignUp ? 'translateX(30%)' : 'translateX(0)',
                    }}
                >
                    <div style={{ width: '50%', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '380px' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{
                                    fontSize: '2rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#222220',
                                    marginBottom: '0.5rem', letterSpacing: '-0.03em',
                                }}>Welcome Back</h2>
                                <p style={{ color: isDark ? '#a0aec0' : '#6b6b65', fontSize: '0.95rem' }}>
                                    Enter your details to sign in.
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && !isSignUp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        style={{
                                            background: 'rgba(248, 113, 113, 0.08)',
                                            color: '#fca5a5',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '0.75rem',
                                            marginBottom: '1.25rem',
                                            border: '1px solid rgba(248, 113, 113, 0.1)',
                                            fontSize: '0.85rem', fontWeight: 500,
                                        }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleLogin}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={labelStyle}>Email Address</label>
                                    <input
                                        type="email" style={inputStyle}
                                        value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                                        onFocus={inputFocusHandler} onBlur={inputBlurHandler}
                                        placeholder="name@company.com" required
                                    />
                                </div>
                                <div style={{ marginBottom: '1.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={labelStyle}>Password</label>
                                        <button type="button" style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                    <input
                                        type="password" style={inputStyle}
                                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                        onFocus={inputFocusHandler} onBlur={inputBlurHandler}
                                        placeholder="••••••••" required
                                    />
                                </div>
                                <MagneticButton
                                    type="submit"
                                    className="btn"
                                    disabled={loading}
                                    strength={0.15}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: '#f7fafc',
                                        fontWeight: 700,
                                        padding: '0.9rem',
                                        borderRadius: '0.875rem',
                                        fontSize: '0.925rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
                                </MagneticButton>
                            </form>

                            <p style={{ marginTop: '1.75rem', textAlign: 'center', color: isDark ? '#718096' : '#6b6b65', fontSize: '0.85rem' }}>
                                Don't have an account?{' '}
                                <button onClick={toggleMode} style={{ color: '#818cf8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Sign up free
                                </button>
                            </p>
                        </div>
                    </div>
                    <div style={{ width: '50%' }} />
                </div>

                {/* ========= Register Form ========= */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        display: 'flex',
                        transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: isSignUp ? 1 : 0,
                        pointerEvents: isSignUp ? 'auto' : 'none',
                        transform: isSignUp ? 'translateX(0)' : 'translateX(-30%)',
                    }}
                >
                    <div style={{ width: '50%' }} />
                    <div style={{ width: '50%', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '380px' }}>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <h2 style={{
                                    fontSize: '2rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#222220',
                                    marginBottom: '0.5rem', letterSpacing: '-0.03em',
                                }}>Create Account</h2>
                                <p style={{ color: isDark ? '#718096' : '#6b6b65', fontSize: '0.95rem' }}>
                                    Join SmartHire today.
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && isSignUp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        style={{
                                            background: 'rgba(248, 113, 113, 0.08)',
                                            color: '#fca5a5',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '0.75rem',
                                            marginBottom: '1rem',
                                            border: '1px solid rgba(248, 113, 113, 0.1)',
                                            fontSize: '0.85rem', fontWeight: 500,
                                        }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleRegister}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" name="name" style={inputStyle} value={registerData.name} onChange={handleRegisterChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} placeholder="John Doe" required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Email Address</label>
                                    <input type="email" name="email" style={inputStyle} value={registerData.email} onChange={handleRegisterChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} placeholder="name@company.com" required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Password</label>
                                    <input type="password" name="password" style={inputStyle} value={registerData.password} onChange={handleRegisterChange} onFocus={inputFocusHandler} onBlur={inputBlurHandler} placeholder="••••••••" required />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>I am a...</label>
                                    <select
                                        name="role"
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                        value={registerData.role}
                                        onChange={handleRegisterChange}
                                        onFocus={inputFocusHandler}
                                        onBlur={inputBlurHandler}
                                    >
                                        <option value="candidate" style={{ background: isDark ? '#141820' : '#f5f5f0', color: isDark ? '#e2e8f0' : '#222220' }}>Candidate (Looking for jobs)</option>
                                        <option value="recruiter" style={{ background: isDark ? '#141820' : '#f5f5f0', color: isDark ? '#e2e8f0' : '#222220' }}>Recruiter (Hiring talent)</option>
                                    </select>
                                </div>
                                <MagneticButton
                                    type="submit"
                                    className="btn"
                                    disabled={loading}
                                    strength={0.15}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: '#f7fafc',
                                        fontWeight: 700,
                                        padding: '0.9rem',
                                        borderRadius: '0.875rem',
                                        fontSize: '0.925rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
                                </MagneticButton>
                            </form>

                            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: isDark ? '#718096' : '#6b6b65', fontSize: '0.85rem' }}>
                                Already have an account?{' '}
                                <button onClick={toggleMode} style={{ color: '#818cf8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Log in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ========= OVERLAY PANEL — Atmospheric Dark ========= */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '50%', height: '100%',
                        zIndex: 50,
                        overflow: 'hidden',
                        transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isSignUp ? 'translateX(0)' : 'translateX(100%)',
                        borderRadius: isSignUp ? '0 2rem 2rem 0' : '2rem 0 0 2rem',
                        background: isDark
                            ? 'linear-gradient(135deg, #1a1f2e 0%, #0f1219 50%, #0a0c12 100%)'
                            : 'linear-gradient(135deg, #e8e8e2 0%, #ddddd7 50%, #d4d4ce 100%)',
                        boxShadow: isDark
                            ? '0 0 80px -20px rgba(99, 102, 241, 0.12)'
                            : '0 0 80px -20px rgba(79, 70, 229, 0.06)',
                    }}
                >
                    {/* Decorative ambient */}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        <div className="ambient-blob" style={{
                            background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.06)',
                            width: '300px', height: '300px',
                            top: '-15%', right: '-10%',
                            animation: 'breathe 10s ease-in-out infinite',
                        }} />
                        <div className="ambient-blob" style={{
                            background: isDark ? 'rgba(139, 92, 246, 0.07)' : 'rgba(124, 58, 237, 0.04)',
                            width: '250px', height: '250px',
                            bottom: '-10%', left: '-10%',
                            animation: 'breathe 12s ease-in-out 3s infinite',
                        }} />
                    </div>

                    {/* Inner sliding content */}
                    <div style={{
                        position: 'relative',
                        width: '200%', height: '100%',
                        display: 'flex',
                        transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isSignUp ? 'translateX(0)' : 'translateX(-50%)',
                    }}>
                        {/* Panel: "Welcome Back" (visible when Register active) */}
                        <div style={{
                            width: '50%', height: '100%',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem', textAlign: 'center',
                            color: isDark ? '#e2e8f0' : '#333330',
                        }}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <h1 style={{
                                    fontSize: '2.75rem', fontWeight: 800,
                                    marginBottom: '1rem', lineHeight: 1.1,
                                    letterSpacing: '-0.03em', color: isDark ? '#f7fafc' : '#111110',
                                }}>
                                    Welcome Back!
                                </h1>
                                <p style={{ fontSize: '1rem', opacity: 0.7, maxWidth: '320px', lineHeight: 1.7, marginBottom: '2rem', color: isDark ? '#a0aec0' : '#6b6b65' }}>
                                    Sign in to continue your recruitment journey.
                                </p>
                                <MagneticButton
                                    onClick={toggleMode}
                                    strength={0.2}
                                    style={{
                                        padding: '0.75rem 2.5rem',
                                        borderRadius: '0.875rem',
                                        border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                        background: 'transparent',
                                        color: isDark ? '#f7fafc' : '#111110',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Sign In
                                </MagneticButton>
                            </motion.div>
                        </div>

                        {/* Panel: "Hello, Friend!" (visible when Login active) */}
                        <div style={{
                            width: '50%', height: '100%',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem', textAlign: 'center',
                            color: isDark ? '#e2e8f0' : '#333330',
                        }}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <h1 style={{
                                    fontSize: '2.75rem', fontWeight: 800,
                                    marginBottom: '1rem', lineHeight: 1.1,
                                    letterSpacing: '-0.03em', color: isDark ? '#f7fafc' : '#111110',
                                }}>
                                    Hello, Friend!
                                </h1>
                                <p style={{ fontSize: '1rem', opacity: 0.7, maxWidth: '320px', lineHeight: 1.7, marginBottom: '1.75rem', color: isDark ? '#a0aec0' : '#6b6b65' }}>
                                    Start your journey and discover what's possible.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '2rem', maxWidth: '260px', margin: '0 auto 2rem' }}>
                                    {[
                                        { icon: <Sparkles size={14} />, text: 'AI-powered matching' },
                                        { icon: <Shield size={14} />, text: 'Secure & private' },
                                        { icon: <Zap size={14} />, text: 'Real-time updates' },
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                                            fontSize: '0.8rem', color: isDark ? '#a5b4fc' : '#4f46e5', fontWeight: 500,
                                        }}>
                                            {item.icon}
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <MagneticButton
                                    onClick={toggleMode}
                                    strength={0.2}
                                    style={{
                                        padding: '0.75rem 2.5rem',
                                        borderRadius: '0.875rem',
                                        border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                        background: 'transparent',
                                        color: isDark ? '#f7fafc' : '#111110',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Sign Up
                                </MagneticButton>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
