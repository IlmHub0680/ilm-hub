'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

const STATUS_BADGE = {
    ACTIVE: 'ih-b-success',
    ON_HOLD: 'ih-b-warning',
    COMPLETED: 'ih-b-neutral',
    DISCONTINUED: 'ih-b-danger',
};

// Research Supervision -- "if the institute offers research-based
// programmes". No Program row currently uses DOCTORATE/MASTERS/
// POSTGRADUATE (verified against seed data), so there is no research
// student to supervise today. The schema/API layer is fully built and
// ready regardless; this page is kept a light, honest empty-state
// rather than a fully-fleshed workflow, since real usage is zero.
export default function ResearchSupervisionPage() {
    const { supervisions, loadingSupervisions, refetchSupervisions, staffOptions, studentOptions } = useResearch();
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ studentId: '', supervisorId: '', topic: '' });

    const handleCreate = async () => {
        if (!draft.studentId || !draft.supervisorId || !draft.topic.trim()) {
            setMessage('A student, supervisor and research topic are required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/supervision', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Supervision record created.');
                setDraft({ studentId: '', supervisorId: '', topic: '' });
                refetchSupervisions();
            } else {
                setMessage(result.error || 'Failed to create supervision record.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}

            {supervisions.length === 0 && !loadingSupervisions && !showForm && (
                <div className="ih-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>No Research Supervisions Yet</h3>
                    <p style={{ color: 'var(--ink-soft)', maxWidth: 440, margin: '0 auto 16px', fontSize: 13.5 }}>
                        The institute does not currently offer a research-based programme (Master's/Doctorate),
                        so there are no research students to supervise. This area is ready for when one exists --
                        supervisor and co-supervisor assignment, progress meetings, and completion tracking all work below.
                    </p>
                    <button className="ih-btn ih-btn-secondary" onClick={() => setShowForm(true)}>Add a Supervision Record</button>
                </div>
            )}

            {(showForm || supervisions.length > 0) && (
                <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>New Supervision Record</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select style={fieldStyle} value={draft.studentId} onChange={(e) => setDraft({ ...draft, studentId: e.target.value })}>
                            <option value="">Select student</option>
                            {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.studentNo})</option>)}
                        </select>
                        <select style={fieldStyle} value={draft.supervisorId} onChange={(e) => setDraft({ ...draft, supervisorId: e.target.value })}>
                            <option value="">Select supervisor</option>
                            {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input style={fieldStyle} type="text" placeholder="Research topic" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} />
                        <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                            {creating ? 'Creating...' : 'Create Supervision Record'}
                        </button>
                    </div>
                </div>
            )}

            {supervisions.length > 0 && (
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Supervisions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {supervisions.map((s) => (
                            <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{s.studentName} -- {s.topic}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        Supervisor: {s.supervisorName}{s.coSupervisors.length > 0 ? ` · Co-supervisors: ${s.coSupervisors.map((c) => c.name).join(', ')}` : ''} · {s.meetingCount ?? 0} meeting(s)
                                    </div>
                                </div>
                                <span className={`ih-badge ${STATUS_BADGE[s.status] || 'ih-b-neutral'}`}>{s.status.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
