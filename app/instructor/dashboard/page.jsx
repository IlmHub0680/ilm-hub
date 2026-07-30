'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InstructorDashboard() {
    const [activeTab, setActiveTab] = useState('courses');
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#14532d', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0' }}>
                <div>
                    <div style={{ padding: '0 24px 24px 24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        Instructor Portal
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px' }}>
                        {[
                            { id: 'courses', label: 'My Assigned Courses' },
                            { id: 'students', label: 'Student Enrollees' },
                            { id: 'grades', label: 'Grading & Submissions' }
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

                {/* Sidebar Bottom / Logout */}
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
                <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '28px' }}>Instructor Dashboard</h1>
                <p style={{ color: '#64748b', margin: '0 0 30px 0', fontSize: '15px' }}>Manage your courses, lectures, and student evaluations.</p>
                
                {activeTab === 'courses' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h2 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Assigned Courses</h2>
                        <p style={{ color: '#64748b' }}>You are currently instructing active modules for the Islamic Studies department.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
