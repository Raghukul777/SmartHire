import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LogOut, Bell, Check } from 'lucide-react';
import api from '../api/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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
        // Optional: Poll every 30s
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
        <nav className="glass-header">
            <div className="container flex justify-between items-center" style={{ height: '80px' }}>
                <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>

                    <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, hsl(var(--text-main)) 0%, hsl(var(--text-secondary)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        SmartHire
                    </span>
                </Link>
                <div className="flex gap-4 items-center">
                    <Link to="/" className="btn btn-secondary" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>Jobs</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>

                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="btn"
                                    style={{ padding: '0.5rem', position: 'relative' }}
                                >
                                    <Bell size={20} color="hsl(var(--text-secondary))" />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '0', right: '0',
                                            background: '#ef4444', color: 'white',
                                            fontSize: '0.6rem', width: '16px', height: '16px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '50%', fontWeight: 'bold'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="card" style={{
                                        position: 'absolute', top: '120%', right: 0, width: '300px',
                                        padding: '0', overflow: 'hidden', zIndex: 1000
                                    }}>
                                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Notifications</div>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '1rem', color: '#9ca3af', textAlign: 'center' }}>No notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n._id} style={{
                                                        padding: '0.75rem 1rem',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: n.read ? 'white' : '#f8fafc',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p style={{ flex: 1 }}>{n.message}</p>
                                                            {!n.read && (
                                                                <button onClick={() => markAsRead(n._id)} title="Mark as read">
                                                                    <Check size={14} className="text-green-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                            {new Date(n.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid hsl(var(--border-color))' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                                <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', color: 'hsl(0, 70%, 60%)' }} title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Log In</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
            {/* Overlay to close notifications when clicking outside */}
            {showNotifications && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    onClick={() => setShowNotifications(false)}
                />
            )}
        </nav>
    );
}
