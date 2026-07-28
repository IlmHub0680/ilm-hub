'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const [cartCount, setCartCount] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const handleBuyBook = (title) => {
        setCartCount(prev => prev + 1);
        alert(`"${title}" has been added to your cart!`);
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

            {/* Course Catalog with Free / Paid Tags */}
            <section style={{ backgroundColor: '#ffffff', padding: '60px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Course Catalog</h3>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Explore our comprehensive curriculum featuring both complimentary foundation modules and professional accredited programs.</p>
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
                    <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Ilm-Hub Islamic Bookstore</h3>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Explore authentic classical texts, student guides, and translated commentaries available for purchase.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>$35.00</span>
                                <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Bulugh al-Maram Commentary</h4>
                                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>Comprehensive legal rulings of hadith compiled by Ibn Hajar al-Asqalani with contemporary notes.</p>
                            </div>
                            <button onClick={() => handleBuyBook('Bulugh al-Maram Commentary')} style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                                Purchase Book
                            </button>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>$20.00</span>
                                <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Al-Ajrumiyyah in Arabic Grammar</h4>
                                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>The foundational classical text for learning Arabic grammar and syntax with diagrams.</p>
                            </div>
                            <button onClick={() => handleBuyBook('Al-Ajrumiyyah in Arabic Grammar')} style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                                Purchase Book
                            </button>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>$45.00</span>
                                <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Riyad as-Salihin (Volumes 1 & 2)</h4>
                                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>Gardens of the Righteous: A vital collection of authentic narrations on manners and heart softening.</p>
                            </div>
                            <button onClick={() => handleBuyBook('Riyad as-Salihin (Volumes 1 & 2)')} style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                                Purchase Book
                            </button>
                        </div>
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

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '14px', marginTop: '80px' }}>
                <p>&copy; 2026 Ilm-Hub Institute of Islamic Sciences. All rights reserved.</p>
            </footer>
        </div>
    );
}