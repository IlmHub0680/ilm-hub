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

      <div className="ih-card">
        {exams.length === 0 ? (
          <div style={s.emptyState}>No final examination timetable has been published yet.</div>
        ) : (
          <div className="ih-tbl-wrap" id="exam-timetable-print">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.key}>
                    <td className="mono">{exam.date}</td>
                    <td>{exam.day}</td>
                    <td className="mono">{exam.time}</td>
                    <td>
                      <strong>{exam.course}</strong>
                    </td>
                    <td>{exam.venue}</td>
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
            className="ih-btn ih-btn-secondary"
            style={{ marginTop: 16 }}
          >
            Print Examination Timetable
          </button>
        )}
      </div>
    </div>
  );
}
