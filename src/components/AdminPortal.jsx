import React, { useState } from 'react';

export default function AdminPortal({ currentUser }) {
    const [adminSection, setAdminSection] = useState('institute');

    if (currentUser?.role !== 'Super Admin' && currentUser?.role !== 'Instructor') {
        return <div style={{ padding: '40px', color: 'red' }}>Access Denied. Admin credentials required.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Admin Navigation Header for the 3 Sections */}
            <header style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>IlmHub Admin Control Center</h2>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setAdminSection('institute')}
                        style={{ padding: '8px 16px', background: adminSection === 'institute' ? '#ffffff' : 'transparent', color: adminSection === 'institute' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                    >
                        Institute Section
                    </button>
                    <button 
                        onClick={() => setAdminSection('author')}
                        style={{ padding: '8px 16px', background: adminSection === 'author' ? '#ffffff' : 'transparent', color: adminSection === 'author' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                    >
                        Author Section
                    </button>
                    <button 
                        onClick={() => setAdminSection('publisher')}
                        style={{ padding: '8px 16px', background: adminSection === 'publisher' ? '#ffffff' : 'transparent', color: adminSection === 'publisher' ? '#14532d' : '#ffffff', border: '1px solid #ffffff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                    >
                        Publisher Section
                    </button>
                </div>
            </header>

            {/* Dynamic Section Renderer */}
            <main style={{ padding: '30px', flex: 1 }}>
                {adminSection === 'institute' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0 }}>Institute Management (Academics & Schedules)</h3>
                        <p style={{ color: '#64748b' }}>Manage course timetables, assign instructors, and oversee student records.</p>
                    </div>
                )}

                {adminSection === 'author' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0 }}>Author Management & Submissions</h3>
                        <p style={{ color: '#64748b' }}>Review manuscripts, track author royalties, and manage seller profiles.</p>
                    </div>
                )}

                {adminSection === 'publisher' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ color: '#14532d', marginTop: 0 }}>Publisher Section & Catalog Distribution</h3>
                        <p style={{ color: '#64748b' }}>Handle book publishing services, coupon generation, and store distribution catalogs.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
