'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('ilm_applications') || '[]');
        if (saved.length === 0) {
            // Default mock application if empty
            const defaultApps = [
                { id: 101, fullName: 'Abdullah Omar', email: 'abdullah@gmail.com', highestQualification: 'High School', institution: 'Al-Noor Secondary', graduationYear: '2025', status: 'Pending' },
                { id: 102, fullName: 'Fatima Zahra', email: 'fatima@gmail.com', highestQualification: 'Bachelor\'s Degree', institution: 'City University', graduationYear: '2024', status: 'Approved' }
            ];
            localStorage.setItem('ilm_applications', JSON.stringify(defaultApps));
            setApplications(defaultApps);
        } else {
            setApplications(saved);
        }
    }, []);

    const updateStatus = (id, newStatus) => {
        const updated = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
        setApplications(updated);
        localStorage.setItem('ilm_applications', JSON.stringify(updated));
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ color: '#14532d', margin: 0, fontSize: '28px' }}>Admin Management Dashboard</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Review student registrations, educational information, and approve acceptance letters</p>
                    </div>
                    <Link href="/" style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        &larr; Back to Home
                    </Link>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Student Registration Requests & Admissions</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                <th style={{ padding: '12px' }}>Applicant Name</th>
                                <th style={{ padding: '12px' }}>Email</th>
                                <th style={{ padding: '12px' }}>Qualification</th>
                                <th style={{ padding: '12px' }}>Institution</th>
                                <th style={{ padding: '12px' }}>Grad. Year</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Actions / Acceptance Letter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '14px', fontWeight: 'bold', color: '#0f172a' }}>{app.fullName}</td>
                                    <td style={{ padding: '14px', color: '#475569' }}>{app.email}</td>
                                    <td style={{ padding: '14px', color: '#475569' }}>{app.highestQualification}</td>
                                    <td style={{ padding: '14px', color: '#475569' }}>{app.institution}</td>
                                    <td style={{ padding: '14px', color: '#475569' }}>{app.graduationYear}</td>
                                    <td style={{ padding: '14px' }}>
                                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: app.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: app.status === 'Approved' ? '#166534' : '#92400e' }}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'center' }}>
                                        {app.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Approved')}
                                                    style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Approve & Issue Letter
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Rejected')}
                                                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => updateStatus(app.id, 'Pending')}
                                                style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                Reset to Pending
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
