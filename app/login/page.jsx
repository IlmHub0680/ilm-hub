'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [role, setRole] = useState('Student'); // 'Student', 'Instructor', 'Admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // Save session state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('studentEmail', email);
        localStorage.setItem('studentName', email.split('@')[0]);

        if (role === 'Admin') {
            router.push('/admin');
        } else if (role === 'Instructor') {
            router.push('/instructor');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px', width: '100%', maxWidth: '500px' }}>
                <Link href="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                    &larr; Back to Home
                </Link>
            </div>
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '500px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '26px' }}>Portal Login</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        Access your Student, Instructor, or Admin account
                    </p>
                </div>

                {/* Role Selection Tabs */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '24px' }}>
                    {['Student', 'Instructor', 'Admin'].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px',
                                backgroundColor: role === r ? '#ffffff' : 'transparent',
                                color: role === r ? '#14532d' : '#64748b',
                                boxShadow: role === r ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="test@gmail.com"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                    >
                        Login as {role}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                    New student? <Link href="/admission" style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'none' }}>Register for Admission</Link>
                </div>
            </div>
        </div>
    );
}