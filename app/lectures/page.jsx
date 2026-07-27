'use client';

import { useState } from 'react';
import Link from 'next/link';

const lecturesData = [
  {
    id: '1',
    title: 'The Reality of Tawheed and Its Impact on Daily Life',
    arabicTitle: 'حقيقة التوحيد وأثره في الحياة اليومية',
    instructor: 'Imam Muhammad Jalaal Deen Umar',
    category: 'Educational Program',
    duration: '45 mins',
    date: '2026-07-10',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'An insightful lesson exploring the deep spiritual implications of pure monotheism.'
  },
  {
    id: '2',
    title: 'Common Mistakes in Wudu and Salah',
    arabicTitle: 'أخطاء شائعة في الوضوء والصلاة',
    instructor: 'Shaykh Ahmad Abdullahi Dawud',
    category: 'Educational Program',
    duration: '50 mins',
    date: '2026-07-12',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'Detailed corrective guide on perfecting purification and prayer postures.'
  },
  {
    id: '3',
    title: 'Understanding Legal Maxims in Usul al-Fiqh',
    arabicTitle: 'القواعد الفقهية الكبرى',
    instructor: 'Shaykh Albani Bupei',
    category: 'Educational Program',
    duration: '60 mins',
    date: '2026-07-14',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'An analytical breakdown of classical Islamic legal maxims and their modern applications.'
  },
  {
    id: '4',
    title: 'Mastering Arabic Verb Forms and Derivations',
    arabicTitle: 'دروس في الصرف العربي',
    instructor: 'shaykh farid Abdus Samad',
    category: 'Educational Program',
    duration: '55 mins',
    date: '2026-07-15',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'Breakdown of triliteral roots and verb augmentations in classical texts.'
  },
  {
    id: '5',
    title: 'Friday Khutbah (Sermon): Holding Fast to the Rope of Allah',
    arabicTitle: 'خطبة الجمعة: الاعتصام بحبل الله',
    instructor: 'Imam Muhammad Jalaal Deen Umar',
    category: 'Khutbah (Sermon)',
    duration: '30 mins',
    date: '2026-07-24',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'A powerful Friday sermon reminding the community of unity, patience, and Taqwa.'
  },
  {
    id: '6',
    title: 'Friday Khutbah (Sermon): Rights of the Neighbors in Islam',
    arabicTitle: 'خطبة الجمعة: حقوق الجار في الإسلام',
    instructor: 'Shaykh Ahmad Abdullahi Dawud',
    category: 'Khutbah (Sermon)',
    duration: '35 mins',
    date: '2026-07-17',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'Emphasizing mutual respect, care, and Islamic duties towards neighbors.'
  },
  {
    id: '7',
    title: 'Poem Recitation: Al-Taiyyiyyah in Islamic Ethics',
    arabicTitle: 'قصيدة في الآداب والأخلاق',
    instructor: 'shaykh farid Abdus Samad',
    category: 'Poem',
    duration: '20 mins',
    date: '2026-07-18',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'A melodious and instructive poetic rendition highlighting virtues and noble character.'
  },
  {
    id: '8',
    title: 'Mandhumah (Ode): Manthumat al-Bayquniyyah in Hadith Terminology',
    arabicTitle: 'منظومة البيقوني في مصطلح الحديث',
    instructor: 'Shaykh Albani Bupei',
    category: 'Mandhumah (Ode)',
    duration: '25 mins',
    date: '2026-07-19',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=IlmHubInstitute',
    description: 'Memorizing and explaining classical didactic verses on the categorization of Hadith.'
  }
];

export default function LecturesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational Program');

  const categories = ['Educational Program', 'Khutbah (Sermon)', 'Poem', 'Mandhumah (Ode)'];

  const filteredLectures = lecturesData.filter((lecture) => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lecture.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = lecture.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <Link href="/courses" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Courses Catalog</Link>
            <Link href="/books" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Islamic Bookstore</Link>
            <Link href="/dashboard" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Student Dashboard</Link>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
            Ilm Hub Institute Media Library
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            Explore dedicated sections for Educational Programs, Khutbah (Sermons), Poems, and Mandhumah (Odes).
          </p>
        </div>

        {/* Search & Exclusive Category Tabs Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          border: '1px solid #e5e7eb'
        }}>
          <input
            type="text"
            placeholder="Search current section by title or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? '#059669' : '#f3f4f6',
                  color: selectedCategory === cat ? '#ffffff' : '#374151',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredLectures.map((lecture) => (
            <div key={lecture.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#111827' }}>
                <iframe
                  src={lecture.videoUrl}
                  title={lecture.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>
                      {lecture.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>⏱️ {lecture.duration}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                    {lecture.title}
                  </h3>
                  <p style={{ color: '#047857', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', direction: 'rtl' }}>
                    {lecture.arabicTitle}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '600', margin: '0 0 8px 0' }}>
                    Speaker/Instructor: {lecture.instructor}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                    {lecture.description}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Published: {lecture.date}</span>
                  <span style={{ color: '#059669', fontWeight: '600' }}>Ilm Hub Institute</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}