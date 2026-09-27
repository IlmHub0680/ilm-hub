'use client';

import Link from 'next/link';
import { useEffect, useState, use as usePromise } from 'react';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, width: '100%', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)' };

const RATING_LABELS = {
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  MEETS_EXPECTATIONS: 'Meets Expectations',
  EXCEEDS_EXPECTATIONS: 'Exceeds Expectations',
  OUTSTANDING: 'Outstanding',
};

function Section({ title, children, right }) {
  return (
    <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, color: 'var(--brand)' }}>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function AdminStaffDetailPage({ params }) {
  const { id } = usePromise(params);

  const [staff, setStaff] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [positionForm, setPositionForm] = useState({ positionId: '' });
  const [profileForm, setProfileForm] = useState({ specialization: '', yearsExperience: '', languages: '' });
  const [publicForm, setPublicForm] = useState({ bio: '', photoUrl: '', isPublic: false });
  const [qualForm, setQualForm] = useState({ type: 'GENERAL', title: '', institution: '', yearObtained: '' });
  const [devForm, setDevForm] = useState({ title: '', provider: '', completedAt: '', hours: '' });
  const [reviewForm, setReviewForm] = useState({ period: '', rating: '', strengths: '', areasForGrowth: '', status: 'DRAFT' });
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/staff/${id}`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/admin/staff/${id}/performance-reviews`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([staffResult, reviewResult]) => {
        if (!staffResult.success) throw new Error(staffResult.error || 'Failed to load staff member.');
        setStaff(staffResult.data);
        setProfileForm({
          specialization: staffResult.data.specialization || '',
          yearsExperience: staffResult.data.yearsExperience ?? '',
          languages: (staffResult.data.languages || []).join(', '),
        });
        setPositionForm({ positionId: staffResult.data.positionId || '' });
        setPublicForm({
          bio: staffResult.data.bio || '',
          photoUrl: staffResult.data.photoUrl || '',
          isPublic: Boolean(staffResult.data.isPublic),
        });
        if (reviewResult.success) setReviews(reviewResult.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const savePosition = async () => {
    if (!positionForm.positionId || positionForm.positionId === staff.positionId) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: positionForm.positionId }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to change position.');
      setMessage('Position updated — this is logged in the Audit Log.');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization: profileForm.specialization,
          yearsExperience: profileForm.yearsExperience === '' ? null : Number(profileForm.yearsExperience),
          languages: profileForm.languages.split(',').map((l) => l.trim()).filter(Boolean),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save.');
      setMessage('Profile updated.');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Model 21, Section 3/10 -- the public faculty directory fields
  // (bio/photoUrl/isPublic), saved separately from the internal
  // Teaching Profile above.
  const savePublicProfile = async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: publicForm.bio,
          photoUrl: publicForm.photoUrl,
          isPublic: publicForm.isPublic,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save.');
      setMessage('Public faculty profile updated.');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addQualification = async () => {
    if (!qualForm.title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}/qualifications`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qualForm),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to add.');
      setQualForm({ type: 'GENERAL', title: '', institution: '', yearObtained: '' });
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeQualification = async (qualId) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/staff/${id}/qualifications/${qualId}`, { method: 'DELETE', credentials: 'include' });
      load();
    } finally {
      setBusy(false);
    }
  };

  const addDevelopment = async () => {
    if (!devForm.title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}/development`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devForm),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to add.');
      setDevForm({ title: '', provider: '', completedAt: '', hours: '' });
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeDevelopment = async (recordId) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/staff/${id}/development/${recordId}`, { method: 'DELETE', credentials: 'include' });
      load();
    } finally {
      setBusy(false);
    }
  };

  const addReview = async () => {
    if (!reviewForm.period.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}/performance-reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save review.');
      setReviewForm({ period: '', rating: '', strengths: '', areasForGrowth: '', status: 'DRAFT' });
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main style={page}><div style={container}>Loading…</div></main>;
  if (error) return <main style={page}><div style={container}><p style={{ color: 'var(--danger)' }}>{error}</p></div></main>;
  if (!staff) return null;

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin/staff" style={backLink}>← Back to Staff Management</Link>

        <div style={{ margin: '18px 0 20px' }}>
          <h1 style={heading}>{staff.user?.name}</h1>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 13 }}>
            {staff.position?.nameEn} · {staff.employeeNo} · {staff.user?.email}
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13 }}>
            {[staff.faculty?.nameEn, staff.department?.nameEn].filter(Boolean).join(' / ') || 'No faculty/department assigned'}
          </p>
        </div>

        {message && <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13.5 }}>{message}</div>}

        <Section title="Position & Role">
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
            Reassigning a position immediately changes what this account can view and edit
            across the system, and is recorded in the Audit Log.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <select
              value={positionForm.positionId}
              onChange={(e) => setPositionForm({ positionId: e.target.value })}
              style={{ ...fieldStyle, width: 'auto', minWidth: 240 }}
            >
              {(staff.availablePositions || []).map((p) => (
                <option key={p.id} value={p.id}>{p.nameEn}</option>
              ))}
            </select>
          </div>
          <button
            className="ih-btn ih-btn-primary"
            disabled={busy || !positionForm.positionId || positionForm.positionId === staff.positionId}
            onClick={savePosition}
          >
            Save Position
          </button>
        </Section>

        <Section title="Teaching Profile">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
            <input type="text" placeholder="Specialization" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} style={fieldStyle} />
            <input type="number" min="0" placeholder="Years of experience" value={profileForm.yearsExperience} onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: e.target.value })} style={fieldStyle} />
            <input type="text" placeholder="Languages (comma-separated)" value={profileForm.languages} onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })} style={fieldStyle} />
          </div>
          <button className="ih-btn ih-btn-primary" disabled={busy} onClick={saveProfile}>Save</button>
        </Section>

        <Section title="Public Faculty Profile">
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
            Only shown on the public Academy faculty directory when "Show on public faculty directory" is checked below. Never includes email, phone, or employee number.
          </p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
            <textarea placeholder="Public bio" value={publicForm.bio} onChange={(e) => setPublicForm({ ...publicForm, bio: e.target.value })} maxLength={2000} style={{ ...fieldStyle, minHeight: 90 }} />
            <input type="text" placeholder="Photo URL" value={publicForm.photoUrl} onChange={(e) => setPublicForm({ ...publicForm, photoUrl: e.target.value })} style={fieldStyle} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
              <input type="checkbox" checked={publicForm.isPublic} onChange={(e) => setPublicForm({ ...publicForm, isPublic: e.target.checked })} />
              Show on public faculty directory
            </label>
          </div>
          <button className="ih-btn ih-btn-primary" disabled={busy} onClick={savePublicProfile}>Save</button>
        </Section>

        <Section title="Qualifications">
          {staff.qualifications?.length > 0 ? (
            <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {staff.qualifications.map((q) => (
                <li key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div>
                    <span className={`ih-badge ${q.type === 'ISLAMIC' ? 'ih-b-success' : 'ih-b-neutral'}`} style={{ marginRight: 8 }}>{q.type === 'ISLAMIC' ? 'Islamic' : 'General'}</span>
                    <strong>{q.title}</strong>{q.institution ? ` — ${q.institution}` : ''}{q.yearObtained ? ` (${q.yearObtained})` : ''}
                  </div>
                  <button className="ih-btn ih-btn-danger" style={{ padding: '5px 9px', fontSize: 12 }} disabled={busy} onClick={() => removeQualification(q.id)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 0 }}>No qualifications on file yet.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 110px', gap: 8, marginBottom: 10 }}>
            <select value={qualForm.type} onChange={(e) => setQualForm({ ...qualForm, type: e.target.value })} style={fieldStyle}>
              <option value="GENERAL">General</option>
              <option value="ISLAMIC">Islamic</option>
            </select>
            <input type="text" placeholder="Title (e.g. MA in Arabic Literature)" value={qualForm.title} onChange={(e) => setQualForm({ ...qualForm, title: e.target.value })} style={fieldStyle} />
            <input type="text" placeholder="Institution" value={qualForm.institution} onChange={(e) => setQualForm({ ...qualForm, institution: e.target.value })} style={fieldStyle} />
            <input type="number" placeholder="Year" value={qualForm.yearObtained} onChange={(e) => setQualForm({ ...qualForm, yearObtained: e.target.value })} style={fieldStyle} />
          </div>
          <button className="ih-btn ih-btn-secondary" disabled={busy} onClick={addQualification}>Add Qualification</button>
        </Section>

        <Section title="Professional Development">
          {staff.developmentRecords?.length > 0 ? (
            <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {staff.developmentRecords.map((d) => (
                <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div>
                    <strong>{d.title}</strong>{d.provider ? ` — ${d.provider}` : ''}{d.completedAt ? ` (${new Date(d.completedAt).toLocaleDateString()})` : ''}{d.hours ? ` · ${d.hours}h` : ''}
                  </div>
                  <button className="ih-btn ih-btn-danger" style={{ padding: '5px 9px', fontSize: 12 }} disabled={busy} onClick={() => removeDevelopment(d.id)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 0 }}>No professional development on file yet.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 90px', gap: 8, marginBottom: 10 }}>
            <input type="text" placeholder="Title (e.g. Tajweed Certification Workshop)" value={devForm.title} onChange={(e) => setDevForm({ ...devForm, title: e.target.value })} style={fieldStyle} />
            <input type="text" placeholder="Provider" value={devForm.provider} onChange={(e) => setDevForm({ ...devForm, provider: e.target.value })} style={fieldStyle} />
            <input type="date" value={devForm.completedAt} onChange={(e) => setDevForm({ ...devForm, completedAt: e.target.value })} style={fieldStyle} />
            <input type="number" placeholder="Hours" value={devForm.hours} onChange={(e) => setDevForm({ ...devForm, hours: e.target.value })} style={fieldStyle} />
          </div>
          <button className="ih-btn ih-btn-secondary" disabled={busy} onClick={addDevelopment}>Add Record</button>
        </Section>

        <Section title="Courses Authorized to Teach">
          {staff.authorizedCourses?.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
              {staff.authorizedCourses.map((c) => (
                <li key={c.id} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <span className="mono">{c.courseCode}</span> — {c.titleEn}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>Not yet assigned to any course. Course assignment is managed by the Head of Department.</p>
          )}
        </Section>

        <Section title="Performance Reviews">
          {reviews.length > 0 ? (
            <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {reviews.map((r) => (
                <li key={r.id} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{r.period}</strong>
                    <span className={`ih-badge ${r.status === 'ACKNOWLEDGED' ? 'ih-b-success' : r.status === 'SUBMITTED' ? 'ih-b-warning' : 'ih-b-neutral'}`}>{r.status}</span>
                  </div>
                  {r.rating && <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{RATING_LABELS[r.rating]}</div>}
                  {r.strengths && <div style={{ fontSize: 13, marginTop: 6 }}><strong>Strengths:</strong> {r.strengths}</div>}
                  {r.areasForGrowth && <div style={{ fontSize: 13, marginTop: 4 }}><strong>Areas for growth:</strong> {r.areasForGrowth}</div>}
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>Reviewed by {r.reviewer?.user?.name || 'Unknown'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 0 }}>No performance reviews on file yet.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 130px', gap: 8, marginBottom: 8 }}>
            <input type="text" placeholder='Period (e.g. "2026 Semester 1")' value={reviewForm.period} onChange={(e) => setReviewForm({ ...reviewForm, period: e.target.value })} style={fieldStyle} />
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} style={fieldStyle}>
              <option value="">Rating (optional)</option>
              {Object.entries(RATING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })} style={fieldStyle}>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
          </div>
          <textarea placeholder="Strengths" value={reviewForm.strengths} onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })} style={{ ...fieldStyle, marginBottom: 8, minHeight: 60 }} />
          <textarea placeholder="Areas for growth" value={reviewForm.areasForGrowth} onChange={(e) => setReviewForm({ ...reviewForm, areasForGrowth: e.target.value })} style={{ ...fieldStyle, marginBottom: 10, minHeight: 60 }} />
          <button className="ih-btn ih-btn-secondary" disabled={busy} onClick={addReview}>Save Review</button>
        </Section>
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: 900, margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 };
