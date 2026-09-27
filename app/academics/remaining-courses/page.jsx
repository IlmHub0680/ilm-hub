'use client';

import { useAcademics } from '../context';
import { getCoursePlanOverview, getAcademicLevelProgress } from '../deriveAcademics';
import * as s from '../styles';

const STATUS_META = {
  current: { label: 'Currently Taking', background: 'var(--info-tint)', color: 'var(--info)' },
  completed: { label: 'Completed', background: 'var(--success-tint)', color: 'var(--success)' },
  remaining: { label: 'Not Yet Taken', background: 'var(--danger-tint)', color: 'var(--danger)' },
};

function CourseCard({ course }) {
  const meta = STATUS_META[course.status];
  const showGradeRow = course.status === 'completed' || course.previouslyAttempted;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 16px',
        background: 'var(--paper)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 0.3 }}>
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
            background: course.previouslyAttempted ? 'var(--warning-tint)' : meta.background,
            color: course.previouslyAttempted ? 'var(--warning)' : meta.color,
          }}
        >
          {course.previouslyAttempted ? 'Not Passed — Retake Required' : meta.label}
        </span>
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', margin: '6px 0 4px' }}>
        {course.title}
      </div>

      <small style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block' }}>
        {course.level}
        {course.credits != null ? ` · ${course.credits} Credit${course.credits === 1 ? '' : 's'}` : ''}
      </small>

      {showGradeRow && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
          }}
        >
          <span style={{ color: 'var(--ink-soft)' }}>
            {course.termName || 'Term not recorded'}
          </span>
          <span style={{ fontWeight: 800, color: course.previouslyAttempted ? 'var(--warning)' : 'var(--ink)' }}>
            {course.grade}
            {course.score != null ? ` · ${course.score}%` : ''}
          </span>
        </div>
      )}
    </div>
  );
}

function CourseGrid({ courses, emptyMessage }) {
  if (courses.length === 0) {
    return <div style={s.emptyState}>{emptyMessage}</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
      }}
    >
      {courses.map((course) => (
        <CourseCard key={course.code} course={course} />
      ))}
    </div>
  );
}

export default function CoursesAcademicProgressPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your academic progress...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const coursePlanOverview = getCoursePlanOverview(data);
  const currentCourses = coursePlanOverview.filter((c) => c.status === 'current');
  const completedCourses = coursePlanOverview.filter((c) => c.status === 'completed');
  const remainingCourses = coursePlanOverview.filter((c) => c.status === 'remaining');
  const levelProgress = getAcademicLevelProgress(data);

  const totalCreditsEarned = completedCourses
    .filter((c) => c.passed)
    .reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <div>
      <h1 style={s.pageHeading}>Courses &amp; Academic Progress</h1>
      <p style={s.pageDescription}>
        Every course in your programme's curriculum — what you've
        completed, what you're currently taking, and what's still ahead
        — drawn from your real academic record.
      </p>

      {coursePlanOverview.length > 0 && (
        <div style={s.statGrid}>
          <div style={s.statCard}>
            <span style={s.statLabel}>Completed</span>
            <span style={s.statValue}>{completedCourses.length}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statLabel}>Currently Taking</span>
            <span style={s.statValue}>{currentCourses.length}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statLabel}>Remaining</span>
            <span style={s.statValue}>{remainingCourses.length}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statLabel}>Credits Earned</span>
            <span style={s.statValue}>{totalCreditsEarned}</span>
          </div>
          {levelProgress.level != null && (
            <div style={s.statCard}>
              <span style={s.statLabel}>Academic Level</span>
              <span style={s.statValue}>
                {levelProgress.durationYears
                  ? `Level ${levelProgress.level} of ${levelProgress.durationYears}`
                  : `Level ${levelProgress.level}`}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={s.card}>
        <h2 style={s.cardTitle}>Currently Taking</h2>
        <CourseGrid
          courses={currentCourses}
          emptyMessage="You're not currently registered in any courses."
        />
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Completed Courses</h2>
        <CourseGrid
          courses={completedCourses}
          emptyMessage="No completed courses on record yet."
        />
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Remaining Courses</h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '-6px 0 14px' }}>
          Courses in your programme's curriculum that you haven't taken or completed yet.
        </p>
        <CourseGrid
          courses={remainingCourses}
          emptyMessage="No remaining courses — you're either currently taking or have completed everything in your curriculum."
        />
      </div>
    </div>
  );
}
