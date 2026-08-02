import React, { useState } from 'react';

export default function App() {
    const [view, setView] = useState('landing');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminSection, setAdminSection] = useState('institute');

    const handleLogin = (role) => {
        if (role === 'admin') {
            if (email.includes('admin') || email === 'farid@ilmhub.com') {
                setView('dashboard_admin');
            } else {
                alert('Invalid Admin credentials.');
            }
        } else if (role === 'instructor') {
            if (email.includes('muhammad') || email.includes('instructor')) {
                setView('dashboard_instructor');
            } else {
                alert('Invalid Instructor credentials.');
            }
        }
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0 }}>
            
            {/* VIEW 1: LANDING PAGE */}
            {view === 'landing' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
                    <h1 style={{ color: '#14532d', marginBottom: '10px' }}>IlmHub Portal</h1>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>Choose your portal entry point below:</p>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div onClick={() => setView('staff_select')} style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', cursor: 'pointer', textAlign: 'center', width: '260px', borderTop: '4px solid #14532d' }}>
                            <h3 style={{ color: '#14532d', margin: '0 0 10px 0' }}>Staff & Admin Portal</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Restricted access for administrators and instructors.</p>
                        </div>

                        <div onClick={() => setView('student_reader')} style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', cursor: 'pointer', textAlign: 'center', width: '260px', borderTop: '4px solid #d97706' }}>
                            <h3 style={{ color: '#d97706', margin: '0 0 10px 0' }}>Student Reading Portal</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Access learning materials and public study resources.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: TWO CARDS SELECTION SCREEN */}
            {view === 'staff_select' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
                    <h2 style={{ color: '#14532d', marginBottom: '5px' }}>Staff & Admin Portal Selection</h2>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>Select your specific role to continue to login:</p>
                    
                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '650px', width: '100%' }}>
                        <div onClick={() => { setEmail(''); setPassword(''); setView('login_admin'); }} style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', cursor: 'pointer', textAlign: 'center', flex: '1', minWidth: '260px', border: '2px solid #cbd5e1' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#14532d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontWeight: 'bold', fontSize: '20px' }}>⚙️</div>
                            <h3 style={{ color: '#14532d', margin: '0 0 10px 0' }}>Admin Portal</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Manage Institute, Author & Publisher operations.</p>
                            <span style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#14532d', color: '#ffffff', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>Login as Admin</span>
                        </div>

                        <div onClick={() => { setEmail(''); setPassword(''); setView('login_instructor'); }} style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', cursor: 'pointer', textAlign: 'center', flex: '1', minWidth: '260px', border: '2px solid #cbd5e1' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontWeight: 'bold', fontSize: '20px' }}>📚</div>
                            <h3 style={{ color: '#0284c7', margin: '0 0 10px 0' }}>Instructor Portal</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Manage timetables, gradebook, and student assessments.</p>
                            <span style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>Login as Instructor</span>
                        </div>
                    </div>

                    <button onClick={() => setView('landing')} style={{ marginTop: '30px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>← Return to Public Website</button>
                </div>
            )}

            {/* VIEW 3: ADMIN LOGIN FORM */}
            {view === 'login_admin' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <h2 style={{ color: '#14532d', marginTop: 0, textAlign: 'center' }}>Admin Portal Login</h2>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Admin Email</label>
                            <input type="email" placeholder="farid@ilmhub.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <button onClick={() => handleLogin('admin')} style={{ width: '100%', padding: '12px', background: '#14532d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Secure Login</button>
                        <button onClick={() => setView('staff_select')} style={{ width: '100%', marginTop: '15px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', textAlign: 'center' }}>← Back to Selection</button>
                    </div>
                </div>
            )}

            {/* VIEW 4: INSTRUCTOR LOGIN FORM */}
            {view === 'login_instructor' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <h2 style={{ color: '#0284c7', marginTop: 0, textAlign: 'center' }}>Instructor Portal Login</h2>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Instructor Email</label>
                            <input type="email" placeholder="muhammad@ilmhub.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <button onClick={() => handleLogin('instructor')} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Secure Login</button>
                        <button onClick={() => setView('staff_select')} style={{ width: '100%', marginTop: '15px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', textAlign: 'center' }}>← Back to Selection</button>
                    </div>
                </div>
            )}

            {/* VIEW 5: ADMIN DASHBOARD */}
            {view === 'dashboard_admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <header style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>IlmHub Admin Control Center</h2>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => setAdminSection('institute')} style={{ padding: '8px 14px', background: adminSection === 'institute' ? '#ffffff' : 'transparent', color: adminSection === 'institute' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Institute</button>
                            <button onClick={() => setAdminSection('author')} style={{ padding: '8px 14px', background: adminSection === 'author' ? '#ffffff' : 'transparent', color: adminSection === 'author' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Author</button>
                            <button onClick={() => setAdminSection('publisher')} style={{ padding: '8px 14px', background: adminSection === 'publisher' ? '#ffffff' : 'transparent', color: adminSection === 'publisher' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Publisher</button>
                            <button onClick={() => setView('landing')} style={{ marginLeft: '15px', padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
                        </div>
                    </header>
                    <main style={{ padding: '30px', flex: 1, backgroundColor: '#f8fafc' }}>
                        {adminSection === 'institute' && <div><h3>Institute Management Section</h3><p>Manage institute schedules, curriculum units, and student records.</p></div>}
                        {adminSection === 'author' && <div><h3>Author Management Section</h3><p>Manage author profiles, review manuscript drafts, and track submissions.</p></div>}
                        {adminSection === 'publisher' && <div><h3>Publisher Management Section</h3><p>Handle book catalog publishing, pricing configurations, and distribution.</p></div>}
                    </main>
                </div>
            )}

            {/* VIEW 6: INSTRUCTOR DASHBOARD */}
            {view === 'dashboard_instructor' && (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <header style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Instructor Portal - Gradebook & Timetable</h2>
                        <button onClick={() => setView('landing')} style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
                    </header>
                    <main style={{ padding: '30px', flex: 1, backgroundColor: '#f8fafc' }}>
                        <h3>Instructor Class Management</h3>
                        <p>Welcome, Instructor. Use this dedicated space to submit student assessments and manage class timetables.</p>
                    </main>
                </div>
            )}

            {/* VIEW 7: STUDENT READING PORTAL */}
            {view === 'student_reader' && (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <header style={{ backgroundColor: '#d97706', color: '#ffffff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Student Reading Portal</h2>
                        <button onClick={() => setView('landing')} style={{ padding: '8px 12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Exit Reader</button>
                    </header>
                    <main style={{ padding: '30px', flex: 1, backgroundColor: '#f8fafc' }}>
                        <h3>Public Study Library</h3>
                        <p>Browse course materials, read articles, and access public study guides.</p>
                    </main>
                </div>
            )}

        </div>
    );
}
