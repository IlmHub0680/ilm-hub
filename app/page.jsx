'use client';
import Link from 'next/link';

export default function Home() {
    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0 }}>
            {/* Top Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#14532d' }}>
                    Ilm Hub Institute
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <Link href="/courses" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Study Courses</Link>
                    <Link href="/bookstore" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Islamic Bookstore</Link>
                    <Link href="/media" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Lectures</Link>
                    <Link href="/login" style={{ backgroundColor: '#0d9488', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                        Enroll / Login
                    </Link>
                </div>
            </div>

            {/* Hero Section with Deep Green Background */}
            <div style={{ backgroundColor: '#14532d', color: '#ffffff', textAlign: 'center', padding: '80px 20px 90px 20px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0 }}>Welcome to Ilm Hub Institute</h1>
                <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.5' }}>
                    Authentic Islamic knowledge, structured study courses, digital bookstore, and multimedia lectures for students.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <Link href="/courses" style={{ backgroundColor: '#0d9488', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                        Explore Study Courses
                    </Link>
                    <Link href="/bookstore" style={{ backgroundColor: '#ffffff', color: '#14532d', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                        Purchase Islamic Books
                    </Link>
                    <Link href="/media" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                        Browse Lectures
                    </Link>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div style={{ maxWidth: '1200px', margin: '-40px auto 60px auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
                    {/* Card 1 */}
                    <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', height: '100%', boxSizing: 'border-box' }}>
                            <h3 style={{ fontSize: '22px', color: '#0f172a', marginTop: 0, marginBottom: '12px' }}>Study Courses</h3>
                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                Enroll in structured online courses with sections, video/audio/text lessons, progress tracking, and verified certificates.
                            </p>
                        </div>
                    </Link>

                    {/* Card 2 - Islamic Bookstore (Now clickable and matches route) */}
                    <Link href="/bookstore" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', height: '100%', boxSizing: 'border-box' }}>
                            <h3 style={{ fontSize: '22px', color: '#0f172a', marginTop: 0, marginBottom: '12px' }}>Islamic Bookstore</h3>
                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                Browse featured books, review our step-by-step buying guide, and purchase authentic texts with instant digital download.
                            </p>
                        </div>
                    </Link>

                    {/* Card 3 */}
                    <Link href="/media" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', height: '100%', boxSizing: 'border-box' }}>
                            <h3 style={{ fontSize: '22px', color: '#0f172a', marginTop: 0, marginBottom: '12px' }}>Lectures Library</h3>
                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                Access video and audio lectures accompanied by proper Adad and educational purpose notices, with optional downloading.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}