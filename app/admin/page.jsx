'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    // 1. Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Active Navigation Tab State
    const [activeTab, setActiveTab] = useState('overview');

    // 2. Staff Accounts Database State (Updated role names: Instructor instead of Grader)
    const [staffList, setStaffList] = useState([
        { id: 1, name: 'Imam Muhammad', email: 'admin@ilmhub.com', password: 'admin1234', role: 'Super Admin' },
        { id: 2, name: 'Shaykh Farid Abdul Samad', email: 'farid@ilmhub.com', password: 'farid123', role: 'Instructor' },
        { id: 3, name: 'Bilal ibn Rabah', email: 'bilal@ilmhub.com', password: 'bilal123', role: 'Bookstore Manager' }
    ]);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffPassword, setNewStaffPassword] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('Instructor');

    // 3. Applications State
    const [applications, setApplications] = useState([
        { id: 1, name: 'Tariq ibn Ziyad', email: 'tariq@example.com', program: 'Quranic Arabic & Morphology', status: 'Pending', date: '2026-07-27' },
        { id: 2, name: 'Aisha bint Abi Bakr', email: 'aisha@example.com', program: 'Hadith Terminology (Mustalah)', status: 'Pending', date: '2026-07-28' },
        { id: 3, name: 'Umar ibn al-Khattab', email: 'umar@example.com', program: 'Islamic Jurisprudence (Fiqh)', status: 'Approved', date: '2026-07-25' }
    ]);

    // 4. Detailed Students Database (For Admin: GPA, Transcript, Enrolled Courses)
    const [studentsDatabase, setStudentsDatabase] = useState([
        { 
            id: 1, 
            name: 'Zayd ibn Thabit', 
            email: 'zayd@student.ilmhub.com', 
            gpa: '3.85', 
            enrolledCourses: ['Quranic Arabic & Morphology', 'Hadith Terminology (Mustalah)'],
            instructorAssigned: 'Shaykh Farid Abdul Samad',
            transcript: [
                { course: 'Quranic Arabic 101', grade: 'A', semester: 'Fall 2025' },
                { course: 'Islamic Fiqh 101', grade: 'A-', semester: 'Fall 2025' }
            ]
        },
        { 
            id: 2, 
            name: 'Fatima al-Fihriyya', 
            email: 'fatima@student.ilmhub.com', 
            gpa: '3.96', 
            enrolledCourses: ['Quranic Arabic & Morphology'],
            instructorAssigned: 'Shaykh Farid Abdul Samad',
            transcript: [
                { course: 'Quranic Arabic 101', grade: 'A+', semester: 'Fall 2025' },
                { course: 'Seerah of the Prophet', grade: 'A', semester: 'Spring 2026' }
            ]
        }
    ]);

    // 5. Announcements State (Global + Instructor Specific)
    const [announcement, setAnnouncement] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([
        { id: 1, author: 'Super Admin', text: 'Semester registration closes on August 15th, 2026.', target: 'All Institute' },
        { id: 2, author: 'Shaykh Farid Abdul Samad', text: 'Quiz 1 scheduled for next Monday covers chapters 1 through 3.', target: 'Quranic Arabic & Morphology' }
    ]);

    // 6. Comprehensive Student Assessments (Quiz, Assignment, Midterm, Final)
    const [assessments, setAssessments] = useState([
        { id: 1, student: 'Zayd ibn Thabit', course: 'Quranic Arabic & Morphology', instructor: 'Shaykh Farid Abdul Samad', type: 'Quiz 1', score: 'Pending', maxScore: '/20', feedback: '' },
        { id: 2, student: 'Zayd ibn Thabit', course: 'Quranic Arabic & Morphology', instructor: 'Shaykh Farid Abdul Samad', type: 'Assignment 1', score: 'Pending', maxScore: '/50', feedback: '' },
        { id: 3, student: 'Fatima al-Fihriyya', course: 'Quranic Arabic & Morphology', instructor: 'Shaykh Farid Abdul Samad', type: 'Midterm Exam', score: 'Pending', maxScore: '/100', feedback: '' },
        { id: 4, student: 'Fatima al-Fihriyya', course: 'Quranic Arabic & Morphology', instructor: 'Shaykh Farid Abdul Samad', type: 'Final Exam', score: 'Pending', maxScore: '/100', feedback: '' }
    ]);

    // 7. Course Schedule State
    const [schedules, setSchedules] = useState([
        { id: 1, course: 'Quranic Arabic & Morphology', day: 'Mondays & Wednesdays', time: '6:00 PM GMT', instructor: 'Shaykh Farid Abdul Samad' },
        { id: 2, course: 'Hadith Terminology (Mustalah)', day: 'Tuesdays & Thursdays', time: '7:30 PM GMT', instructor: 'Shaykh Ahmad Abdullahi Dawud' }
    ]);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseDay, setNewCourseDay] = useState('');
    const [newCourseInstructor, setNewCourseInstructor] = useState('');

    // 8. Islamic Bookstore Inventory Upload State
    const [books, setBooks] = useState([
        { id: 1, title: 'The Sealed الرحيق المختوم', price: '$25.00', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
        { id: 2, title: 'Riyad as-Salihin', price: '$35.00', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' }
    ]);
    const [bookTitle, setBookTitle] = useState('');
    const [bookPrice, setBookPrice] = useState('');
    const [bookImage, setBookImage] = useState('');

    // 9. Support Tickets State
    const [tickets, setTickets] = useState([
        { id: 1, student: 'Zayd ibn Thabit', subject: 'Question regarding Quranic verb forms in Assignment 1', message: 'Assalamu alaykum Shaykh, on question 3 regarding hollow verbs, should we conjugate in past tense?', status: 'Open', reply: '', assignedInstructor: 'Shaykh Farid Abdul Samad' },
        { id: 2, student: 'Fatima al-Fihriyya', subject: 'Midterm schedule conflict', message: 'Is there a makeup window available if someone falls ill on midterm day?', status: 'Resolved', reply: 'Yes, documentation from a clinic is required.', assignedInstructor: 'Shaykh Farid Abdul Samad' }
    ]);
    const [replyText, setReplyText] = useState({});

    // 10. Discount Coupons State
    const [coupons, setCoupons] = useState([
        { id: 1, code: 'RAMADAN20', discount: '20% OFF', status: 'Active' },
        { id: 2, code: 'STUDENT5', discount: '$5.00 OFF', status: 'Active' }
    ]);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState('');

    // Authentication Handlers
    const handleLogin = (e) => {
        e.preventDefault();
        const foundStaff = staffList.find(staff => staff.email.toLowerCase() === email.toLowerCase() && staff.password === password);
        
        if (foundStaff) {
            setIsAuthenticated(true);
            setCurrentUser(foundStaff);
            setAuthError('');
            
            if (foundStaff.role === 'Bookstore Manager') {
                setActiveTab('bookstore');
            } else if (foundStaff.role === 'Instructor') {
                setActiveTab('instructor_dashboard');
            } else {
                setActiveTab('overview');
            }
        } else {
            setAuthError('Invalid email or password. Please check your credentials.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setEmail('');
        setPassword('');
        setActiveTab('overview');
    };

    // Role Management Handlers
    const handleAddStaff = (e) => {
        e.preventDefault();
        if (!newStaffName || !newStaffEmail || !newStaffPassword) return;
        setStaffList([...staffList, { 
            id: Date.now(), 
            name: newStaffName, 
            email: newStaffEmail, 
            password: newStaffPassword, 
            role: newStaffRole 
        }]);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPassword('');
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
        setAnnouncementsList([
            { 
                id: Date.now(), 
                author: currentUser.name, 
                text: announcement, 
                target: currentUser.role === 'Super Admin' ? 'All Institute' : 'Assigned Courses' 
            }, 
            ...announcementsList
        ]);
        setAnnouncement('');
    };

    const handleAssessmentUpdate = (id, newScore, newFeedback) => {
        setAssessments(assessments.map(item => item.id === id ? { ...item, score: newScore, feedback: newFeedback } : item));
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

    const handleSendReply = (id) => {
        const text = replyText[id];
        if (!text) return;
        setTickets(tickets.map(t => t.id === id ? { ...t, reply: text, status: 'Resolved' } : t));
    };

    const handleAddCoupon = (e) => {
        e.preventDefault();
        if (!couponCode || !couponDiscount) return;
        setCoupons([...coupons, { id: Date.now(), code: couponCode.toUpperCase(), discount: couponDiscount, status: 'Active' }]);
        setCouponCode('');
        setCouponDiscount('');
    };

    // If not logged in, show secure login gate
    if (!isAuthenticated) {
        return (
            <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '420px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '24px' }}>Staff & Admin Portal</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Log in with your designated staff credentials.</p>
                    </div>

                    {authError && (
                        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Staff Email</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@ilmhub.com"
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

                    {/* Quick Demo Credentials Help Box */}
                    <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', color: '#14532d' }}>Test Account Credentials:</strong>
                        <div>👑 Super Admin: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>admin@ilmhub.com</code> / <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>admin1234</code></div>
                        <div style={{ marginTop: '2px' }}>👨‍🏫 Instructor: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>farid@ilmhub.com</code> / <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>farid123</code></div>
                        <div style={{ marginTop: '2px' }}>📚 Store Manager: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>bilal@ilmhub.com</code> / <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>bilal123</code></div>
                    </div>

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
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h1 style={{ fontSize: '20px', color: '#14532d', margin: '0 0 4px 0' }}>Ilm-Hub Role-Based Control Portal</h1>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Logged in as: <strong>{currentUser?.name}</strong> &bull; <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{currentUser?.role}</span>
                    </div>
                </div>
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

            {/* Navigation Tabs */}
            <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 40px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {currentUser?.role === 'Super Admin' && (
                    <>
                        <button
                            onClick={() => setActiveTab('overview')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'overview' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            📊 Overview & Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('admissions')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'admissions' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'admissions' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            🎓 Admissions
                        </button>
                        <button
                            onClick={() => setActiveTab('student_records')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'student_records' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'student_records' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            📁 Student Records & Transcripts
                        </button>
                        <button
                            onClick={() => setActiveTab('bookstore')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'bookstore' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'bookstore' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            📚 Bookstore & Coupons
                        </button>
                        <button
                            onClick={() => setActiveTab('academics')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'academics' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'academics' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            📝 Schedules & Control
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'staff' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'staff' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            👥 Staff Accounts & Passwords
                        </button>
                    </>
                )}

                {currentUser?.role === 'Bookstore Manager' && (
                    <button
                        onClick={() => setActiveTab('bookstore')}
                        style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'bookstore' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'bookstore' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        📚 Bookstore & Coupons
                    </button>
                )}

                {currentUser?.role === 'Instructor' && (
                    <>
                        <button
                            onClick={() => setActiveTab('instructor_dashboard')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'instructor_dashboard' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'instructor_dashboard' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            👨‍🏫 My Semester Students & Grading
                        </button>
                        <button
                            onClick={() => setActiveTab('instructor_announcements')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'instructor_announcements' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'instructor_announcements' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            📢 Course Announcements
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            style={{ padding: '16px 4px', background: 'none', border: 'none', borderBottom: activeTab === 'support' ? '3px solid #14532d' : '3px solid transparent', color: activeTab === 'support' ? '#14532d' : '#64748b', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            💬 Support Inbox
                        </button>
                    </>
                )}
            </nav>

            {/* Main Content Area */}
            <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
                
                {/* 1. SUPER ADMIN: OVERVIEW */}
                {activeTab === 'overview' && currentUser?.role === 'Super Admin' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Enrolled Students</h4>
                                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#14532d' }}>{studentsDatabase.length}</div>
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
                                <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '13px' }}>Active Instructors</h4>
                                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0284c7' }}>
                                    {staffList.filter(s => s.role === 'Instructor').length}
                                </div>
                            </div>
                        </div>

                        {/* Institute Announcements */}
                        <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Manage Institute Announcements</h3>
                            <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                                <input 
                                    type="text" 
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                    placeholder="Type institute-wide announcement..."
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '280px' }}
                                />
                                <button 
                                    type="submit"
                                    style={{ padding: '12px 24px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Broadcast
                                </button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {announcementsList.map((item) => (
                                    <div key={item.id} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><strong>[{item.author}]</strong> {item.text}</div>
                                        <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{item.target}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* 2. SUPER ADMIN: STUDENT RECORDS & TRANSCRIPTS */}
                {activeTab === 'student_records' && currentUser?.role === 'Super Admin' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Comprehensive Student Records & Transcripts</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>View official student profiles, cumulative GPA ratings, active semester courses, and academic transcripts.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {studentsDatabase.map((student) => (
                                <div key={student.id} style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{student.name}</h4>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>Email: {student.email} &bull; Assigned Instructor: <strong>{student.instructorAssigned}</strong></div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Cumulative GPA</div>
                                            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a' }}>{student.gpa}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Enrolled Semester Courses:</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {student.enrolledCourses.map((c, idx) => (
                                                <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Official Academic Transcript:</div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ background: '#f1f5f9', color: '#64748b', textAlign: 'left' }}>
                                                    <th style={{ padding: '8px 12px' }}>Course Title</th>
                                                    <th style={{ padding: '8px 12px' }}>Semester</th>
                                                    <th style={{ padding: '8px 12px' }}>Final Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.transcript.map((t, idx) => (
                                                    <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                                                        <td style={{ padding: '8px 12px', color: '#0f172a' }}>{t.course}</td>
                                                        <td style={{ padding: '8px 12px', color: '#64748b' }}>{t.semester}</td>
                                                        <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#16a34a' }}>{t.grade}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. INSTRUCTOR: DASHBOARD (Quizzes, Assignments, Midterms, Finals for assigned students) */}
                {activeTab === 'instructor_dashboard' && currentUser?.role === 'Instructor' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Assigned Semester Students & Assessment Grading</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Grade quizzes, assignments, midterms, and final examinations for students enrolled in your courses.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {assessments.map((item) => (
                                <div key={item.id} style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ flex: 1, minWidth: '260px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>{item.course}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{item.type}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>Student Name: <strong>{item.student}</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                type="text" 
                                                defaultValue={item.score === 'Pending' ? '' : item.score}
                                                id={`score-${item.id}`}
                                                placeholder={`Score ${item.maxScore}`}
                                                style={{ width: '90px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold' }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const val = document.getElementById(`score-${item.id}`).value;
                                                    const fb = document.getElementById(`fb-${item.id}`).value;
                                                    handleAssessmentUpdate(item.id, val ? `${val} ${item.maxScore}` : 'Pending', fb);
                                                }}
                                                style={{ padding: '8px 14px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                Save Score
                                            </button>
                                        </div>
                                        <input 
                                            type="text" 
                                            id={`fb-${item.id}`}
                                            defaultValue={item.feedback}
                                            placeholder="Optional instructor comments..."
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                        />
                                        <div style={{ fontSize: '12px', color: item.score === 'Pending' ? '#d97706' : '#16a34a', fontWeight: 'bold' }}>
                                            Current Status: {item.score}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. INSTRUCTOR: COURSE ANNOUNCEMENTS */}
                {activeTab === 'instructor_announcements' && currentUser?.role === 'Instructor' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Publish Announcement to Enrolled Students</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Post updates, reminders, or schedule changes directly to students taking your semester courses.</p>
                        
                        <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                            <input 
                                type="text" 
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Type announcement for your semester students..."
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '280px' }}
                            />
                            <button 
                                type="submit"
                                style={{ padding: '12px 24px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Publish to Class
                            </button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {announcementsList.filter(a => a.author === currentUser.name || a.author === 'Super Admin').map((item) => (
                                <div key={item.id} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>
                                    <strong>[{item.author}]:</strong> {item.text}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ADMISSIONS TAB (Super Admin) */}
                {activeTab === 'admissions' && currentUser?.role === 'Super Admin' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
                )}

                {/* BOOKSTORE & COUPONS TAB */}
                {activeTab === 'bookstore' && (currentUser?.role === 'Super Admin' || currentUser?.role === 'Bookstore Manager') && (
                    <div>
                        <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                            <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Islamic Bookstore Inventory Management</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Upload new literature items, define pricing, and publish book covers directly to the public store.</p>
                            
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

                        <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Discount Code & Coupon Generator</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Create promo codes for bookstore shoppers.</p>
                            
                            <form onSubmit={handleAddCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <input 
                                    type="text" 
                                    placeholder="Coupon Code (e.g., EID50)" 
                                    required 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Discount Value (e.g., 50% OFF)" 
                                    required 
                                    value={couponDiscount}
                                    onChange={(e) => setCouponDiscount(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                />
                                <button 
                                    type="submit"
                                    style={{ padding: '10px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    Generate Coupon
                                </button>
                            </form>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                                {coupons.map((c) => (
                                    <div key={c.id} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#14532d', marginBottom: '4px' }}>{c.code}</div>
                                            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 'bold' }}>{c.discount}</div>
                                        </div>
                                        <button 
                                            onClick={() => setCoupons(coupons.filter(item => item.id !== c.id))}
                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* SCHEDULE MANAGEMENT TAB (Super Admin) */}
                {activeTab === 'academics' && currentUser?.role === 'Super Admin' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Course Schedule Management</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Publish weekly lecture timings and assign instructors.</p>
                        
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
                )}

                {/* STAFF ACCOUNTS TAB (Super Admin) */}
                {activeTab === 'staff' && currentUser?.role === 'Super Admin' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Staff Accounts & Individual Passwords</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Create distinct login emails and passwords for instructors and store managers with role-based restrictions.</p>
                        
                        <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <input 
                                type="text" 
                                placeholder="Staff Name" 
                                required 
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <input 
                                type="email" 
                                placeholder="Staff Email" 
                                required 
                                value={newStaffEmail}
                                onChange={(e) => setNewStaffEmail(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <input 
                                type="password" 
                                placeholder="Login Password" 
                                required 
                                value={newStaffPassword}
                                onChange={(e) => setNewStaffPassword(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <select 
                                value={newStaffRole}
                                onChange={(e) => setNewStaffRole(e.target.value)}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff' }}
                            >
                                <option value="Super Admin">Super Admin</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Bookstore Manager">Bookstore Manager</option>
                            </select>
                            <button 
                                type="submit"
                                style={{ padding: '10px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', gridColumn: '1 / -1' }}
                            >
                                Create Staff Account & Password
                            </button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {staffList.map((st) => (
                                <div key={st.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '2px' }}>{st.name}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>Email: {st.email} &bull; Password: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{st.password}</code></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: '#e0f2fe', color: '#0369a1' }}>
                                            {st.role}
                                        </span>
                                        {st.email !== 'admin@ilmhub.com' && (
                                            <button 
                                                onClick={() => setStaffList(staffList.filter(item => item.id !== st.id))}
                                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SUPPORT INBOX TAB (Instructor) */}
                {activeTab === 'support' && currentUser?.role === 'Instructor' && (
                    <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '8px', fontSize: '20px' }}>Student Support Inbox</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Direct inquiries sent by students enrolled in your courses.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {tickets.map((t) => (
                                <div key={t.id} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '2px' }}>{t.subject}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>From: <strong>{t.student}</strong></div>
                                        </div>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '12px', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold',
                                            background: t.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                                            color: t.status === 'Resolved' ? '#16a34a' : '#d97706'
                                        }}>
                                            {t.status}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '14px', color: '#334155', padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                        {t.message}
                                    </div>

                                    {t.reply ? (
                                        <div style={{ fontSize: '13px', color: '#16a34a', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                            <strong>Instructor Reply:</strong> {t.reply}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Type reply to student..." 
                                                value={replyText[t.id] || ''}
                                                onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', minWidth: '220px' }}
                                            />
                                            <button 
                                                onClick={() => handleSendReply(t.id)}
                                                style={{ padding: '10px 18px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                Send Reply & Resolve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}