'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = (e) => {
        e.preventDefault();
        if (name && email && password) {
            localStorage.setItem('isAuthenticated', 'true');
            router.push('/dashboard');
        } else {
            alert('Please fill out all registration fields.');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                    &larr; Back to Home
                </Link>
            </div>
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '24px' }}>Ilm Hub Institute</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Create your student account</p>
                </div>
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                        Register Account
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                    Already have an account? <Link href="/login" style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
