import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Bell, Check, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastVariants, softSpring } from '../utils/motion';
import { MagneticButton } from './CursorEffects';
import api from '../api/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showNotifications]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <nav
            className="glass-header"
            style={{
                boxShadow: scrolled
                    ? '0 8px 40px -4px rgba(0,0,0,0.2), 0 0 60px -15px rgba(99, 102, 241, 0.06)'
                    : 'none',
            }}
        >
            <div className="container flex justify-between items-center" style={{ height: '72px' }}>
                {/* Logo */}
                <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
                    <motion.span
                        whileHover={{ scale: 1.04 }}
                        transition={softSpring}
                        style={{ display: 'inline-block' }}
                    >
                        <span
                            key={isDark ? 'logo-dark' : 'logo-light'}
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                letterSpacing: '-0.04em',
                                fontFamily: '"Space Grotesk", system-ui, sans-serif',
                                background: isDark
                                    ? 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 40%, #a78bfa 100%)'
                                    : 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #7c3aed 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: isDark
                                    ? 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.3))'
                                    : 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.2))',
                                display: 'inline-block',
                            }}
                        >
                            SmartHire
                        </span>
                    </motion.span>
                </Link>

                {/* Navigation links */}
                <div className="flex gap-2 items-center">
                    <Link
                        to="/"
                        className="btn-ghost"
                        style={{
                            color: isDark ? '#a0aec0' : '#6b6b65',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={(e) => { e.target.style.color = isDark ? '#e2e8f0' : '#222220'; e.target.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                        onMouseLeave={(e) => { e.target.style.color = isDark ? '#a0aec0' : '#6b6b65'; e.target.style.background = 'transparent'; }}
                    >
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard">
                                <MagneticButton
                                    className="btn"
                                    strength={0.2}
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: '#f7fafc',
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '0.625rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                                    }}
                                >
                                    Dashboard
                                </MagneticButton>
                            </Link>

                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{
                                        padding: '0.5rem',
                                        position: 'relative',
                                        color: isDark ? '#a0aec0' : '#6b6b65',
                                        borderRadius: '0.625rem',
                                        transition: 'color 300ms',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#e2e8f0' : '#222220'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#a0aec0' : '#6b6b65'}
                                >
                                    <Bell size={20} />
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '2px',
                                                    background: '#f87171',
                                                    color: '#fef2f2',
                                                    fontSize: '0.6rem',
                                                    width: '16px',
                                                    height: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    fontWeight: 'bold',
                                                    border: `2px solid ${isDark ? '#0f1219' : '#f5f5f0'}`,
                                                }}
                                            >
                                                {unreadCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>

                                {/* Notification Dropdown — dissolving floating glass panel */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            variants={toastVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            style={{
                                                position: 'absolute',
                                                top: '140%',
                                                right: 0,
                                                width: '340px',
                                                background: isDark ? 'rgba(20, 24, 32, 0.97)' : 'rgba(255, 255, 255, 0.97)',
                                                backdropFilter: 'blur(24px)',
                                                borderRadius: '1.25rem',
                                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                                boxShadow: isDark ? '0 20px 60px -12px rgba(0, 0, 0, 0.3), 0 0 40px -10px rgba(99, 102, 241, 0.08)' : '0 20px 60px -12px rgba(0, 0, 0, 0.08), 0 0 40px -10px rgba(79, 70, 229, 0.05)',
                                                overflow: 'hidden',
                                                zIndex: 1000,
                                            }}
                                        >
                                            <div style={{
                                                padding: '1rem 1.25rem',
                                                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,

                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}>
                                                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isDark ? '#e2e8f0' : '#222220' }}>Notifications</span>
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    style={{ color: isDark ? '#718096' : '#6b6b65', padding: '0.25rem' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '2rem', color: isDark ? '#718096' : '#6b6b65', textAlign: 'center', fontSize: '0.875rem' }}>
                                                        No notifications yet
                                                    </div>
                                                ) : (
                                                    notifications.map((n, i) => (
                                                        <motion.div
                                                            key={n._id}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.04 }}
                                                            style={{
                                                                padding: '0.875rem 1.25rem',
                                                                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                                                                background: n.read ? 'transparent' : (isDark ? 'rgba(99, 102, 241, 0.04)' : 'rgba(79, 70, 229, 0.04)'),
                                                                fontSize: '0.85rem',
                                                                transition: 'background 300ms',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                                <p style={{ flex: 1, color: isDark ? '#cbd5e0' : '#333330', lineHeight: 1.5 }}>{n.message}</p>
                                                                {!n.read && (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.15 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => markAsRead(n._id)}
                                                                        title="Mark as read"
                                                                        style={{ color: '#34d399', flexShrink: 0 }}
                                                                    >
                                                                        <Check size={14} />
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                            <span style={{ fontSize: '0.7rem', color: isDark ? '#718096' : '#a0a09a', marginTop: '0.25rem', display: 'block' }}>
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Theme Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.625rem',
                                    color: isDark ? '#a0aec0' : '#6b6b65',
                                    transition: 'color 300ms, background 300ms',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = isDark ? '#e2e8f0' : '#222220'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? '#a0aec0' : '#6b6b65'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
                            >
                                <AnimatePresence mode="wait">
                                    {isDark ? (
                                        <motion.div
                                            key="sun"
                                            initial={{ rotate: -90, opacity: 0, scale: 0 }}
                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotate: 90, opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Sun size={18} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="moon"
                                            initial={{ rotate: 90, opacity: 0, scale: 0 }}
                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotate: -90, opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Moon size={18} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* User info + Logout */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginLeft: '0.5rem',
                                paddingLeft: '0.75rem',
                                borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,

                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    color: '#c7d2fe',
                                }}>
                                    {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isDark ? '#e2e8f0' : '#222220' }}>{user.name}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1, color: '#fca5a5' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleLogout}
                                    title="Logout"
                                    style={{ color: isDark ? '#718096' : '#6b6b65', transition: 'color 300ms' }}
                                >
                                    <LogOut size={18} />
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-2 items-center">
                            {/* Theme Toggle (logged-out) */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.625rem',
                                    color: isDark ? '#a0aec0' : '#6b6b65',
                                    transition: 'color 300ms, background 300ms',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = isDark ? '#e2e8f0' : '#222220'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? '#a0aec0' : '#6b6b65'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
                            >
                                <AnimatePresence mode="wait">
                                    {isDark ? (
                                        <motion.div
                                            key="sun"
                                            initial={{ rotate: -90, opacity: 0, scale: 0 }}
                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotate: 90, opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Sun size={18} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="moon"
                                            initial={{ rotate: 90, opacity: 0, scale: 0 }}
                                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotate: -90, opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Moon size={18} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <Link to="/login">
                                <MagneticButton
                                    strength={0.2}
                                    style={{
                                        color: isDark ? '#cbd5e0' : '#333330',
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '0.625rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,

                                        transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                >
                                    Log In
                                </MagneticButton>
                            </Link>
                            <Link to="/register">
                                <MagneticButton
                                    strength={0.25}
                                    className="btn"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: '#f7fafc',
                                        padding: '0.55rem 1.25rem',
                                        borderRadius: '0.625rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                                    }}
                                >
                                    Sign Up
                                </MagneticButton>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
