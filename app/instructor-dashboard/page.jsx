'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
    const router = useRouter();
    const [gradebook, setGradebook] = useState([
        { id: 1, student: 'Tariq ibn Ziyad', course: 'Quranic Arabic', grade: '92%' },
        { id: 2, student: 'Aisha bint Abi Bakr', course: 'Hadith Terminology', grade: '88%' }
    ]);

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#0284c7', color: '#fff', padding: '20px 30px', borderRadius: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '22px' }}>Instructor Portal</h1>
                <button onClick={() => router.push('/')} style={{ padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
                <h3>Gradebook & Assessments Management</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage student grades and course timetables.</p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px' }}>Student Name</th>
                            <th style={{ padding: '12px' }}>Assigned Course</th>
                            <th style={{ padding: '12px' }}>Current Grade</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradebook.map(g => (
                            <tr key={g.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px' }}>{g.student}</td>
                                <td style={{ padding: '12px' }}>{g.course}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{g.grade}</td>
                                <td style={{ padding: '12px' }}><button onClick={() => alert(`Updating grade for ${g.student}`)} style={{ padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit Grade</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
