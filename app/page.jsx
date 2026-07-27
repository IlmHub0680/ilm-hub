'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#064e3b' }}>
          Ilm Hub Institute
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/courses" style={{ color: '#374151', fontWeight: '600', textDecoration: 'none' }}>Study Courses</Link>
          <Link href="/books" style={{ color: '#374151', fontWeight: '600', textDecoration: 'none' }}>Islamic Bookstore</Link>
          <Link href="/lectures" style={{ color: '#374151', fontWeight: '600', textDecoration: 'none' }}>Lectures</Link>
          <Link href="/dashboard" style={{
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Student Dashboard
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' }}>
            Welcome to Ilm Hub Institute
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#d1fae5', marginBottom: '40px', lineHeight: '1.6' }}>
            Authentic Islamic knowledge, structured study courses, digital bookstore, and multimedia lectures for students.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/courses"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Explore Study Courses
            </Link>

            <Link
              href="/books"
              style={{
                backgroundColor: '#ffffff',
                color: '#064e3b',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Purchase Islamic Books
            </Link>

            <Link
              href="/lectures"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Browse Lectures
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Study Courses
          </h3>
          <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' }}>
            Enroll in structured online courses with sections, video/audio/text lessons, progress tracking, and verified certificates.
          </p>
          <Link href="/courses" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>
            View Study Courses →
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Islamic Bookstore
          </h3>
          <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' }}>
            Browse featured books, review our step-by-step buying guide, and purchase authentic texts with instant digital download.
          </p>
          <Link href="/books" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>
            Purchase Islamic Books →
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            Lectures Library
          </h3>
          <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' }}>
            Access video and audio lectures accompanied by proper Adab and educational purpose notices, with optional donation support.
          </p>
          <Link href="/lectures" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>
            Explore Lectures Library →
          </Link>
        </div>

      </div>
    </div>
  );
}