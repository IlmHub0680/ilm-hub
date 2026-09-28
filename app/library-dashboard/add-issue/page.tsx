'use client';
import { useState } from 'react';
import { useLibraryDash } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: 9, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 };

export default function AddIssuePage() {
    const { items, students, refetch } = useLibraryDash();
    const [message, setMessage] = useState('');
    const [newItem, setNewItem] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
    const [creating, setCreating] = useState(false);
    const [issueForm, setIssueForm] = useState({ itemId: '', studentId: '', dueAt: '' });
    const [issuing, setIssuing] = useState(false);
    const isErrorMessage = message.includes('rror') || message.includes('ailed') || message.includes('required') || message.includes('Select');

    const handleCreateItem = async () => {
        if (!newItem.title || !newItem.author) {
            setMessage('Title and author are required.');
            return;
        }

        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/library/portal', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Item added to catalogue.');
                setNewItem({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
                refetch();
            } else {
                setMessage(data.error || 'Failed to add item.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    const handleIssueLoan = async () => {
        if (!issueForm.itemId || !issueForm.studentId || !issueForm.dueAt) {
            setMessage('Select an item, a student, and a due date.');
            return;
        }

        setIssuing(true);
        setMessage('');
        try {
            const res = await fetch('/api/library/loans/issue', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issueForm),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Loan issued.');
                setIssueForm({ itemId: '', studentId: '', dueAt: '' });
                refetch();
            } else {
                setMessage(data.error || 'Failed to issue loan.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setIssuing(false);
        }
    };

    const handleReserve = async () => {
        if (!issueForm.itemId || !issueForm.studentId) {
            setMessage('Select an item and a student to reserve.');
            return;
        }

        setIssuing(true);
        setMessage('');
        try {
            const res = await fetch('/api/library/reservations', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: issueForm.itemId, studentId: issueForm.studentId }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Reservation placed. It will show under Reservations once made.');
                setIssueForm({ itemId: '', studentId: '', dueAt: '' });
                refetch();
            } else {
                setMessage(data.error || 'Failed to place reservation.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setIssuing(false);
        }
    };

    const selectedItem = items.find((i: any) => i.id === issueForm.itemId);
    const noCopiesAvailable = Boolean(selectedItem && selectedItem.availableCopies <= 0);

    return (
        <>
            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage ? 'var(--danger)' : 'var(--success)' }}>
                    {message}
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="ih-card">
                    <h2 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Add Catalogue Item</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input type="text" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} style={fieldStyle} />
                        <input type="text" placeholder="Author" value={newItem.author} onChange={(e) => setNewItem({ ...newItem, author: e.target.value })} style={fieldStyle} />
                        <input type="text" placeholder="ISBN (optional)" value={newItem.isbn} onChange={(e) => setNewItem({ ...newItem, isbn: e.target.value })} style={fieldStyle} />
                        <input type="text" placeholder="Category (optional)" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={fieldStyle} />
                        <input type="number" placeholder="Total copies" value={newItem.totalCopies} onChange={(e) => setNewItem({ ...newItem, totalCopies: Number(e.target.value) })} style={fieldStyle} />
                        <button onClick={handleCreateItem} disabled={creating} className="ih-btn ih-btn-primary">
                            {creating ? 'Adding…' : 'Add Item'}
                        </button>
                    </div>
                </div>

                <div className="ih-card">
                    <h2 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Issue Loan</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} style={fieldStyle}>
                            <option value="">Select item</option>
                            {items.map((i: any) => (
                                <option key={i.id} value={i.id} disabled={i.availableCopies <= 0}>
                                    {i.title} ({i.availableCopies}/{i.totalCopies} available)
                                </option>
                            ))}
                        </select>
                        <select value={issueForm.studentId} onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} style={fieldStyle}>
                            <option value="">Select student</option>
                            {students.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.studentNo})</option>
                            ))}
                        </select>
                        <input type="date" value={issueForm.dueAt} onChange={(e) => setIssueForm({ ...issueForm, dueAt: e.target.value })} style={fieldStyle} />
                        <button onClick={handleIssueLoan} disabled={issuing || noCopiesAvailable} className="ih-btn ih-btn-gold">
                            {issuing ? 'Issuing…' : 'Issue Loan'}
                        </button>
                        {noCopiesAvailable && (
                            <button onClick={handleReserve} disabled={issuing} className="ih-btn ih-btn-secondary">
                                {issuing ? 'Placing…' : 'No copies available — Reserve for student instead'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
