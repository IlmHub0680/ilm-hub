'use client';

import { GRADING_SYSTEM } from '../deriveAcademics';
import { GRADE_POINTS } from '@/lib/grading';
import * as s from '../styles';

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

      <div style={s.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Score Range</th>
                <th style={s.th}>Grade</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Grade Points</th>
              </tr>
            </thead>
            <tbody>
              {GRADING_SYSTEM.map(([range, grade, description]) => (
                <tr key={range}>
                  <td style={s.td}>{range}</td>
                  <td style={s.td}>
                    <strong>{grade}</strong>
                  </td>
                  <td style={s.td}>{description}</td>
                  <td style={s.td}>{GRADE_POINTS[grade].toFixed(2)}</td>
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
