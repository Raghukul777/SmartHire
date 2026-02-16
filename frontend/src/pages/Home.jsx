import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Search, MapPin, DollarSign, ArrowRight, Briefcase } from 'lucide-react';

export default function Home() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await api.get('/jobs');
                setJobs(data);
            } catch (error) {
                console.error('Failed to fetch jobs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Hero Section */}
            <section style={{ position: 'relative', padding: '8rem 0 6rem', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
                    background: 'radial-gradient(circle, hsla(var(--primary), 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -1
                }} />

                <div className="container">
                    <div className="flex flex-col items-center" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <div className="badge badge-blue mb-4 animate-fade-in">
                            Over 10,000+ jobs available
                        </div>
                        <h1 className="animate-fade-in animate-delay-100" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                            Find Your <span className="text-gradient">Dream Job</span><br />
                            With SmartHire
                        </h1>
                        <p className="animate-fade-in animate-delay-200" style={{ fontSize: '1.25rem', color: 'hsl(var(--text-secondary))', marginBottom: '3rem', maxWidth: '600px' }}>
                            Connect with top companies and startups. Your next big career move is just a search away.
                        </p>

                        <div className="animate-fade-in animate-delay-200" style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
                            <div className="flex items-center" style={{
                                background: 'white',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-full)',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <Search className="text-gray-400" size={24} style={{ marginLeft: '1rem', color: 'hsl(var(--text-light))' }} />
                                <input
                                    type="text"
                                    placeholder="Search by job title, company, or location..."
                                    className="input-field"
                                    style={{ border: 'none', boxShadow: 'none', fontSize: '1.1rem', padding: '0 1rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}>
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Jobs Section */}
            <section className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 style={{ fontSize: '2rem' }}>Latest Opportunities</h2>
                        <p style={{ color: 'hsl(var(--text-secondary))' }}>Hand-picked jobs for you</p>
                    </div>
                    <Link to="/jobs" className="btn btn-secondary flex items-center gap-2">
                        View All Jobs <ArrowRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-color))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%' }}></div>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="job-grid">
                        {filteredJobs.map((job, index) => (
                            <div key={job._id} className="card flex flex-col h-full animate-fade-in" style={{ animationDelay: `${index * 50}ms`, position: 'relative' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, hsl(var(--primary-light)), hsl(var(--bg-color)))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'hsl(var(--primary))'
                                    }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <span className="badge badge-green">New</span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{job.title}</h3>
                                <p style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {job.postedBy?.companyName || 'Confidential Company'}
                                </p>

                                <div className="flex flex-col gap-2 mb-6" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} style={{ color: 'hsl(var(--text-light))' }} />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} style={{ color: 'hsl(var(--text-light))' }} />
                                        ${job.salary.toLocaleString()}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16" style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed hsl(var(--border-color))' }}>
                        <p style={{ fontSize: '1.25rem', color: 'hsl(var(--text-secondary))' }}>No jobs found matching your search.</p>
                        <button
                            className="btn btn-primary mt-4" style={{ marginTop: '1rem' }}
                            onClick={() => setSearchTerm('')}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
