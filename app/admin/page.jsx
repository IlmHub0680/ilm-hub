'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    // 1. Applications State
    const [applications, setApplications] = useState([
        { id: 1, name: 'Tariq ibn Ziyad', email: 'tariq@example.com', program: 'Quranic Arabic & Morphology', status: 'Pending', date: '2026-07-27' },
        { id: 2, name: 'Aisha bint Abi Bakr', email: 'aisha@example.com', program: 'Hadith Terminology (Mustalah)', status: 'Pending', date: '2026-07-28' },
        { id: 3, name: 'Umar ibn al-Khattab', email: 'umar@example.com', program: 'Islamic Jurisprudence (Fiqh)', status: 'Approved', date: '2026-07-25' }
    ]);

    // 2. Announcements State
    const [announcement, setAnnouncement] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([
        'Semester registration closes on August 15th, 2026.',
        'New Quranic Tafsir modules are now available in the student portal.'
    ]);

    // 3. Assignment Grading & Student Submissions State
    const [submissions, setSubmissions] = useState([
        { id: 1, student: 'Zayd ibn Thabit', course: 'Quranic Arabic 102', assignment: 'Verb Conjugation Matrix (Exercise 4)', submissionDate: '2026-07-26', grade: 'Pending', feedback: '' },
        { id: 2, student: 'Fatima al-Fihriyya', course: 'Islamic Fiqh 101', assignment: 'Case Study on Modern Transactions', submissionDate: '2026-07-27', grade: 'Pending', feedback: '' }
    ]);

    // 4. Course Schedule Management State
    const [schedules, setSchedules] = useState([
        { id: 1, course: 'Quranic Arabic & Morphology', day: 'Mondays & Wednesdays', time: '6:00 PM GMT', instructor: 'Shaykh Farid Abdul Samad' },
        { id: 2, course: 'Hadith Terminology (Mustalah)', day: 'Tuesdays & Thursdays', time: '7:30 PM GMT', instructor: 'Shaykh Ahmad Abdullahi Dawud' }
    ]);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseDay, setNewCourseDay] = useState('');
    const [newCourseInstructor, setNewCourseInstructor] = useState('');

    // Handlers for Applications
    const handleApprove = (id) => {
        setApplications(applications.map(app => app.id === id ? { ...app, status: 'Approved' } : app));
    };

    const handleReject = (id) => {
        setApplications(applications.map(app => app.id === id ? { ...app, status: 'Rejected' } : app));
    };

    // Handlers for Announcements
    const handleAddAnnouncement = (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;
        setAnnouncementsList([announcement, ...announcementsList]);
        setAnnouncement('');
    };

    // Handlers for Grading
    const handleGradeUpdate = (id, newGrade, newFeedback) => {
        setSubmissions(submissions.map(sub => sub.id === id ? { ...sub, grade: newGrade, feedback: newFeedback } : sub));
    };

    // Handlers for Course Schedule
    const handleAddSchedule = (e) => {
        e.preventDefault();
        if (!newCourseName || !newCourseDay || !newCourseInstructor) return;
        setSchedules([...schedules, { id: Date.now(), course: newCourseName, day: newCourseDay, time: '8:00 PM GMT', instructor: newCourseInstructor }]);
        setNewCourseName('');
        setNewCourseDay('');
        setNewCourseInstructor('');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: '22px', color: '#14532d', margin: 0 }}>Ilm-Hub Admin Portal &bull; Advanced Control Center</h1>
                <Link href="/" style={{ padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>
                    &larr; Back to Public Site
                </Link>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Total Applications</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#14532d' }}>{applications.length}</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Pending Admissions</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#d97706' }}>
                            {applications.filter(a => a.status === 'Pending').length}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Ungraded Assignments</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#dc2626' }}>
                            {submissions.filter(s => s.grade === 'Pending').length}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Active Schedules</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#16a34a' }}>{schedules.length}</div>
                    </div>
                </div>

                {/* 1. Student Admission Requests */}
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

                {/* 2. Assignment Grading & Student Evaluation */}
                <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                    <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Assignment Grading & Student Evaluation</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Review submitted student tasks, assign formal academic scores, and provide structured instructor notes.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {submissions.map((sub) => (
                            <div key={sub.id} style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ flex: 1, minWidth: '260px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>{sub.course}</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{sub.assignment}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Student: <strong>{sub.student}</strong> &bull; Submitted: {sub.submissionDate}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <select 
                                            defaultValue={sub.grade}
                                            id={`grade-${sub.id}`}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', background: '#ffffff' }}
                                        >
                                            <option value="Pending">Pending Review</option>
                                            <option value="A (Excellent)">A (Excellent)</option>
                                            <option value="B (Very Good)">B (Very Good)</option>
                                            <option value="C (Pass)">C (Pass)</option>
                                            <option value="Needs Revision">Needs Revision</option>
                                        </select>
                                        <button 
                                            onClick={() => {
                                                const selectedGrade = document.getElementById(`grade-${sub.id}`).value;
                                                const feedbackInput = document.getElementById(`feedback-${sub.id}`).value;
                                                handleGradeUpdate(sub.id, selectedGrade, feedbackInput);
                                            }}
                                            style={{ padding: '8px 14px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                        >
                                            Save Grade
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        id={`feedback-${sub.id}`}
                                        defaultValue={sub.feedback}
                                        placeholder="Add instructor feedback..."
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                    />
                                    <div style={{ fontSize: '12px', color: sub.grade === 'Pending' ? '#d97706' : '#16a34a', fontWeight: 'bold' }}>
                                        Current Status: {sub.grade}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Course Schedule Management */}
                <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                    <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Course Schedule Management</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Publish weekly lecture timings and assign instructors to active curriculum modules.</p>
                    
                    <form onSubmit={handleAddSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <input 
                            type="text" 
                            placeholder="Course Title" 
                            required 
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Days (e.g., Fridays & Saturdays)" 
                            required 
                            value={newCourseDay}
                            onChange={(e) => setNewCourseDay(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Assigned Instructor" 
                            required 
                            value={newCourseInstructor}
                            onChange={(e) => setNewCourseInstructor(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <button 
                            type="submit"
                            style={{ padding: '10px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Add New Schedule
                        </button>
                    </form>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                        {schedules.map((sch) => (
                            <div key={sch.id} style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#14532d', marginBottom: '6px' }}>{sch.course}</div>
                                <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>📅 {sch.day} ({sch.time})</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>👨‍🏫 Instructor: {sch.instructor}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Broadcast Announcements Section */}
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