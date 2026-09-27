'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const CONCERN_LABEL = {
    PLAGIARISM: 'Plagiarism',
    DATA_FABRICATION: 'Data Fabrication',
    AUTHORSHIP_DISPUTE: 'Authorship Dispute',
    ETHICS_VIOLATION: 'Ethics Violation',
    CONFLICT_OF_INTEREST: 'Conflict of Interest',
    OTHER: 'Other',
};

const STATUS_BADGE = {
    REPORTED: 'ih-b-warning',
    UNDER_INVESTIGATION: 'ih-b-warning',
    RESOLVED: 'ih-b-success',
    DISMISSED: 'ih-b-neutral',
};

const STATUSES = ['REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'];

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

// Research Integrity -- "where applicable". Strict permissions: this
// entire section requires RESEARCH_OPS edit access (see the API
// route's own comment) -- there is no view-only path into these
// records, matching the confidentiality this data needs. Deliberately
// separate from student academic IntegrityCase.
export default function ResearchIntegrityPage() {
    const { integrityCases, loadingIntegrityCases, integrityCasesError, refetchIntegrityCases, projects, publications } = useResearch();
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ concernType: 'PLAGIARISM', description: '', projectId: '', publicationId: '' });
    const [busyId, setBusyId] = useState(null);
    const [notesDraft, setNotesDraft] = useState({});

    const handleCreate = async () => {
        if (!draft.description.trim()) {
            setMessage('A description is required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/integrity', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concernType: draft.concernType,
                    description: draft.description,
                    projectId: draft.projectId || undefined,
                    publicationId: draft.publicationId || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Concern logged.');
                setDraft({ concernType: 'PLAGIARISM', description: '', projectId: '', publicationId: '' });
                refetchIntegrityCases();
            } else {
                setMessage(result.error || 'Failed to log the concern.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id, changes) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/research/integrity/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                refetchIntegrityCases();
            } else {
                setMessage(result.error || 'Failed to update the case.');
            }
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>
            <div className="ih-card" style={{ background: 'var(--warning-tint, #fff6e5)', border: '1px solid var(--warning, #c98a1f)', marginBottom: 20, fontSize: 13 }}>
                Confidential -- these records are visible only to Research & Scholarly Affairs staff and Admin/Super Admin oversight.
            </div>

            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}

            <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>Log a Research Integrity Concern</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <select style={fieldStyle} value={draft.concernType} onChange={(e) => setDraft({ ...draft, concernType: e.target.value })}>
                        {Object.entries(CONCERN_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                    <select style={fieldStyle} value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
                        <option value="">No linked project</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <select style={fieldStyle} value={draft.publicationId} onChange={(e) => setDraft({ ...draft, publicationId: e.target.value })}>
                        <option value="">No linked publication</option>
                        {publications.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Logging...' : 'Log Concern'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Integrity Cases</h3>
                {loadingIntegrityCases && <p>Loading...</p>}
                {integrityCasesError && <p style={{ color: 'var(--danger)' }}>{integrityCasesError}</p>}
                {!loadingIntegrityCases && integrityCases.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No integrity concerns logged.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {integrityCases.map((c) => (
                        <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{CONCERN_LABEL[c.concernType]}{c.projectTitle ? ` -- ${c.projectTitle}` : ''}{c.publicationTitle ? ` -- ${c.publicationTitle}` : ''}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{c.description}</div>
                                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                                        Reported by {c.reportedByName} · {new Date(c.createdAt).toLocaleDateString()}
                                        {c.resolvedByName ? ` · Resolved by ${c.resolvedByName}` : ''}
                                    </div>
                                </div>
                                <select
                                    value={c.status}
                                    disabled={busyId === c.id}
                                    onChange={(e) => handleUpdate(c.id, { status: e.target.value })}
                                    style={{ ...fieldStyle, width: 'auto', padding: '5px 8px', fontSize: 12.5 }}
                                >
                                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                                <input
                                    style={{ ...fieldStyle, fontSize: 12.5 }}
                                    type="text"
                                    placeholder="Investigation notes / outcome"
                                    value={notesDraft[c.id] ?? c.investigationNotes ?? ''}
                                    onChange={(e) => setNotesDraft({ ...notesDraft, [c.id]: e.target.value })}
                                />
                                <button
                                    className="ih-btn ih-btn-secondary"
                                    style={{ fontSize: 12.5 }}
                                    disabled={busyId === c.id}
                                    onClick={() => handleUpdate(c.id, { investigationNotes: notesDraft[c.id] ?? c.investigationNotes ?? '' })}
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
