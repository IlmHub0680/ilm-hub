'use client';

import { useAcademics } from '../context';
import * as s from '../styles';
import {
  ATTENDANCE_FAIL_THRESHOLD_PERCENT,
  ATTENDANCE_STATUS_TONE,
  computeAttendanceStatus,
} from '@/lib/attendancePolicy';

const TONE_COLOR = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--ink-soft)',
};

const TONE_BADGE_CLASS = {
  success: 'ih-b-success',
  warning: 'ih-b-warning',
  danger: 'ih-b-danger',
  neutral: 'ih-b-neutral',
};

export default function AttendancePage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your attendance record...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const records = data?.attendance || [];

  return (
    <div>
      <h1 style={s.pageHeading}>Attendance Record</h1>
      <p style={s.pageDescription}>
        Monitor your lecture attendance, lateness, and absence percentage for every course
        you're registered in this term.
      </p>

      <div
        style={{
          background: 'var(--danger-tint)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-l)',
          padding: 'var(--sp-5)',
          marginBottom: 20,
        }}
      >
        <strong style={{ color: 'var(--danger)', fontSize: 14 }}>Important Attendance Rule</strong>
        <p style={{ fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 0' }}>
          A student who reaches {ATTENDANCE_FAIL_THRESHOLD_PERCENT}% absence in a specific
          course fails that course and must repeat it, subject to the institute's academic
          regulations. Standing below moves through graduated warning tiers as absences
          approach this limit.
        </p>
      </div>

      <div className="ih-card">
        {records.length === 0 ? (
          <div style={s.emptyState}>No attendance records are available yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Classes</th>
                  <th>Attended</th>
                  <th>Late</th>
                  <th>Absent</th>
                  <th>Absence %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const { absenceRate, status } = computeAttendanceStatus(
                    record.totalClasses,
                    record.attended,
                    record.late,
                    record.absent
                  );
                  const tone = ATTENDANCE_STATUS_TONE[status] || 'neutral';
                  return (
                    <tr key={record.course}>
                      <td>
                        <strong>{record.course}</strong>
                      </td>
                      <td className="mono">{record.totalClasses}</td>
                      <td className="mono">{record.attended}</td>
                      <td className="mono">{record.late ?? 0}</td>
                      <td className="mono">{record.absent}</td>
                      <td className="mono">
                        <strong style={{ color: TONE_COLOR[tone] }}>
                          {absenceRate === null ? '—' : `${absenceRate}%`}
                        </strong>
                      </td>
                      <td>
                        <span className={`ih-badge ${TONE_BADGE_CLASS[tone] || 'ih-b-neutral'}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
