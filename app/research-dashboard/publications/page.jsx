'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const TYPE_LABEL = {
    JOURNAL_ARTICLE: 'Journal Article',
    BOOK: 'Book',
    BOOK_CHAPTER: 'Book Chapter',
    CONFERENCE_PAPER: 'Conference Paper',
    RESEARCH_REPORT: 'Research Report',
    WORKING_PAPER: 'Working Paper',
    OTHER: 'Other',
};

const STATUS_BADGE = {
    DRAFT: 'ih-b-neutral',
    SUBMITTED: 'ih-b-info',
    ACCEPTED: 'ih-b-warning',
    PUBLISHED: 'ih-b-success',
    RETRACTED: 'ih-b-danger',
};

const STATUSES = ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'PUBLISHED', 'RETRACTED'];

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function ResearchPublicationsPage() {
    const { publications, loadingPublications, publicationsError, refetchPublications, refetchOverview, projects } = useResearch();
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ title: '', type: 'JOURNAL_ARTICLE', projectId: '', venue: '', year: '', doiOrLink: '' });
    const [busyId, setBusyId] = useState(null);

    const handleCreate = async () => {
        if (!draft.title.trim()) {
            setMessage('A title is required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/publications', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: draft.title,
                    type: draft.type,
                    projectId: draft.projectId || undefined,
                    venue: draft.venue || undefined,
                    year: draft.year ? parseInt(draft.year, 10) : undefined,
                    doiOrLink: draft.doiOrLink || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Publication recorded.');
                setDraft({ title: '', type: 'JOURNAL_ARTICLE', projectId: '', venue: '', year: '', doiOrLink: '' });
                refetchPublications();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to record publication.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/research/publications/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage(status === 'PUBLISHED' ? 'Publication published.' : 'Publication updated.');
                refetchPublications();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to update publication.');
            }
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}

            <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>Record a Scholarly Output</h3>
                <p style={{ color: 'var(--ink-soft)', marginTop: -6, marginBottom: 12, fontSize: 12.5 }}>
                    Journal articles, books, book chapters, conference papers, research reports and working papers -- entirely separate from Personal Publishing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input style={fieldStyle} type="text" placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <select style={fieldStyle} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                        {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select style={fieldStyle} value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
                        <option value="">No linked project</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <input style={fieldStyle} type="text" placeholder="Venue / publisher" value={draft.venue} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} />
                    <input style={fieldStyle} type="number" placeholder="Year" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
                    <input style={fieldStyle} type="text" placeholder="DOI or link" value={draft.doiOrLink} onChange={(e) => setDraft({ ...draft, doiOrLink: e.target.value })} />
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Saving...' : 'Add Publication'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Scholarly Publications</h3>
                {loadingPublications && <p>Loading...</p>}
                {publicationsError && <p style={{ color: 'var(--danger)' }}>{publicationsError}</p>}
                {!loadingPublications && publications.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No publications recorded yet.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {publications.map((p) => (
                        <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{p.title}</div>
                                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                    {TYPE_LABEL[p.type]}{p.venue ? ` · ${p.venue}` : ''}{p.year ? ` · ${p.year}` : ''}{p.projectTitle ? ` · from project: ${p.projectTitle}` : ''}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`ih-badge ${STATUS_BADGE[p.status] || 'ih-b-neutral'}`}>{p.status}</span>
                                <select
                                    value={p.status}
                                    disabled={busyId === p.id}
                                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                    style={{ ...fieldStyle, width: 'auto', padding: '5px 8px', fontSize: 12.5 }}
                                >
                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
