'use client';

import { useEffect, useState } from 'react';

/**
 * The institution's one official Academic Calendar — Gregorian + Hijri,
 * grouped by semester, ending with "Start of the New Academic Year" —
 * read from /api/academic-calendar (the single calendar every portal
 * shares; see app/api/records/academic-calendar for how staff manage it).
 *
 * Self-contained and portal-agnostic on purpose: any dashboard can embed
 * <AcademicCalendarView /> and it always shows the one currently
 * PUBLISHED calendar, with nothing hard-coded here.
 */
export default function AcademicCalendarView() {
  const [calendar, setCalendar] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/academic-calendar', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load the academic calendar.');
        }
        setCalendar(result.calendar);
        setHolidays(Array.isArray(result.holidays) ? result.holidays : []);
      })
      .catch((err) => setError(err.message || 'Unable to load the academic calendar.'))
      .finally(() => setLoading(false));
  }, []);

  function formatHolidayDate(h) {
    const start = h.startDate;
    const end = h.endDate;
    return start === end ? start : `${start} \u2013 ${end}`;
  }

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading the academic calendar…</div>;
  }

  if (error) {
    return (
      <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  if (!calendar && holidays.length === 0) {
    return (
      <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
        No academic calendar has been published yet. Please check back once the Registrar publishes this year's calendar.
      </div>
    );
  }

  const holidaysSection = holidays.length > 0 && (
    <div className="ih-card" style={{ marginTop: calendar ? 20 : 0 }}>
      <h3 style={{ fontSize: 14.5, margin: '0 0 10px', color: 'var(--brand-dark)' }}>Institution Holidays</h3>
      <div className="ih-tbl-wrap">
        <table className="ih-tbl">
          <thead>
            <tr>
              <th>Holiday</th>
              <th>Date(s)</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td className="mono">{formatHolidayDate(h)}</td>
                <td>{h.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!calendar) {
    return holidaysSection;
  }

  // Group rows by their semester/section, in the order they were entered.
  const sections = [];
  for (const entry of calendar.entries) {
    let group = sections.find((s) => s.section === entry.section);
    if (!group) {
      group = { section: entry.section, rows: [] };
      sections.push(group);
    }
    group.rows.push(entry);
  }

  return (
    <div className="ih-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--brand)' }}>
            Ulul Azm Institute — Office of the Registrar
          </div>
          <h2 style={{ margin: '4px 0 4px', fontSize: 20 }}>
            Academic Calendar — For the Academic Year: {calendar.academicYearLabel}
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Hijri Year: {calendar.hijriYearLabel}
          </p>
        </div>

        <a
          href="/api/academic-calendar/download"
          className="ih-btn ih-btn-gold"
          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          ⬇ Download PDF
        </a>
      </div>

      {sections.map((group) => (
        <div key={group.section} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14.5, margin: '0 0 10px', color: 'var(--brand-dark)' }}>{group.section}</h3>
          <div className="ih-tbl-wrap">
            <table className="ih-tbl">
              <thead>
                <tr>
                  <th>Procedure</th>
                  <th>Gregorian Date</th>
                  <th>Hijri Date</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.procedure}</td>
                    <td className="mono">{row.gregorianDate}</td>
                    <td className="mono">{row.hijriDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {holidaysSection}
    </div>
  );
}
