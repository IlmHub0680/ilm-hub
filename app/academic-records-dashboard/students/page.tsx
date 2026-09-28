'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type StudentRow = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    programme: string | null;
    level: number | null;
    status: string;
};

const STATUS_BADGE: Record<string, string> = {
    ACTIVE: 'ih-b-success',
    GRADUATED: 'ih-b-success',
    ADMITTED: 'ih-b-neutral',
    APPLICANT: 'ih-b-neutral',
    DEFERRED: 'ih-b-warning',
    SUSPENDED: 'ih-b-danger',
    WITHDRAWN: 'ih-b-danger',
    DISMISSED: 'ih-b-danger',
};

export default function RecordsStudentsPage() {
    const [query, setQuery] = useState('');
    const [rows, setRows] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');

        const url = query.trim()
            ? `/api/records/students?q=${encodeURIComponent(query.trim())}`
            : '/api/records/students';

        const handle = setTimeout(() => {
            fetch(url, { credentials: 'include', signal: controller.signal })
                .then(async (res) => {
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || 'Failed to search students.');
                    setRows(result.students || []);
                })
                .catch((err) => {
                    if (err?.name !== 'AbortError') setError(err.message);
                })
                .finally(() => setLoading(false));
        }, 250);

        return () => {
            clearTimeout(handle);
            controller.abort();
        };
    }, [query]);

    return (
        <div className="ih-card">
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Student Records</h2>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                    Look up any student on record by name, student number, or programme.
                </p>
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, student no., or programme…"
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    marginBottom: 16,
                    fontSize: 14,
                    boxSizing: 'border-box',
                }}
            />

            {error && (
                <div className="ih-card" style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            {loading && <p style={{ color: 'var(--ink-soft)' }}>Searching…</p>}

            {!loading && rows.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>
                    {query.trim() ? 'No students match that search.' : 'No students on record yet.'}
                </p>
            )}

            {!loading && rows.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rows.map((s) => (
                        <Link
                            key={s.id}
                            href={`/academic-records-dashboard/students/${s.id}`}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 8,
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-m)',
                                padding: 14,
                                textDecoration: 'none',
                                color: 'inherit',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700 }}>
                                    {s.name} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({s.studentNo})</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                    {s.programme || 'No programme on record'}
                                    {s.level ? ` · Level ${s.level}` : ''}
                                </div>
                            </div>
                            <span className={`ih-badge ${STATUS_BADGE[s.status] || 'ih-b-neutral'}`}>
                                {s.status.replace(/_/g, ' ')}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
