'use client';
import { useEffect, useState } from 'react';

const inputStyle = {
  width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px',
  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
  color: 'var(--ink)', backgroundColor: 'var(--surface)',
};
const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 };
const primaryButtonStyle = {
  padding: '10px 18px', borderRadius: 8, border: 'none',
  background: 'var(--brand)', color: 'var(--on-accent)',
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
};
const secondaryButtonStyle = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'ih-b-warning',
  CONFIRMED_DUPLICATE: 'ih-b-danger',
  NOT_A_DUPLICATE: 'ih-b-neutral',
  MERGED: 'ih-b-success',
};
const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  CONFIRMED_DUPLICATE: 'Confirmed Duplicate',
  NOT_A_DUPLICATE: 'Not a Duplicate',
  MERGED: 'Merged',
};

type Lookup = { id: string; label: string };
type Flag = {
  id: string; subjectType: string; subjectALabel: string; subjectBLabel: string;
  reason: string; status: string; resolutionNote: string | null;
  flaggedByName: string; resolvedByName: string | null; createdAt: string;
};

export default function DuplicateFlagsPage() {
  const [flags, setFlags] = useState<Flag[] | null>(null);
  const [message, setMessage] = useState('');

  const [subjectType, setSubjectType] = useState('COURSE');
  const [queryA, setQueryA] = useState('');
  const [resultsA, setResultsA] = useState<Lookup[]>([]);
  const [selectedA, setSelectedA] = useState<Lookup | null>(null);
  const [queryB, setQueryB] = useState('');
  const [resultsB, setResultsB] = useState<Lookup[]>([]);
  const [selectedB, setSelectedB] = useState<Lookup | null>(null);
  const [reason, setReason] = useState('');
  const [raising, setRaising] = useState(false);

  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveStatus, setResolveStatus] = useState('CONFIRMED_DUPLICATE');
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  function loadFlags() {
    setFlags(null);
    fetch('/api/qa/duplicate-flags', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => { if (data?.success) setFlags(data.data); else setFlags([]); })
      .catch(() => setFlags([]));
  }

  useEffect(() => { loadFlags(); }, []);

  useEffect(() => {
    const q = queryA.trim();
    if (q.length < 2) { setResultsA([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/qa/duplicate-flags/lookup?type=${subjectType}&q=${encodeURIComponent(q)}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => { if (data?.success) setResultsA(data.data); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
  }, [queryA, subjectType]);

  useEffect(() => {
    const q = queryB.trim();
    if (q.length < 2) { setResultsB([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/qa/duplicate-flags/lookup?type=${subjectType}&q=${encodeURIComponent(q)}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => { if (data?.success) setResultsB(data.data); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
  }, [queryB, subjectType]);

  async function raiseFlag() {
    if (!selectedA || !selectedB || !reason.trim()) return;
    setRaising(true);
    setMessage('');
    try {
      const res = await fetch('/api/qa/duplicate-flags', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectType,
          subjectAId: selectedA.id,
          subjectBId: selectedB.id,
          reason: reason.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to raise flag.');
      setSelectedA(null);
      setSelectedB(null);
      setReason('');
      loadFlags();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setRaising(false);
    }
  }

  async function resolveFlag(id: string) {
    setResolving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/qa/duplicate-flags/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: resolveStatus, resolutionNote: resolveNote.trim() || undefined }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update.');
      setResolvingId(null);
      setResolveNote('');
      loadFlags();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setResolving(false);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 880 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Duplication & Overlap Flags</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Flag two courses, programmes, or categories that may overlap or duplicate one another
          for human review. Nothing here is ever merged or deleted automatically — a flag is
          resolved only once a reviewer records an actual decision.
        </p>
      </div>

      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>{message}</div>}

      <div className="ih-card" style={{ padding: 20, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Raise a Flag</h2>

        <label style={labelStyle}>Subject type</label>
        <select
          value={subjectType}
          onChange={(e) => {
            setSubjectType(e.target.value);
            setSelectedA(null); setSelectedB(null);
            setQueryA(''); setQueryB('');
            setResultsA([]); setResultsB([]);
          }}
          style={{ ...inputStyle, marginBottom: 14 }}
        >
          <option value="COURSE">Course</option>
          <option value="PROGRAM">Programme</option>
          <option value="CATEGORY">Category</option>
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>First subject</label>
            {!selectedA ? (
              <>
                <input value={queryA} onChange={(e) => setQueryA(e.target.value)} style={inputStyle} placeholder="Search…" />
                {resultsA.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {resultsA.map((r) => (
                      <button key={r.id} type="button" onClick={() => { setSelectedA(r); setQueryA(''); setResultsA([]); }} style={{ ...secondaryButtonStyle, textAlign: 'left' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span>{selectedA.label}</span>
                <button type="button" onClick={() => setSelectedA(null)} style={{ ...secondaryButtonStyle, padding: '3px 8px', fontSize: 11 }}>Change</button>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Second subject</label>
            {!selectedB ? (
              <>
                <input value={queryB} onChange={(e) => setQueryB(e.target.value)} style={inputStyle} placeholder="Search…" />
                {resultsB.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {resultsB.map((r) => (
                      <button key={r.id} type="button" onClick={() => { setSelectedB(r); setQueryB(''); setResultsB([]); }} style={{ ...secondaryButtonStyle, textAlign: 'left' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span>{selectedB.label}</span>
                <button type="button" onClick={() => setSelectedB(null)} style={{ ...secondaryButtonStyle, padding: '3px 8px', fontSize: 11 }}>Change</button>
              </div>
            )}
          </div>
        </div>

        <label style={labelStyle}>Why do these look like duplicates or overlaps?</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          style={{ ...inputStyle, marginBottom: 14, resize: 'vertical' as const }}
        />

        <button type="button" disabled={raising || !selectedA || !selectedB || !reason.trim()} onClick={raiseFlag} style={primaryButtonStyle}>
          {raising ? 'Raising…' : 'Raise Flag'}
        </button>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Flags</h2>

      {flags === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
      {flags && flags.length === 0 && (
        <div className="ih-card" style={{ padding: 20, color: 'var(--ink-soft)' }}>No duplication flags raised yet.</div>
      )}
      {flags && flags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {flags.map((f) => (
            <div key={f.id} className="ih-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {f.subjectALabel} <span style={{ color: 'var(--ink-soft)' }}>vs.</span> {f.subjectBLabel}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{f.reason}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6 }}>
                    Flagged by {f.flaggedByName}
                    {f.resolvedByName && ` · Resolved by ${f.resolvedByName}`}
                  </div>
                  {f.resolutionNote && (
                    <div style={{ fontSize: 12.5, marginTop: 6, fontStyle: 'italic' }}>{f.resolutionNote}</div>
                  )}
                </div>
                <span className={`ih-badge ${STATUS_BADGE[f.status]}`} style={{ whiteSpace: 'nowrap' as const }}>
                  {STATUS_LABEL[f.status]}
                </span>
              </div>

              {f.status === 'OPEN' && (
                <div style={{ marginTop: 12 }}>
                  {resolvingId !== f.id ? (
                    <button type="button" onClick={() => { setResolvingId(f.id); setResolveStatus('CONFIRMED_DUPLICATE'); setResolveNote(''); }} style={secondaryButtonStyle}>
                      Resolve
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <select value={resolveStatus} onChange={(e) => setResolveStatus(e.target.value)} style={inputStyle}>
                        <option value="CONFIRMED_DUPLICATE">Confirmed Duplicate</option>
                        <option value="NOT_A_DUPLICATE">Not a Duplicate</option>
                        <option value="MERGED">Merged (already carried out)</option>
                      </select>
                      <input
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        placeholder="Resolution note (optional)"
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" disabled={resolving} onClick={() => resolveFlag(f.id)} style={primaryButtonStyle}>
                          {resolving ? 'Saving…' : 'Save Decision'}
                        </button>
                        <button type="button" onClick={() => setResolvingId(null)} style={secondaryButtonStyle}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
