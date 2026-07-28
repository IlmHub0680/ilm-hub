'use client';
import Link from 'next/link';

export default function Home() {
    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            {/* Header / Navbar */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '22px', color: '#14532d', margin: 0 }}>Ilm-Hub Institute</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
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

            {/* Islamic Bookstore Section */}
            <section style={{ backgroundColor: '#f1f5f9', padding: '60px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Ilm-Hub Islamic Bookstore</h3>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Explore authentic classical texts, student guides, and translated commentaries.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Featured Book</span>
                            <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Bulugh al-Maram Commentary</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Comprehensive legal rulings of hadith compiled by Ibn Hajar al-Asqalani with contemporary notes.</p>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Featured Book</span>
                            <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Al-Ajrumiyyah in Arabic Grammar</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>The foundational classical text for learning Arabic grammar and syntax with diagrams.</p>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Featured Book</span>
                            <h4 style={{ color: '#14532d', margin: '12px 0 6px 0', fontSize: '18px' }}>Riyad as-Salihin (Volumes 1 & 2)</h4>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Gardens of the Righteous: A vital collection of authentic narrations on manners and heart softening.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lectures & Media Library Section */}
            <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
                <h3 style={{ fontSize: '26px', color: '#14532d', textAlign: 'center', marginBottom: '10px' }}>Lectures & Media Library</h3>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Watch and listen to recorded sessions, guest lectures, and seminar series.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '30px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                            [ Video Session Preview ]
                        </div>
                        <h4 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '18px' }}>Advanced Quranic Morphology Masterclass</h4>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Instructor: Shaykh Farid Abdul Samad &bull; Duration: 1h 45m</p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '30px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                            [ Video Session Preview ]
                        </div>
                        <h4 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '18px' }}>Understanding the Context of Hadith Narrations</h4>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Instructor: Shaykh Ahmad Abdullahi Dawud &bull; Duration: 2h 10m</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '14px', marginTop: '80px' }}>
                <p>&copy; 2026 Ilm-Hub Institute of Islamic Sciences. All rights reserved.</p>
            </footer>
        </div>
    );
}