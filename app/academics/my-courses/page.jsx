'use client';

import Link from 'next/link';
import { useAcademics } from '../context';
import * as s from '../styles';

const STATUS_META = {
  APPROVED: { label: 'Enrolled', badgeClass: 'ih-b-success' },
  PENDING: { label: 'Pending Approval', badgeClass: 'ih-b-warning' },
  REJECTED: { label: 'Not Approved', badgeClass: 'ih-b-danger' },
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
                badgeClass: 'ih-b-neutral',
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

                    <span className={`ih-badge ${meta.badgeClass}`}>{meta.label}</span>
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
