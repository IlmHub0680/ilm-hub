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

      <div style={s.card}>
        <h2 style={s.cardTitle}>Upcoming</h2>

        {upcoming.length === 0 ? (
          <div style={s.emptyState}>No live classes are scheduled yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Day</th>
                  <th style={s.th}>Time</th>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Topic</th>
                  <th style={s.th}>Instructor</th>
                  <th style={s.th}>Join</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((cls) => (
                  <tr key={cls.key}>
                    <td style={s.td}>{cls.date}</td>
                    <td style={s.td}>{cls.day}</td>
                    <td style={s.td}>{cls.time}</td>
                    <td style={s.td}>
                      <strong>{cls.courseTitle}</strong>
                    </td>
                    <td style={s.td}>{cls.topic}</td>
                    <td style={s.td}>{cls.instructor}</td>
                    <td style={s.td}>
                      {cls.isLive ? (
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={s.badge('var(--success, #1a7f4b)')}
                        >
                          Join now
                        </a>
                      ) : (
                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
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
        <div style={s.card}>
          <h2 style={s.cardTitle}>Past Sessions</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Course</th>
                  <th style={s.th}>Topic</th>
                  <th style={s.th}>Instructor</th>
                  <th style={s.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {past.map((cls) => (
                  <tr key={cls.key}>
                    <td style={s.td}>{cls.date}</td>
                    <td style={s.td}>{cls.courseTitle}</td>
                    <td style={s.td}>{cls.topic}</td>
                    <td style={s.td}>{cls.instructor}</td>
                    <td style={s.td}>{cls.notes || '—'}</td>
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
