'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    // 1. Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // 2. Applications State
    const [applications, setApplications] = useState([
        { id: 1, name: 'Tariq ibn Ziyad', email: 'tariq@example.com', program: 'Quranic Arabic & Morphology', status: 'Pending', date: '2026-07-27' },
        { id: 2, name: 'Aisha bint Abi Bakr', email: 'aisha@example.com', program: 'Hadith Terminology (Mustalah)', status: 'Pending', date: '2026-07-28' },
        { id: 3, name: 'Umar ibn al-Khattab', email: 'umar@example.com', program: 'Islamic Jurisprudence (Fiqh)', status: 'Approved', date: '2026-07-25' }
    ]);

    // 3. Announcements State
    const [announcement, setAnnouncement] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([
        'Semester registration closes on August 15th, 2026.',
        'New Quranic Tafsir modules are now available in the student portal.'
    ]);

    // 4. Assignment Grading State
    const [submissions, setSubmissions] = useState([
        { id: 1, student: 'Zayd ibn Thabit', course: 'Quranic Arabic 102', assignment: 'Verb Conjugation Matrix (Exercise 4)', submissionDate: '2026-07-26', grade: 'Pending', feedback: '' },
        { id: 2, student: 'Fatima al-Fihriyya', course: 'Islamic Fiqh 101', assignment: 'Case Study on Modern Transactions', submissionDate: '2026-07-27', grade: 'Pending', feedback: '' }
    ]);

    // 5. Course Schedule State
    const [schedules, setSchedules] = useState([
        { id: 1, course: 'Quranic Arabic & Morphology', day: 'Mondays & Wednesdays', time: '6:00 PM GMT', instructor: 'Shaykh Farid Abdul Samad' },
        { id: 2, course: 'Hadith Terminology (Mustalah)', day: 'Tuesdays & Thursdays', time: '7:30 PM GMT', instructor: 'Shaykh Ahmad Abdullahi Dawud' }
    ]);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseDay, setNewCourseDay] = useState('');
    const [newCourseInstructor, setNewCourseInstructor] = useState('');

    // 6. Islamic Bookstore Inventory Upload State
    const [books, setBooks] = useState([
        { id: 1, title: 'The Sealed الرحيق المختوم', price: '$25.00', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
        { id: 2, title: 'Riyad as-Salihin', price: '$35.00', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' }
    ]);
    const [bookTitle, setBookTitle] = useState('');
    const [bookPrice, setBookPrice] = useState('');
    const [bookImage, setBookImage] = useState('');

    // Handlers
    const handleLogin = (e) => {
        e.preventDefault();
        // Secure admin check credentials
        if (email === 'admin@ilmhub.com' && password === 'admin1234') {
            setIsAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError('Invalid administrator credentials. Please try again.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setEmail('');
        setPassword('');
    };

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

    const handleGradeUpdate = (id, newGrade, newFeedback) => {
        setSubmissions(submissions.map(sub => sub.id === id ? { ...sub, grade: newGrade, feedback: newFeedback } : sub));
    };

    const handleAddSchedule = (e) => {
        e.preventDefault();
        if (!newCourseName || !newCourseDay || !newCourseInstructor) return;
        setSchedules([...schedules, { id: Date.now(), course: newCourseName, day: newCourseDay, time: '8:00 PM GMT', instructor: newCourseInstructor }]);
        setNewCourseName('');
        setNewCourseDay('');
        setNewCourseInstructor('');
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        if (!bookTitle || !bookPrice || !bookImage) return;
        setBooks([...books, { id: Date.now(), title: bookTitle, price: bookPrice, image: bookImage }]);
        setBookTitle('');
        setBookPrice('');
        setBookImage('');
    };

    // If not logged in, show secure login gate
    if (!isAuthenticated) {
        return (
            <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '24px' }}>Admin Portal Login</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Restricted access for Ilm-Hub administrators only.</p>
                    </div>

                    {authError && (
                        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Admin Email</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ilmhub.com"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Password</label>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button 
                            type="submit"
                            style={{ width: '100%', padding: '12px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
                        >
                            Secure Login
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                            &larr; Return to Public Website
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            {/* Header with Logout */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: '22px', color: '#14532d', margin: 0 }}>Ilm-Hub Admin Portal &bull; Advanced Control Center</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/" style={{ padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 'bold', fontSize: '14px', border: '1px solid #cbd5e1' }}>
                        Public Site
                    </Link>
                    <button 
                        onClick={handleLogout}
                        style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                    >
                        Secure Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
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
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Bookstore Inventory</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#16a34a' }}>{books.length} Books</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Active Schedules</h4>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0284c7' }}>{schedules.length}</div>
                    </div>
                </div>

                {/* 1. Islamic Bookstore Management & Inventory Upload */}
                <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                    <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Islamic Bookstore Management</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Upload new Islamic literature items, define pricing, and publish book covers directly to the public bookstore.</p>
                    
                    <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <input 
                            type="text" 
                            placeholder="Book Title" 
                            required 
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input 
                            type="text" 
                            placeholder="Price (e.g., $20.00)" 
                            required 
                            value={bookPrice}
                            onChange={(e) => setBookPrice(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input 
                            type="url" 
                            placeholder="Image URL (e.g., https://...)" 
                            required 
                            value={bookImage}
                            onChange={(e) => setBookImage(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <button 
                            type="submit"
                            style={{ padding: '10px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Upload to Bookstore
                        </button>
                    </form>

                    <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '15px' }}>Current Store Catalog</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {books.map((b) => (
                            <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '160px', width: '100%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                    <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{b.title}</div>
                                        <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: 'bold' }}>{b.price}</div>
                                    </div>
                                    <button 
                                        onClick={() => setBooks(books.filter(item => item.id !== b.id))}
                                        style={{ marginTop: '12px', padding: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Remove Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Student Admission Requests */}
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

                {/* 3. Assignment Grading Section */}
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

                {/* 4. Course Schedule Management */}
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

                {/* 5. Announcements Section */}
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