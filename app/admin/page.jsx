'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [applications, setApplications] = useState([
        { id: 1, name: 'Tariq ibn Ziyad', email: 'tariq@example.com', program: 'Quranic Arabic & Morphology', status: 'Pending', date: '2026-07-27' },
        { id: 2, name: 'Aisha bint Abi Bakr', email: 'aisha@example.com', program: 'Hadith Terminology (Mustalah)', status: 'Pending', date: '2026-07-28' },
        { id: 3, name: 'Umar ibn al-Khattab', email: 'umar@example.com', program: 'Islamic Jurisprudence (Fiqh)', status: 'Approved', date: '2026-07-25' }
    ]);

    const [announcement, setAnnouncement] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([
        'Semester registration closes on August 15th, 2026.',
        'New Quranic Tafsir modules are now available in the student portal.'
    ]);

    const handleApprove = (id) => {
        setApplications(applications.map(app => app.id === id ? { ...app, status: 'Approved' } : app));
    };

    const handleReject = (id) => {
        setApplications(applications.map(app => app.id === id ? { ...app, status: 'Rejected' } : app));
    };

    const handleAddAnnouncement = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        setAnnouncementsList([announcement, ...announcementsList]);
        setAnnouncement('');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '22px', color: '#14532d', margin: 0 }}>Ilm-Hub Admin Portal</h1>
                <Link href="/" style={{ padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>
                    &larr; Back to Public Site
                </Link>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '14px' }}>Total Applications</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d' }}>{applications.length}</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '14px' }}>Pending Reviews</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>
                            {applications.filter(a => a.status === 'Pending').length}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '14px' }}>Active Announcements</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{announcementsList.length}</div>
                    </div>
                </div>

                {/* Admissions Review Section */}
                <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                    <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Student Admission Requests</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Applicant Name</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Program</th>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#0f172a' }}>{app.name}</td>
                                        <td style={{ padding: '14px', color: '#64748b' }}>{app.email}</td>
                                        <td style={{ padding: '14px', color: '#334155' }}>{app.program}</td>
                                        <td style={{ padding: '14px', color: '#64748b' }}>{app.date}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '12px', 
                                                fontSize: '12px', 
                                                fontWeight: 'bold',
                                                background: app.status === 'Approved' ? '#dcfce7' : app.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                                color: app.status === 'Approved' ? '#16a34a' : app.status === 'Rejected' ? '#dc2626' : '#d97706'
                                            }}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            {app.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleApprove(app.id)}
                                                        style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(app.id)}
                                                        style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Broadcast Announcements Section */}
                <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Manage Institute Announcements</h3>
                    <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Type a new institutional announcement..."
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '280px' }}
                        />
                        <button 
                            type="submit"
                            style={{ padding: '12px 24px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Post Announcement
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {announcementsList.map((item, idx) => (
                            <div key={idx} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                                &bull; {item}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}