'use client';

import { useAcademics } from '../context';
import * as s from '../styles';

function formatLiveClassRow(raw) {
  const dt = new Date(raw.scheduledAt);
  const now = new Date();
  const endsAt = new Date(dt.getTime() + (raw.durationMin || 0) * 60000);

  return {
    key: raw.id,
    date: dt.toISOString().slice(0, 10),
    day: dt.toLocaleDateString('en-US', { weekday: 'long' }),
    time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    courseCode: raw.courseCode || '',
    courseTitle: raw.course || '',
    instructor: raw.instructor || 'TBA',
    topic: raw.topic,
    durationMin: raw.durationMin,
    meetingLink: raw.meetingLink,
    notes: raw.notes,
    isLive: now >= dt && now < endsAt,
    isPast: now >= endsAt,
  };
}

export default function LiveClassesPage() {
  const { data, loading, error } = useAcademics();

  if (loading) {
    return <div style={s.loadingState}>Loading your live class schedule...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const classes = (data?.liveClasses || []).map(formatLiveClassRow);
  const upcoming = classes.filter((c) => !c.isPast).sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  const past = classes.filter((c) => c.isPast);

  return (
    <div>
      <h1 style={s.pageHeading}>Live Classes</h1>
      <p style={s.pageDescription}>
        Scheduled live sessions for every course you're enrolled in — join links, topics, and
        instructors, drawn straight from your instructors' own schedules.
      </p>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Upcoming</h2>

        {upcoming.length === 0 ? (
          <div style={s.emptyState}>No live classes are scheduled yet.</div>
        ) : (
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Instructor</th>
                  <th>Join</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((cls) => (
                  <tr key={cls.key}>
                    <td className="mono">{cls.date}</td>
                    <td>{cls.day}</td>
                    <td className="mono">{cls.time}</td>
                    <td>
                      <strong>{cls.courseTitle}</strong>
                    </td>
                    <td>{cls.topic}</td>
                    <td>{cls.instructor}</td>
                    <td>
                      {cls.isLive ? (
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ih-badge ih-b-success"
                        >
                          Join now
                        </a>
                      ) : (
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ih-btn ih-btn-primary"
                        >
                          Link
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="ih-card">
          <h2 style={s.cardTitle}>Past Sessions</h2>
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Instructor</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {past.map((cls) => (
                  <tr key={cls.key}>
                    <td className="mono">{cls.date}</td>
                    <td>{cls.courseTitle}</td>
                    <td>{cls.topic}</td>
                    <td>{cls.instructor}</td>
                    <td>{cls.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
