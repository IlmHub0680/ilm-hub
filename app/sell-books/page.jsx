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
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h1 style={{ color: 'var(--brand)', marginTop: 0, fontSize: '24px' }}>Sell Your Books Portal</h1>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '30px' }}>List your academic or Islamic texts for sale to students and instructors across the institute.</p>

                {submitted ? (
                    <div style={{ backgroundColor: 'var(--brand-tint)', color: 'var(--success)', padding: '20px', borderRadius: '8px', border: '1px solid var(--success-tint)', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Listing Submitted Successfully!</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Your book has been submitted for review and will appear in the bookstore catalogue shortly.</p>
                        <button onClick={() => { setSubmitted(false); setTitle(''); setAuthor(''); setPrice(''); setContact(''); }} style={{ marginTop: '20px', padding: '8px 16px', background: 'var(--brand)', color: 'var(--on-accent)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Another Book</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--ink-soft)' }}>Book Title</label>
                            <input type="text" placeholder="e.g., Al-Ajrumiyyah in Arabic Grammar" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--ink-soft)' }}>Author / Scholar</label>
                            <input type="text" placeholder="e.g., Ibn Ajurrum" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--ink-soft)' }}>Asking Price ($)</label>
                            <input type="number" placeholder="25.00" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }} required />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--ink-soft)' }}>Contact Email or Phone</label>
                            <input type="text" placeholder="student@example.com" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }} required />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--brand)', color: 'var(--on-accent)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Publish Listing</button>
                    </form>
                )}

                <button onClick={() => router.push('/')} style={{ width: '100%', marginTop: '20px', background: 'transparent', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: '13px', textAlign: 'center' }}>← Return to Home Page</button>
            </div>
        </div>
    );
}
