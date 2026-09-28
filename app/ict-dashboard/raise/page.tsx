'use client';
import { useState } from 'react';
import { useICT } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: 9, background: 'var(--surface)', color: 'var(--ink)' };

export default function RaiseTicketPage() {
    const { refetch } = useICT();
    const [message, setMessage] = useState('');
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'MEDIUM', category: '' });
    const [raising, setRaising] = useState(false);
    const isErrorMessage = message.includes('rror') || message.includes('equired');

    const handleRaiseTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            setMessage('Subject and description are required.');
            return;
        }

        setRaising(true);
        setMessage('');

        try {
            const res = await fetch('/api/ict/tickets', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setMessage('Ticket raised.');
                setNewTicket({ subject: '', description: '', priority: 'MEDIUM', category: '' });
                refetch();
            } else {
                setMessage(data.error || 'Failed to raise ticket.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setRaising(false);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage ? 'var(--danger)' : 'var(--success)' }}>
                    {message}
                </div>
            )}
            <div className="ih-card">
                <h2 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Raise a Ticket</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        style={fieldStyle}
                    />
                    <textarea
                        placeholder="Description"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        style={{ ...fieldStyle, minHeight: 70 }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <select
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                            style={{ ...fieldStyle, flex: 1 }}
                        >
                            <option value="LOW">Low priority</option>
                            <option value="MEDIUM">Medium priority</option>
                            <option value="HIGH">High priority</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Category (optional, e.g. Network, Hardware)"
                            value={newTicket.category}
                            onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                            style={{ ...fieldStyle, flex: 1 }}
                        />
                    </div>
                    <button onClick={handleRaiseTicket} disabled={raising} className="ih-btn ih-btn-primary" style={{ alignSelf: 'flex-start' }}>
                        {raising ? 'Submitting…' : 'Raise Ticket'}
                    </button>
                </div>
            </div>
        </>
    );
}
