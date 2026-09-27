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
          ...s.card,
          background: 'var(--danger-tint)',
          border: '1px solid var(--danger)',
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

      <div style={s.card}>
        {records.length === 0 ? (
          <div style={s.emptyState}>No attendance records are available yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Classes</th>
                  <th style={s.th}>Attended</th>
                  <th style={s.th}>Late</th>
                  <th style={s.th}>Absent</th>
                  <th style={s.th}>Absence %</th>
                  <th style={s.th}>Status</th>
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
                      <td style={s.td}>
                        <strong>{record.course}</strong>
                      </td>
                      <td style={s.td}>{record.totalClasses}</td>
                      <td style={s.td}>{record.attended}</td>
                      <td style={s.td}>{record.late ?? 0}</td>
                      <td style={s.td}>{record.absent}</td>
                      <td style={s.td}>
                        <strong style={{ color: TONE_COLOR[tone] }}>
                          {absenceRate === null ? '—' : `${absenceRate}%`}
                        </strong>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(TONE_COLOR[tone])}>{status}</span>
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
