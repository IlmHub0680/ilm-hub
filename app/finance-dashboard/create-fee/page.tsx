'use client';
import { useState } from 'react';
import { useFinance } from '../context';
import { fieldStyle } from '../types';

export default function CreateFeePage() {
    const { students, terms, refetch } = useFinance();
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [newFee, setNewFee] = useState({ feeType: '', amountUSD: '', termId: '', dueDate: '' });
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState('');

    const isErrorMessage = message.includes('rror') || message.toLowerCase().includes('select') || message.toLowerCase().includes('fill');

    const handleCreateFee = async () => {
        if (!selectedStudentId || !newFee.feeType || !newFee.amountUSD) {
            setMessage('Select a student and fill in fee type and amount.');
            return;
        }

        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/finance/portal', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudentId,
                    feeType: newFee.feeType,
                    amountUSD: Number(newFee.amountUSD),
                    termId: newFee.termId || null,
                    dueDate: newFee.dueDate || null,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Fee record created.');
                setNewFee({ feeType: '', amountUSD: '', termId: '', dueDate: '' });
                refetch();
            } else {
                setMessage(data.error || 'Failed to create fee.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Create Fee</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Create a new fee record for a student.
            </p>

            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage ? 'var(--danger)' : 'var(--success)' }}>
                    {message}
                </div>
            )}

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>New Fee Record</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Student</label>
                        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{ ...fieldStyle, minWidth: 220 }}>
                            <option value="">Select student</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.studentNo})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Fee Type</label>
                        <input type="text" placeholder="e.g. Tuition" value={newFee.feeType} onChange={(e) => setNewFee({ ...newFee, feeType: e.target.value })} style={fieldStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Amount (USD)</label>
                        <input type="number" value={newFee.amountUSD} onChange={(e) => setNewFee({ ...newFee, amountUSD: e.target.value })} style={{ ...fieldStyle, width: 110 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Term</label>
                        <select value={newFee.termId} onChange={(e) => setNewFee({ ...newFee, termId: e.target.value })} style={fieldStyle}>
                            <option value="">No term</option>
                            {terms.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Due Date</label>
                        <input type="date" value={newFee.dueDate} onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })} style={fieldStyle} />
                    </div>
                    <button onClick={handleCreateFee} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Creating…' : 'Create Fee'}
                    </button>
                </div>
            </div>
        </>
    );
}
