'use client';

import { useEffect, useState } from 'react';

const RATING_LABELS: Record<string, string> = {
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  MEETS_EXPECTATIONS: 'Meets Expectations',
  EXCEEDS_EXPECTATIONS: 'Exceeds Expectations',
  OUTSTANDING: 'Outstanding',
};

type Qualification = { id: string; type: 'GENERAL' | 'ISLAMIC'; title: string; institution: string | null; yearObtained: number | null };
type DevelopmentRecord = { id: string; title: string; provider: string | null; completedAt: string | null; hours: number | null };
type PerformanceReview = { id: string; period: string; rating: string | null; strengths: string | null; areasForGrowth: string | null; status: string; reviewer: { user: { name: string } } };
type CourseRef = { id: string; titleEn: string; courseCode: string };

type ProfileData = {
  hasProfile: boolean;
  specialization?: string | null;
  yearsExperience?: number | null;
  languages?: string[];
  position?: { nameEn: string };
  faculty?: { nameEn: string } | null;
  department?: { nameEn: string } | null;
  qualifications?: Qualification[];
  developmentRecords?: DevelopmentRecord[];
  performanceReviewsReceived?: PerformanceReview[];
  authorizedCourses?: CourseRef[];
};

export default function InstructorProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/instructor/profile', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load your profile.');
        setData(result.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ih-card">Loading…</div>;
  if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data?.hasProfile) {
    return (
      <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
        No staff profile is linked to your account yet — contact Academic Administration.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="ih-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Teaching Profile</h2>
        <p style={{ margin: '0 0 4px', fontSize: 13.5 }}><strong>Position:</strong> {data.position?.nameEn}</p>
        <p style={{ margin: '0 0 4px', fontSize: 13.5 }}><strong>Faculty / Department:</strong> {[data.faculty?.nameEn, data.department?.nameEn].filter(Boolean).join(' / ') || '—'}</p>
        <p style={{ margin: '0 0 4px', fontSize: 13.5 }}><strong>Specialization:</strong> {data.specialization || '—'}</p>
        <p style={{ margin: '0 0 4px', fontSize: 13.5 }}><strong>Experience:</strong> {data.yearsExperience != null ? `${data.yearsExperience} years` : '—'}</p>
        <p style={{ margin: 0, fontSize: 13.5 }}><strong>Languages:</strong> {(data.languages && data.languages.length > 0) ? data.languages.join(', ') : '—'}</p>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>To update this profile, contact Academic Administration.</p>
      </section>

      <section className="ih-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Qualifications</h2>
        {data.qualifications && data.qualifications.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {data.qualifications.map((q) => (
              <li key={q.id} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span className={`ih-badge ${q.type === 'ISLAMIC' ? 'ih-b-success' : 'ih-b-neutral'}`} style={{ marginRight: 8 }}>{q.type === 'ISLAMIC' ? 'Islamic' : 'General'}</span>
                <strong>{q.title}</strong>{q.institution ? ` — ${q.institution}` : ''}{q.yearObtained ? ` (${q.yearObtained})` : ''}
              </li>
            ))}
          </ul>
        ) : <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>None on file yet.</p>}
      </section>

      <section className="ih-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Professional Development</h2>
        {data.developmentRecords && data.developmentRecords.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {data.developmentRecords.map((d) => (
              <li key={d.id} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <strong>{d.title}</strong>{d.provider ? ` — ${d.provider}` : ''}{d.completedAt ? ` (${new Date(d.completedAt).toLocaleDateString()})` : ''}{d.hours ? ` · ${d.hours}h` : ''}
              </li>
            ))}
          </ul>
        ) : <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>None on file yet.</p>}
      </section>

      <section className="ih-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Courses Authorized to Teach</h2>
        {data.authorizedCourses && data.authorizedCourses.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {data.authorizedCourses.map((c) => (
              <li key={c.id} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span className="mono">{c.courseCode}</span> — {c.titleEn}
              </li>
            ))}
          </ul>
        ) : <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>Not yet assigned to a course.</p>}
      </section>

      <section className="ih-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Performance Reviews</h2>
        {data.performanceReviewsReceived && data.performanceReviewsReceived.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {data.performanceReviewsReceived.map((r) => (
              <li key={r.id} style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{r.period}</strong>
                  <span className={`ih-badge ${r.status === 'ACKNOWLEDGED' ? 'ih-b-success' : 'ih-b-warning'}`}>{r.status}</span>
                </div>
                {r.rating && <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{RATING_LABELS[r.rating]}</div>}
                {r.strengths && <div style={{ fontSize: 13, marginTop: 6 }}><strong>Strengths:</strong> {r.strengths}</div>}
                {r.areasForGrowth && <div style={{ fontSize: 13, marginTop: 4 }}><strong>Areas for growth:</strong> {r.areasForGrowth}</div>}
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>Reviewed by {r.reviewer?.user?.name || 'Unknown'}</div>
              </li>
            ))}
          </ul>
        ) : <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>No performance reviews on file yet.</p>}
      </section>
    </div>
  );
}
