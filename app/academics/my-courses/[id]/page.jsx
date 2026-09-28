'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAcademics } from '../../context';
import * as s from '../../styles';

const TONE_BADGE_CLASS = {
  good: 'ih-b-success',
  warning: 'ih-b-warning',
  danger: 'ih-b-danger',
  neutral: 'ih-b-neutral',
};

function StatusChip({ label, tone }) {
  return <span className={`ih-badge ${TONE_BADGE_CLASS[tone] || 'ih-b-neutral'}`}>{label}</span>;
}

export default function CourseHubPage() {
  const params = useParams();
  const courseId = params?.id;
  const { data, loading, error } = useAcademics();

  const [quizzes, setQuizzes] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    let mounted = true;

    async function loadCourseExtras() {
      setSubLoading(true);
      try {
        const [quizzesRes, discussionsRes, readingsRes] = await Promise.all([
          fetch('/api/student/quizzes', { credentials: 'include' }),
          fetch(`/api/student/discussions?courseId=${encodeURIComponent(courseId)}`, {
            credentials: 'include',
          }),
          fetch(`/api/student/courses/${encodeURIComponent(courseId)}/readings`, {
            credentials: 'include',
          }),
        ]);

        const quizzesData = await quizzesRes.json();
        const discussionsData = await discussionsRes.json();
        const readingsData = await readingsRes.json().catch(() => null);

        if (!mounted) return;

        if (quizzesData.success) {
          setQuizzes((quizzesData.data || []).filter((q) => q.courseId === courseId));
        }

        if (discussionsData.success) {
          setDiscussions(discussionsData.discussions || []);
        }

        if (readingsData?.success) {
          setReadings(readingsData.data || []);
        }
      } catch (err) {
        console.error('Course hub extras load error:', err);
      } finally {
        if (mounted) setSubLoading(false);
      }
    }

    loadCourseExtras();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (loading) {
    return <div style={s.loadingState}>Loading course...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const course = (data?.registeredCourses || []).find((c) => c.id === courseId);

  if (!course) {
    return (
      <div>
        <div style={s.errorBanner}>
          You're not enrolled in this course, or it no longer exists.
        </div>
        <Link href="/academics/my-courses">&larr; Back to My Courses</Link>
      </div>
    );
  }

  const assignments = (data?.assignments || []).filter((a) => a.courseId === courseId);
  const grade = (data?.grades || []).find((g) => g.courseId === courseId);
  const attendance = (data?.attendance || []).find((a) => a.courseId === courseId);
  const exams = (data?.examTimetable || []).filter((e) => e.courseId === courseId);
  const liveClasses = (data?.liveClasses || []).filter((c) => c.courseId === courseId);

  return (
    <div>
      <Link href="/academics/my-courses" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        &larr; Back to My Courses
      </Link>

      <h1 style={{ ...s.pageHeading, marginTop: 10 }}>{course.title}</h1>
      <p style={s.pageDescription}>
        {course.code} — everything for this course in one place: assignments, quizzes,
        grades, attendance, live classes and discussion.
      </p>

      <div className="ih-stat-grid" style={{ marginBottom: 20 }}>
        <div className="ih-stat-tile">
          <div className="l">Assignments</div>
          <div className="n">{assignments.length}</div>
        </div>
        <div className="ih-stat-tile">
          <div className="l">Quizzes</div>
          <div className="n">{quizzes.length}</div>
        </div>
        <div className="ih-stat-tile">
          <div className="l">Attendance</div>
          <div className="n">{attendance ? `${attendance.attendanceRate}%` : '—'}</div>
        </div>
        <div className="ih-stat-tile accent">
          <div className="l">Current Grade</div>
          <div className="n">{grade?.letter || '—'}</div>
        </div>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Assignments</h2>
        {assignments.length === 0 ? (
          <div style={s.emptyState}>No assignments posted for this course yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td className="mono">{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td>
                      <StatusChip
                        label={a.submission ? a.submission.status : 'Not Submitted'}
                        tone={a.submission ? 'good' : 'warning'}
                      />
                    </td>
                    <td className="mono">
                      {a.submission?.score != null ? `${a.submission.score}/${a.maxScore}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '14px 0 0' }}>
          <Link href="/login?tab=quiz">Submit or review assignments in Quizzes &amp; Assignments &rarr;</Link>
        </p>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Quizzes</h2>
        {subLoading ? (
          <div style={s.loadingState}>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={s.emptyState}>No quizzes posted for this course yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Attempts</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id}>
                    <td>{q.title}</td>
                    <td className="mono">{q.attemptsUsed}/{q.maxAttempts}</td>
                    <td>
                      <StatusChip
                        label={q.closed ? 'Closed' : q.notYetOpen ? 'Not Yet Open' : q.attempted ? 'Attempted' : 'Open'}
                        tone={q.closed ? 'danger' : q.attempted ? 'good' : 'neutral'}
                      />
                    </td>
                    <td className="mono">{q.bestScore != null ? `${q.bestScore}/${q.maxScore}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '14px 0 0' }}>
          <Link href="/login?tab=quiz">Take or review quizzes in Quizzes &amp; Assignments &rarr;</Link>
        </p>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Grade</h2>
        {grade ? (
          <div className="ih-stat-grid">
            <div className="ih-stat-tile">
              <div className="l">Quiz 1</div>
              <div className="n">{grade.quiz1 ?? '—'}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Quiz 2</div>
              <div className="n">{grade.quiz2 ?? '—'}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Assignment</div>
              <div className="n">{grade.assignment ?? '—'}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Midterm</div>
              <div className="n">{grade.midterm ?? '—'}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Final</div>
              <div className="n">{grade.final ?? '—'}</div>
            </div>
            <div className="ih-stat-tile accent">
              <div className="l">Letter Grade</div>
              <div className="n">{grade.letter || '—'}</div>
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>No grade recorded for this course yet.</div>
        )}
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Attendance</h2>
        {attendance ? (
          <div className="ih-stat-grid">
            <div className="ih-stat-tile">
              <div className="l">Total Classes</div>
              <div className="n">{attendance.totalClasses}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Attended</div>
              <div className="n">{attendance.attended}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Late</div>
              <div className="n">{attendance.late}</div>
            </div>
            <div className="ih-stat-tile">
              <div className="l">Absent</div>
              <div className="n">{attendance.absent}</div>
            </div>
            <div className="ih-stat-tile accent">
              <div className="l">Rate</div>
              <div className="n">{attendance.attendanceRate}%</div>
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>No attendance recorded for this course yet.</div>
        )}
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Upcoming Exams</h2>
        {exams.length === 0 ? (
          <div style={s.emptyState}>No exams scheduled for this course yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td>{e.examType}</td>
                    <td className="mono">{new Date(e.date).toLocaleString()}</td>
                    <td className="mono">{e.durationMin} min</td>
                    <td>{e.venue || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Live Classes</h2>
        {liveClasses.length === 0 ? (
          <div style={s.emptyState}>No live classes scheduled for this course yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Instructor</th>
                  <th>Join</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{new Date(c.scheduledAt).toLocaleString()}</td>
                    <td>{c.topic}</td>
                    <td>{c.instructor || 'TBA'}</td>
                    <td>
                      {c.meetingLink ? (
                        <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="ih-btn ih-btn-secondary">
                          Link
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Section Discussion</h2>
        {subLoading ? (
          <div style={s.loadingState}>Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div style={s.emptyState}>No discussion posts for this course yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {discussions.map((d) => (
              <div
                key={d.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: 'var(--paper)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 13.5 }}>{d.title}</strong>
                  {d.isExercise && (
                    <StatusChip
                      label={d.hasSubmitted ? 'Submitted' : 'Exercise — Not Submitted'}
                      tone={d.hasSubmitted ? 'good' : 'warning'}
                    />
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '6px 0' }}>
                  {d.author?.name || 'Unknown'} · {new Date(d.createdAt).toLocaleDateString()} ·{' '}
                  {d.commentCount} comment{d.commentCount === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '14px 0 0' }}>
          <Link href="/login?tab=discussion" className="ih-btn ih-btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Open full Section Discussion &rarr;
          </Link>
        </p>
      </div>

      {/* Model 28 rule #8: required/recommended readings linked
          directly to a Digital Library resource or Bookstore title --
          only rendered when the course actually has any (never a
          placeholder), and each link goes to that resource's own,
          already access-controlled public page. */}
      {readings.length > 0 && (
        <div className="ih-card">
          <h2 style={s.cardTitle}>Required Reading</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {readings.map((reading) => {
              const target = reading.libraryResource || reading.book;
              if (!target) return null;
              return (
                <Link
                  key={reading.id}
                  href={target.href}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    background: 'var(--paper)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{target.title}</strong>
                    {reading.note && (
                      <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '4px 0 0' }}>{reading.note}</p>
                    )}
                  </div>
                  <StatusChip
                    label={reading.readingType === 'REQUIRED' ? 'Required' : 'Recommended'}
                    tone={reading.readingType === 'REQUIRED' ? 'warning' : 'good'}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
