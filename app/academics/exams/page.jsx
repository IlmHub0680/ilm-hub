'use client';

import { useAcademics } from '../context';
import * as s from '../styles';

function formatExamRow(raw) {
  const dt = new Date(raw.date);
  return {
    key: `${raw.date}-${raw.course}`,
    date: dt.toISOString().slice(0, 10),
    day: dt.toLocaleDateString('en-US', { weekday: 'long' }),
    time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    course: raw.course,
    venue: raw.venue || 'TBA',
  };
}

export default function ExamsPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your examination timetable...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const exams = (data?.examTimetable || []).map(formatExamRow);

  return (
    <div>
      <h1 style={s.pageHeading}>Final Exam Timetable</h1>
      <p style={s.pageDescription}>
        Your official final examination schedule — dates, times, and venues for every course
        you're registered in.
      </p>

      <div style={s.card}>
        {exams.length === 0 ? (
          <div style={s.emptyState}>No final examination timetable has been published yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }} id="exam-timetable-print">
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Day</th>
                  <th style={s.th}>Time</th>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Venue</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.key}>
                    <td style={s.td}>{exam.date}</td>
                    <td style={s.td}>{exam.day}</td>
                    <td style={s.td}>{exam.time}</td>
                    <td style={s.td}>
                      <strong>{exam.course}</strong>
                    </td>
                    <td style={s.td}>{exam.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {exams.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--brand)',
              color: 'var(--on-accent)',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Print Examination Timetable
          </button>
        )}
      </div>
    </div>
  );
}
