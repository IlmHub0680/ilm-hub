'use client';

import { useState } from 'react';
import Link from 'next/link';

const coursesData = [
  {
    id: '1',
    slug: 'fundamentals-of-aqeedah',
    title: 'Fundamentals of Islamic Aqeedah',
    arabicTitle: 'أصول العقيدة الإسلامية',
    instructor: 'Imam Muhammad Jalaal Deen Umar',
    category: 'Aqeedah',
    priceType: 'Free',
    price: 0,
    duration: '6 Weeks',
    image: 'https://images.unsplash.com/photo-1584282734721-a53d6118d42d?auto=format&fit=crop&w=600&q=80',
    description: 'Learn the foundational pillars of Islamic belief, tawhid, and refutation of misconceptions.'
  },
  {
    id: '2',
    slug: 'fiqh-of-taharah-and-salah',
    title: 'Fiqh of Taharah and Salah',
    arabicTitle: 'فقه الطهارة والصلاة',
    instructor: 'Shaykh Ahmad Abdullahi Dawud',
    category: 'Fiqh',
    priceType: 'Free',
    price: 0,
    duration: '4 Weeks',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
    description: 'Master the rules of purification, wudu, ghusl, and establishing correct daily prayers.'
  },
  {
    id: '3',
    slug: 'advanced-usool-al-fiqh',
    title: 'Advanced Usool al-Fiqh',
    arabicTitle: 'أصول الفقه المتقدم',
    instructor: 'Shaykh Albani Bupei',
    category: 'Jurisprudence',
    priceType: 'Paid',
    price: 49.99,
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    description: 'Deep dive into legal theory, sources of Islamic law, and juristic methodologies.'
  },
  {
    id: '4',
    slug: 'classical-arabic-morphology',
    title: 'Classical Arabic & Morphology',
    arabicTitle: 'الصرف العربي المتقدم',
    instructor: 'Shaykh Farid Abdus Samad',
    category: 'Language',
    priceType: 'Paid',
    price: 59.99,
    duration: '10 Weeks',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
    description: 'Master Arabic word roots, verb conjugations, and structural grammatical rules.'
  },
  {
    id: '5',
    slug: 'hifdh-quran-memorization',
    title: 'Hifdh (Qur’an Memorization)',
    arabicTitle: 'تحفيظ القرآن الكريم',
    instructor: 'Shaykh Farid Abdus Samad',
    category: 'Qur’an',
    priceType: 'Paid',
    price: 39.99,
    duration: '12 Weeks',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
    description: 'Structured memorization program with proper tajweed tracking and revision techniques.'
  },
  {
    id: '6',
    slug: 'quran-recital-tajweed',
    title: 'Qur’an Recital & Tajweed',
    arabicTitle: 'تلاوة القرآن وتجويده',
    instructor: 'Shaykh Ahmad Abdullahi Dawud',
    category: 'Qur’an',
    priceType: 'Paid',
    price: 34.99,
    duration: '6 Weeks',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: 'Master articulation points (Makharij) and recitation rules for beautiful Quranic delivery.'
  },
  {
    id: '7',
    slug: 'hadith-studies',
    title: 'Hadith Studies & Explanation',
    arabicTitle: 'دراسات الحديث الشريف',
    instructor: 'Shaykh Albani Bupei',
    category: 'Hadith',
    priceType: 'Free',
    price: 0,
    duration: '6 Weeks',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    description: 'Study selected authentic narrations from Umdat al-Ahkam and Al-Arba\'in an-Nawawiyyah.'
  },
  {
    id: '8',
    slug: 'tarbiya-islamic-education',
    title: 'Tarbiya (Islamic Character & Education)',
    arabicTitle: 'التربية الإسلامية والتزكية',
    instructor: 'Imam Muhammad Jalaal Deen Umar',
    category: 'Tarbiya',
    priceType: 'Free',
    price: 0,
    duration: '4 Weeks',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
    description: 'Nurturing spiritual excellence, moral character, and self-purification in daily life.'
  },
  {
    id: '9',
    slug: 'seerah-of-the-prophet',
    title: 'Seerah of the Prophet ﷺ',
    arabicTitle: 'السيرة النبوية العطرة',
    instructor: 'Shaykh Farid Abdus Samad',
    category: 'Seerah',
    priceType: 'Free',
    price: 0,
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Comprehensive study of the noble biography of Prophet Muhammad ﷺ from Makkah to Madinah.'
  },
  {
    id: '10',
    slug: 'tafsir-quran-exegesis',
    title: 'Tafsir Qur’an Exegesis',
    arabicTitle: 'تفسير القرآن الكريم',
    instructor: 'Shaykh Albani Bupei',
    category: 'Tafsir',
    priceType: 'Paid',
    price: 44.99,
    duration: '10 Weeks',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    description: 'Deep contextual commentary and linguistic analysis of selected Surahs from the Noble Qur’an.'
  }
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Aqeedah', 'Fiqh', 'Jurisprudence', 'Language', 'Qur’an', 'Hadith', 'Tarbiya', 'Seerah', 'Tafsir'];

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesPrice = priceFilter === 'All' || course.priceType === priceFilter;

    return matchesSearch && matchesCategory && matchesPrice;
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
            <Link href="/books" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Islamic Bookstore</Link>
            <Link href="/lectures" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Lectures Library</Link>
            <Link href="/dashboard" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>Student Dashboard</Link>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
            Study Courses Catalog
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            Explore our structured free and paid study courses taught by qualified instructors.
          </p>
        </div>

        {/* Search & Filter Bar */}
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
          {/* Search Input (Maintained as requested) */}
          <input
            type="text"
            placeholder="Search courses by title or instructor..."
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Free vs Paid Toggle Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginRight: '5px' }}>Filter:</span>
              {['All', 'Free', 'Paid'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPriceFilter(type)}
                  style={{
                    backgroundColor: priceFilter === type ? '#059669' : '#f3f4f6',
                    color: priceFilter === type ? '#ffffff' : '#374151',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {type} Courses
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: selectedCategory === cat ? '#1e40af' : '#f3f4f6',
                    color: selectedCategory === cat ? '#ffffff' : '#374151',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Courses Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredCourses.map((course) => (
            <div key={course.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#e6f4ea' }}>
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: course.priceType === 'Free' ? '#10b981' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {course.priceType === 'Free' ? 'Free Course' : `$${course.price}`}
                </span>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>
                      {course.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{course.duration}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                    {course.title}
                  </h3>
                  <p style={{ color: '#047857', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0', direction: 'rtl' }}>
                    {course.arabicTitle}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: '600', margin: '0 0 8px 0' }}>
                    Instructor: {course.instructor}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                    {course.description}
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Link
                    href={`/courses/${course.slug}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      width: '100%',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    View Syllabus & Enroll →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}