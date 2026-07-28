'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function InstructorDashboard() {
    const [selectedCourse, setSelectedCourse] = useState('Foundations of Islamic Aqeedah');
    const [scores, setScores] = useState({
        1: { quiz: 18, midterm: 42, final: 35 },
        2: { quiz: 15, midterm: 38, final: 30 },
        3: { quiz: 20, midterm: 45, final: 38 }
    });

    const students = [
        { id: 1, name: 'Abdullah Al-Amin', regNo: 'ILM/2026/001' },
        { id: 2, name: 'Yusuf ibn Malik', regNo: 'ILM/2026/002' },
        { id: 3, name: 'Fatima bint Zayd', regNo: 'ILM/2026/003' }
    ];

    const handleScoreChange = (studentId, field, value) => {
        setScores({
            ...scores,
            [studentId]: {
                ...scores[studentId],
                [field]: Number(value)
            }
        });
    };

    const saveGrades = () => {
        alert('Grades and assessment scores successfully saved and updated for students!');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <Link href="/" style={{ backgroundColor: '#ffffff', color: '#14532d', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #dcfce7' }}>
                        &larr; Back to Home
                    </Link>
                    <div style={{ background: '#16a34a', color: '#ffffff', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                        Instructor Grading Portal
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', color: '#14532d', marginBottom: '10px' }}>Instructor Dashboard & Gradebook</h1>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>Manage class timetables, view enrolled students, and input scores for Quizzes, Midterms, and Finals.</p>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#14532d', marginBottom: '10px' }}>Select Course & Timetable Session:</label>
                    <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
                    >
                        <option>Foundations of Islamic Aqeedah (Mon/Wed 10:00 AM)</option>
                        <option>Mandhumah al-Bayquniyyah in Hadith Science (Tue/Thu 2:00 PM)</option>
                    </select>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ color: '#14532d', marginBottom: '20px' }}>Student Assessment Gradebook ({selectedCourse})</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px' }}>
                                <th style={{ padding: '12px' }}>Student Name</th>
                                <th style={{ padding: '12px' }}>Registration No.</th>
                                <th style={{ padding: '12px' }}>Quiz (Max 20)</th>
                                <th style={{ padding: '12px' }}>Midterm (Max 50)</th>
                                <th style={{ padding: '12px' }}>Final Exam (Max 50)</th>
                                <th style={{ padding: '12px' }}>Total Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => {
                                const s = scores[student.id] || { quiz: 0, midterm: 0, final: 0 };
                                const total = s.quiz + s.midterm + s.final;
                                return (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#1e293b' }}>{student.name}</td>
                                        <td style={{ padding: '14px', color: '#64748b' }}>{student.regNo}</td>
                                        <td style={{ padding: '14px' }}>
                                            <input 
                                                type="number" 
                                                value={s.quiz} 
                                                onChange={(e) => handleScoreChange(student.id, 'quiz', e.target.value)}
                                                style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <input 
                                                type="number" 
                                                value={s.midterm} 
                                                onChange={(e) => handleScoreChange(student.id, 'midterm', e.target.value)}
                                                style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <input 
                                                type="number" 
                                                value={s.final} 
                                                onChange={(e) => handleScoreChange(student.id, 'final', e.target.value)}
                                                style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </td>
                                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#16a34a' }}>{total} / 120</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button 
                            onClick={saveGrades}
                            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                        >
                            Save & Submit Grades
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
