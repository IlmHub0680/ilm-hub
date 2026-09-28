'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
  color: 'var(--ink)', backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 };

const secondaryButtonStyle = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
};

// Read-only oversight — adding or removing a course reading is the
// Programme Coordinator's own operational authority (Delegated
// Operations), at their own dashboard (/coordinator-dashboard). This
// page previously let Admin add/remove readings directly through a
// route gated only by a bare admin check, with no coordinator/programme
// ownership scoping at all — a genuine duplication of the Coordinator's
// delegated authority. That write path has been removed; this page now
// only looks up a course and displays its current readings.
export default function AdminCourseReadingsPage() {
  const [courseQuery, setCourseQuery] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [readings, setReadings] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = courseQuery.trim();
    if (q.length < 2) {
      setCourseResults([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/admin/courses/lookup?q=${encodeURIComponent(q)}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) setCourseResults(data.data);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
  }, [courseQuery]);

  function chooseCourse(course) {
    setSelectedCourse(course);
    setCourseQuery('');
    setCourseResults([]);
    loadReadings(course.id);
  }

  async function loadReadings(courseId) {
    setReadings(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/readings`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load readings.');
      setReadings(result.data);
    } catch (err) {
      setMessage(err.message);
      setReadings([]);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 880 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Course Readings</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Read-only. Each course's required/recommended readings are managed by that
          programme's Coordinator at their own dashboard.
        </p>
      </div>

      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>{message}</div>}

      {!selectedCourse && (
        <div className="ih-card" style={{ padding: 20 }}>
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
                  onClick={() => chooseCourse({ id: c.id, titleEn: c.titleEn, courseCode: c.courseCode })}
                  style={{ ...secondaryButtonStyle, textAlign: 'left' }}
                >
                  {c.titleEn} {c.courseCode ? `(${c.courseCode})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCourse && (
        <>
          <div className="ih-card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{selectedCourse.titleEn}</strong>
              {selectedCourse.courseCode && <span style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>({selectedCourse.courseCode})</span>}
            </div>
            <button type="button" onClick={() => { setSelectedCourse(null); setReadings(null); }} style={secondaryButtonStyle}>
              Change Course
            </button>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Current Readings</h2>

          {readings === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
          {readings && readings.length === 0 && (
            <div className="ih-card" style={{ padding: 20, color: 'var(--ink-soft)' }}>No readings linked yet.</div>
          )}
          {readings && readings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {readings.map((reading) => (
                <div key={reading.id} className="ih-card" style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700 }}>
                    {reading.libraryResource?.title || reading.book?.title}
                    <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: 'var(--brand-tint)', color: 'var(--brand)' }}>
                      {reading.readingType === 'REQUIRED' ? 'Required' : 'Recommended'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 8 }}>
                      {reading.libraryResource ? 'Digital Library' : 'Bookstore'}
                    </span>
                  </div>
                  {reading.note && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{reading.note}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
