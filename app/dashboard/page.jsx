'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('studentEmail');
        localStorage.removeItem('studentName');
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#14532d', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0' }}>
                <div>
                    <div style={{ padding: '0 24px 24px 24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        Student Portal
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px' }}>
                        {[
                            { id: 'profile', label: 'Profile & Information' },
                            { id: 'courses', label: 'Enrolled Courses' },
                            { id: 'timetable', label: 'Class Timetable' },
                            { id: 'grades', label: 'Grades & Transcripts' },
                            { id: 'exams', label: 'Exams & Certificates' },
                            { id: 'records', label: 'Records & Letters' },
                            { id: 'support', label: 'Support & Helpdesk' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? '#16a34a' : 'transparent',
                                    color: '#ffffff',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Bottom / Logout & Back to Home */}
                <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    >
                        Logout
                    </button>
                    <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13px' }}>
                        &larr; Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '28px' }}>Student Dashboard</h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Welcome back, Khalid Muhammad Sulaiman</p>
                    </div>
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #bbf7d0' }}>
                        Admission Status: Approved
                    </div>
                </div>

                {activeTab === 'profile' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h2 style={{ color: '#14532d', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Student Profile & Educational Information</h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}></div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px' }}>Khalid Muhammad Sulaiman</h3>
                                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Course of Study: <span style={{ color: '#14532d', fontWeight: 'bold' }}>Advanced Islamic Studies & Qur'anic Sciences</span></p>
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Enrollment Status: Active</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Full Name</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Khalid Muhammad Sulaiman</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email Address</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>abdullah@gmail.com</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone Number</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>+233 24 123 4567</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>May 14, 1998</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Highest Qualification</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>High School</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Previous Institution</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Al-Noor Secondary</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Graduation Year</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>2025</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Institute ID</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>ILM-2026-8842</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}