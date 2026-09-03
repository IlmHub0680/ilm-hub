'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentPortalPage() {
    const router = useRouter();
    const [courses] = useState([
        { id: 1, name: 'Quranic Arabic & Morphology', instructor: 'Shaykh Farid Abdul Samad', grade: 'A (94%)', status: 'In Progress' },
        { id: 2, name: 'Hadith Terminology (Mustalah)', instructor: 'Dr. Ahmad Al-Masri', grade: 'A- (89%)', status: 'In Progress' }
    ]);

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e3a8a', color: '#fff', padding: '20px 30px', borderRadius: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px' }}>Student Portal Dashboard</h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>Student ID: EP2026001 | Zayd ibn Thabit</p>
                </div>
                <button onClick={() => router.push('/')} style={{ padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', marginBottom: '20px' }}>
                <h3>Enrolled Courses & Academic Standing</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Current term coursework and grade summaries.</p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px' }}>Course Title</th>
                            <th style={{ padding: '12px' }}>Instructor</th>
                            <th style={{ padding: '12px' }}>Standing / Grade</th>
                            <th style={{ padding: '12px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                                <td style={{ padding: '12px' }}>{c.instructor}</td>
                                <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>{c.grade}</td>
                                <td style={{ padding: '12px' }}>{c.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
