'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const [cartCount, setCartCount] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Checkout & Currency State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [currency, setCurrency] = useState('USD');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [isOrdered, setIsOrdered] = useState(false);

    // Currency conversion rates relative to USD
    const currencyRates = {
        USD: { symbol: '$', rate: 1 },
        EUR: { symbol: '€', rate: 0.92 },
        GBP: { symbol: '£', rate: 0.78 },
        GHS: { symbol: 'GH₵', rate: 15.5 },
        SAR: { symbol: 'SAR ', rate: 3.75 }
    };

    const convertPrice = (usdPrice) => {
        const converted = usdPrice * currencyRates[currency].rate;
        return `${currencyRates[currency].symbol}${converted.toFixed(2)}`;
    };

    const handleOpenCheckout = (book) => {
        setSelectedBook(book);
        setIsOrdered(false);
        setBuyerName('');
        setBuyerEmail('');
        setShippingAddress('');
        setIsCheckoutOpen(true);
    };

    const handleCompletePayment = (e) => {
        e.preventDefault();
        if (!buyerName || !buyerEmail) {
            alert('Please provide your name and email.');
            return;
        }
        setCartCount(prev => prev + 1);
        setIsOrdered(true);
    };

    const categories = [
        'All', 
        'Education Programs', 
        'Khutbah (Friday sermon)', 
        'Mutun Al-Ilmiyyah (Scientific Texts)', 
        'Manzumat (Didactic Poems)'
    ];

    const lecturesList = [
        { title: 'Advanced Quranic Morphology Masterclass', category: 'Education Programs', instructor: 'Shaykh Farid Abdul Samad', duration: '1h 45m' },
        { title: 'The Importance of Sincerity in Seeking Knowledge', category: 'Khutbah (Friday sermon)', instructor: 'Imam Muhammad Jalaal Deen Umar', duration: '45m' },
        { title: 'Explanation of Matn Al-Ajrumiyyah', category: 'Mutun Al-Ilmiyyah (Scientific Texts)', instructor: 'Shaykh Ahmad Abdullahi Dawud', duration: '2h 10m' }
    ];

    const filteredLectures = selectedCategory === 'All' 
        ? lecturesList 
        : lecturesList.filter(l => l.category === selectedCategory);

    const booksList = [
        { 
            title: 'Bulugh al-Maram Commentary', 
            usdPrice: 35.00, 
            author: 'Ibn Hajar al-Asqalani', 
            publisher: 'Ilm-Hub Academic Press', 
            format: 'Hardcover / Digital PDF', 
            pages: '540 pages',
            language: 'Arabic / English Translation',
            description: 'Comprehensive legal rulings of hadith compiled by Ibn Hajar al-Asqalani with contemporary notes.' 
        },
        { 
            title: 'Al-Ajrumiyyah in Arabic Grammar', 
            usdPrice: 20.00, 
            author: 'Imam Al-Ajrumi', 
            publisher: 'Ilm-Hub Publications', 
            format: 'Softcover / Workbook', 
            pages: '180 pages',
            language: 'Arabic with English Explanations',
            description: 'The foundational classical text for learning Arabic grammar and syntax with comprehensive diagrams.' 
        },
        { 
            title: 'Riyad as-Salihin (Volumes 1 & 2)', 
            usdPrice: 45.00, 
            author: 'Imam An-Nawawi', 
            publisher: 'Darussalam & Ilm-Hub Edition', 
            format: 'Deluxe Hardcover Set', 
            pages: '920 pages total',
            language: 'Arabic / English',
            description: 'Gardens of the Righteous: A vital collection of authentic narrations on manners, purification of the heart, and character.' 
        }
    ];

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            {/* Header / Navbar */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: '22px', color: '#14532d', margin: 0 }}>Ilm-Hub Institute</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>
                        🛒 Cart: {cartCount} items
                    </span>
                    <Link href="/login" style={{ padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', color: '#14532d', fontWeight: 'bold', border: '1px solid #14532d' }}>
                        Login
                    </Link>
                    <Link href="/dashboard" style={{ padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold' }}>
                        Student Portal
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#14532d', color: '#ffffff' }}>
                <h2 style={{ fontSize: '38px', marginBottom: '15px' }}>Excellence in Islamic Studies & Qur'anic Sciences</h2>
                <p style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto 30px auto', color: '#cbd5e1' }}>
                    Empowering students worldwide with authentic foundational knowledge, structured curricula, expert instruction, and digital resources.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <Link href="/register" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }}>
                        Apply For Admission
                    </Link>
                    <Link href="/admin" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', fontWeight: 'bold', fontSize: '16px' }}>
                        Admin Portal
                    </Link>
                </div>
            </section>

            {/* Programs Overview */}
            <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
                <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '40px' }}>Core Academic Programs</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Islamic Jurisprudence (Fiqh)</h4>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>Master the principles of modern transactions, family law, and classical madhab methodologies.</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Qur'anic Arabic & Morphology</h4>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>Develop deep linguistic proficiency through root tables, verb conjugations, and direct text analysis.</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Hadith Terminology (Mustalah)</h4>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>Study narration classifications, Isnad evaluation, and classical collection structures.</p>
                    </div>
                </div>
            </section>

            {/* Course Catalog */}
            <section style={{ backgroundColor: '#ffffff', padding: '60px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Course Catalog</h3>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Explore our comprehensive curriculum featuring complimentary foundation modules and professional accredited programs.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>ISL-101</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px' }}>Free Foundation</span>
                            </div>
                            <h4 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '18px' }}>Foundations of Islamic Jurisprudence</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: '0 0 15px 0' }}>Introduction to core Fiqh concepts and methodology.</p>
                            <Link href="/register" style={{ display: 'inline-block', color: '#14532d', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>Enroll Now &rarr;</Link>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>ARA-102</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px' }}>Paid Accredited ($150)</span>
                            </div>
                            <h4 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '18px' }}>Quranic Arabic & Morphology</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: '0 0 15px 0' }}>Deep dive into verb conjugations and root systems.</p>
                            <Link href="/register" style={{ display: 'inline-block', color: '#14532d', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>Enroll Now &rarr;</Link>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>HAD-201</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px' }}>Paid Accredited ($200)</span>
                            </div>
                            <h4 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '18px' }}>Hadith Terminology & Narrations</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: '0 0 15px 0' }}>Rigorous examination of Isnad and narration types.</p>
                            <Link href="/register" style={{ display: 'inline-block', color: '#14532d', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>Enroll Now &rarr;</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Islamic Bookstore Section */}
            <section style={{ backgroundColor: '#f1f5f9', padding: '60px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h3 style={{ fontSize: '26px', color: '#14532d', margin: '0 0 8px 0' }}>Ilm-Hub Islamic Bookstore</h3>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Authentic classical texts, student guides, and verified editions.</p>
                        </div>
                        {/* Currency Switcher Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Currency:</span>
                            {['USD', 'EUR', 'GBP', 'GHS', 'SAR'].map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: currency === curr ? '#14532d' : 'transparent',
                                        color: currency === curr ? '#ffffff' : '#334155',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                        {booksList.map((book, idx) => (
                            <div key={idx} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '14px', background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                                            {convertPrice(book.usdPrice)}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{book.format}</span>
                                    </div>
                                    <h4 style={{ color: '#14532d', margin: '0 0 4px 0', fontSize: '18px' }}>{book.title}</h4>
                                    <p style={{ color: '#334155', fontSize: '13px', fontStyle: 'italic', margin: '0 0 10px 0' }}>Author: {book.author}</p>
                                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' }}>{book.description}</p>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                                        <div><strong>Publisher:</strong> {book.publisher}</div>
                                        <div><strong>Details:</strong> {book.pages} &bull; {book.language}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleOpenCheckout(book)} 
                                    style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '14px' }}
                                >
                                    Proceed to Secure Checkout
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Button to View All Uploaded Admin Books */}
                    <div style={{ textAlign: 'center' }}>
                        <Link href="/bookstore" style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: '#14532d', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                            View All Bookstore Inventory &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* Lectures & Media Library Section */}
            <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
                <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Lectures & Media Library</h3>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '25px' }}>Watch and listen to recorded sessions filtered by category.</p>
                
                {/* Category Filter Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '35px', flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #14532d',
                                background: selectedCategory === cat ? '#14532d' : 'transparent',
                                color: selectedCategory === cat ? '#ffffff' : '#14532d',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '35px' }}>
                    {filteredLectures.map((lecture, idx) => (
                        <div key={idx} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px' }}>{lecture.category}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{lecture.duration}</span>
                            </div>
                            <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '30px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => alert(`Streaming: ${lecture.title}`)}>
                                ▶ Play Video Session
                            </div>
                            <h4 style={{ color: '#14532d', margin: '0 0 6px 0', fontSize: '18px' }}>{lecture.title}</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Instructor: {lecture.instructor}</p>
                        </div>
                    ))}
                </div>

                {/* Button to View All Media Library Videos */}
                <div style={{ textAlign: 'center' }}>
                    <Link href="/lectures" style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: '#14532d', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                        View All Lectures & Media Archive &rarr;
                    </Link>
                </div>
            </section>

            {/* Interactive Checkout Modal */}
            {isCheckoutOpen && selectedBook && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button 
                            onClick={() => setIsCheckoutOpen(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}
                        >
                            &times;
                        </button>

                        {!isOrdered ? (
                            <form onSubmit={handleCompletePayment}>
                                <h3 style={{ color: '#14532d', marginTop: 0, marginBottom: '5px', fontSize: '22px' }}>Secure Book Checkout</h3>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Complete your transaction for authentic publishing.</p>

                                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 'bold', color: '#14532d', fontSize: '16px' }}>{selectedBook.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '13px', margin: '4px 0' }}>Author: {selectedBook.author} &bull; {selectedBook.format}</div>
                                    <div style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>
                                        Total: {convertPrice(selectedBook.usdPrice)} ({currency})
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={buyerName} 
                                        onChange={(e) => setBuyerName(e.target.value)}
                                        placeholder="Enter your full name"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Email Address (For digital delivery/receipt)</label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={buyerEmail} 
                                        onChange={(e) => setBuyerEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Shipping Address (For physical copies)</label>
                                    <textarea 
                                        rows="2"
                                        value={shippingAddress} 
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Street address, city, country..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    ></textarea>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Payment Method</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {[
                                            { id: 'card', label: 'Credit Card' },
                                            { id: 'momo', label: 'Mobile Money' },
                                            { id: 'bank', label: 'Bank Transfer' }
                                        ].map((method) => (
                                            <button
                                                type="button"
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 8px',
                                                    borderRadius: '6px',
                                                    border: paymentMethod === method.id ? '2px solid #14532d' : '1px solid #cbd5e1',
                                                    background: paymentMethod === method.id ? '#f0fdf4' : '#ffffff',
                                                    color: paymentMethod === method.id ? '#14532d' : '#334155',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {method.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                                >
                                    Confirm & Pay {convertPrice(selectedBook.usdPrice)}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                                <h3 style={{ color: '#14532d', margin: '0 0 10px 0' }}>Order Successful!</h3>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', marginBottom: '25px' }}>
                                    Jazakallahu Khairan, <strong>{buyerName}</strong>. Your payment of <strong>{convertPrice(selectedBook.usdPrice)}</strong> has been processed successfully via {paymentMethod.toUpperCase()}. A confirmation and download/tracking link has been sent to <strong>{buyerEmail}</strong>.
                                </p>
                                <button 
                                    onClick={() => setIsCheckoutOpen(false)}
                                    style={{ padding: '10px 24px', backgroundColor: '#14532d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Close Window
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '14px', marginTop: '80px' }}>
                <p>&copy; 2026 Ilm-Hub Institute of Islamic Sciences. All rights reserved.</p>
            </footer>
        </div>
    );
}