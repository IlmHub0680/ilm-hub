'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const [applications, setApplications] = useState([]);
    const [userEmail, setUserEmail] = useState('test@gmail.com');
    
    // Reference for file picker dialog
    const fileInputRef = useRef(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    
    // Feature States
    const [assignments, setAssignments] = useState([
        { id: 1, code: 'ISL-101', title: 'Fiqh Research Essay: Principles of Modern Transactions', dueDate: '2026-08-10', status: 'Pending', grade: null },
        { id: 2, code: 'ARA-102', title: 'Morphology Exercise & Verb Conjugation Drill', dueDate: '2026-08-05', status: 'Submitted', grade: '92/100' },
        { id: 3, code: 'HAD-201', title: 'Hadith Classification & Isnad Analysis Report', dueDate: '2026-08-20', status: 'Pending', grade: null },
        { id: 4, code: 'NAH-204', title: 'Classical Arabic Syntax (Nahw)', dueDate: '2026-08-25', status: 'Pending', grade: null },
        { id: 5, code: 'SIR-106', title: 'Seerah of the Prophet', dueDate: '2026-08-30', status: 'Pending', grade: null },
        { id: 6, code: 'TAJ-105', title: 'Advanced Tajwid Rules & Recitation', dueDate: '2026-09-5', status: 'Pending', grade: null },
        { id: 7, code: 'AQD-104', title: 'Essentials of Islamic Creed (Aqidah)', dueDate: '2026-09-10', status: 'Pending', grade: null },
        { id: 8, code: 'TAF-103', title: 'Introduction to Tafsir Methodologies', dueDate: '2026-09-15', status: 'Pending', grade: null },
        { id: 9, code: 'QRN-207', title: 'QURAN (RECITAL) & HIFDH (MEMORIZATION)', dueDate: '2026-09-20', status: 'Pending', grade: null },
        { id: 10, code: 'THJ-100', title: 'SPELLINGS & WRITING', dueDate: '2026-09-25', status: 'Pending', grade: null },
    ]);
    const [announcements, setAnnouncements] = useState([
        { id: 1, title: 'Semester Registration Deadline Extended', date: 'July 26, 2026', content: 'The registration deadline for all returning and new students has been extended to August 5, 2026.' },
        { id: 2, title: 'Special Guest Lecture by Shaykh Farid', date: 'July 24, 2026', content: 'Join us this Friday at 4:00 PM GMT for a live virtual session on Advanced Quranic Morphology.' }
    ]);
    const [studyMaterials, setStudyMaterials] = useState([
        { id: 1, code: 'ISL-101', title: 'Introduction to Madhabs - Lecture Slides (PDF)', size: '4.2 MB' },
        { id: 2, code: 'ARA-102', title: 'Arabic Verb Charts & Root Tables (PDF)', size: '2.8 MB' },
        { id: 3, code: 'AQS-301', title: 'Aqeedah Core Text Commentary (eBook)', size: '12.5 MB' },
    ]);
    
    // Enhanced Fee Status with detailed breakdown and mobile money/card support including specific payment number input
    const [feeStatus, setFeeStatus] = useState({
        tuitionFee: 1000,
        semesterFee: 300,
        admissionFee: 200,
        totalFees: 1500,
        amountPaid: 1500,
        balance: 0,
        status: 'Fully Paid',
        history: [
            { date: '2026-06-15', reference: 'TRX-998214', method: 'Bank Transfer', amount: 1000, receiptNo: 'RCP-001', status: 'Confirmed' },
            { date: '2026-07-01', reference: 'TRX-999342', method: 'Mobile Money', amount: 500, receiptNo: 'RCP-002', status: 'Confirmed' }
        ]
    });
    const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNumber, setPaymentNumber] = useState(''); // Added payment number input state

    // Academic Profile Details
    const [academicInfo, setAcademicInfo] = useState({
        programme: "Advanced Islamic Studies & Qur'anic Sciences",
        level: "Level 200",
        semester: "First Semester, 2026/2027",
        sessionType: "Morning Session",
        nextClass: {
            date: "Tomorrow, August 11, 2026",
            time: "9:00 AM - 11:00 AM GMT",
            courseName: "Foundations of Islamic Jurisprudence (Fiqh)",
            instructor: "Imam Muhammad Jalaal Deen Umar"
        }
    });

    // Registration modification lock state (requires admin permission)
    const [registrationLocked, setRegistrationLocked] = useState(true);
    const [adminPermissionRequested, setAdminPermissionRequested] = useState(false);
    const [registeredCourses, setRegisteredCourses] = useState(['ISL-101', 'ARA-102', 'HAD-201']);

    // Private Tutoring with fees, other charges, and admin approval check
    const [tutoringRequests, setTutoringRequests] = useState([
        { id: 1, subject: 'Arabic Morphology & Grammar', tutor: 'Shaykh Farid Abdul Samad', date: '2026-08-12', time: '10:00 AM GMT', privateCourseFee: 150, otherCharges: 25, status: 'Approved by Admin' }
    ]);
    const [newTutoring, setNewTutoring] = useState({ subject: '', tutor: '', date: '', time: '', privateCourseFee: 120, otherCharges: 20 });

    // Notifications state
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'Academic', text: 'Your Grade for ARA-102 has been published.', date: 'Aug 8, 2026', read: false },
        { id: 2, type: 'Materials', text: 'New learning material uploaded for ISL-101.', date: 'Aug 7, 2026', read: false },
        { id: 3, type: 'Payment', text: 'Payment confirmation received for TRX-999342.', date: 'Jul 1, 2026', read: true },
        { id: 4, type: 'Schedule', text: 'Class schedule change for TAF-401.', date: 'Jun 28, 2026', read: true }
    ]);

    // Attendance State
    const [attendanceRecords, setAttendanceRecords] = useState([
        { code: 'ISL-101', title: 'Foundations of Islamic Jurisprudence', totalClasses: 20, attended: 18, absences: 2, percentage: '90%' },
        { code: 'ARA-102', title: 'Quranic Arabic & Morphology', totalClasses: 18, attended: 15, absences: 3, percentage: '83.3%' },
        { code: 'HAD-201', title: 'Hadith Terminology & Narrations', totalClasses: 15, attended: 14, absences: 1, percentage: '93.3%' }
    ]);

    // Assessments & Online Quizzes State
    const [assessments, setAssessments] = useState([
        { id: 1, code: 'ISL-101', title: 'Midterm Quiz: Fiqh Principles', type: 'Online Quiz', schedule: 'Aug 15, 2026 - 10:00 AM', status: 'Available', score: null },
        { id: 2, code: 'ARA-102', title: 'Verb Conjugation Test', type: 'Assignment Assessment', schedule: 'Aug 04, 2026', status: 'Completed', score: '28/30 (Published)' },
        { id: 3, code: 'HAD-201', title: 'Isnad Chain Analysis Assessment', type: 'Online Quiz', schedule: 'Aug 20, 2026', status: 'Upcoming', score: null }
    ]);

    // Support & Helpdesk Message State
    const [supportMessages, setSupportMessages] = useState([
        { id: 1, sender: 'Admin', recipient: 'Khalid Muhammad', text: 'Welcome to the semester helpdesk. How can we assist you today?', date: 'Aug 01, 2026' }
    ]);
    const [newSupportMsg, setNewSupportMsg] = useState({ recipient: 'Admin', text: '' });

    // Official Document Requests State
    const [documentRequests, setDocumentRequests] = useState([
        { id: 1, docType: 'Official Transcript', reason: 'Scholarship Application', date: '2026-07-20', status: 'Completed' }
    ]);
    const [newDocType, setNewDocType] = useState('Official Transcript');
    const [docReason, setDocReason] = useState('');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('ilm_applications') || '[]');
        setApplications(saved);
    }, []);

    const myApp = applications.find(a => a.email.toLowerCase() === userEmail.toLowerCase()) || applications[0] || {
        fullName: 'Khalid Muhammad Sulaiman',
        email: 'test@gmail.com',
        highestQualification: "Bachelor's Degree",
        institution: 'University of Science',
        graduationYear: '2025',
        status: 'Approved'
    };

    const instructorsList = [
        'Imam Muhammad Jalaal Deen Umar',
        'Shaykh Farid Abdul Samad',
        'Shaykh Ahmad Abdullahi Dawud',
        'Shaykh Albani Bupei',
        'Shaykh Muhammad Hasan Zahid',
        'Shaykh Muhammad Nazih',
        'Shaykh Armiya Tahir Abdul Mumin',
        'Shaykh Khalid Muhammad Sulaiman',
        'Shaykh Aliyu Ibrahim'
    ];

    const coursesList = [
        { 
            code: 'ISL-101', 
            title: 'Foundations of Islamic Jurisprudence (Fiqh)', 
            instructor: instructorsList[0], 
            description: 'Comprehensive study of sources of Islamic law, Shariah objectives, and primary methodologies of legal deduction.',
            material: 'ISL-101 Comprehensive Core Notes & Slides (PDF)',
            schedule: 'Mondays & Wednesdays, 9:00 AM GMT',
            progress: 85, assignment: 14, quiz: 14, midterm: 18, final: 46, total: 92 
        },
        { 
            code: 'ARA-102', 
            title: 'Quranic Arabic & Morphology', 
            instructor: instructorsList[1], 
            description: 'Advanced morphological structures (Sarf), root word patterns, and semantic analysis of classical Quranic expressions.',
            material: 'Arabic Verb Charts & Root Tables (PDF)',
            schedule: 'Tuesdays & Thursdays, 11:00 AM GMT',
            progress: 60, assignment: 12, quiz: 13, midterm: 16, final: 44, total: 85 
        },
        { 
            code: 'HAD-201', 
            title: 'Hadith Terminology & Narrations', 
            instructor: instructorsList[2], 
            description: 'Classification of prophetic traditions, evaluation of transmitters (Jarh wa Ta\'dil), and authentic sunnah canons.',
            material: 'Hadith Classification & Isnad Compendium (PDF)',
            schedule: 'Fridays, 2:00 PM GMT',
            progress: 45, assignment: 13, quiz: 12, midterm: 15, final: 42, total: 82 
        },
        { 
            code: 'AQS-301', 
            title: 'Aqeedah & Islamic Creed', 
            instructor: instructorsList[3], 
            description: 'Core theological doctrines of Ahl al-Sunnah wal-Jama\'ah with refutations of deviant philosophical thoughts.',
            material: 'Aqeedah Core Text Commentary (eBook)',
            schedule: 'Wednesdays, 1:00 PM GMT',
            progress: 90, assignment: 15, quiz: 14, midterm: 19, final: 48, total: 96 
        },
        { 
            code: 'TAF-401', 
            title: 'Quranic Tafseer & Exegesis', 
            instructor: instructorsList[4], 
            description: 'Expository analysis of selected chapters of the Holy Qur\'an utilizing classical and modern exegetical approaches.',
            material: 'Tafseer Notes Volume 1 (PDF)',
            schedule: 'Mondays, 3:00 PM GMT',
            progress: 50, assignment: 13, quiz: 13, midterm: 17, final: 43, total: 86 
        },
        { 
            code: 'TAJ-101', 
            title: 'Tajwid (Qur\'an Proficiency)', 
            instructor: instructorsList[5], 
            description: 'Mastery of articulation points (Makharij), phonetic rules, and melodious recitation of the divine text.',
            material: 'Tajwid Rules Summary Chart',
            schedule: 'Tuesdays, 9:00 AM GMT',
            progress: 80, assignment: 14, quiz: 14, midterm: 18, final: 45, total: 91 
        },
        { 
            code: 'HIF-102', 
            title: 'Hifdh (Memorization)', 
            instructor: instructorsList[6], 
            description: 'Structured memorization technique, retention strategies, and regular revision protocols under direct supervision.',
            material: 'Hifdh Tracking Schedule & Juz Guides',
            schedule: 'Thursdays, 8:00 AM GMT',
            progress: 75, assignment: 13, quiz: 13, midterm: 17, final: 45, total: 88 
        },
        { 
            code: 'TAR-201', 
            title: 'Tarbiyah (Islamic education)', 
            instructor: instructorsList[7], 
            description: 'Spiritual purification, moral training, and character building in light of Prophetic guidance.',
            material: 'Tarbiyah Workbook & Ethical Readings',
            schedule: 'Saturdays, 10:00 AM GMT',
            progress: 70, assignment: 12, quiz: 12, midterm: 16, final: 42, total: 82 
        },
        { 
            code: 'SEE-301', 
            title: 'Seerah (Life of the Prophet)', 
            instructor: instructorsList[8], 
            description: 'Biographical study of Prophet Muhammad (PBUH), key historical milestones, lessons, and strategic insights.',
            material: 'Seerah Timeline & Analysis Guide',
            schedule: 'Saturdays, 1:00 PM GMT',
            progress: 88, assignment: 14, quiz: 14, midterm: 19, final: 47, total: 94 
        },
        { 
            code: 'QUR-401', 
            title: 'Qur\'an (Recital)', 
            instructor: instructorsList[0], 
            description: 'Advanced recitation practice focusing on fluency, Waqf (pauses), and Ibtida (resumption rules).',
            material: 'Qur\'an Recital Audio References',
            schedule: 'Sundays, 10:00 AM GMT',
            progress: 92, assignment: 15, quiz: 15, midterm: 20, final: 49, total: 99 
        }
    ];

    // Instructor-created sessions (Live classes)
    const [liveClassesList, setLiveClassesList] = useState([
        { id: 1, courseName: 'Foundations of Islamic Jurisprudence (ISL-101)', instructor: instructorsList[0], date: '2026-08-11', startTime: '6:00 PM GMT', endTime: '7:30 PM GMT', meetingPlatform: 'Zoom Secure Virtual Hall', link: '#' },
        { id: 2, courseName: 'Quranic Arabic & Morphology (ARA-102)', instructor: instructorsList[1], date: '2026-08-12', startTime: '4:00 PM GMT', endTime: '5:30 PM GMT', meetingPlatform: 'Google Meet Institute Portal', link: '#' },
        { id: 3, courseName: 'Hadith Terminology & Narrations (HAD-201)', instructor: instructorsList[2], date: '2026-08-13', startTime: '5:30 PM GMT', endTime: '7:00 PM GMT', meetingPlatform: 'Zoom Secure Virtual Hall', link: '#' }
    ]);

    const handleFileClick = (id) => {
        setSelectedAssignmentId(id);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && selectedAssignmentId) {
            setAssignments(assignments.map(a => a.id === selectedAssignmentId ? { ...a, status: 'Submitted', grade: 'Pending Review' } : a));
            alert(`File "${file.name}" successfully uploaded and submitted!`);
            setSelectedAssignmentId(null);
            e.target.value = null;
        }
    };

    const toggleCourseRegistration = (code) => {
        if (registrationLocked) {
            alert('Course registration is locked. You cannot modify registered courses unless permission is granted by admin.');
            return;
        }
        if (registeredCourses.includes(code)) {
            setRegisteredCourses(registeredCourses.filter(c => c !== code));
        } else {
            setRegisteredCourses([...registeredCourses, code]);
        }
    };

    const requestAdminPermission = () => {
        setAdminPermissionRequested(true);
        alert('Permission request sent to Administrator successfully!');
    };

    const handleBookTutoring = (e) => {
        e.preventDefault();
        if (!newTutoring.subject || !newTutoring.tutor || !newTutoring.date || !newTutoring.time) {
            alert('Please fill in all required fields for private tutoring.');
            return;
        }
        const newReq = {
            id: tutoringRequests.length + 1,
            ...newTutoring,
            status: 'Pending Super Admin Approval'
        };
        setTutoringRequests([...tutoringRequests, newReq]);
        setNewTutoring({ subject: '', tutor: '', date: '', time: '', privateCourseFee: 120, otherCharges: 20 });
        alert('Private tutoring session requested! Awaiting Super Admin approval before payment.');
    };

    const handleMakePayment = (e) => {
        e.preventDefault();
        if (!paymentAmount || isNaN(paymentAmount)) {
            alert('Please enter a valid payment amount.');
            return;
        }
        if (!paymentNumber) {
            alert('Please enter the payment account or phone number.');
            return;
        }
        const amt = parseFloat(paymentAmount);
        const newBalance = Math.max(0, feeStatus.balance - amt);
        const newTotalPaid = feeStatus.amountPaid + amt;
        const newHistoryItem = {
            date: new Date().toISOString().split('T')[0],
            reference: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
            method: `${paymentMethod} (${paymentNumber})`,
            amount: amt,
            receiptNo: 'RCP-' + Math.floor(100 + Math.random() * 900),
            status: 'Confirmed'
        };

        setFeeStatus({
            ...feeStatus,
            amountPaid: newTotalPaid,
            balance: newBalance,
            status: newBalance === 0 ? 'Fully Paid' : 'Partially Paid',
            history: [newHistoryItem, ...feeStatus.history]
        });
        setPaymentAmount('');
        setPaymentNumber('');
        alert(`Payment of $${amt} via ${paymentMethod} (${paymentNumber}) processed successfully! Receipt generated.`);
    };

    const handleSendSupportMessage = (e) => {
        e.preventDefault();
        if (!newSupportMsg.text.trim()) {
            alert('Please type a message before sending.');
            return;
        }
        const msg = {
            id: supportMessages.length + 1,
            sender: 'Khalid Muhammad (Student)',
            recipient: newSupportMsg.recipient,
            text: newSupportMsg.text,
            date: new Date().toLocaleDateString()
        };
        setSupportMessages([...supportMessages, msg]);
        setNewSupportMsg({ recipient: 'Admin', text: '' });
        alert('Message sent successfully to ' + msg.recipient + '!');
    };

    const handleRequestDocument = (e) => {
        e.preventDefault();
        if (!docReason.trim()) {
            alert('Please provide a reason for the document request.');
            return;
        }
        const newReq = {
            id: documentRequests.length + 1,
            docType: newDocType,
            reason: docReason,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending Review'
        };
        setDocumentRequests([...documentRequests, newReq]);
        setDocReason('');
        alert('Official document request submitted successfully!');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
            {/* Hidden file input dialog */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx,.txt"
            />

            {/* Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#14532d', color: '#ffffff', padding: '30px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#ffffff' }}>Student Portal</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button onClick={() => setActiveTab('profile')} style={{ textAlign: 'left', background: activeTab === 'profile' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Profile & Information</button>
                        <button onClick={() => setActiveTab('registration')} style={{ textAlign: 'left', background: activeTab === 'registration' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Course Registration</button>
                        <button onClick={() => setActiveTab('courses')} style={{ textAlign: 'left', background: activeTab === 'courses' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Enrolled Courses</button>
                        <button onClick={() => setActiveTab('liveClasses')} style={{ textAlign: 'left', background: activeTab === 'liveClasses' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Live Classes (Sessions)</button>
                        <button onClick={() => setActiveTab('tutoring')} style={{ textAlign: 'left', background: activeTab === 'tutoring' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Private Tutoring</button>
                        <button onClick={() => setActiveTab('assessments')} style={{ textAlign: 'left', background: activeTab === 'assessments' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Assessments & Quizzes</button>
                        <button onClick={() => setActiveTab('attendance')} style={{ textAlign: 'left', background: activeTab === 'attendance' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Attendance Records</button>
                        <button onClick={() => setActiveTab('assignments')} style={{ textAlign: 'left', background: activeTab === 'assignments' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Assignments & Submissions</button>
                        <button onClick={() => setActiveTab('materials')} style={{ textAlign: 'left', background: activeTab === 'materials' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Study Materials & Resources</button>
                        <button onClick={() => setActiveTab('calendar')} style={{ textAlign: 'left', background: activeTab === 'calendar' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Academic Calendar</button>
                        <button onClick={() => setActiveTab('grades')} style={{ textAlign: 'left', background: activeTab === 'grades' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Grades & Transcripts</button>
                        <button onClick={() => setActiveTab('fees')} style={{ textAlign: 'left', background: activeTab === 'fees' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Fee Statement & Payments</button>
                        <button onClick={() => setActiveTab('notifications')} style={{ textAlign: 'left', background: activeTab === 'notifications' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Notifications Center</button>
                        <button onClick={() => setActiveTab('announcements')} style={{ textAlign: 'left', background: activeTab === 'announcements' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Announcements & News</button>
                        <button onClick={() => setActiveTab('exams')} style={{ textAlign: 'left', background: activeTab === 'exams' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Exams & Certificates</button>
                        <button onClick={() => setActiveTab('acceptance')} style={{ textAlign: 'left', background: activeTab === 'acceptance' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Records & Letters</button>
                        <button onClick={() => setActiveTab('support')} style={{ textAlign: 'left', background: activeTab === 'support' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Support & Helpdesk</button>
                        
                        {/* Logout Button */}
                        <button 
                            onClick={() => {
                                localStorage.removeItem('ilm_applications');
                                alert('You have been logged out successfully.');
                                window.location.href = '/';
                            }}
                            style={{ textAlign: 'left', background: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div>
                    <Link href="/" style={{ display: 'block', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', padding: '10px 0' }}>
                        &larr; Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', color: '#14532d', margin: 0 }}>Student Dashboard</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Welcome back, Khalid Muhammad Sulaiman</p>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#334155' }}>
                        Admission Status: <span style={{ color: myApp.status === 'Approved' ? '#16a34a' : '#d97706' }}>{myApp.status}</span>
                    </div>
                </div>

                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '900px' }}>
                        {/* Academic Summary Card */}
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <h2 style={{ fontSize: '20px', color: '#14532d', marginTop: 0, marginBottom: '16px' }}>Current Academic Overview</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>Current Academic Programme</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '14px' }}>{academicInfo.programme}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>Current Level</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '14px' }}>{academicInfo.level}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>Current Semester</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '14px' }}>{academicInfo.semester}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>Assigned Session</p>
                                    <p style={{ fontWeight: 'bold', color: '#16a34a', margin: 0, fontSize: '14px' }}>{academicInfo.sessionType}</p>
                                </div>
                            </div>

                            {/* Next Class Widget */}
                            <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                <h4 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '15px' }}>📅 Next Scheduled Class</h4>
                                <p style={{ margin: '0 0 4px 0', color: '#111827', fontWeight: 'bold' }}>{academicInfo.nextClass.courseName}</p>
                                <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '14px' }}>Instructor: {academicInfo.nextClass.instructor}</p>
                                <p style={{ margin: 0, color: '#047857', fontSize: '13px', fontWeight: '500' }}>{academicInfo.nextClass.date} at {academicInfo.nextClass.time}</p>
                            </div>
                        </div>

                        {/* Personal Bio Card */}
                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '22px', color: '#14532d', marginTop: 0, marginBottom: '20px' }}>Student Profile & Personal Information</h2>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#14532d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', border: '2px solid #16a34a' }}>
                                    KM
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px' }}>Khalid Muhammad Sulaiman</h3>
                                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '14px' }}>Institute ID: <strong>ILM-2026-8842</strong></p>
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Enrollment Status: Active</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Full Name</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>Khalid Muhammad Sulaiman</p>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Email Address</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>{myApp.email}</p>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Phone Number</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>+233 24 123 4567</p>
                                </div>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Highest Qualification</p>
                                    <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>{myApp.highestQualification}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Registration View with Admin Lock Protection */}
                {activeTab === 'registration' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 6px 0' }}>Semester Course Registration</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>View and manage registered courses. Modification is locked unless permission is granted by admin.</p>
                            </div>
                            <div>
                                {registrationLocked ? (
                                    <button 
                                        onClick={requestAdminPermission}
                                        style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {adminPermissionRequested ? 'Permission Requested (Pending)' : 'Request Admin Permission to Edit'}
                                    </button>
                                ) : (
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>Edit Permission Granted</span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {coursesList.map((course, idx) => {
                                const isRegistered = registeredCourses.includes(course.code);
                                return (
                                    <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', color: '#334155' }}>{course.code}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isRegistered ? '#16a34a' : '#64748b' }}>{isRegistered ? 'Registered' : 'Available'}</span>
                                            </div>
                                            <h3 style={{ color: '#14532d', margin: '10px 0 6px 0', fontSize: '16px' }}>{course.title}</h3>
                                            <p style={{ color: '#334155', fontSize: '13px', margin: '0 0 8px 0', lineHeight: '1.5' }}>{course.description}</p>
                                            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}><strong>Instructor:</strong> {course.instructor}</p>
                                        </div>
                                        <button 
                                            onClick={() => toggleCourseRegistration(course.code)}
                                            style={{ 
                                                background: registrationLocked ? '#94a3b8' : (isRegistered ? '#dc2626' : '#16a34a'), 
                                                color: '#fff', 
                                                border: 'none', 
                                                padding: '8px 12px', 
                                                borderRadius: '6px', 
                                                fontWeight: 'bold', 
                                                cursor: registrationLocked ? 'not-allowed' : 'pointer' 
                                            }}
                                        >
                                            {isRegistered ? 'Drop Course' : 'Register Course'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Enrolled Courses Details View */}
                {activeTab === 'courses' && (
                    <div>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Enrolled Courses & Materials</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                            {coursesList.map((course, idx) => (
                                <div key={idx} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', color: '#334155' }}>{course.code}</span>
                                        <h3 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>{course.title}</h3>
                                        <p style={{ color: '#334155', fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.5' }}>{course.description}</p>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#0f172a' }}><strong>Instructor:</strong> {course.instructor}</p>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#0f172a' }}><strong>Schedule:</strong> {course.schedule}</p>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#16a34a' }}><strong>Material:</strong> {course.material}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                                            <div style={{ background: '#16a34a', width: course.progress + '%', height: '100%' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>Progress: {course.progress}%</span>
                                            <button onClick={() => alert(`Downloading material for ${course.code}...`)} style={{ background: '#14532d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Get Course Material
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Live Classes (Instructor-Created Sessions) View */}
                {activeTab === 'liveClasses' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Instructor-Created Live Sessions</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Access your scheduled virtual classroom sessions created by course instructors.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {liveClassesList.map((cls) => (
                                <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 6px 0', color: '#14532d', fontSize: '18px' }}>{cls.courseName}</h3>
                                        <p style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '14px' }}><strong>Instructor:</strong> {cls.instructor}</p>
                                        <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}><strong>Date & Time:</strong> {cls.date} | {cls.startTime} - {cls.endTime}</p>
                                        <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>Platform: {cls.meetingPlatform}</span>
                                    </div>
                                    <a href={cls.link} onClick={(e) => { e.preventDefault(); alert(`Connecting to ${cls.meetingPlatform}...`); }} style={{ background: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                                        Join Meeting
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Private Tutoring View with Fees, Other Charges, & Super Admin Approval */}
                {activeTab === 'tutoring' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Request Private Tutoring</h2>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>Book 1-on-1 tutoring. Payment can be made only after Super Admin approval.</p>
                            <form onSubmit={handleBookTutoring} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Subject / Topic</label>
                                    <input 
                                        type="text" 
                                        value={newTutoring.subject} 
                                        onChange={(e) => setNewTutoring({...newTutoring, subject: e.target.value})}
                                        placeholder="e.g., Advanced Fiqh Inheritance" 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Preferred Tutor</label>
                                    <select 
                                        value={newTutoring.tutor} 
                                        onChange={(e) => setNewTutoring({...newTutoring, tutor: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="">Select an Instructor</option>
                                        {instructorsList.map((inst, i) => (
                                            <option key={i} value={inst}>{inst}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Preferred Date</label>
                                    <input 
                                        type="date" 
                                        value={newTutoring.date} 
                                        onChange={(e) => setNewTutoring({...newTutoring, date: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Time Slot</label>
                                    <input 
                                        type="text" 
                                        value={newTutoring.time} 
                                        onChange={(e) => setNewTutoring({...newTutoring, time: e.target.value})}
                                        placeholder="e.g., 3:00 PM GMT" 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Private Course Fee: <strong>${newTutoring.privateCourseFee}</strong></span>
                                    <span>Other Charges (Materials/Admin): <strong>${newTutoring.otherCharges}</strong></span>
                                    <span>Total Estimated: <strong>${newTutoring.privateCourseFee + newTutoring.otherCharges}</strong></span>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Submit Tutoring Booking Request
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>Your Tutoring Appointments & Fee Breakdown</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                        <th style={{ padding: '10px' }}>Subject</th>
                                        <th style={{ padding: '10px' }}>Tutor</th>
                                        <th style={{ padding: '10px' }}>Date & Time</th>
                                        <th style={{ padding: '10px' }}>Fees & Charges</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tutoringRequests.map((req) => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#14532d' }}>{req.subject}</td>
                                            <td style={{ padding: '12px' }}>{req.tutor}</td>
                                            <td style={{ padding: '12px', color: '#64748b' }}>{req.date} at {req.time}</td>
                                            <td style={{ padding: '12px' }}>${(req.privateCourseFee || 150) + (req.otherCharges || 25)}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: req.status.includes('Approved') ? '#dcfce7' : '#fef3c7', color: req.status.includes('Approved') ? '#16a34a' : '#d97706' }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {req.status.includes('Approved') ? (
                                                    <button onClick={() => alert('Payment portal opened for tutoring session.')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                        Make Payment
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Awaiting Admin Approval</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Assessments & Online Quizzes View */}
                {activeTab === 'assessments' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Online Quizzes & Assessments</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>View available assessments, completed exams, and publication scores.</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course</th>
                                    <th style={{ padding: '12px' }}>Assessment Title</th>
                                    <th style={{ padding: '12px' }}>Type</th>
                                    <th style={{ padding: '12px' }}>Schedule / Deadline</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Score</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assessments.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#14532d' }}>{item.code}</td>
                                        <td style={{ padding: '14px' }}>{item.title}</td>
                                        <td style={{ padding: '14px' }}>{item.type}</td>
                                        <td style={{ padding: '14px', color: '#64748b' }}>{item.schedule}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: item.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: item.status === 'Completed' ? '#16a34a' : '#d97706' }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: item.score ? '#16a34a' : '#64748b' }}>{item.score || 'Pending Publication'}</td>
                                        <td style={{ padding: '14px' }}>
                                            {item.status === 'Available' ? (
                                                <button onClick={() => alert(`Launching online assessment: ${item.title}`)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    Take Quiz
                                                </button>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>Viewed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Attendance Records View (View-only, cannot edit) */}
                {activeTab === 'attendance' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 6px 0' }}>Attendance Records & History</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>View your attendance percentage and recorded absences. Attendance records are managed by instructors and cannot be edited by students.</p>
                            </div>
                            <span style={{ background: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>🔒 View-Only Mode</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course Code</th>
                                    <th style={{ padding: '12px' }}>Course Title</th>
                                    <th style={{ padding: '12px' }}>Total Classes</th>
                                    <th style={{ padding: '12px' }}>Classes Attended</th>
                                    <th style={{ padding: '12px' }}>Absences Recorded</th>
                                    <th style={{ padding: '12px' }}>Attendance Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map((att, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#14532d' }}>{att.code}</td>
                                        <td style={{ padding: '14px' }}>{att.title}</td>
                                        <td style={{ padding: '14px' }}>{att.totalClasses}</td>
                                        <td style={{ padding: '14px', color: '#16a34a', fontWeight: 'bold' }}>{att.attended}</td>
                                        <td style={{ padding: '14px', color: '#dc2626', fontWeight: 'bold' }}>{att.absences}</td>
                                        <td style={{ padding: '14px', fontWeight: 'bold' }}>
                                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                                                {att.percentage}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Assignments & Submissions</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course</th>
                                    <th style={{ padding: '12px' }}>Assignment Title</th>
                                    <th style={{ padding: '12px' }}>Due Date</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Grade</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#14532d' }}>{item.code}</td>
                                        <td style={{ padding: '14px' }}>{item.title}</td>
                                        <td style={{ padding: '14px', color: '#64748b' }}>{item.dueDate}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: item.status === 'Submitted' ? '#dcfce7' : '#fef3c7', color: item.status === 'Submitted' ? '#16a34a' : '#d97706' }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px', fontWeight: 'bold' }}>{item.grade || '—'}</td>
                                        <td style={{ padding: '14px' }}>
                                            {item.status === 'Pending' ? (
                                                <button onClick={() => handleFileClick(item.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Upload & Submit
                                                </button>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>Submitted</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Study Materials & Lecture Notes</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {studyMaterials.map((mat) => (
                                <div key={mat.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>{mat.code}</span>
                                    <h4 style={{ color: '#14532d', margin: '10px 0 6px 0' }}>{mat.title}</h4>
                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>File Size: {mat.size}</p>
                                    <button onClick={() => alert(`Downloading ${mat.title}...`)} style={{ background: '#14532d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: '100%' }}>
                                        Download PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Academic Calendar View */}
                {activeTab === 'calendar' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '900px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Academic Calendar (2026/2027)</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Month, Year, Semester Dates, Class Schedules, Examination Dates, Vacation Periods, and Resumption Dates.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#14532d', margin: '0 0 10px 0', fontSize: '16px' }}>🗓️ August 2026</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', lineHeight: '1.8', fontSize: '14px' }}>
                                    <li><strong>Aug 5, 2026:</strong> Course Registration Deadline</li>
                                    <li><strong>Aug 10, 2026:</strong> First Semester Lectures Resume Fully</li>
                                    <li><strong>Aug 24 - Aug 28, 2026:</strong> Midterm Examination Week</li>
                                </ul>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#14532d', margin: '0 0 10px 0', fontSize: '16px' }}>🗓️ September 2026</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', lineHeight: '1.8', fontSize: '14px' }}>
                                    <li><strong>Sep 15, 2026:</strong> Quiz & Assignment Submission Window</li>
                                    <li><strong>Sep 25, 2026:</strong> End of Semester Vacation Begins</li>
                                    <li><strong>Sep 30, 2026:</strong> Semester Resumption Date for Next Term</li>
                                </ul>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Full Semester Schedule Overview</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '10px' }}>Event / Period</th>
                                    <th style={{ padding: '10px' }}>Date Range</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>First Semester Lectures</td>
                                    <td style={{ padding: '12px' }}>June 11, 2026 – August 20, 2026</td>
                                    <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>Active</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>End of Semester Final Examinations</td>
                                    <td style={{ padding: '12px' }}>Late August 2026</td>
                                    <td style={{ padding: '12px', color: '#d97706', fontWeight: 'bold' }}>Upcoming</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>Vacation Period</td>
                                    <td style={{ padding: '12px' }}>September 1 – September 25, 2026</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>Scheduled</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>Resumption Date (New Semester)</td>
                                    <td style={{ padding: '12px' }}>September 30, 2026</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>Scheduled</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Grades & Transcripts View with Assignment (15), Quiz (15), Midterm (20), Final (50) */}
                {activeTab === 'grades' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 6px 0' }}>Academic Grades & Transcripts</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Grades are officially published and visible after board approval. (Assignment: 15, Quiz: 15, Midterm: 20, Final: 50)</p>
                            </div>
                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Status: Approved & Published</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course Code</th>
                                    <th style={{ padding: '12px' }}>Course Title</th>
                                    <th style={{ padding: '12px' }}>Assignment (15)</th>
                                    <th style={{ padding: '12px' }}>Quiz (15)</th>
                                    <th style={{ padding: '12px' }}>Midterm (20)</th>
                                    <th style={{ padding: '12px' }}>Final (50)</th>
                                    <th style={{ padding: '12px' }}>Total (100)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coursesList.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold' }}>{c.code}</td>
                                        <td style={{ padding: '14px' }}>{c.title}</td>
                                        <td style={{ padding: '14px' }}>{c.assignment}</td>
                                        <td style={{ padding: '14px' }}>{c.quiz}</td>
                                        <td style={{ padding: '14px' }}>{c.midterm}</td>
                                        <td style={{ padding: '14px' }}>{c.final}</td>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#16a34a' }}>{c.total} / 100</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Fee Statement & Payments View with Mobile Money, Debit Card, Credit and Payment Number Input */}
                {activeTab === 'fees' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '900px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Fee Statement & Payment Gateway</h2>
                        
                        {/* Fee Breakdown Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Tuition Fees</p>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>${feeStatus.tuitionFee}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Semester Fee</p>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>${feeStatus.semesterFee}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Admission Fee Paid</p>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>${feeStatus.admissionFee}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Total Fees</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>${feeStatus.totalFees}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Amount Paid</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>${feeStatus.amountPaid}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Outstanding Balance</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>${feeStatus.balance}</p>
                            </div>
                        </div>

                        {/* Make Payment Form with Payment Number Input */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Make a Payment (Mobile Money, Debit Card, Credit)</h3>
                            <form onSubmit={handleMakePayment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Payment Method</label>
                                    <select 
                                        value={paymentMethod} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Mobile Money">Mobile Money (MTN/Vodafone)</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="Credit Card">Credit Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Payment Number / Account</label>
                                    <input 
                                        type="text" 
                                        value={paymentNumber} 
                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                        placeholder="e.g., +233241234567 or Card No." 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Amount ($)</label>
                                    <input 
                                        type="number" 
                                        value={paymentAmount} 
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="e.g., 100" 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Pay Now
                                    </button>
                                </div>
                            </form>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Payment History & Printable Receipts</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '10px' }}>Payment Date</th>
                                    <th style={{ padding: '10px' }}>Receipt No.</th>
                                    <th style={{ padding: '10px' }}>Reference</th>
                                    <th style={{ padding: '10px' }}>Payment Type</th>
                                    <th style={{ padding: '10px' }}>Amount</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeStatus.history.map((tx, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px' }}>{tx.date}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#14532d' }}>{tx.receiptNo}</td>
                                        <td style={{ padding: '12px' }}>{tx.reference}</td>
                                        <td style={{ padding: '12px' }}>{tx.method}</td>
                                        <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>${tx.amount}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{tx.status}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button onClick={() => alert(`Downloading & printing receipt ${tx.receiptNo}...`)} style={{ background: '#14532d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Download / Print
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Notifications Center */}
                {activeTab === 'notifications' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Notifications Center</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Academic notifications, new course materials, assignment deadlines, exam schedules, results, admin approvals, payment confirmations, payment reminders, announcements, vacation, resumption, instructor notes, and schedule changes.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notifications.map((notif) => (
                                <div key={notif.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#14532d', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{notif.type}</span>
                                        <p style={{ margin: '8px 0 4px 0', color: '#0f172a', fontWeight: 'bold', fontSize: '15px' }}>{notif.text}</p>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{notif.date}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: notif.read ? '#64748b' : '#16a34a', fontWeight: 'bold' }}>{notif.read ? 'Read' : 'New'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Institute Announcements & Semester News</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {announcements.map((item) => (
                                <div key={item.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h3 style={{ color: '#14532d', margin: 0, fontSize: '18px' }}>{item.title}</h3>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{item.date}</span>
                                    </div>
                                    <p style={{ color: '#334155', margin: 0, lineHeight: '1.6' }}>{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Exams & Verified Certificates</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>View your upcoming exam schedules and verified certificates upon course completion.</p>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ color: '#14532d', margin: '0 0 8px 0' }}>End of Semester Final Examinations</h4>
                            <p style={{ color: '#334155', margin: '0 0 12px 0', fontSize: '14px' }}>Scheduled for late August 2026. All online portals will be active 30 minutes prior to exam commencement.</p>
                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Status: Eligible</span>
                        </div>
                    </div>
                )}

                {/* Records & Letters View with Request Official Document feature */}
                {activeTab === 'acceptance' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Records & Official Documents</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Download official institutional documentation or request official documents from the admin desk.</p>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                            <button onClick={() => alert('Downloading Official Admission Letter...')} style={{ background: '#14532d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Download Admission Letter
                            </button>
                            <button onClick={() => alert('Downloading Enrollment Certificate...')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Download Enrollment Certificate
                            </button>
                        </div>

                        {/* Request Official Document Form */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Request an Official Document</h3>
                            <form onSubmit={handleRequestDocument} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Document Type</label>
                                    <select 
                                        value={newDocType} 
                                        onChange={(e) => setNewDocType(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Official Transcript">Official Transcript</option>
                                        <option value="Certificate of Enrollment">Certificate of Enrollment</option>
                                        <option value="Letter of Good Standing">Letter of Good Standing</option>
                                        <option value="English Proficiency Letter">English Proficiency Letter</option>
                                        <option value="Arabic Proficiency Letter">Arabic Proficiency Letter</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Reason / Purpose</label>
                                    <input 
                                        type="text" 
                                        value={docReason} 
                                        onChange={(e) => setDocReason(e.target.value)}
                                        placeholder="e.g., Visa application / Scholarship / Job application" 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Submit Document Request
                                    </button>
                                </div>
                            </form>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '10px' }}>Your Document Requests History</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '10px' }}>Document Type</th>
                                    <th style={{ padding: '10px' }}>Reason</th>
                                    <th style={{ padding: '10px' }}>Date Requested</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentRequests.map((doc, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#14532d' }}>{doc.docType}</td>
                                        <td style={{ padding: '12px' }}>{doc.reason}</td>
                                        <td style={{ padding: '12px', color: '#64748b' }}>{doc.date}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ background: doc.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: doc.status === 'Completed' ? '#16a34a' : '#d97706', padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {doc.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Support & Helpdesk View with Direct Messaging to Instructor or Admin */}
                {activeTab === 'support' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Support & Helpdesk Messaging</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Type and send a message directly to an instructor or the institute administration.</p>
                        
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                            <p style={{ margin: '0 0 6px 0', color: '#0f172a' }}><strong>Email Support:</strong> support@ilmhubinstitute.edu</p>
                            <p style={{ margin: '0 0 6px 0', color: '#0f172a' }}><strong>WhatsApp Helpdesk:</strong> +233 20 123 4567</p>
                            <p style={{ margin: 0, color: '#0f172a' }}><strong>Office Hours:</strong> Monday – Friday (9:00 AM – 5:00 PM GMT)</p>
                        </div>

                        {/* Send Message Form */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Send Direct Message</h3>
                            <form onSubmit={handleSendSupportMessage} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Recipient (Admin or Instructor)</label>
                                    <select 
                                        value={newSupportMsg.recipient} 
                                        onChange={(e) => setNewSupportMsg({...newSupportMsg, recipient: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Institute Administration">Institute Administration (Admin)</option>
                                        {instructorsList.map((inst, i) => (
                                            <option key={i} value={inst}>{inst}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Message</label>
                                    <textarea 
                                        rows="4" 
                                        value={newSupportMsg.text} 
                                        onChange={(e) => setNewSupportMsg({...newSupportMsg, text: e.target.value})}
                                        placeholder="Type your inquiry or message here..." 
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    ></textarea>
                                </div>
                                <div>
                                    <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>

                        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>Message History</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {supportMessages.map((msg) => (
                                <div key={msg.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#14532d', fontSize: '14px' }}>To: {msg.recipient}</span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{msg.date}</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}