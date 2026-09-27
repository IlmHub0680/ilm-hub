'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAcademics } from '../../context';
import * as s from '../../styles';

function StatusChip({ label, tone }) {
  const toneStyle = s.badge(
    tone === 'good'
      ? 'var(--success, #1a7f4b)'
      : tone === 'warning'
      ? 'var(--warning, #a15c00)'
      : tone === 'danger'
      ? 'var(--danger, #b3261e)'
      : 'var(--brand, #2b5fae)'
  );
  return <span style={toneStyle}>{label}</span>;
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

      <div style={s.statGrid}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Assignments</span>
          <span style={s.statValue}>{assignments.length}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Quizzes</span>
          <span style={s.statValue}>{quizzes.length}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Attendance</span>
          <span style={s.statValue}>
            {attendance ? `${attendance.attendanceRate}%` : '—'}
          </span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Current Grade</span>
          <span style={s.statValue}>{grade?.letter || '—'}</span>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Assignments</h2>
        {assignments.length === 0 ? (
          <div style={s.emptyState}>No assignments posted for this course yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Due</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Score</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td style={s.td}>{a.title}</td>
                    <td style={s.td}>{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <StatusChip
                        label={a.submission ? a.submission.status : 'Not Submitted'}
                        tone={a.submission ? 'good' : 'warning'}
                      />
                    </td>
                    <td style={s.td}>
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

      <div style={s.card}>
        <h2 style={s.cardTitle}>Quizzes</h2>
        {subLoading ? (
          <div style={s.loadingState}>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={s.emptyState}>No quizzes posted for this course yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Attempts</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Score</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id}>
                    <td style={s.td}>{q.title}</td>
                    <td style={s.td}>{q.attemptsUsed}/{q.maxAttempts}</td>
                    <td style={s.td}>
                      <StatusChip
                        label={q.closed ? 'Closed' : q.notYetOpen ? 'Not Yet Open' : q.attempted ? 'Attempted' : 'Open'}
                        tone={q.closed ? 'danger' : q.attempted ? 'good' : 'neutral'}
                      />
                    </td>
                    <td style={s.td}>{q.bestScore != null ? `${q.bestScore}/${q.maxScore}` : '—'}</td>
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

      <div style={s.card}>
        <h2 style={s.cardTitle}>Grade</h2>
        {grade ? (
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Quiz 1</span>
              <span style={s.statValue}>{grade.quiz1 ?? '—'}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Quiz 2</span>
              <span style={s.statValue}>{grade.quiz2 ?? '—'}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Assignment</span>
              <span style={s.statValue}>{grade.assignment ?? '—'}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Midterm</span>
              <span style={s.statValue}>{grade.midterm ?? '—'}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Final</span>
              <span style={s.statValue}>{grade.final ?? '—'}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Letter Grade</span>
              <span style={s.statValue}>{grade.letter || '—'}</span>
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>No grade recorded for this course yet.</div>
        )}
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Attendance</h2>
        {attendance ? (
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total Classes</span>
              <span style={s.statValue}>{attendance.totalClasses}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Attended</span>
              <span style={s.statValue}>{attendance.attended}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Late</span>
              <span style={s.statValue}>{attendance.late}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Absent</span>
              <span style={s.statValue}>{attendance.absent}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Rate</span>
              <span style={s.statValue}>{attendance.attendanceRate}%</span>
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>No attendance recorded for this course yet.</div>
        )}
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Upcoming Exams</h2>
        {exams.length === 0 ? (
          <div style={s.emptyState}>No exams scheduled for this course yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Duration</th>
                  <th style={s.th}>Venue</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td style={s.td}>{e.examType}</td>
                    <td style={s.td}>{new Date(e.date).toLocaleString()}</td>
                    <td style={s.td}>{e.durationMin} min</td>
                    <td style={s.td}>{e.venue || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Live Classes</h2>
        {liveClasses.length === 0 ? (
          <div style={s.emptyState}>No live classes scheduled for this course yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Topic</th>
                  <th style={s.th}>Instructor</th>
                  <th style={s.th}>Join</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}>{new Date(c.scheduledAt).toLocaleString()}</td>
                    <td style={s.td}>{c.topic}</td>
                    <td style={s.td}>{c.instructor || 'TBA'}</td>
                    <td style={s.td}>
                      {c.meetingLink ? (
                        <a href={c.meetingLink} target="_blank" rel="noopener noreferrer">
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

      <div style={s.card}>
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
          <Link href="/login?tab=discussion">Open full Section Discussion &rarr;</Link>
        </p>
      </div>

      {/* Model 28 rule #8: required/recommended readings linked
          directly to a Digital Library resource or Bookstore title --
          only rendered when the course actually has any (never a
          placeholder), and each link goes to that resource's own,
          already access-controlled public page. */}
      {readings.length > 0 && (
        <div style={s.card}>
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
