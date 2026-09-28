'use client';

// The real "Academic System" home for a student -- GPA/CGPA, status,
// and every academic self-service tool, all reading the same
// /api/student/portal data as /login's dashboard tab. This is what
// "student dashboard" should mean in this codebase. It is NOT
// app/account/dashboard (bookstore/media/orders -- a different account
// type entirely) or app/dashboard (that route no longer exists; it
// redirects to app/account/dashboard -- see next.config.js).

import Link from 'next/link';
import { useAcademics } from '../context';
import { getCurrentStudent, getAcademicStatusMeta, getAcademicLevelProgress, STATUS_TONE_STYLE } from '../deriveAcademics';
import * as s from '../styles';

const HUB_LINKS = [
  {
    href: '/academics/my-courses',
    icon: '📚',
    title: 'My Courses',
    description: 'Every enrolled course, with its assignments, quizzes, grades, attendance and discussion in one hub.',
  },
  {
    href: '/academics/study-plan',
    icon: '☰',
    title: 'Study Plan & Curriculum',
    description: 'Your full curriculum, and course add/drop requests.',
  },
  {
    href: '/academics/records',
    icon: '▥',
    title: 'Grades & Academic History',
    description: 'Term-by-term GPA history and recorded course grades.',
  },
  {
    href: '/academics/remaining-courses',
    icon: '◫',
    title: 'Courses & Academic Progress',
    description: 'Your completed, current, and remaining curriculum courses.',
  },
  {
    href: '/academics/grading-policy',
    icon: '⚖',
    title: 'Grading Policy',
    description: 'The official score-to-grade scale.',
  },
  {
    href: '/academics/communication',
    icon: '✉',
    title: 'Communication & Complaints',
    description: 'Contact a department or office, and track your requests.',
  },
  {
    href: '/academics/graduation',
    icon: '🎓',
    title: 'Graduation Procedures',
    description: 'Eligibility, application, clearance and final approval.',
  },
  {
    href: '/academics/graduation-documents',
    icon: '📜',
    title: 'Graduation Documents',
    description: 'Your graduation certificate, statement of completion, and transcript.',
  },
  {
    href: '/academics/exams',
    icon: '▤',
    title: 'Final Exam Timetable',
    description: 'Your official final examination schedule — dates, times, and venues.',
  },
  {
    href: '/academics/attendance',
    icon: '◷',
    title: 'Attendance Record',
    description: 'Your lecture attendance and absence percentage by course.',
  },
  {
    href: '/academics/live-classes',
    icon: '🎥',
    title: 'Live Classes',
    description: 'Your upcoming and past live class sessions.',
  },
  {
    href: '/academics/community',
    icon: '🕌',
    title: 'Ulul Azm Community',
    description: 'Connect with fellow students and alumni.',
  },
];

export default function AcademicOverviewPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your academic overview...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const student = getCurrentStudent(data);
  const gpaDisplay = student.semesterGPA != null ? student.semesterGPA.toFixed(2) : 'N/A';
  const cgpaDisplay = student.cgpa != null ? student.cgpa.toFixed(2) : 'N/A';
  const statusMeta = getAcademicStatusMeta(student.academicStatus);
  const levelProgress = getAcademicLevelProgress(data);
  const levelDisplay =
    levelProgress.level != null
      ? levelProgress.durationYears
        ? `Level ${levelProgress.level} of ${levelProgress.durationYears}`
        : `Level ${levelProgress.level}`
      : 'Not yet recorded';

  return (
    <div>
      <h1 style={s.pageHeading}>Academic System</h1>
      <p style={s.pageDescription}>
        Your central hub for everything academic — GPA and status at a
        glance, plus every self-service tool: curriculum, grades,
        communication with departments, and graduation.
      </p>

      <div style={s.heroRow}>
        <div style={s.heroMetric}>
          <span style={s.heroLabel}>Current Semester GPA</span>
          <strong style={s.heroValue}>{gpaDisplay}</strong>
        </div>

        <div style={s.heroMetric}>
          <span style={s.heroLabel}>CGPA</span>
          <strong style={{ ...s.heroValue, fontSize: 22 }}>{cgpaDisplay}</strong>
        </div>

        <div
          style={{
            ...s.statusPill,
            background: (STATUS_TONE_STYLE[statusMeta.tone] || {}).background,
            color: (STATUS_TONE_STYLE[statusMeta.tone] || {}).color,
            border: 'none',
          }}
        >
          {statusMeta.label}
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Snapshot</h2>

        <div style={s.statGrid}>
          <div style={s.statCard}>
            <span style={s.statLabel}>Programme</span>
            <strong style={s.statValue}>{student.enrolledProgramme || '—'}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>Study Type</span>
            <strong style={s.statValue}>{student.studyType || '—'}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>Registered Courses</span>
            <strong style={s.statValue}>{student.registeredCourses.length}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>Fee Status</span>
            <strong style={s.statValue}>{student.feeStatus}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>Academic Level</span>
            <strong style={s.statValue}>{levelDisplay}</strong>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Academic Self-Service</h2>

        <div style={s.navCardGrid}>
          {HUB_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="ih-card" style={s.navCard}>
              <span style={s.navCardIcon} aria-hidden="true">{link.icon}</span>
              <h3 style={s.navCardTitle}>{link.title}</h3>
              <p style={s.navCardDesc}>{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
