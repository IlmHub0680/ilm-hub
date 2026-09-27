'use client';

import { useEffect, useState } from 'react';

/*
 * Homepage-only floating widget: today's Hijri date, plus a rotating
 * Islamic reminder that adapts to where we are in the Hijri calendar --
 * a daily reminder throughout Ramadan, occasion-specific reminders for
 * the blessed first ten days of Dhul-Hijjah / the Day of Arafah / both
 * Eids, and a Jumu'ah reminder on an ordinary Friday. Fixed to the
 * bottom-LEFT of the viewport, deliberately mirroring AssistantWidget's
 * bottom-right placement (components/AssistantWidget.jsx, zIndex 999)
 * so the two never overlap -- this one sits at a lower zIndex and
 * stays collapsed by default so it never competes with the chat
 * launcher.
 *
 * This computes its own Hijri date independently (the same standard
 * Intl.DateTimeFormat('en-u-ca-islamic-umalqura') approach already
 * used by the homepage's top information bar) rather than importing
 * anything from app/page.jsx -- the existing Islamic/Gregorian date
 * display there is intentionally left untouched.
 *
 * Wording note: this deliberately does not wish "Jumu'ah Mubarak" --
 * that is not an established greeting. "Taqabbalallah" (may Allah
 * accept [our deeds]) is used only where it is the authentic,
 * traditional greeting: the two Eids.
 */

function hijriParts(now) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(now);
    const get = (type) => Number(parts.find((p) => p.type === type)?.value);
    const day = get('day');
    const month = get('month');
    return Number.isFinite(day) && Number.isFinite(month) ? { day, month } : null;
  } catch (error) {
    return null;
  }
}

function hijriLongDate(now) {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now) + ' AH';
  } catch (error) {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now) + ' AH';
    } catch (fallbackError) {
      return null;
    }
  }
}

const JUMUAH_REMINDERS = [
  'Recite Surah Al-Kahf.',
  "Send abundant Salawat upon the Prophet صَلَّى اللّه عَلَيْهِ وَسَلَّم.",
  "Attend Jumu'ah early, and make du'a in the last hour before Maghrib.",
];

// Shown on an ordinary day (no Ramadan/Dhul-Hijjah/Eid occasion, and
// not a Friday) -- previously that state showed only the Jumu'ah
// countdown with no reminder at all. One short, general reminder,
// rotated by the Gregorian day-of-year (this only picks which line
// to show -- it does not compute or display any date itself, so it
// does not touch the Hijri/Gregorian date logic above).
const DAILY_REMINDERS = [
  'The Prophet صَلَّى اللّه عَلَيْهِ وَسَلَّم said the most beloved deeds to Allah are those done regularly, even if small.',
  'Begin your day with the remembrance of Allah -- a moment of dhikr steadies the whole day.',
  'Seek knowledge that benefits, and put what you learn into practice.',
  'A good word is charity -- speak well to those around you today.',
  'Guard your five daily prayers; they are the pillar of the religion.',
  'Send Salawat upon the Prophet صَلَّى اللّه عَلَيْهِ وَسَلَّم whenever you remember him.',
  "Recite even a few verses of the Qur'an today and reflect on their meaning.",
  'Be grateful -- gratitude is the surest way to increase in blessing.',
  'Ask Allah for forgiveness often; istighfar softens the heart.',
  'Treat your parents, family and neighbours with kindness today.',
];

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

const RAMADAN_FIRST_TEN = [
  'Guard your fast: avoid idle talk, backbiting, and arguments.',
  "Recite and reflect on the Qur'an daily.",
  'Give charity (sadaqah) -- the Prophet صَلَّى اللّه عَلَيْهِ وَسَلَّم was most generous in Ramadan.',
  "Make abundant du'a -- a fasting person's prayer is not turned away.",
  'Hasten to break your fast, and delay suhoor.',
];

const RAMADAN_MIDDLE_TEN = [
  'Pray Taraweeh and seek the reward of the night prayer.',
  'Maintain family ties and be generous to those around you.',
  'Seek forgiveness often -- Ramadan is a season of mercy.',
  "Renew your intention (niyyah) each night for the next day's fast.",
  "Recite and reflect on the Qur'an daily.",
];

const RAMADAN_LAST_TEN = [
  'Seek Laylatul Qadr in these last ten nights -- better than a thousand months.',
  "Increase in prayer, Qur'an, and du'a in the odd nights.",
  'Consider i’tikaf (devotional seclusion) if you are able.',
  'Give generously -- charity is multiplied in these blessed nights.',
  '"Allahumma innaka ‘afuwwun tuhibbul ‘afwa fa‘fu ‘anni" -- a du’a taught by the Prophet for these nights.',
];

const DHUL_HIJJAH_TEN_REMINDERS = [
  'These are the best days of the year for good deeds -- increase in worship, charity, and dhikr.',
  'Say the Takbeer often: Allahu Akbar, Allahu Akbar, La ilaha illallah, Allahu Akbar, Allahu Akbar, wa lillahil hamd.',
  'If you intend to offer a sacrifice (udhiyah), avoid cutting your hair or nails until after it is offered.',
];

function pick(list, index) {
  return list[((index % list.length) + list.length) % list.length];
}

// Priority order: the more specific/rarer the occasion, the higher it
// ranks -- Day of Arafah and the Eids outrank the general Dhul-Hijjah
// or Ramadan reminder, which in turn outrank an ordinary Friday.
function computeOccasion({ month, day }) {
  if (month === 12 && day === 9) {
    return {
      key: 'ARAFAH',
      icon: '🕋',
      tabLabel: 'Day of Arafah',
      eyebrow: 'Day of Arafah',
      lines: [
        'Today is the Day of Arafah -- the most virtuous day of the year.',
        'Those not performing Hajj are encouraged to fast; it is reported to expiate the sins of the past and coming year.',
      ],
    };
  }

  if (month === 12 && day === 10) {
    return {
      key: 'EID_ADHA',
      icon: '🕌',
      tabLabel: 'Taqabbalallah',
      eyebrow: 'Eid al-Adha',
      lines: [
        'Taqabbalallahu minna wa minkum -- may Allah accept from us and you.',
        'Attend the Eid prayer, and if able, offer your sacrifice (udhiyah).',
      ],
    };
  }

  if (month === 12 && day >= 11 && day <= 13) {
    return {
      key: 'TASHREEQ',
      icon: '🕌',
      tabLabel: 'Days of Tashreeq',
      eyebrow: 'Days of Tashreeq',
      lines: [
        'These are the Days of Tashreeq -- days of eating, drinking, and remembering Allah.',
      ],
    };
  }

  if (month === 12 && day >= 1 && day <= 8) {
    return {
      key: 'DHUL_HIJJAH_TEN',
      icon: '🕋',
      tabLabel: 'The Blessed Ten Days',
      eyebrow: `Dhul-Hijjah · Day ${day} of 10`,
      lines: [pick(DHUL_HIJJAH_TEN_REMINDERS, day)],
    };
  }

  if (month === 10 && day >= 1 && day <= 3) {
    return {
      key: 'EID_FITR',
      icon: '🌙',
      tabLabel: 'Taqabbalallah',
      eyebrow: 'Eid al-Fitr',
      lines: [
        'Taqabbalallahu minna wa minkum -- may Allah accept our fasting and good deeds.',
        'Attend the Eid prayer and share in the joy with family and community.',
      ],
    };
  }

  if (month === 9) {
    const list = day <= 10 ? RAMADAN_FIRST_TEN : day <= 20 ? RAMADAN_MIDDLE_TEN : RAMADAN_LAST_TEN;
    return {
      key: 'RAMADAN',
      icon: '🌙',
      tabLabel: 'Ramadan Reminder',
      eyebrow: `Ramadan · Day ${day}`,
      lines: [pick(list, day)],
    };
  }

  return null;
}

export default function IslamicDateWidget() {
  const [open, setOpen] = useState(false);
  const [hijriDate, setHijriDate] = useState('');
  const [dayIndex, setDayIndex] = useState(null);
  const [occasion, setOccasion] = useState(null);
  const [dailyReminder, setDailyReminder] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setHijriDate(hijriLongDate(now));
      setDayIndex(now.getDay()); // 0 = Sunday ... 5 = Friday ... 6 = Saturday

      const parts = hijriParts(now);
      setOccasion(parts ? computeOccasion(parts) : null);
      setDailyReminder(pick(DAILY_REMINDERS, dayOfYear(now)));
    };

    update();
    // A date/occasion widget only needs to refresh around midnight,
    // not every second like the header's live clock -- a minute is
    // more than often enough and far cheaper.
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, []);

  if (dayIndex === null) return null;

  const isFriday = dayIndex === 5 && !occasion;
  const daysUntilFriday = (5 - dayIndex + 7) % 7;
  const isSpecial = Boolean(occasion) || isFriday;

  const tabIcon = occasion ? occasion.icon : isFriday ? '🕌' : '🌙';
  const tabLabel = occasion ? occasion.tabLabel : isFriday ? "Jumu'ah" : 'Islamic Reminder';
  const eyebrow = occasion ? occasion.eyebrow : isFriday ? "Jumu'ah" : 'Today';

  return (
    <div style={wrap}>
      {open && (
        <div style={card} role="dialog" aria-label="Islamic date and reminder">
          <div style={cardHeader}>
            <span style={cardEyebrow}>{eyebrow}</span>
            <button type="button" onClick={() => setOpen(false)} style={closeBtn} aria-label="Close">
              {'✕'}
            </button>
          </div>

          <div style={hijriRow}>
            <span style={{ fontSize: '20px' }}>{'🌙'}</span>
            <strong style={{ fontSize: '14px' }}>{hijriDate || 'Hijri date unavailable'}</strong>
          </div>

          {occasion ? (
            <ul style={reminderList}>
              {occasion.lines.map((line, i) => (
                <li key={i} style={reminderItem}>{line}</li>
              ))}
            </ul>
          ) : isFriday ? (
            <ul style={reminderList}>
              {JUMUAH_REMINDERS.map((line, i) => (
                <li key={i} style={reminderItem}>{line}</li>
              ))}
            </ul>
          ) : (
            <>
              {dailyReminder && <p style={dailyReminderText}>{dailyReminder}</p>}
              <p style={countdownText}>
                {daysUntilFriday === 1
                  ? "Jumu'ah is tomorrow."
                  : `${daysUntilFriday} days until Jumu'ah.`}
              </p>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={isSpecial ? tabBtnSpecial : tabBtn}
        aria-expanded={open}
      >
        <span style={{ fontSize: '18px' }}>{tabIcon}</span>
        {!open && <span>{tabLabel}</span>}
      </button>
    </div>
  );
}

const wrap = {
  position: 'fixed',
  bottom: '22px',
  insetInlineStart: '22px',
  zIndex: 950,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '10px',
  fontFamily: 'var(--font-body)',
};

const tabBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '9px',
  padding: '12px 19px',
  borderRadius: '999px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--brand)',
  fontWeight: 700,
  fontSize: '14.5px',
  cursor: 'pointer',
  boxShadow: '0 10px 26px rgba(15,23,42,.14)',
};

const tabBtnSpecial = {
  ...tabBtn,
  background: 'linear-gradient(135deg,var(--brand-deepest),var(--brand))',
  color: 'var(--on-accent)',
  borderColor: 'var(--brand)',
};

const card = {
  width: '278px',
  maxWidth: 'calc(100vw - 44px)',
  padding: '18px',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  boxShadow: '0 20px 50px rgba(15,23,42,.20)',
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
};

const cardEyebrow = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  color: 'var(--gold-dark, var(--gold))',
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-soft)',
  fontSize: '13px',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '2px',
};

const hijriRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--ink)',
  marginBottom: '10px',
};

const dailyReminderText = {
  margin: '0 0 8px',
  fontSize: '12.5px',
  color: 'var(--ink)',
  lineHeight: 1.5,
};

const countdownText = {
  margin: 0,
  fontSize: '13px',
  color: 'var(--ink-soft)',
  lineHeight: 1.5,
};

const reminderList = {
  margin: 0,
  paddingInlineStart: '18px',
  fontSize: '12.5px',
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const reminderItem = {
  paddingInlineStart: '2px',
};
