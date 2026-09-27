'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function ResearchCollaborationPage() {
    const { partners, loadingPartners, refetchPartners, projects } = useResearch();
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ name: '', type: '', country: '', contactName: '', contactEmail: '', projectId: '' });

    const handleCreate = async () => {
        if (!draft.name.trim()) {
            setMessage('A partner name is required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/collaboration/partners', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: draft.name,
                    type: draft.type || undefined,
                    country: draft.country || undefined,
                    contactName: draft.contactName || undefined,
                    contactEmail: draft.contactEmail || undefined,
                    projectId: draft.projectId || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Partner added.');
                setDraft({ name: '', type: '', country: '', contactName: '', contactEmail: '', projectId: '' });
                refetchPartners();
            } else {
                setMessage(result.error || 'Failed to add partner.');
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

            <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Add a Collaboration Partner</h3>
                <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 16, fontSize: 13 }}>
                    External institutional partners for collaborative research projects.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input style={fieldStyle} type="text" placeholder="Partner / institution name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                    <input style={fieldStyle} type="text" placeholder="Type (e.g. University, NGO)" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
                    <input style={fieldStyle} type="text" placeholder="Country" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
                    <input style={fieldStyle} type="text" placeholder="Contact name" value={draft.contactName} onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} />
                    <input style={fieldStyle} type="email" placeholder="Contact email" value={draft.contactEmail} onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })} />
                    <select style={fieldStyle} value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
                        <option value="">Link to a project (optional)</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Adding...' : 'Add Partner'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Collaboration Partners</h3>
                {loadingPartners && <p>Loading...</p>}
                {!loadingPartners && partners.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No collaboration partners yet.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {partners.map((p) => (
                        <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 14 }}>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                {[p.type, p.country].filter(Boolean).join(' · ')}{p.contactName ? ` · ${p.contactName}` : ''} · {p.projectCount} linked project(s)
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
