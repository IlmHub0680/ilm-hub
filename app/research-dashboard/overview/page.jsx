'use client';
import { useResearch } from '../context';

export default function ResearchOverviewPage() {
    const { data, loading, error } = useResearch();

    return (
        <>
            {loading && <div className="ih-card">Loading Research data...</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <>
                    <div className="ih-stat-grid">
                        <div className="ih-stat-tile"><div className="n">{data.projectCount}</div><div className="l">Research Projects</div></div>
                        <div className="ih-stat-tile accent"><div className="n">{data.activeProjectCount}</div><div className="l">Active Projects</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.proposalCount}</div><div className="l">Proposals</div></div>
                        <div className="ih-stat-tile accent"><div className="n">{data.pendingProposalCount}</div><div className="l">Proposals In Review</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.publicationCount}</div><div className="l">Scholarly Outputs</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.publishedPublicationCount}</div><div className="l">Published Outputs</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.grantCount}</div><div className="l">Grant Records</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.activeGrantCount}</div><div className="l">Awarded / Active Grants</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.supervisionCount}</div><div className="l">Research Supervisions</div></div>
                        {data.openIntegrityCaseCount > 0 && (
                            <div className="ih-stat-tile" style={{ borderColor: 'var(--danger)' }}>
                                <div className="n" style={{ color: 'var(--danger)' }}>{data.openIntegrityCaseCount}</div>
                                <div className="l">Open Integrity Cases</div>
                            </div>
                        )}
                    </div>

                    <div className="ih-card" style={{ marginTop: 20 }}>
                        <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Research Areas</h3>
                        {data.areas.length === 0 ? (
                            <p style={{ color: 'var(--ink-soft)', margin: 0 }}>No research areas defined yet -- add one when creating a project or proposal.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {data.areas.map((a) => (
                                    <span key={a.id} className="ih-badge ih-b-info">{a.nameEn}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
