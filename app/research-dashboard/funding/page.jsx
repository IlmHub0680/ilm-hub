'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const STATUS_BADGE = {
    APPLIED: 'ih-b-info',
    AWARDED: 'ih-b-success',
    DECLINED: 'ih-b-danger',
    ACTIVE: 'ih-b-success',
    CLOSED: 'ih-b-neutral',
};

const STATUSES = ['APPLIED', 'AWARDED', 'DECLINED', 'ACTIVE', 'CLOSED'];

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

// Research Funding -- "if applicable". Grant applications/awards/
// status/reporting as RECORDS only. Finance remains responsible for
// actual financial transactions -- there is no "disburse" or "pay"
// action anywhere on this page, only status/amount records.
export default function ResearchFundingPage() {
    const { grants, loadingGrants, refetchGrants, projects } = useResearch();
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [draft, setDraft] = useState({ projectId: '', fundingSource: '', amountRequested: '', currency: 'USD' });
    const [busyId, setBusyId] = useState(null);

    const handleCreate = async () => {
        if (!draft.projectId || !draft.fundingSource.trim()) {
            setMessage('A project and funding source are required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/grants', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: draft.projectId,
                    fundingSource: draft.fundingSource,
                    amountRequested: draft.amountRequested ? parseFloat(draft.amountRequested) : undefined,
                    currency: draft.currency,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Grant record created.');
                setDraft({ projectId: '', fundingSource: '', amountRequested: '', currency: 'USD' });
                refetchGrants();
            } else {
                setMessage(result.error || 'Failed to create grant record.');
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
            const res = await fetch(`/api/research/grants/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                refetchGrants();
            } else {
                setMessage(result.error || 'Failed to update grant.');
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
                <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>New Grant Application</h3>
                <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 16, fontSize: 12.5 }}>
                    Record only -- Finance handles any actual disbursement.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <select style={fieldStyle} value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
                        <option value="">Select project</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <input style={fieldStyle} type="text" placeholder="Funding source" value={draft.fundingSource} onChange={(e) => setDraft({ ...draft, fundingSource: e.target.value })} />
                    <input style={fieldStyle} type="number" placeholder="Amount requested" value={draft.amountRequested} onChange={(e) => setDraft({ ...draft, amountRequested: e.target.value })} />
                    <input style={fieldStyle} type="text" placeholder="Currency" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Creating...' : 'Add Grant Application'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Grants</h3>
                {loadingGrants && <p>Loading...</p>}
                {!loadingGrants && grants.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No grant records yet.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {grants.map((g) => (
                        <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{g.fundingSource}</div>
                                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                    {g.projectTitle} · Requested {g.currency} {g.amountRequested ?? '--'}{g.amountAwarded != null ? ` · Awarded ${g.currency} ${g.amountAwarded}` : ''} · {g.reportCount ?? 0} report(s)
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`ih-badge ${STATUS_BADGE[g.status] || 'ih-b-neutral'}`}>{g.status}</span>
                                <select
                                    value={g.status}
                                    disabled={busyId === g.id}
                                    onChange={(e) => handleStatusChange(g.id, e.target.value)}
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
