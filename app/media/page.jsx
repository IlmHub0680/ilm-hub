'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MediaLibraryPage() {
    const [activeCategory, setActiveCategory] = useState('Educational Program');
    const [searchQuery, setSearchQuery] = useState('');

    const mediaItems = {
        'Educational Program': [
            { title: 'The Reality of Tawheed and Its Impact on Daily Life', arabicTitle: '????? ??????? ????? ?? ?????? ???????', speaker: 'Imam Muhammad Jalaal Deen Umar', duration: '45 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Common Mistakes in Wudu and Salah', arabicTitle: '????? ????? ?? ?????? ???????', speaker: 'Shaykh Ahmad Abdullahi Dawud', duration: '50 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Understanding Legal Maxims in Usul al-Fiqh', arabicTitle: '??????? ??????? ??????', speaker: 'Shaykh Albani Bupei', duration: '60 mins', date: 'June 2026', videoId: 'dQw4w9WgXcQ' }
        ],
        'Khutbah (Sermon)': [
            { title: 'The Importance of Sincerity in Knowledge', arabicTitle: '????? ??????? ?? ??? ?????', speaker: 'Shaykh Albani Bupei', duration: '35 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Patience through Trials and Tribulations', arabicTitle: '????? ??? ?????? ?????????', speaker: 'Shaykh Abdul Hanif Batsiadan', duration: '40 mins', date: 'June 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Reviving the Sunnah in Daily Life', arabicTitle: '????? ????? ?? ?????? ???????', speaker: 'Shaykh Khalid Muhammad Suleiman', duration: '38 mins', date: 'June 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Excellence in Character and Ethics', arabicTitle: '??????? ????????? ???????', speaker: 'Shaykh Muhammad Hasan', duration: '42 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' }
        ],
        'Educational Arabic Poems': [
            { title: 'Qasidat al-Burdah Recitation & Reflection', arabicTitle: '????? ?????? ?????? ????????', speaker: 'Shaykh Khalid Muhammad Suleiman', duration: '60 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Tuhfat al-Atfal (Tajweed Poem)', arabicTitle: '???? ??????? ????????', speaker: 'Shaykh Ahmad Abdullahi Dawud', duration: '45 mins', date: 'June 2026', videoId: 'dQw4w9WgXcQ' }
        ],
        'Mandhumah (Scientific Texts and Odes)': [
            { title: 'Mandhumah al-Bayquniyyah in Hadith Science', arabicTitle: '?????? ???????? ?? ????? ??????', speaker: 'Imam Muhammad Jalaal Deen Umar', duration: '50 mins', date: 'July 2026', videoId: 'dQw4w9WgXcQ' },
            { title: 'Umdah al-Ahkam Explanatory Sessions', arabicTitle: '???? ??????? ?? ???? ??? ??????', speaker: 'Shaykh Farid Abdus Samad', duration: '65 mins', date: 'June 2026', videoId: 'dQw4w9WgXcQ' }
        ]
    };

    const categories = [
        'Educational Program',
        'Khutbah (Sermon)',
        'Educational Arabic Poems',
        'Mandhumah (Scientific Texts and Odes)'
    ];

    const currentItems = mediaItems[activeCategory] || [];
    const filteredItems = currentItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
                {/* Top Nav Links */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <Link href="/" style={{ backgroundColor: '#ffffff', color: '#14532d', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #dcfce7', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        &larr; Back to Home
                    </Link>
                    <div style={{ display: 'flex', gap: '20px', fontWeight: 'bold', fontSize: '15px' }}>
                        <Link href="/courses" style={{ color: '#16a34a', textDecoration: 'none' }}>Courses Catalog</Link>
                        <Link href="/bookstore" style={{ color: '#16a34a', textDecoration: 'none' }}>Islamic Bookstore</Link>
                        <Link href="/dashboard" style={{ color: '#16a34a', textDecoration: 'none' }}>Student Dashboard</Link>
                    </div>
                </div>

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', color: '#14532d', marginBottom: '10px' }}>Ilm Hub Institute Media Library</h1>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>Explore dedicated sections for Educational Programs, Khutbah (Sermons), Educational Arabic Poems, and Mandhumah (Scientific Texts and Odes).</p>
                </div>

                {/* Search & Category Filter Box */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="Search current section by title or speaker..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#14532d', fontSize: '14px' }}>Category:</strong>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                                style={{
                                    backgroundColor: activeCategory === cat ? '#16a34a' : '#f1f5f9',
                                    color: activeCategory === cat ? '#ffffff' : '#334155',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <div key={index} style={{ background: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ height: '160px', backgroundColor: '#14532d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '40px' }}>
                                    ??
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activeCategory}</span>
                                        <h3 style={{ margin: '8px 0 12px 0', color: '#0f172a', fontSize: '18px', lineHeight: '1.4' }}>{item.title}</h3>
                                        <p style={{ margin: '0 0 6px 0', color: '#475569', fontSize: '14px' }}><strong>Speaker:</strong> {item.speaker}</p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Duration: {item.duration} &bull; {item.date}</p>
                                    </div>
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                                        <button 
                                            onClick={() => alert('Now playing: ' + item.title)} 
                                            style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                                        >
                                            Watch Session
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>No media sessions found matching your search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
