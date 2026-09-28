'use client';
import { useState } from 'react';
import { useICT } from '../context';

const STATUS_BADGE: Record<string, string> = {
    OPEN: 'ih-b-warning',
    IN_PROGRESS: 'ih-b-info',
    RESOLVED: 'ih-b-success',
    CLOSED: 'ih-b-neutral',
    REOPENED: 'ih-b-danger',
};

const PRIORITY_BADGE: Record<string, string> = {
    LOW: 'ih-b-neutral',
    MEDIUM: 'ih-b-info',
    HIGH: 'ih-b-warning',
    URGENT: 'ih-b-danger',
};

const MAX_REOPENS = 2;

function NotesPanel({ ticketId }: { ticketId: string }) {
    const [notes, setNotes] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/ict/tickets/${ticketId}/notes`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                setNotes(data.data || []);
            } else {
                setError(data.error || 'Failed to load notes.');
            }
        } catch {
            setError('An error occurred.');
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleOpen = () => {
        if (!loaded) load();
    };

    const handleDownload = async (noteId: string) => {
        try {
            const res = await fetch(`/api/ict/tickets/${ticketId}/notes/${noteId}/download`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data.url) {
                window.open(data.url, '_blank');
            }
        } catch {
            // ignore
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError('Note text is required.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            let attachmentKey: string | null = null;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch(`/api/ict/tickets/${ticketId}/notes/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok || !uploadData.success) {
                    setError(uploadData.error || 'Failed to upload attachment.');
                    setSubmitting(false);
                    return;
                }
                attachmentKey = uploadData.key;
            }

            const res = await fetch(`/api/ict/tickets/${ticketId}/notes`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: text, attachmentKey }),
            });
            const data = await res.json();

            if (res.ok) {
                setText('');
                setFile(null);
                load();
            } else {
                setError(data.error || 'Failed to add note.');
            }
        } catch {
            setError('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <details style={{ marginTop: 10 }} onToggle={(e) => (e.target as HTMLDetailsElement).open && handleOpen()}>
            <summary style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--brand)' }}>
                Internal notes
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {error && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
                {loading ? (
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Loading notes…</div>
                ) : notes.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>No internal notes yet.</div>
                ) : (
                    notes.map((n) => (
                        <div key={n.id} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 8, fontSize: 12.5 }}>
                            <div>{n.note}</div>
                            <div style={{ color: 'var(--ink-soft)', fontSize: 11, marginTop: 2 }}>
                                {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                                {n.attachmentUrl && (
                                    <>
                                        {' · '}
                                        <button
                                            onClick={() => handleDownload(n.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 0, fontSize: 11, textDecoration: 'underline' }}
                                        >
                                            Attachment
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}

                <textarea
                    placeholder="Add an internal note (staff only)…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '7px 9px', fontSize: 12.5, background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit' }}
                />
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ fontSize: 11.5 }}
                />
                <button onClick={handleSubmit} disabled={submitting} className="ih-btn ih-btn-secondary" style={{ padding: '5px 10px', fontSize: 12, alignSelf: 'flex-start' }}>
                    {submitting ? 'Adding…' : 'Add Note'}
                </button>
            </div>
        </details>
    );
}

export default function TicketsPage() {
    const { tickets, loading, error, refetch } = useICT();
    const [message, setMessage] = useState('');
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const isErrorMessage = message.includes('rror') || message.includes('ailed');
    const filteredTickets = statusFilter ? tickets.filter((t: any) => t.status === statusFilter) : tickets;

    const updateTicket = async (ticketId: string, payload: Record<string, any>, successMessage: string) => {
        setActioningId(ticketId);
        setMessage('');

        try {
            const res = await fetch(`/api/ict/tickets/${ticketId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(successMessage);
                refetch();
            } else {
                setMessage(data.error || 'Failed to update ticket.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setActioningId(null);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage ? 'var(--danger)' : 'var(--success)' }}>
                    {message}
                </div>
            )}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: 20 }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', background: 'var(--surface)', color: 'var(--ink)' }}
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REOPENED">Reopened</option>
                </select>
            </div>

            {loading ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading tickets…</div>
            ) : filteredTickets.length === 0 ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No tickets found.</div>
            ) : (
                filteredTickets.map((ticket: any) => (
                    <div key={ticket.id} className="ih-card" style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: 16 }}>{ticket.subject}</h3>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {ticket.escalated && <span className="ih-badge ih-b-danger">Escalated</span>}
                                <span className={`ih-badge ${PRIORITY_BADGE[ticket.priority] || 'ih-b-neutral'}`}>{ticket.priority}</span>
                                <span className={`ih-badge ${STATUS_BADGE[ticket.status] || 'ih-b-neutral'}`}>{ticket.status.replace(/_/g, ' ')}</span>
                            </div>
                        </div>

                        <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '0 0 8px' }}>{ticket.description}</p>

                        <p style={{ color: 'var(--ink-soft)', fontSize: 12, margin: '0 0 12px' }}>
                            Raised by {ticket.raisedBy} ({ticket.raisedByRole}) · {new Date(ticket.createdAt).toLocaleDateString()}
                            {ticket.category && ` · ${ticket.category}`}
                            {ticket.assignedTo && ` · Assigned to ${ticket.assignedTo}`}
                            {ticket.firstRespondedAt && ` · First response ${new Date(ticket.firstRespondedAt).toLocaleDateString()}`}
                            {ticket.reopenedCount > 0 && ` · Reopened ${ticket.reopenedCount}/${MAX_REOPENS}`}
                        </p>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {ticket.status === 'OPEN' && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { status: 'IN_PROGRESS', assignToSelf: true }, 'Ticket updated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Take Ticket
                                </button>
                            )}

                            {ticket.status === 'REOPENED' && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { status: 'IN_PROGRESS', assignToSelf: true }, 'Ticket updated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Take Reopened Ticket
                                </button>
                            )}

                            {(ticket.status === 'IN_PROGRESS') && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { status: 'RESOLVED' }, 'Ticket updated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-primary"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Mark Resolved
                                </button>
                            )}

                            {(ticket.status === 'RESOLVED' || ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'REOPENED') && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { status: 'CLOSED' }, 'Ticket updated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-ghost"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Close
                                </button>
                            )}

                            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.reopenedCount < MAX_REOPENS && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { status: 'REOPEN' }, 'Ticket reopened.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-ghost"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Reopen
                                </button>
                            )}

                            {!ticket.escalated && ticket.status !== 'CLOSED' && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { escalate: true }, 'Ticket escalated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-danger"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Escalate
                                </button>
                            )}

                            {ticket.escalated && (
                                <button
                                    onClick={() => updateTicket(ticket.id, { deescalate: true }, 'Ticket de-escalated.')}
                                    disabled={actioningId === ticket.id}
                                    className="ih-btn ih-btn-ghost"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    De-escalate
                                </button>
                            )}
                        </div>

                        <NotesPanel ticketId={ticket.id} />
                    </div>
                ))
            )}
        </>
    );
}
