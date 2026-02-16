import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // Determine initial state based on URL
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Sync state with URL if it changes externally (e.g. back button)
    useEffect(() => {
        setIsSignUp(location.pathname === '/register');
        setError(''); // Clear errors on switch
    }, [location.pathname]);

    const toggleMode = () => {
        const newMode = !isSignUp;
        setIsSignUp(newMode);
        // Update URL without full reload
        navigate(newMode ? '/register' : '/login', { replace: true });
    };

    // --- Login Logic ---
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(loginEmail, loginPassword);
            if (result.success) {
                navigate('/dashboard'); // or redirect to intended page
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    // --- Register Logic ---
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate'
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
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 overflow-hidden bg-slate-50 relative"
        >

            {/* Main Container */}
            <div className="relative w-full max-w-[1200px] min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">

                {/* --- FORMS LAYER --- */}
                {/* Login Form Container - Left Side */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-0 pointer-events-none -translate-x-full md:translate-x-[100%]' : 'opacity-100 translate-x-0'}`}>
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-slate-900">Welcome Back</h2>
                            <p className="text-slate-500 text-lg">Please enter your details to sign in.</p>
                        </div>

                        {error && !isSignUp && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2 text-sm font-medium">
                                <div className="w-4 h-4 rounded-full bg-red-200 text-red-600 flex items-center justify-center text-xs font-bold">!</div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-slate-700">Password</label>
                                    <button type="button" className="text-xs font-bold text-purple-600 hover:underline">Forgot password?</button>
                                </div>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-500 text-sm">
                            Don't have an account? <button onClick={toggleMode} className="text-purple-600 font-bold hover:underline">Sign up for free</button>
                        </p>
                    </div>
                </div>

                {/* Register Form Container - Right Side (Initially) */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-100 translate-x-0 md:translate-x-[100%]' : 'opacity-0 pointer-events-none translate-x-full md:translate-x-0'}`}>
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center md:text-right">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-slate-900">Create Account</h2>
                            <p className="text-slate-500 text-lg">Join SmartHire today.</p>
                        </div>

                        {error && isSignUp && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2 text-sm font-medium">
                                <div className="w-4 h-4 rounded-full bg-red-200 text-red-600 flex items-center justify-center text-xs font-bold">!</div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600"
                                    value={registerData.name}
                                    onChange={handleRegisterChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">I am a...</label>
                                <select
                                    name="role"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-600 cursor-pointer"
                                    value={registerData.role}
                                    onChange={handleRegisterChange}
                                >
                                    <option value="candidate">Candidate (Looking for jobs)</option>
                                    <option value="recruiter">Recruiter (Hiring talent)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-500 text-sm">
                            Already have an account? <button onClick={toggleMode} className="text-purple-600 font-bold hover:underline">Log in</button>
                        </p>
                    </div>
                </div>

                {/* --- OVERLAY PANEL (Hidden on Mobile) --- */}
                <div
                    className={`hidden md:block absolute top-0 left-0 w-1/2 h-full z-50 overflow-hidden transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0 rounded-r-[3rem] rounded-l-none' : 'translate-x-[100%] rounded-l-[3rem] rounded-r-none'}`}
                    style={{
                        background: 'linear-gradient(135deg, hsl(260, 80%, 60%), hsl(260, 70%, 50%))',
                        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
                    }}
                >
                    {/* Background decorations */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_60%)] animate-[spin_20s_linear_infinite]" />
                    </div>

                    {/* Content inside Overlay */}
                    <div className="relative w-[200%] h-full flex text-white transition-transform duration-700 ease-in-out" style={{ transform: isSignUp ? 'translateX(0)' : 'translateX(-50%)' }}>

                        {/* Panel Content for Register State (Left Side of Overlay) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center">
                            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Welcome Back!</h1>
                            <p className="text-lg opacity-90 font-light max-w-md mb-8">
                                To keep connected with us please login with your personal info.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="px-10 py-3 rounded-xl border-2 border-white/30 backdrop-blur-sm font-bold hover:bg-white hover:text-purple-600 transition-all"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Panel Content for Login State (Right Side of Overlay) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center">
                            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Hello, Friend!</h1>
                            <p className="text-lg opacity-90 font-light max-w-md mb-8">
                                Enter your personal details and start your journey with us.
                            </p>

                            <div className="flex flex-col gap-4 items-center mb-8 w-full max-w-xs">
                                <div className="flex items-center gap-3 text-sm font-medium opacity-80 w-full justify-start pl-8">
                                    <CheckCircle size={16} /> <span>Connect with top recruiters</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium opacity-80 w-full justify-start pl-8">
                                    <CheckCircle size={16} /> <span>Apply with one click</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium opacity-80 w-full justify-start pl-8">
                                    <CheckCircle size={16} /> <span>Track your applications</span>
                                </div>
                            </div>

                            <button
                                onClick={toggleMode}
                                className="px-10 py-3 rounded-xl border-2 border-white/30 backdrop-blur-sm font-bold hover:bg-white hover:text-purple-600 transition-all"
                            >
                                Sign Up
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </motion.div>
    );
}
