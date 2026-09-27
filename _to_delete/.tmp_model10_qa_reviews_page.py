# -*- coding: utf-8 -*-
import io

PATH = "app/qa-dashboard/reviews/page.tsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    "const OUTCOME_BADGE: Record<string, string> = {\n    COMPLIANT: 'ih-b-success',\n    MINOR_NON_COMPLIANCE: 'ih-b-warning',\n    MAJOR_NON_COMPLIANCE: 'ih-b-danger',\n};",
    "const OUTCOME_BADGE: Record<string, string> = {\n    COMPLIANT: 'ih-b-success',\n    MINOR_NON_COMPLIANCE: 'ih-b-warning',\n    MAJOR_NON_COMPLIANCE: 'ih-b-danger',\n};\n\nconst IMPROVEMENT_BADGE: Record<string, string> = {\n    NOT_REQUIRED: 'ih-b-neutral',\n    PENDING: 'ih-b-warning',\n    IN_PROGRESS: 'ih-b-warning',\n    COMPLETED: 'ih-b-success',\n};",
    "add IMPROVEMENT_BADGE map",
)

c = r1(
    c,
    "    const [completeDraft, setCompleteDraft] = useState<{ findings: string; outcome: string; recommendation: string }>({\n        findings: '', outcome: 'COMPLIANT', recommendation: '',\n    });\n    const [busyId, setBusyId] = useState<string | null>(null);",
    "    const [completeDraft, setCompleteDraft] = useState<{ findings: string; outcome: string; recommendation: string; evidenceUrls: string }>({\n        findings: '', outcome: 'COMPLIANT', recommendation: '', evidenceUrls: '',\n    });\n    const [busyId, setBusyId] = useState<string | null>(null);\n    const [progressDraftId, setProgressDraftId] = useState<string | null>(null);\n    const [progressDraft, setProgressDraft] = useState<{ improvementStatus: string; evidenceUrls: string }>({ improvementStatus: 'IN_PROGRESS', evidenceUrls: '' });",
    "extend completeDraft + add progressDraft state",
)

c = r1(
    c,
    "        setCompleteDraft({ findings: '', outcome: 'COMPLIANT', recommendation: '' });",
    "        setCompleteDraft({ findings: '', outcome: 'COMPLIANT', recommendation: '', evidenceUrls: '' });",
    "openComplete reset",
)

c = r1(
    c,
    """                body: JSON.stringify({ action: 'complete', ...completeDraft }),""",
    """                body: JSON.stringify({
                    action: 'complete',
                    findings: completeDraft.findings,
                    outcome: completeDraft.outcome,
                    recommendation: completeDraft.recommendation,
                    evidenceUrls: completeDraft.evidenceUrls.split(',').map((u) => u.trim()).filter(Boolean),
                }),""",
    "handleComplete payload",
)

c = r1(
    c,
    """    return (
        <div className="ih-card">""",
    """    const handleUpdateProgress = async (id: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/qa/reviews/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_progress',
                    improvementStatus: progressDraft.improvementStatus,
                    evidenceUrls: progressDraft.evidenceUrls.split(',').map((u) => u.trim()).filter(Boolean),
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Improvement plan updated.');
                setProgressDraftId(null);
                refetchReviews();
            } else {
                setMessage(result.error || 'Failed to update.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="ih-card">""",
    "add handleUpdateProgress",
)

c = r1(
    c,
    """                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                        {r.status.replace(/_/g, ' ')}
                                    </span>
                                    {r.outcome && (
                                        <span className={`ih-badge ${OUTCOME_BADGE[r.outcome] || 'ih-b-neutral'}`}>
                                            {r.outcome.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>""",
    """                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                        {r.status.replace(/_/g, ' ')}
                                    </span>
                                    {r.outcome && (
                                        <span className={`ih-badge ${OUTCOME_BADGE[r.outcome] || 'ih-b-neutral'}`}>
                                            {r.outcome.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                    {r.status === 'COMPLETED' && r.improvementStatus !== 'NOT_REQUIRED' && (
                                        <span className={`ih-badge ${IMPROVEMENT_BADGE[r.improvementStatus] || 'ih-b-neutral'}`}>
                                            Plan: {r.improvementStatus.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>""",
    "improvement badge in header",
)

c = r1(
    c,
    """                            {r.recommendation && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                    <strong>Recommendation:</strong> {r.recommendation}
                                </p>
                            )}""",
    """                            {r.recommendation && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                    <strong>Recommendation:</strong> {r.recommendation}
                                </p>
                            )}

                            {r.evidenceUrls && r.evidenceUrls.length > 0 && (
                                <div style={{ margin: '0 0 10px', fontSize: 12.5 }}>
                                    <strong>Evidence:</strong>{' '}
                                    {r.evidenceUrls.map((u: string, i: number) => (
                                        <a key={u} href={u} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>[{i + 1}]</a>
                                    ))}
                                </div>
                            )}

                            {r.status === 'COMPLETED' && r.improvementStatus !== 'NOT_REQUIRED' && progressDraftId !== r.id && (
                                <button
                                    disabled={busyId === r.id}
                                    onClick={() => {
                                        setProgressDraftId(r.id);
                                        setProgressDraft({ improvementStatus: r.improvementStatus === 'PENDING' ? 'IN_PROGRESS' : r.improvementStatus, evidenceUrls: '' });
                                    }}
                                    className="ih-btn ih-btn-secondary"
                                    style={{ marginBottom: 8 }}
                                >
                                    Update Improvement Plan
                                </button>
                            )}

                            {progressDraftId === r.id && (
                                <div style={{ marginBottom: 10, borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <select
                                        value={progressDraft.improvementStatus}
                                        onChange={(e) => setProgressDraft({ ...progressDraft, improvementStatus: e.target.value })}
                                        style={fieldStyle}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Add evidence URL(s), comma-separated"
                                        value={progressDraft.evidenceUrls}
                                        onChange={(e) => setProgressDraft({ ...progressDraft, evidenceUrls: e.target.value })}
                                        style={fieldStyle}
                                    />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button disabled={busyId === r.id} onClick={() => handleUpdateProgress(r.id)} className="ih-btn ih-btn-primary">Save</button>
                                        <button onClick={() => setProgressDraftId(null)} className="ih-btn ih-btn-ghost">Cancel</button>
                                    </div>
                                </div>
                            )}""",
    "evidence list + update progress control",
)

c = r1(
    c,
    """                                    <textarea
                                        placeholder="Recommendation (optional)"
                                        value={completeDraft.recommendation}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, recommendation: e.target.value })}
                                        style={{ ...fieldStyle, minHeight: 50 }}
                                    />""",
    """                                    <textarea
                                        placeholder="Recommendation (optional)"
                                        value={completeDraft.recommendation}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, recommendation: e.target.value })}
                                        style={{ ...fieldStyle, minHeight: 50 }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Evidence URL(s), comma-separated (optional)"
                                        value={completeDraft.evidenceUrls}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, evidenceUrls: e.target.value })}
                                        style={fieldStyle}
                                    />""",
    "complete form evidence input",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("qa-dashboard reviews page updated with improvement plan + evidence UI.")
