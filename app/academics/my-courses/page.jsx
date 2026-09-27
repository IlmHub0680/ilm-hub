'use client';

import Link from 'next/link';
import { useAcademics } from '../context';
import * as s from '../styles';

const STATUS_META = {
  APPROVED: { label: 'Enrolled', background: 'var(--success-tint)', color: 'var(--success)' },
  PENDING: { label: 'Pending Approval', background: 'var(--warning-tint)', color: 'var(--warning)' },
  REJECTED: { label: 'Not Approved', background: 'var(--danger-tint)', color: 'var(--danger)' },
};

export default function MyCoursesPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your courses...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const courses = data?.registeredCourses || [];

  return (
    <div>
      <h1 style={s.pageHeading}>My Courses</h1>
      <p style={s.pageDescription}>
        Every course you're enrolled in this term — open one for its assignments, quizzes,
        grades, attendance, live classes and discussion in a single place.
      </p>

      <div style={s.card}>
        {courses.length === 0 ? (
          <div style={s.emptyState}>You're not currently registered in any courses.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {courses.map((course) => {
              const meta = STATUS_META[course.status] || {
                label: course.status,
                background: 'var(--brand-tint)',
                color: 'var(--brand)',
              };

              return (
                <Link
                  key={course.id}
                  href={`/academics/my-courses/${course.id}`}
                  className="ih-card"
                  style={s.navCard}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        color: 'var(--ink-soft)',
                        fontWeight: 700,
                        letterSpacing: 0.3,
                      }}
                    >
                      {course.code}
                    </span>

                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: meta.background,
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <h3 style={s.navCardTitle}>{course.title}</h3>
                  <p style={s.navCardDesc}>Open the course hub →</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
