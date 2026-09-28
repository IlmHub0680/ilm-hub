'use client';

import { GRADING_SYSTEM } from '../deriveAcademics';
import { GRADE_POINTS } from '@/lib/grading';
import * as s from '../styles';

function gradeBadgeClass(grade) {
  return ['A+', 'A'].includes(grade)
    ? 'ih-b-success'
    : ['B+', 'B', 'C+'].includes(grade)
    ? 'ih-b-info'
    : ['C', 'D+', 'D'].includes(grade)
    ? 'ih-b-warning'
    : 'ih-b-danger';
}

export default function GradingPolicyPage() {
  return (
    <div>
      <h1 style={s.pageHeading}>Grading Policy</h1>
      <p style={s.pageDescription}>
        The institution's official score-to-grade scale, used across all
        programmes and courses — and the grade points each letter carries
        toward your Semester GPA and CGPA, both calculated automatically
        from your real course grades.
      </p>

      <div className="ih-card">
        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Grade</th>
                <th>Description</th>
                <th>Grade Points</th>
              </tr>
            </thead>
            <tbody>
              {GRADING_SYSTEM.map(([range, grade, description]) => (
                <tr key={range}>
                  <td className="mono">{range}</td>
                  <td>
                    <span className={`ih-badge ${gradeBadgeClass(grade)}`}>{grade}</span>
                  </td>
                  <td>{description}</td>
                  <td className="mono">{GRADE_POINTS[grade].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '14px 0 0' }}>
          Your GPA is a credit-weighted average of these grade points across your
          graded courses — never a fixed or manually-entered number.
        </p>
      </div>
    </div>
  );
}
