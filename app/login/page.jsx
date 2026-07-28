'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPortal() {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Registration fields
    const [fullName, setFullName] = useState('');
    const [highestQualification, setHighestQualification] = useState('High School');
    const [institution, setInstitution] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState(false);

    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        if (role === 'student') {
            router.push('/dashboard');
        } else if (role === 'instructor') {
            router.push('/instructor/dashboard');
        } else if (role === 'admin') {
            router.push('/admin/dashboard');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        // Save registration request to localStorage for Admin review
        const newApp = {
            id: Date.now(),
            fullName,
            email,
            highestQualification,
            institution,
            graduationYear,
            status: 'Pending'
        };
        const existing = JSON.parse(localStorage.getItem('ilm_applications') || '[]');
        localStorage.setItem('ilm_applications', JSON.stringify([newApp, ...existing]));
        setRegisterSuccess(true);
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '500px', width: '100%', background: '#ffffff', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <Link href="/" style={{ display: 'inline-block', color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', marginBottom: '15px' }}>
                        &larr; Back to Home
                    </Link>
                    <h1 style={{ fontSize: '28px', color: '#14532d', marginBottom: '8px' }}>
                        {mode === 'login' ? 'Portal Login' : 'Student Enrollment & Registration'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        {mode === 'login' ? 'Access your Student, Instructor, or Admin account' : 'Submit your educational details for admission'}
                    </p>
                </div>

                {/* Mode Switcher: Login vs Register */}
                <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px', marginBottom: '25px' }}>
                    <button 
                        type="button"
                        onClick={() => { setMode('login'); setRegisterSuccess(false); }}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: mode === 'login' ? '#ffffff' : 'transparent', color: mode === 'login' ? '#14532d' : '#475569', boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        Login
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setMode('register'); }}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: mode === 'register' ? '#ffffff' : 'transparent', color: mode === 'register' ? '#14532d' : '#475569', boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        New Student Register
                    </button>
                </div>

                {mode === 'login' ? (
                    <div>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '25px' }}>
                            <button 
                                type="button"
                                onClick={() => setRole('student')}
                                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: role === 'student' ? '#ffffff' : 'transparent', color: role === 'student' ? '#14532d' : '#64748b', boxShadow: role === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                Student
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRole('instructor')}
                                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: role === 'instructor' ? '#ffffff' : 'transparent', color: role === 'instructor' ? '#14532d' : '#64748b', boxShadow: role === 'instructor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                Instructor
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRole('admin')}
                                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: role === 'admin' ? '#ffffff' : 'transparent', color: role === 'admin' ? '#14532d' : '#64748b', boxShadow: role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                Admin
                            </button>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    placeholder={'Enter your ' + role + ' email...'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="Enter your password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <button 
                                type="submit"
                                style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }}
                            >
                                Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        {registerSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>
                                    Registration submitted successfully! Our administrative team will review your educational details and approve your admission & acceptance letter shortly.
                                </div>
                                <button 
                                    onClick={() => setRegisterSuccess(false)}
                                    style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Enter your full name..."
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        required 
                                        placeholder="Enter your email address..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Highest Educational Qualification</label>
                                    <select 
                                        value={highestQualification}
                                        onChange={(e) => setHighestQualification(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none', background: '#ffffff' }}
                                    >
                                        <option value="High School">High School / Secondary School</option>
                                        <option value="Diploma">Diploma / Certificate</option>
                                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                                        <option value="Master's Degree">Master's Degree</option>
                                        <option value="Islamic Seminary (Alimiyyah)">Islamic Seminary (Alimiyyah)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Previous Institution Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Name of school/college/university attended..."
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Graduation Year</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. 2024"
                                        value={graduationYear}
                                        onChange={(e) => setGraduationYear(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }}
                                >
                                    Submit Registration & Educational Info
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
