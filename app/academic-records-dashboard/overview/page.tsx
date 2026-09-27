'use client';
import { useRecords } from '../context';

export default function RecordsOverviewPage() {
    const { data, loading, error } = useRecords();

    return (
        <>
            {loading && <div className="ih-card">Loading…</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{data.studentCount}</div><div className="l">Students</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{data.pendingTranscriptRequests}</div><div className="l">Pending Transcript Requests</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.transcriptsIssued}</div><div className="l">Transcripts Issued</div></div>
                </div>
            )}
        </>
    );
}
