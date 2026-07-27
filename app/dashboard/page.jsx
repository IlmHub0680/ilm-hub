'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const [certModal, setCertModal] = useState(null);

  const myCourses = [
    {
      id: 'c1',
      title: 'Foundations of Islamic Jurisprudence (Usool al-Fiqh)',
      progress: 75,
      completedLessons: 12,
      totalLessons: 16,
      status: 'In Progress',
      lastStudied: '2 days ago'
    },
    {
      id: 'c2',
      title: 'Advanced Arabic Grammar & Morphology',
      progress: 100,
      completedLessons: 20,
      totalLessons: 20,
      status: 'Completed',
      completionDate: 'June 15, 2026',
      certificateNumber: 'ILM-CERT-2026-8942',
      verificationCode: 'VERIFY-9482-XYZ'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            ← Back to Home
          </Link>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link href="/courses" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Study Courses</Link>
            <Link href="/books" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Islamic Bookstore</Link>
            <Link href="/lectures" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Lectures Library</Link>
          </div>
        </div>

        {/* Dashboard Header */}
        <div style={{
          backgroundColor: '#064e3b',
          color: '#ffffff',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Student Dashboard</h1>
            <p style={{ color: '#d1fae5', margin: '0', fontSize: '1rem' }}>Welcome back. Track your learning progress and certificates.</p>
          </div>
          <div style={{ backgroundColor: '#059669', padding: '12px 20px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1 / 2</div>
            <div style={{ fontSize: '0.85rem', color: '#e6f4ea' }}>Courses Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              backgroundColor: activeTab === 'courses' ? '#059669' : '#ffffff',
              color: activeTab === 'courses' ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            My Courses & Progress
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            style={{
              backgroundColor: activeTab === 'certificates' ? '#059669' : '#ffffff',
              color: activeTab === 'certificates' ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Certificates & Awards
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {myCourses.map((c) => (
              <div key={c.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <span style={{
                      backgroundColor: c.status === 'Completed' ? '#ecfdf5' : '#fef3c7',
                      color: c.status === 'Completed' ? '#065f46' : '#92400e',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '10px'
                    }}>
                      {c.status}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: '8px 0 4px 0' }}>{c.title}</h3>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    {c.status === 'Completed' ? 'Completed on: ' + c.completionDate : 'Last studied: ' + c.lastStudied}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    <span>Lessons Completed: {c.completedLessons} / {c.totalLessons}</span>
                    <span>{c.progress}% Completed</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: c.progress + '%', backgroundColor: '#059669', height: '100%' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => alert('Resuming course lessons...')}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {c.status === 'Completed' ? 'Review Course Material' : 'Continue Learning →'}
                  </button>

                  {c.status === 'Completed' && (
                    <button
                      onClick={() => setCertModal(c)}
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View & Download PDF Certificate 🏆
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {myCourses.filter(c => c.status === 'Completed').map((c) => (
              <div key={c.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #059669',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>Certificate of Completion</h3>
                <p style={{ color: '#059669', fontWeight: '600', fontSize: '0.95rem', margin: '0 0 15px 0' }}>{c.title}</p>
                <div style={{ fontSize: '0.85rem', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                  <div><strong>Student Name:</strong> Imam Muhammad</div>
                  <div><strong>Completion Date:</strong> {c.completionDate}</div>
                  <div><strong>Certificate No:</strong> {c.certificateNumber}</div>
                  <div><strong>Verification Code:</strong> {c.verificationCode}</div>
                </div>
                <button
                  onClick={() => alert('Generating PDF certificate for download...')}
                  style={{
                    width: '100%',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Download Official PDF Certificate
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}