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
const cardStyle = { padding: 20 };

type Lookup = { id: string; label: string };
type PLO = { id: string; code: string; statementEn: string; isActive: boolean; mappedCourseOutcomeCount: number };
type CLO = {
  id: string; code: string; statementEn: string; depth: string | null;
  assessmentMethods: string | null;
  programLearningOutcome: { id: string; code: string; statementEn: string } | null;
};

const DEPTH_OPTIONS = ['', 'INTRODUCED', 'DEVELOPED', 'REINFORCED', 'MASTERED'];
const DEPTH_LABEL: Record<string, string> = {
  INTRODUCED: 'Introduced', DEVELOPED: 'Developed', REINFORCED: 'Reinforced', MASTERED: 'Mastered',
};

export default function CurriculumOutcomesPage() {
  // --- Programme Learning Outcomes ---
  const [programQuery, setProgramQuery] = useState('');
  const [programResults, setProgramResults] = useState<Lookup[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Lookup | null>(null);
  const [plos, setPlos] = useState<PLO[] | null>(null);
  const [ploCode, setPloCode] = useState('');
  const [ploStatement, setPloStatement] = useState('');
  const [savingPlo, setSavingPlo] = useState(false);

  // --- Course Learning Outcomes ---
  const [courseQuery, setCourseQuery] = useState('');
  const [courseResults, setCourseResults] = useState<Lookup[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Lookup | null>(null);
  const [clos, setClos] = useState<CLO[] | null>(null);
  const [availablePlos, setAvailablePlos] = useState<{ id: string; code: string; statementEn: string }[]>([]);
  const [cloCode, setCloCode] = useState('');
  const [cloStatement, setCloStatement] = useState('');
  const [cloDepth, setCloDepth] = useState('');
  const [cloAssessment, setCloAssessment] = useState('');
  const [cloPloId, setCloPloId] = useState('');
  const [savingClo, setSavingClo] = useState(false);

  // --- Coverage report ---
  const [coverage, setCoverage] = useState<any[] | null>(null);
  const [showCoverage, setShowCoverage] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = programQuery.trim();
    if (q.length < 2) { setProgramResults([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/qa/duplicate-flags/lookup?type=PROGRAM&q=${encodeURIComponent(q)}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => { if (data?.success) setProgramResults(data.data); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
  }, [programQuery]);

  useEffect(() => {
    const q = courseQuery.trim();
    if (q.length < 2) { setCourseResults([]); return; }
    const handle = setTimeout(() => {
      fetch(`/api/qa/duplicate-flags/lookup?type=COURSE&q=${encodeURIComponent(q)}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => { if (data?.success) setCourseResults(data.data); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
  }, [courseQuery]);

  function loadPlos(programId: string) {
    setPlos(null);
    fetch(`/api/admin/programs/${programId}/learning-outcomes`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => { if (data?.success) setPlos(data.data); else setPlos([]); })
      .catch(() => setPlos([]));
  }

  function loadClos(courseId: string) {
    setClos(null);
    fetch(`/api/admin/courses/${courseId}/learning-outcomes`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setClos(data.data);
          setAvailablePlos(data.availableProgramOutcomes || []);
        } else {
          setClos([]);
        }
      })
      .catch(() => setClos([]));
  }

  async function addPlo() {
    if (!selectedProgram || !ploCode.trim() || !ploStatement.trim()) return;
    setSavingPlo(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/programs/${selectedProgram.id}/learning-outcomes`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ploCode.trim(), statementEn: ploStatement.trim() }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to add outcome.');
      setPlos((prev) => [...(prev || []), { ...result.data, mappedCourseOutcomeCount: 0 }]);
      setPloCode('');
      setPloStatement('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSavingPlo(false);
    }
  }

  async function retirePlo(ploId: string, isActive: boolean) {
    if (!selectedProgram) return;
    try {
      const res = await fetch(`/api/admin/programs/${selectedProgram.id}/learning-outcomes/${ploId}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update.');
      setPlos((prev) => (prev || []).map((p) => (p.id === ploId ? { ...p, isActive: !isActive } : p)));
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function addClo() {
    if (!selectedCourse || !cloCode.trim() || !cloStatement.trim()) return;
    setSavingClo(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourse.id}/learning-outcomes`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cloCode.trim(),
          statementEn: cloStatement.trim(),
          depth: cloDepth || null,
          assessmentMethods: cloAssessment.trim() || null,
          programLearningOutcomeId: cloPloId || null,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to add outcome.');
      setClos((prev) => [...(prev || []), result.data]);
      setCloCode('');
      setCloStatement('');
      setCloDepth('');
      setCloAssessment('');
      setCloPloId('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSavingClo(false);
    }
  }

  async function removeClo(cloId: string) {
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourse.id}/learning-outcomes/${cloId}`, {
        method: 'DELETE', credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to remove.');
      setClos((prev) => (prev || []).filter((c) => c.id !== cloId));
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  function loadCoverage() {
    setShowCoverage(true);
    if (coverage) return;
    fetch('/api/qa/curriculum-coverage', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => { if (data?.success) setCoverage(data.data); else setCoverage([]); })
      .catch(() => setCoverage([]));
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Curriculum Outcome Mapping</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Map each programme's approved learning outcomes (PLOs) to the courses that develop
          them, and track how deeply each course reaches an outcome — introduced, developed,
          reinforced, or mastered.
        </p>
      </div>

      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>{message}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button type="button" onClick={loadCoverage} style={secondaryButtonStyle}>
          {showCoverage ? 'Refresh Coverage Report' : 'View Coverage Report'}
        </button>
      </div>

      {showCoverage && (
        <div className="ih-card" style={{ padding: 20, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Coverage Report</h2>
          {coverage === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
          {coverage && coverage.length === 0 && (
            <div style={{ color: 'var(--ink-soft)' }}>No active programmes found.</div>
          )}
          {coverage && coverage.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {coverage.map((row) => (
                <div key={row.programId} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  <strong>{row.programName}</strong>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {row.outcomeCount} approved outcome{row.outcomeCount === 1 ? '' : 's'} · {row.courseCount} published course{row.courseCount === 1 ? '' : 's'}
                  </div>
                  {row.unreachedOutcomes.length > 0 && (
                    <div style={{ fontSize: 12.5, color: 'var(--warning, #b45309)', marginTop: 4 }}>
                      Not yet reached by any course: {row.unreachedOutcomes.map((o: any) => o.code).join(', ')}
                    </div>
                  )}
                  {row.coursesWithNoOutcomes.length > 0 && (
                    <div style={{ fontSize: 12.5, color: 'var(--warning, #b45309)', marginTop: 4 }}>
                      Courses with no learning outcomes recorded: {row.coursesWithNoOutcomes.map((c: any) => c.title).join(', ')}
                    </div>
                  )}
                  {row.coursesWithNoAssessmentMethod.length > 0 && (
                    <div style={{ fontSize: 12.5, color: 'var(--warning, #b45309)', marginTop: 4 }}>
                      Courses with outcomes but no assessment method noted: {row.coursesWithNoAssessmentMethod.map((c: any) => c.title).join(', ')}
                    </div>
                  )}
                  {row.unreachedOutcomes.length === 0 && row.coursesWithNoOutcomes.length === 0 && row.coursesWithNoAssessmentMethod.length === 0 && (
                    <div style={{ fontSize: 12.5, color: 'var(--success, #15803d)', marginTop: 4 }}>No gaps found.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* --- Programme Learning Outcomes --- */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Programme Learning Outcomes</h2>

          {!selectedProgram && (
            <div className="ih-card" style={cardStyle}>
              <label style={labelStyle}>Find a programme by name or code</label>
              <input
                value={programQuery}
                onChange={(e) => setProgramQuery(e.target.value)}
                placeholder="e.g. Diploma in Islamic Studies"
                style={inputStyle}
              />
              {programResults.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {programResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedProgram(p); setProgramQuery(''); setProgramResults([]); loadPlos(p.id); }}
                      style={{ ...secondaryButtonStyle, textAlign: 'left' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedProgram && (
            <>
              <div className="ih-card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{selectedProgram.label}</strong>
                <button type="button" onClick={() => { setSelectedProgram(null); setPlos(null); }} style={secondaryButtonStyle}>Change</button>
              </div>

              <div className="ih-card" style={{ ...cardStyle, marginBottom: 16 }}>
                <label style={labelStyle}>Code</label>
                <input value={ploCode} onChange={(e) => setPloCode(e.target.value)} placeholder="PLO1" style={{ ...inputStyle, marginBottom: 10 }} />
                <label style={labelStyle}>Outcome statement</label>
                <textarea
                  value={ploStatement}
                  onChange={(e) => setPloStatement(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' as const }}
                />
                <button type="button" disabled={savingPlo} onClick={addPlo} style={primaryButtonStyle}>
                  {savingPlo ? 'Adding…' : 'Add Outcome'}
                </button>
              </div>

              {plos === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
              {plos && plos.length === 0 && <div className="ih-card" style={{ padding: 16, color: 'var(--ink-soft)' }}>No outcomes yet.</div>}
              {plos && plos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plos.map((p) => (
                    <div key={p.id} className="ih-card" style={{ padding: 14, opacity: p.isActive ? 1 : 0.55 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{p.code}</strong>
                        <button type="button" onClick={() => retirePlo(p.id, p.isActive)} style={{ ...secondaryButtonStyle, padding: '4px 10px', fontSize: 11.5 }}>
                          {p.isActive ? 'Retire' : 'Reactivate'}
                        </button>
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>{p.statementEn}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6 }}>
                        Mapped from {p.mappedCourseOutcomeCount} course outcome{p.mappedCourseOutcomeCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* --- Course Learning Outcomes --- */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Course Learning Outcomes</h2>

          {!selectedCourse && (
            <div className="ih-card" style={cardStyle}>
              <label style={labelStyle}>Find a course by title or code</label>
              <input
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                placeholder="e.g. Tajwid Foundations, or ARB101"
                style={inputStyle}
              />
              {courseResults.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {courseResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCourse(c); setCourseQuery(''); setCourseResults([]); loadClos(c.id); }}
                      style={{ ...secondaryButtonStyle, textAlign: 'left' }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCourse && (
            <>
              <div className="ih-card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{selectedCourse.label}</strong>
                <button type="button" onClick={() => { setSelectedCourse(null); setClos(null); }} style={secondaryButtonStyle}>Change</button>
              </div>

              <div className="ih-card" style={{ ...cardStyle, marginBottom: 16 }}>
                <label style={labelStyle}>Code</label>
                <input value={cloCode} onChange={(e) => setCloCode(e.target.value)} placeholder="CLO1" style={{ ...inputStyle, marginBottom: 10 }} />
                <label style={labelStyle}>Outcome statement</label>
                <textarea
                  value={cloStatement}
                  onChange={(e) => setCloStatement(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' as const }}
                />
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' as const }}>
                  <div style={{ flex: '1 1 160px' }}>
                    <label style={labelStyle}>Maps to (optional)</label>
                    <select value={cloPloId} onChange={(e) => setCloPloId(e.target.value)} style={inputStyle}>
                      <option value="">— No programme outcome —</option>
                      {availablePlos.map((p) => (
                        <option key={p.id} value={p.id}>{p.code}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 160px' }}>
                    <label style={labelStyle}>Depth (optional)</label>
                    <select value={cloDepth} onChange={(e) => setCloDepth(e.target.value)} style={inputStyle}>
                      {DEPTH_OPTIONS.map((d) => (
                        <option key={d || 'none'} value={d}>{d ? DEPTH_LABEL[d] : '— Not set —'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label style={labelStyle}>Assessment method (optional)</label>
                <input
                  value={cloAssessment}
                  onChange={(e) => setCloAssessment(e.target.value)}
                  placeholder="e.g. Written exam + Qur'an recitation"
                  style={{ ...inputStyle, marginBottom: 10 }}
                />
                <button type="button" disabled={savingClo} onClick={addClo} style={primaryButtonStyle}>
                  {savingClo ? 'Adding…' : 'Add Outcome'}
                </button>
              </div>

              {clos === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
              {clos && clos.length === 0 && <div className="ih-card" style={{ padding: 16, color: 'var(--ink-soft)' }}>No outcomes yet.</div>}
              {clos && clos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {clos.map((c) => (
                    <div key={c.id} className="ih-card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{c.code}</strong>
                        <button type="button" onClick={() => removeClo(c.id)} style={{ ...secondaryButtonStyle, padding: '4px 10px', fontSize: 11.5 }}>
                          Remove
                        </button>
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>{c.statementEn}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6, display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                        {c.programLearningOutcome && <span>→ {c.programLearningOutcome.code}</span>}
                        {c.depth && <span>{DEPTH_LABEL[c.depth]}</span>}
                        {c.assessmentMethods && <span>{c.assessmentMethods}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
