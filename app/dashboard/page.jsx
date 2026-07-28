'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const [applications, setApplications] = useState([]);
    const [userEmail, setUserEmail] = useState('test@gmail.com');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('ilm_applications') || '[]');
        setApplications(saved);
    }, []);

    const myApp = applications.find(a => a.email.toLowerCase() === userEmail.toLowerCase()) || applications[0] || {
        fullName: 'Khalid Muhammad Sulaiman',
        email: 'test@gmail.com',
        highestQualification: 'Bachelor\'s Degree',
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
        'Shaykh Abdul Hanif Batsiadan',
        'Shaykh Armiya Tahir Abdul Mumin',
        'Shaykh Khalid Muhammad Sulaiman',
        'Shaykh Aliyu Ibrahim'
    ];

    const coursesList = [
        { code: 'ISL-101', title: 'Foundations of Islamic Jurisprudence (Fiqh)', instructor: instructorsList[0], progress: 85, quiz: 27, midterm: 29, final: 56, total: 112 },
        { code: 'ARA-102', title: 'Quranic Arabic & Morphology', instructor: instructorsList[1], progress: 60, quiz: 24, midterm: 26, final: 52, total: 102 },
        { code: 'HAD-201', title: 'Hadith Terminology & Narrations', instructor: instructorsList[2], progress: 45, quiz: 22, midterm: 25, final: 48, total: 95 },
        { code: 'AQS-301', title: 'Aqeedah & Islamic Creed', instructor: instructorsList[3], progress: 90, quiz: 28, midterm: 29, final: 58, total: 115 },
        { code: 'TAF-401', title: 'Quranic Tafseer & Exegesis', instructor: instructorsList[4], progress: 50, quiz: 25, midterm: 27, final: 50, total: 102 },
        { code: 'TAJ-101', title: 'Tajwid (Qur\'an Proficiency)', instructor: instructorsList[5], progress: 80, quiz: 26, midterm: 28, final: 54, total: 108 },
        { code: 'HIF-102', title: 'Hifdh (Memorization)', instructor: instructorsList[6], progress: 75, quiz: 25, midterm: 27, final: 53, total: 105 },
        { code: 'TAR-201', title: 'Tarbiyah (Islamic education)', instructor: instructorsList[7], progress: 70, quiz: 23, midterm: 26, final: 51, total: 100 },
        { code: 'SEE-301', title: 'Seerah (Life of the Prophet)', instructor: instructorsList[8], progress: 88, quiz: 28, midterm: 28, final: 57, total: 113 },
        { code: 'QUR-401', title: 'Qur\'an (Recital)', instructor: instructorsList[0], progress: 92, quiz: 29, midterm: 29, final: 59, total: 117 }
    ];

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#14532d', color: '#ffffff', padding: '30px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#ffffff' }}>Student Portal</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            style={{ textAlign: 'left', background: activeTab === 'profile' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Profile & Information
                        </button>
                        <button 
                            onClick={() => setActiveTab('courses')}
                            style={{ textAlign: 'left', background: activeTab === 'courses' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Enrolled Courses
                        </button>
                        <button 
                            onClick={() => setActiveTab('timetable')}
                            style={{ textAlign: 'left', background: activeTab === 'timetable' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Class Timetable
                        </button>
                        <button 
                            onClick={() => setActiveTab('grades')}
                            style={{ textAlign: 'left', background: activeTab === 'grades' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Grades & Transcripts
                        </button>
                        <button 
                            onClick={() => setActiveTab('exams')}
                            style={{ textAlign: 'left', background: activeTab === 'exams' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Exams & Certificates
                        </button>
                        <button 
                            onClick={() => setActiveTab('acceptance')}
                            style={{ textAlign: 'left', background: activeTab === 'acceptance' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Records & Letters
                        </button>
                        <button 
                            onClick={() => setActiveTab('support')}
                            style={{ textAlign: 'left', background: activeTab === 'support' ? '#16a34a' : 'transparent', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Support & Helpdesk
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
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '22px', color: '#14532d', marginTop: 0, marginBottom: '20px' }}>Student Profile & Educational Information</h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <img 
                                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=" 
                                alt="Student Avatar" 
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #16a34a' }} 
                            />
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px' }}>Khalid Muhammad Sulaiman</h3>
                                <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '14px' }}>Course of Study: <strong>Advanced Islamic Studies & Qur'anic Sciences</strong></p>
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
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Date of Birth</p>
                                <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>May 14, 1998</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Highest Qualification</p>
                                <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>{myApp.highestQualification}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Previous Institution</p>
                                <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>{myApp.institution}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Graduation Year</p>
                                <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>{myApp.graduationYear}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px 0' }}>Institute ID</p>
                                <p style={{ fontWeight: 'bold', color: '#0f172a', margin: 0, fontSize: '16px' }}>ILM-2026-8842</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Enrolled Courses (10 Courses)</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                            {coursesList.map((course, idx) => (
                                <div key={idx} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', color: '#334155' }}>{course.code}</span>
                                    <h3 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>{course.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>Instructor: {course.instructor}</p>
                                    <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                                        <div style={{ background: '#16a34a', width: course.progress + '%', height: '100%' }}></div>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Progress: {course.progress}% Complete</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'timetable' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Class Timetable (Weekly Schedule)</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course Code</th>
                                    <th style={{ padding: '12px' }}>Course Title</th>
                                    <th style={{ padding: '12px' }}>Instructor</th>
                                    <th style={{ padding: '12px' }}>Location / Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coursesList.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#14532d' }}>{c.code}</td>
                                        <td style={{ padding: '14px' }}>{c.title}</td>
                                        <td style={{ padding: '14px' }}>{c.instructor}</td>
                                        <td style={{ padding: '14px', color: '#16a34a', fontWeight: 'bold' }}>Online Virtual Hall</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>Academic Grades & Transcripts</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                    <th style={{ padding: '12px' }}>Course Code</th>
                                    <th style={{ padding: '12px' }}>Course Title</th>
                                    <th style={{ padding: '12px' }}>Quiz (30)</th>
                                    <th style={{ padding: '12px' }}>Midterm (30)</th>
                                    <th style={{ padding: '12px' }}>Final (60)</th>
                                    <th style={{ padding: '12px' }}>Total (120)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coursesList.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold' }}>{c.code}</td>
                                        <td style={{ padding: '14px' }}>{c.title}</td>
                                        <td style={{ padding: '14px' }}>{c.quiz}</td>
                                        <td style={{ padding: '14px' }}>{c.midterm}</td>
                                        <td style={{ padding: '14px' }}>{c.final}</td>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#16a34a' }}>{c.total} / 120</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#14532d', marginTop: 0 }}>Upcoming Examinations</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 20px 0' }}>Mid-Semester examinations schedule for the current academic session.</p>
                            <ul style={{ paddingLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
                                <li><strong>ISL-101 Final Exam:</strong> Aug 15, 2026 (10:00 AM) - <em>{instructorsList[0]}</em></li>
                                <li><strong>ARA-102 Final Exam:</strong> Aug 17, 2026 (02:00 PM) - <em>{instructorsList[1]}</em></li>
                                <li><strong>HAD-201 Final Exam:</strong> Aug 19, 2026 (10:00 AM) - <em>{instructorsList[2]}</em></li>
                            </ul>
                        </div>
                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#14532d', marginTop: 0 }}>Verified Certificates</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 20px 0' }}>Download your completed course certificates.</p>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#0f172a' }}>Certificate in Islamic Ethics</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Issued by: {instructorsList[3]}</p>
                                </div>
                                <button onClick={() => alert('Downloading certificate PDF...')} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'acceptance' && (
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #14532d', paddingBottom: '20px', marginBottom: '30px' }}>
                            <h2 style={{ color: '#14532d', margin: '0 0 5px 0' }}>ILM HUB INSTITUTE</h2>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Official Office of Admissions & Academic Records</p>
                        </div>

                        {myApp.status === 'Approved' ? (
                            <div>
                                <p style={{ textAlign: 'right', color: '#64748b' }}>Date: July 28, 2026</p>
                                <p>Dear <strong>Khalid Muhammad Sulaiman</strong>,</p>
                                <p style={{ lineHeight: '1.6', color: '#334155' }}>
                                    We are delighted to inform you that your application for admission into the Ilm Hub Institute based on your educational background in <strong>{myApp.highestQualification}</strong> from <strong>{myApp.institution}</strong> has been officially <strong>APPROVED</strong>.
                                </p>
                                <div style={{ margin: '30px 0', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#14532d' }}>Student Enrollment Details:</h4>
                                    <p style={{ margin: '4px 0', color: '#475569' }}><strong>Registration ID:</strong> ILM-2026-8842</p>
                                    <p style={{ margin: '4px 0', color: '#475569' }}><strong>Program:</strong> Advanced Islamic Studies & Qur'anic Sciences</p>
                                    <p style={{ margin: '4px 0', color: '#475569' }}><strong>Status:</strong> Active Enrolled Student</p>
                                </div>
                                <p style={{ marginTop: '30px' }}>Sincerely,<br/><strong>{instructorsList[0]}</strong><br/>Director of Admissions, Ilm Hub Institute</p>

                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                    <button 
                                        onClick={() => window.print()}
                                        style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                                    >
                                        Print Acceptance Letter
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <div style={{ background: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>
                                    Your registration status is currently <strong>Pending Admin Approval</strong>. Once the administration reviews your educational qualifications, your official acceptance letter will be generated here for printing.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'support' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Support & Helpdesk</h2>
                        <p style={{ color: '#64748b', marginBottom: '25px' }}>Need assistance with your courses, timetable, or portal access? Send a ticket to our academic support team.</p>
                        
                        <form onSubmit={(e) => { e.preventDefault(); alert('Support ticket submitted successfully! Our team will respond via email.'); }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Subject</label>
                                <input type="text" required placeholder="Brief description of your issue..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Message Details</label>
                                <textarea rows="4" required placeholder="Describe your issue in detail..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
                            </div>
                            <button type="submit" style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Submit Support Ticket
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
