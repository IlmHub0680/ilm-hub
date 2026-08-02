'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellBooksPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [price, setPrice] = useState('');
    const [contact, setContact] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h1 style={{ color: '#14532d', marginTop: 0, fontSize: '24px' }}>Sell Your Books Portal</h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>List your academic or Islamic texts for sale to students and instructors across the institute.</p>

                {submitted ? (
                    <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Listing Submitted Successfully!</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Your book has been submitted for review and will appear in the bookstore catalogue shortly.</p>
                        <button onClick={() => { setSubmitted(false); setTitle(''); setAuthor(''); setPrice(''); setContact(''); }} style={{ marginTop: '20px', padding: '8px 16px', background: '#14532d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Another Book</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Book Title</label>
                            <input type="text" placeholder="e.g., Al-Ajrumiyyah in Arabic Grammar" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Author / Scholar</label>
                            <input type="text" placeholder="e.g., Ibn Ajurrum" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Asking Price ($)</label>
                            <input type="number" placeholder="25.00" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Contact Email or Phone</label>
                            <input type="text" placeholder="student@example.com" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px', background: '#14532d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Publish Listing</button>
                    </form>
                )}

                <button onClick={() => router.push('/')} style={{ width: '100%', marginTop: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', textAlign: 'center' }}>← Return to Home Page</button>
            </div>
        </div>
    );
}
