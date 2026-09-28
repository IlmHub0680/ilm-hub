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

      <div className="ih-stat-grid" style={{ marginBottom: 20 }}>
        <div className="ih-stat-tile accent">
          <div className="n">{student.semesterGPA != null ? student.semesterGPA.toFixed(2) : 'N/A'}</div>
          <div className="l">Semester GPA</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{student.cgpa != null ? student.cgpa.toFixed(2) : 'N/A'}</div>
          <div className="l">CGPA</div>
        </div>
      </div>

      <div className="ih-card">
        <h2 style={s.cardTitle}>Term-by-Term History</h2>

        {academicSemesters.length === 0 ? (
          <div style={s.emptyState}>
            No completed terms are on record yet.
          </div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>GPA</th>
                  <th>Standing</th>
                  <th>Credits Attempted</th>
                  <th>Credits Earned</th>
                </tr>
              </thead>
              <tbody>
                {academicSemesters.map((semester) => (
                  <tr key={semester.semester}>
                    <td>{semester.semester}</td>
                    <td className="mono">
                      {semester.gpa != null ? semester.gpa.toFixed(2) : 'N/A'}
                    </td>
                    <td>{semester.standing || '—'}</td>
                    <td className="mono">
                      {semester.creditsAttempted != null ? semester.creditsAttempted : '—'}
                    </td>
                    <td className="mono">
                      {semester.creditsEarned != null ? semester.creditsEarned : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ih-card">
        <h2 style={s.cardTitle}>Course Grades</h2>

        {student.grades.length === 0 ? (
          <div style={s.emptyState}>
            No course grades have been recorded yet.
          </div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Final Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {student.grades.map((g) => (
                  <tr key={g.course}>
                    <td>{g.course}</td>
                    <td className="mono">{g.score != null ? `${g.score}%` : '—'}</td>
                    <td>
                      <strong>{g.grade}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ih-card">
        <h2 style={s.cardTitle}>Score Breakdown by Component</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 14px' }}>
          How each course's final score was built up from your quiz, assignment, midterm and final exam marks.
        </p>

        {(data.grades || []).length === 0 ? (
          <div style={s.emptyState}>
            No recorded scores yet.
          </div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Quiz 1</th>
                  <th>Quiz 2</th>
                  <th>Assignment</th>
                  <th>Midterm</th>
                  <th>Final</th>
                </tr>
              </thead>
              <tbody>
                {(data.grades || []).map((g) => (
                  <tr key={g.course}>
                    <td><strong>{g.course}</strong></td>
                    <td className="mono">{g.quiz1 ?? '—'}</td>
                    <td className="mono">{g.quiz2 ?? '—'}</td>
                    <td className="mono">{g.assignment ?? '—'}</td>
                    <td className="mono">{g.midterm ?? '—'}</td>
                    <td className="mono">{g.final ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ih-card" style={{ background: 'var(--brand-tint)', border: '1px solid var(--success-tint)' }}>
        <h2 style={{ ...s.cardTitle, color: 'var(--brand-dark)' }}>Need an official transcript?</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
          Request an official, signed transcript PDF through Requests &amp;
          Documents — the Registrar issues it and it appears in your
          request history once ready.
        </p>
        <Link href="/login" className="ih-btn ih-btn-primary">
          Go to Requests & Documents →
        </Link>
      </div>
    </div>
  );
}
