'use client';

import Link from 'next/link';
import { useAcademics } from '../context';
import { getAcademicSemesters, getCurrentStudent } from '../deriveAcademics';
import * as s from '../styles';

export default function AcademicRecordPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your academic history...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const academicSemesters = getAcademicSemesters(data);
  const student = getCurrentStudent(data);

  return (
    <div>
      <h1 style={s.pageHeading}>Grades & Academic History</h1>
      <p style={s.pageDescription}>
        Your term-by-term academic standing, and your recorded course
        grades. For an official, signed transcript document, request one
        from Requests & Documents in your student portal.
      </p>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Term-by-Term History</h2>

        {academicSemesters.length === 0 ? (
          <div style={s.emptyState}>
            No completed terms are on record yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Term</th>
                  <th style={s.th}>GPA</th>
                  <th style={s.th}>Standing</th>
                  <th style={s.th}>Credits Attempted</th>
                  <th style={s.th}>Credits Earned</th>
                </tr>
              </thead>
              <tbody>
                {academicSemesters.map((semester) => (
                  <tr key={semester.semester}>
                    <td style={s.td}>{semester.semester}</td>
                    <td style={s.td}>
                      {semester.gpa != null ? semester.gpa.toFixed(2) : 'N/A'}
                    </td>
                    <td style={s.td}>{semester.standing || '—'}</td>
                    <td style={s.td}>
                      {semester.creditsAttempted != null ? semester.creditsAttempted : '—'}
                    </td>
                    <td style={s.td}>
                      {semester.creditsEarned != null ? semester.creditsEarned : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Course Grades</h2>

        {student.grades.length === 0 ? (
          <div style={s.emptyState}>
            No course grades have been recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Final Score</th>
                  <th style={s.th}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {student.grades.map((g) => (
                  <tr key={g.course}>
                    <td style={s.td}>{g.course}</td>
                    <td style={s.td}>{g.score != null ? `${g.score}%` : '—'}</td>
                    <td style={s.td}>
                      <strong>{g.grade}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Score Breakdown by Component</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 14px' }}>
          How each course's final score was built up from your quiz, assignment, midterm and final exam marks.
        </p>

        {(data.grades || []).length === 0 ? (
          <div style={s.emptyState}>
            No recorded scores yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Quiz 1</th>
                  <th style={s.th}>Quiz 2</th>
                  <th style={s.th}>Assignment</th>
                  <th style={s.th}>Midterm</th>
                  <th style={s.th}>Final</th>
                </tr>
              </thead>
              <tbody>
                {(data.grades || []).map((g) => (
                  <tr key={g.course}>
                    <td style={s.td}><strong>{g.course}</strong></td>
                    <td style={s.td}>{g.quiz1 ?? '—'}</td>
                    <td style={s.td}>{g.quiz2 ?? '—'}</td>
                    <td style={s.td}>{g.assignment ?? '—'}</td>
                    <td style={s.td}>{g.midterm ?? '—'}</td>
                    <td style={s.td}>{g.final ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ ...s.card, background: 'var(--brand-tint)', border: '1px solid var(--success-tint)' }}>
        <h2 style={{ ...s.cardTitle, color: 'var(--brand-dark)' }}>Need an official transcript?</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
          Request an official, signed transcript PDF through Requests &amp;
          Documents — the Registrar issues it and it appears in your
          request history once ready.
        </p>
        <Link
          href="/login"
          style={{
            color: 'var(--brand-dark)',
            fontWeight: 700,
            fontSize: 13.5,
            textDecoration: 'none',
          }}
        >
          Go to Requests & Documents →
        </Link>
      </div>
    </div>
  );
}
