import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    Sparkles, ArrowRight, Briefcase, Users, TrendingUp,
    Shield, Zap, Target, MapPin, DollarSign, ChevronRight,
    CheckCircle2, Star, Award, Rocket
} from 'lucide-react';
import { premiumEase, softSpring } from '../utils/motion';
import { TiltCard, MagneticButton, useCursor, ParallaxLayer } from '../components/CursorEffects';
import { useTheme } from '../contexts/ThemeContext';

/* ─── Scroll-triggered fade-in ─── */
function RevealSection({ children, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.9, delay, ease: premiumEase }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Infinite scrolling job ticker ─── */
function JobTicker({ jobs, isDark }) {
    const navigate = useNavigate();
    if (!jobs || jobs.length === 0) return null;

    // Duplicate for seamless loop
    const tickerJobs = [...jobs, ...jobs, ...jobs];

    return (
        <div style={{
            overflow: 'hidden',
            width: '100%',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}>
            <motion.div
                animate={{ x: ['0%', '-33.333%'] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: Math.max(20, jobs.length * 5),
                        ease: 'linear',
                    },
                }}
                style={{
                    display: 'flex',
                    gap: '1.5rem',
                    width: 'max-content',
                    willChange: 'transform',
                }}
            >
                {tickerJobs.map((job, i) => (
                    <motion.div
                        key={`${job._id}-${i}`}
                        whileHover={{ y: -8, scale: 1.03 }}
                        transition={softSpring}
                        onClick={() => navigate('/login')}
                        style={{
                            minWidth: '340px',
                            maxWidth: '340px',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            background: isDark ? 'rgba(20, 24, 34, 0.75)' : 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(16px)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            transition: 'box-shadow 400ms',
                            boxShadow: isDark
                                ? '0 4px 24px -4px rgba(0,0,0,0.3)'
                                : '0 4px 24px -4px rgba(0,0,0,0.08)',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 12px 40px -8px rgba(99,102,241,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = isDark
                                ? '0 4px 24px -4px rgba(0,0,0,0.3)'
                                : '0 4px 24px -4px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#818cf8', flexShrink: 0,
                            }}>
                                <Briefcase size={20} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h4 style={{
                                    fontSize: '1rem', fontWeight: 700,
                                    color: isDark ? '#e2e8f0' : '#111118',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    marginBottom: '0.15rem',
                                }}>
                                    {job.title}
                                </h4>
                                <p style={{
                                    fontSize: '0.8rem', color: '#818cf8', fontWeight: 600,
                                }}>
                                    {job.postedBy?.companyName || 'Growing Company'}
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', gap: '1rem', fontSize: '0.78rem',
                            color: isDark ? '#a0aec0' : '#555560',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MapPin size={12} /> {job.location}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <DollarSign size={12} /> ${Number(job.salary || 0).toLocaleString()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                                color: '#818cf8', fontSize: '0.68rem', fontWeight: 600,
                                border: '1px solid rgba(99,102,241,0.15)',
                            }}>
                                {job.type || 'Full-time'}
                            </span>
                            <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.08)',
                                color: '#34d399', fontSize: '0.68rem', fontWeight: 600,
                                border: '1px solid rgba(52,211,153,0.15)',
                            }}>
                                Apply Now →
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

/* ─── Animated counter ─── */
function AnimatedCounter({ end, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = end / 60;
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, end]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function LandingPage() {
    const [jobs, setJobs] = useState([]);
    const { isDark } = useTheme();
    const cursor = useCursor();
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);
    const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

    const heroRotateX = (cursor.y - 0.5) * -4;
    const heroRotateY = (cursor.x - 0.5) * 4;

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await api.get('/jobs');
                setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs for landing page', err);
            }
        };
        fetchJobs();
    }, []);

    const features = [
        {
            icon: <Target size={24} />,
            title: 'AI-Powered Matching',
            desc: 'Our intelligent algorithm matches your skills with the perfect opportunities automatically.',
            color: '#818cf8',
        },
        {
            icon: <Zap size={24} />,
            title: 'Real-Time Tracking',
            desc: 'Follow your application through every stage with our visual Kanban pipeline.',
            color: '#fbbf24',
        },
        {
            icon: <Shield size={24} />,
            title: 'Secure & Private',
            desc: 'Your data is encrypted and never shared without your explicit consent.',
            color: '#34d399',
        },
        {
            icon: <Rocket size={24} />,
            title: 'Fast Apply',
            desc: 'One-click applications with smart resume parsing. Apply to 10x more jobs.',
            color: '#f472b6',
        },
    ];

    const textPrimary = isDark ? '#e2e8f0' : '#111118';
    const textSub = isDark ? '#a0aec0' : '#555560';
    const textMuted = isDark ? '#718096' : '#888890';

    return (
        <div style={{ overflow: 'hidden', position: 'relative' }}>

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section
                ref={heroRef}
                style={{
                    position: 'relative',
                    padding: '9rem 0 7rem',
                    overflow: 'hidden',
                    minHeight: '92vh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* Ambient blobs */}
                <ParallaxLayer factor={-30} style={{
                    position: 'absolute', top: '-12%', right: '-8%',
                    width: '600px', height: '600px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--indigo"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </ParallaxLayer>

                <ParallaxLayer factor={25} style={{
                    position: 'absolute', top: '30%', left: '-8%',
                    width: '450px', height: '450px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--violet"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    />
                </ParallaxLayer>

                <ParallaxLayer factor={18} style={{
                    position: 'absolute', bottom: '-10%', right: '15%',
                    width: '380px', height: '380px',
                }}>
                    <motion.div
                        className="ambient-blob ambient-blob--ice"
                        style={{ width: '100%', height: '100%' }}
                        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
                    />
                </ParallaxLayer>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}>
                        <div style={{
                            textAlign: 'center', maxWidth: '920px', margin: '0 auto',
                            perspective: '1200px',
                        }}>
                            <div style={{
                                transform: `perspective(1200px) rotateX(${heroRotateX}deg) rotateY(${heroRotateY}deg)`,
                                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                willChange: 'transform',
                            }}>
                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 0.9, delay: 0.1, ease: premiumEase }}
                                    className="badge badge-indigo"
                                    style={{
                                        marginBottom: '1.75rem', padding: '0.5rem 1.5rem',
                                        fontSize: '0.78rem', display: 'inline-flex',
                                    }}
                                >
                                    <Sparkles size={13} style={{ marginRight: '0.4rem' }} />
                                    AI-Powered Recruitment Platform
                                </motion.div>

                                {/* Headline */}
                                <motion.h1
                                    initial={{ opacity: 0, x: -80, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1.1, delay: 0.2, ease: premiumEase }}
                                    style={{
                                        fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                                        marginBottom: '1.5rem',
                                        lineHeight: 1.06,
                                        fontWeight: 800,
                                        letterSpacing: '-0.045em',
                                        color: textPrimary,
                                    }}
                                >
                                    Where Great{' '}
                                    <span className="text-gradient">Talent</span>
                                    <br />
                                    Meets Opportunity
                                </motion.h1>

                                {/* Subtitle */}
                                <motion.p
                                    initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1, delay: 0.45, ease: premiumEase }}
                                    style={{
                                        fontSize: '1.2rem',
                                        color: textSub,
                                        maxWidth: '620px',
                                        margin: '0 auto 2.75rem',
                                        lineHeight: 1.8,
                                    }}
                                >
                                    SmartHire uses intelligent matching to connect you with roles
                                    that fit your <span style={{ color: '#818cf8', fontWeight: 600 }}>skills</span>,{' '}
                                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>experience</span>, and{' '}
                                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>ambitions</span> — faster than ever.
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.9, delay: 0.6, ease: premiumEase }}
                                    style={{
                                        display: 'flex', gap: '1rem',
                                        justifyContent: 'center', flexWrap: 'wrap',
                                    }}
                                >
                                    <Link to="/register">
                                        <MagneticButton
                                            className="btn"
                                            strength={0.25}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                color: '#f7fafc',
                                                padding: '0.85rem 2.25rem',
                                                borderRadius: '0.75rem',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4)',
                                                gap: '0.6rem',
                                            }}
                                        >
                                            Get Started Free <ArrowRight size={18} />
                                        </MagneticButton>
                                    </Link>
                                    <Link to="/login">
                                        <MagneticButton
                                            className="btn btn-secondary"
                                            strength={0.2}
                                            style={{
                                                padding: '0.85rem 2.25rem',
                                                borderRadius: '0.75rem',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                gap: '0.5rem',
                                            }}
                                        >
                                            Sign In
                                        </MagneticButton>
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Stats row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9, ease: premiumEase }}
                                style={{
                                    display: 'flex', justifyContent: 'center',
                                    gap: '3.5rem', marginTop: '4rem', flexWrap: 'wrap',
                                }}
                            >
                                {[
                                    { icon: <Briefcase size={16} />, value: 5, suffix: '+', label: 'Active Jobs', color: '#818cf8' },
                                    { icon: <Users size={16} />, value: 6, suffix: '+', label: 'Users', color: '#a78bfa' },
                                    { icon: <TrendingUp size={16} />, value: 95, suffix: '%', label: 'Match Rate', color: '#38bdf8' },
                                    { icon: <Shield size={16} />, value: 24, suffix: '/7', label: 'Support', color: '#34d399' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.95 + i * 0.1, ease: premiumEase }}
                                        whileHover={{ y: -3, scale: 1.05 }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <div style={{
                                            fontSize: '1.8rem', fontWeight: 800,
                                            color: stat.color, lineHeight: 1,
                                            marginBottom: '0.3rem',
                                        }}>
                                            <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem', color: textMuted,
                                            fontWeight: 600, display: 'flex',
                                            alignItems: 'center', gap: '0.35rem',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{ color: stat.color }}>{stat.icon}</span>
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════ CURVED TRANSITION ═══════════ */}
            <div style={{
                position: 'relative', height: '80px', marginTop: '-80px',
                zIndex: 3, overflow: 'hidden',
            }}>
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="rgba(15, 18, 25, 0.35)" />
                </svg>
            </div>

            {/* ═══════════ FEATURES SECTION ═══════════ */}
            <section className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem', position: 'relative', zIndex: 2 }}>
                <RevealSection>
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <span className="badge badge-indigo" style={{
                            marginBottom: '1rem', display: 'inline-flex',
                            padding: '0.4rem 1.2rem', fontSize: '0.72rem',
                        }}>
                            <Award size={12} style={{ marginRight: '0.35rem' }} /> Why SmartHire
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            color: textPrimary, marginBottom: '0.75rem',
                        }}>
                            Built for the <span className="text-gradient">Modern</span> Workforce
                        </h2>
                        <p style={{ color: textSub, fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto' }}>
                            Everything you need to find, apply, and land your next role — all in one place.
                        </p>
                    </div>
                </RevealSection>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {features.map((feat, i) => (
                        <RevealSection key={i} delay={i * 0.1}>
                            <TiltCard
                                className="card"
                                intensity={5}
                                style={{
                                    padding: '2rem',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                }}
                            >
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: `${feat.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: feat.color,
                                    border: `1px solid ${feat.color}25`,
                                }}>
                                    {feat.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.15rem', fontWeight: 700,
                                    color: textPrimary, letterSpacing: '-0.02em',
                                }}>
                                    {feat.title}
                                </h3>
                                <p style={{
                                    color: textSub, fontSize: '0.9rem',
                                    lineHeight: 1.7,
                                }}>
                                    {feat.desc}
                                </p>
                            </TiltCard>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ═══════════ LIVE JOBS TICKER ═══════════ */}
            <section style={{
                paddingTop: '3rem', paddingBottom: '5rem',
                position: 'relative', zIndex: 2,
            }}>
                <RevealSection>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <span className="badge badge-indigo" style={{
                            marginBottom: '1rem', display: 'inline-flex',
                            padding: '0.4rem 1.2rem', fontSize: '0.72rem',
                        }}>
                            <Briefcase size={12} style={{ marginRight: '0.35rem' }} /> Live Openings
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            color: textPrimary, marginBottom: '0.75rem',
                        }}>
                            Opportunities <span className="text-gradient">Waiting</span> for You
                        </h2>
                        <p style={{ color: textSub, fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
                            New roles added daily. Sign in to apply instantly.
                        </p>
                    </div>
                </RevealSection>

                <JobTicker jobs={jobs} isDark={isDark} />

                <RevealSection delay={0.3}>
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link to="/register">
                            <MagneticButton
                                className="btn"
                                strength={0.25}
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    color: '#f7fafc',
                                    padding: '0.85rem 2.5rem',
                                    borderRadius: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4)',
                                    gap: '0.6rem',
                                }}
                            >
                                Browse All Jobs <ChevronRight size={18} />
                            </MagneticButton>
                        </Link>
                    </div>
                </RevealSection>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', position: 'relative', zIndex: 2 }}>
                <RevealSection>
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            color: textPrimary, marginBottom: '0.75rem',
                        }}>
                            How It <span className="text-gradient">Works</span>
                        </h2>
                        <p style={{ color: textSub, fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Three simple steps to your dream career.
                        </p>
                    </div>
                </RevealSection>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '2rem',
                    maxWidth: '900px',
                    margin: '0 auto',
                }}>
                    {[
                        { step: '01', title: 'Create Your Profile', desc: 'Add your skills, experience, and preferences. Our AI starts learning about you.', color: '#818cf8' },
                        { step: '02', title: 'Get Matched', desc: 'Receive personalized job recommendations with match scores based on your profile.', color: '#a78bfa' },
                        { step: '03', title: 'Apply & Track', desc: 'One-click apply with resume upload. Track every stage on your visual dashboard.', color: '#38bdf8' },
                    ].map((item, i) => (
                        <RevealSection key={i} delay={i * 0.15}>
                            <TiltCard
                                className="card"
                                intensity={4}
                                style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: '-10px', right: '-5px',
                                    fontSize: '5rem', fontWeight: 900,
                                    color: `${item.color}08`,
                                    lineHeight: 1, pointerEvents: 'none',
                                }}>
                                    {item.step}
                                </div>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: `${item.color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: item.color, fontWeight: 800, fontSize: '1rem',
                                    margin: '0 auto 1.25rem',
                                    border: `2px solid ${item.color}30`,
                                }}>
                                    {item.step}
                                </div>
                                <h3 style={{
                                    fontSize: '1.1rem', fontWeight: 700,
                                    color: textPrimary, marginBottom: '0.5rem',
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    color: textSub, fontSize: '0.88rem', lineHeight: 1.7,
                                }}>
                                    {item.desc}
                                </p>
                            </TiltCard>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section style={{
                position: 'relative', zIndex: 2,
                padding: '5rem 0 6rem',
            }}>
                <RevealSection>
                    <div className="container" style={{
                        textAlign: 'center',
                        maxWidth: '700px',
                        margin: '0 auto',
                    }}>
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ marginBottom: '1.5rem' }}
                        >
                            <Sparkles size={40} style={{ color: '#818cf8', margin: '0 auto' }} />
                        </motion.div>
                        <h2 style={{
                            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            color: textPrimary, marginBottom: '1rem',
                        }}>
                            Ready to Find Your{' '}
                            <span className="text-gradient">Perfect Match</span>?
                        </h2>
                        <p style={{
                            color: textSub, fontSize: '1.1rem',
                            lineHeight: 1.7, marginBottom: '2.5rem',
                        }}>
                            Join thousands of professionals who've already accelerated their careers with SmartHire.
                            It's free to get started.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register">
                                <MagneticButton
                                    className="btn"
                                    strength={0.25}
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: '#f7fafc',
                                        padding: '1rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.45)',
                                        gap: '0.6rem',
                                    }}
                                >
                                    Create Free Account <ArrowRight size={19} />
                                </MagneticButton>
                            </Link>
                            <Link to="/login">
                                <MagneticButton
                                    className="btn btn-secondary"
                                    strength={0.2}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        borderRadius: '0.75rem',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Sign In
                                </MagneticButton>
                            </Link>
                        </div>

                        {/* Trust markers */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                display: 'flex', gap: '1.5rem', justifyContent: 'center',
                                marginTop: '2.5rem', flexWrap: 'wrap',
                            }}
                        >
                            {['No credit card required', 'Free forever plan', 'Setup in 30 seconds'].map((t, i) => (
                                <span key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    color: textMuted, fontSize: '0.82rem', fontWeight: 500,
                                }}>
                                    <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                                    {t}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                </RevealSection>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                padding: '2rem 0',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
            }}>
                <p style={{ color: textMuted, fontSize: '0.82rem' }}>
                    © {new Date().getFullYear()} SmartHire. Built with ❤️ for the modern workforce.
                </p>
            </footer>
        </div>
    );
}
