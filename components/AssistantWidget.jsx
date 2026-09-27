'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { menuFor, MORE_OPTIONS_VALUE } from '@/lib/assistantKnowledge';
import { useSiteBranding } from '@/components/SiteBrandingProvider';
import { at } from '@/lib/assistantI18n';

// Which part of the site this pathname belongs to, for the assistant's
// context-aware menu and welcome message. This only shapes what the
// assistant *suggests* — every actual data lookup on the server is still
// scoped to the signed-in user regardless of what zone is reported here.
//
// Identity-card selection (Student / Employee / Visitor, below) can
// override this once the person picks one — but that override is a
// presentation choice only. It is never sent anywhere as an
// authorization claim, and the server never reads it as one either.
const STAFF_PATH_PREFIXES = [
  '/instructor-dashboard', '/coordinator-dashboard', '/dean-dashboard', '/hod-dashboard',
  '/advisor-dashboard', '/registry-dashboard', '/examinations-dashboard', '/finance-dashboard',
  '/ict-dashboard', '/qa-dashboard', '/student-affairs-dashboard', '/academic-records-dashboard',
  '/admin', '/staff-login', '/staff-payroll', '/author-portal', '/author',
];

function zoneForPath(pathname) {
  if (!pathname) return 'general';
  if (STAFF_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return 'employee';
  }
  if (pathname.startsWith('/academics') || pathname.startsWith('/login')) {
    return 'student';
  }
  // /account/bookstore and /account/media are each section's OWN
  // dashboard (see app/account/bookstore/page.jsx and
  // app/account/media/page.jsx -- split out from the old combined
  // /account/dashboard, which mixed both together on one page).
  // /account/dashboard itself is now just a thin router/chooser between
  // the two (see app/account/dashboard/page.jsx), so it isn't
  // confidently one zone or the other and falls through to 'general'
  // below, same as bare /account (the general sign-in form shared by
  // every non-student account type).
  if (pathname.startsWith('/bookstore') || pathname.startsWith('/checkout') || pathname.startsWith('/account/bookstore')) {
    return 'bookstore';
  }
  if (pathname.startsWith('/media') || pathname.startsWith('/account/media')) {
    return 'media';
  }
  if (pathname.startsWith('/library')) {
    return 'library';
  }
  return 'general';
}

const ZONE_WELCOME = {
  student: "Assalamu alaikum! I'm the Ulul Azm assistant. Ask me about admissions, fees, transcripts, requests, or your academic records.",
  employee: "Assalamu alaikum! I'm the Ulul Azm staff assistant. Ask me about your dashboard, courses, students, attendance, or academic tasks.",
  bookstore: "Assalamu alaikum! I'm the Ulul Azm Bookstore assistant. Ask me about books, authors, orders, or purchases.",
  media: "Assalamu alaikum! I'm the Ulul Azm Media assistant. Ask me about khutbahs, lectures, mutoon, or your subscription.",
  library: "Assalamu alaikum! I'm the Ulul Azm Library assistant. Ask me about articles, fatwas, research papers, or classical texts — the Library is always free, no subscription needed.",
  general: "Assalamu alaikum! I'm the Ulul Azm assistant. Ask me about admissions, fees, the bookstore, Media, the Library, or anything else about the institute.",
};

// The three identity cards, exactly as the brief specifies -- no more,
// no fewer. `zone` is which suggestion menu + welcome flavor a choice
// maps to; for Visitor it's the *current* page's zone when that's one
// of the public content sections (so a visitor already browsing the
// Library still gets Library suggestions), general otherwise.
const IDENTITY_CARDS = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'employee', label: 'Employee', icon: '💼' },
  { id: 'visitor', label: 'Visitor', icon: '🧭' },
];

const GREETING_TEXT = 'How may I help you today?';
const IDENTITY_PROMPT_TEXT = 'Welcome! You are:';
const ACK_TEXT = 'Welcome! You can pick one of the quick options below.';

export default function AssistantWidget() {
  const pathname = usePathname();
  const pathZone = useMemo(() => zoneForPath(pathname), [pathname]);
  // Same server-seeded branding context SiteHeader already uses (see
  // components/SiteBrandingProvider.jsx) -- the widget's own toggle
  // button shows the institute's real uploaded logo instead of a
  // generic chat-bubble emoji, and falls back to the emoji only if no
  // logo has been uploaded yet.
  const { logoUrl } = useSiteBranding();

  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.success) setAuthUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolves who we're talking to without asking, wherever that's
  // already knowable -- but a signed-in role is not the same thing as
  // which section of the site the visitor is actually standing in.
  // Bookstore, Media and Library are independent sections open to
  // anyone with (or without) any other account -- a real student
  // browsing the Bookstore is a bookstore visitor at that moment, not
  // "the student" (same distinction just fixed for the header's
  // account button in components/SiteHeader.jsx). So a signed-in
  // student/instructor/admin only auto-resolves to their own role zone
  // while they're actually in that role's territory (student ->
  // academics/general, staff -> a staff dashboard/admin); anywhere on
  // bookstore/media/library, EVERYONE -- signed in or not -- auto-
  // resolves to 'visitor' and gets that section's own zone via
  // effectiveZone below. Only a logged-out visitor on the homepage/
  // general area still needs to be asked. undefined = auth check still
  // in flight (wait); null = genuinely ask.
  const autoIdentity = useMemo(() => {
    if (!authChecked) return undefined;
    if (['bookstore', 'media', 'library'].includes(pathZone)) return 'visitor';
    if (authUser?.role === 'STUDENT') return 'student';
    if (
      authUser?.role === 'INSTRUCTOR' ||
      authUser?.role === 'ADMIN' ||
      authUser?.role === 'SUPER_ADMIN'
    ) {
      return 'employee';
    }
    return null;
  }, [authChecked, authUser, pathZone]);

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null); // null while loading
  const settingsLoadedRef = useRef(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(null);
  const [identity, setIdentity] = useState(null); // null | 'student' | 'employee' | 'visitor'
  const [awaitingFirstMessage, setAwaitingFirstMessage] = useState(true);
  const idleTimerRef = useRef(null);
  const [lang, setLang] = useState('en'); // 'en' | 'ar' — this widget's own switcher, independent of the rest of the site
  const scrollRef = useRef(null);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = (text) => at(lang, text);

  // Best-effort, fire-and-forget -- never lets an analytics hiccup
  // touch the actual conversation. Logs only structured event metadata,
  // never the visitor's typed text (see app/api/assistant/event/route.js).
  function logEvent(type, extra = {}) {
    try {
      fetch('/api/assistant/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...extra }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  // Effective zone: identity selection (a UX choice) takes over from the
  // page-derived zone once the person has picked one. Visitor keeps
  // whichever public-content zone they're already browsing, when there
  // is one, instead of flattening everything to "general".
  const effectiveZone = useMemo(() => {
    if (identity === 'student') return 'student';
    if (identity === 'employee') return 'employee';
    if (identity === 'visitor') {
      return ['bookstore', 'media', 'library'].includes(pathZone) ? pathZone : 'general';
    }
    return pathZone;
  }, [identity, pathZone]);
  const zoneRef = useRef(effectiveZone);
  zoneRef.current = effectiveZone;
  const identityRef = useRef(identity);
  identityRef.current = identity;

  // A fresh section deserves a fresh conversation: when the visitor
  // moves to a genuinely different part of the site (not just another
  // page within the same one), close the widget and drop the old
  // thread rather than carrying it along. Skipped on first mount --
  // only an actual zone change resets anything.
  const prevZoneRef = useRef(pathZone);
  useEffect(() => {
    if (prevZoneRef.current !== pathZone) {
      prevZoneRef.current = pathZone;
      setOpen(false);
      setMessages(null);
      setIdentity(null);
      setAwaitingFirstMessage(true);
    }
  }, [pathZone]);

  useEffect(() => {
    if (settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;

    fetch('/api/assistant/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success) setSettings(result.data);
      })
      .catch(() => {
        // A failed settings lookup falls back to the widget's own
        // built-in defaults below rather than hiding the assistant.
        setSettings({ isEnabled: true, welcomeMessageEn: '', welcomeMessageAr: '', supportedLanguages: ['en', 'ar'] });
      });
  }, []);

  // Remembered language preference only — never the conversation itself,
  // and never anything that could stand in for authentication.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('assistant-lang');
      if (saved === 'ar' || saved === 'en') setLang(saved);
    } catch {
      // localStorage can throw (private mode, blocked storage) — fine,
      // the widget just stays on the default language.
    }
  }, []);

  function changeLang(next) {
    logEvent('language_selected', { language: next });
    setLang(next);
    try {
      window.localStorage.setItem('assistant-lang', next);
    } catch {
      // best-effort only
    }
  }

  // Greeting only -- who's asking (the identity chooser) or what they
  // might want (the zone menu) is revealed only once the visitor says
  // something, or after a short idle wait (see the idle-nudge effect
  // below) -- never stacked onto the greeting itself. Seeded once,
  // the first time the widget is opened for this zone.
  useEffect(() => {
    if (messages === null && autoIdentity !== undefined) {
      const configuredGreeting = lang === 'ar' ? settings?.welcomeMessageAr : settings?.welcomeMessageEn;
      const firstName = authUser?.name ? authUser.name.split(' ')[0] : null;
      const greetingText = configuredGreeting
        ? configuredGreeting
        : firstName
        ? `${firstName}! ${GREETING_TEXT}`
        : GREETING_TEXT;

      setMessages([
        { role: 'assistant', text: greetingText, skipTranslate: Boolean(configuredGreeting || firstName) },
      ]);
      setIdentity(autoIdentity || null);
      setAwaitingFirstMessage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoIdentity]);

  // Reveals the identity chooser (if we still don't know who's asking)
  // or the current zone's welcome + quick-option menu (if we do) --
  // the one moment this widget offers its menu on its own, instead of
  // an answer stacking the menu on every single reply. Used both
  // right after the first message of a conversation and by the
  // idle-nudge timer below.
  function pushReveal(promptText) {
    setAwaitingFirstMessage(false);
    setMessages((m) => {
      if (identityRef.current === null) {
        return [
          ...(m || []),
          { role: 'assistant', kind: 'identity', text: promptText || IDENTITY_PROMPT_TEXT },
        ];
      }
      return [
        ...(m || []),
        {
          role: 'assistant',
          text: promptText ? `${promptText}\n\n${ACK_TEXT}` : ACK_TEXT,
          options: menuFor(zoneRef.current),
        },
      ];
    });
  }

  // Idle nudge: if the conversation sits quiet for 35s while the
  // widget is open, gently resurface "how may I help you" + the menu
  // -- the same reveal as above, just triggered by silence instead of
  // a message. Re-arms after firing, so a second long pause nudges
  // again.
  useEffect(() => {
    if (!open || messages === null) return undefined;

    const timer = setTimeout(() => {
      pushReveal(GREETING_TEXT);
    }, 35000);
    idleTimerRef.current = timer;

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function selectIdentity(id) {
    logEvent('identity_selected', { identity: id });
    setIdentity(id);
    setAwaitingFirstMessage(false);
    const zone = id === 'student' ? 'student' : id === 'employee' ? 'employee' : (['bookstore', 'media', 'library'].includes(pathZone) ? pathZone : 'general');
    setMessages((m) => [
      ...(m || []),
      {
        role: 'assistant',
        text: `${ZONE_WELCOME[zone] || ZONE_WELCOME.general}\n\n${ACK_TEXT}`,
        options: menuFor(zone),
      },
    ]);
  }

  function resetIdentity() {
    setIdentity(null);
    setMessages((m) => [...(m || []), { role: 'assistant', kind: 'identity', text: IDENTITY_PROMPT_TEXT }]);
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const isFirstMessage = awaitingFirstMessage;
    setAwaitingFirstMessage(false);

    setMessages((m) => [...(m || []), { role: 'user', text: trimmed }]);
    setSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, zone: zoneRef.current }),
      });
      const data = await res.json();
      // Every answered reply now carries its own small, CONTEXTUAL set
      // of follow-up chips from the server (see relatedFor() in
      // lib/assistantKnowledge.js) -- 2-3 topics related to what was
      // just asked, plus a trailing "More options" chip that explicitly
      // re-requests the full zone menu (data.showMenu === true is only
      // set for that full-menu case: a greeting, a courtesy "help" ask,
      // or "More options" itself). Neither ever renders before an
      // identity has been picked.
      const showOptions =
        identityRef.current !== null &&
        Array.isArray(data.options) &&
        data.options.length > 0;

      setMessages((m) => [
        ...(m || []),
        {
          role: 'assistant',
          text: data.reply || 'Sorry, something went wrong — please try again.',
          department: data.department,
          href: data.href || null,
          options: showOptions ? data.options : null,
        },
      ]);

      // The first thing the visitor ever says in this conversation
      // still earns the one spontaneous reveal (identity chooser, or
      // the zone menu) -- unless the server already attached options
      // to this exact reply.
      if (isFirstMessage && !showOptions) {
        pushReveal();
      }
    } catch {
      setMessages((m) => [
        ...(m || []),
        { role: 'assistant', text: "Sorry, I couldn't reach the server — please try again shortly." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = input;
    setInput('');
    sendMessage(text);
  }

  function handleOptionClick(option) {
    if (sending) return;
    logEvent('quick_option', { zone: effectiveZone, label: option.label });
    sendMessage(option.value);
  }

  const visibleMessages = messages || [];

  if (settings && settings.isEnabled === false) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '22px', insetInlineEnd: '22px', zIndex: 999 }}>
      {open && (
        <div
          dir={dir}
          style={{
            width: 'min(340px, calc(100vw - 44px))',
            height: 'min(500px, calc(100vh - 140px))',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-l)',
            boxShadow: 'var(--shadow-raised)',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '12px',
            overflow: 'hidden',
            fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-body)',
          }}
        >
          <div
            style={{
              background: 'var(--brand-dark)',
              color: 'var(--on-accent)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px' }}>
                {t('Ulul Azm Assistant')}
              </div>
              <div style={{ fontSize: '11.5px', opacity: 0.75 }}>{t('Institute guidance, instantly')}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language switcher -- visible at all times, switches the
                  whole widget without leaving the conversation. */}
              <div
                role="group"
                aria-label="Language / اللغة"
                style={{
                  display: 'flex',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                <button
                  type="button"
                  onClick={() => changeLang('en')}
                  aria-pressed={lang === 'en'}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    background: lang === 'en' ? 'var(--on-accent)' : 'transparent',
                    color: lang === 'en' ? 'var(--brand-dark)' : 'var(--on-accent)',
                  }}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => changeLang('ar')}
                  aria-pressed={lang === 'ar'}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    background: lang === 'ar' ? 'var(--on-accent)' : 'transparent',
                    color: lang === 'ar' ? 'var(--brand-dark)' : 'var(--on-accent)',
                    fontFamily: 'var(--font-arabic)',
                  }}
                >
                  ع
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('Close assistant')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '20px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'var(--paper)',
            }}
          >
            {visibleMessages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    background: m.role === 'user' ? 'var(--brand)' : 'var(--surface)',
                    color: m.role === 'user' ? 'var(--on-accent)' : 'var(--ink)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-m)',
                    padding: '9px 12px',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {m.skipTranslate ? m.text : t(m.text)}
                  {m.department && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--gold-dark)', fontWeight: 700 }}>
                      {t(m.department)}
                    </div>
                  )}
                </div>

                {m.href && (
                  <Link
                    href={m.href}
                    onClick={() => setOpen(false)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--gold)',
                      color: 'var(--on-accent)',
                      textDecoration: 'none',
                      borderRadius: '999px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {t('Go to')} {dir === 'rtl' ? '←' : '→'}
                  </Link>
                )}

                {/* Identity cards: Student / Employee / Visitor. Purely a
                    presentation choice -- selecting one only changes which
                    quick-option menu and greeting flavor are shown next;
                    it is never sent to the server as an identity claim,
                    and every actual data lookup still comes from the
                    signed-in session, exactly as before this existed. */}
                {m.kind === 'identity' && !identity && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {IDENTITY_CARDS.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => selectIdentity(card.id)}
                        style={{
                          flex: '1 1 90px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-m)',
                          padding: '14px 8px 10px',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                            background: 'linear-gradient(135deg, var(--gold) 0%, var(--brand) 100%)',
                            fontSize: '18px',
                          }}
                        >
                          {card.icon}
                        </span>
                        {t(card.label)}
                      </button>
                    ))}
                  </div>
                )}

                {Array.isArray(m.options) && m.options.length > 0 && (() => {
                  // "More options" is a distinct action (re-request the
                  // full zone menu -- see MORE_OPTIONS_VALUE in
                  // lib/assistantKnowledge.js), not another topic, so it
                  // renders as its own small text link below the grid
                  // rather than as one more tile inside it -- the
                  // conventional "see more" pattern, and visually
                  // unambiguous at a glance.
                  const topicOptions = m.options.filter((opt) => opt.value !== MORE_OPTIONS_VALUE);
                  const moreOption = m.options.find((opt) => opt.value === MORE_OPTIONS_VALUE);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {topicOptions.length > 0 && (
                        <>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>
                            {t('What would you like to do next?')}
                          </div>
                          {/* Square/grid layout: two columns of compact
                              tiles instead of one long vertical list, so
                              a full set of quick options is scannable at
                              a glance rather than requiring a scroll. */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                              gap: '7px',
                            }}
                          >
                            {topicOptions.map((opt, oi) => (
                              <button
                                key={oi}
                                type="button"
                                onClick={() => handleOptionClick(opt)}
                                disabled={sending}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  minHeight: '64px',
                                  background: 'var(--surface)',
                                  color: 'var(--ink)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius-m)',
                                  padding: '10px 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  lineHeight: 1.25,
                                  cursor: sending ? 'not-allowed' : 'pointer',
                                  opacity: sending ? 0.6 : 1,
                                }}
                              >
                                <span
                                  aria-hidden="true"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                                    background: 'linear-gradient(135deg, var(--gold) 0%, var(--brand) 100%)',
                                    color: 'var(--on-accent)',
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                  }}
                                >
                                  {oi + 1}
                                </span>
                                {t(opt.label)}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {moreOption && (
                        <button
                          type="button"
                          onClick={() => handleOptionClick(moreOption)}
                          disabled={sending}
                          style={{
                            alignSelf: topicOptions.length > 0 ? 'flex-start' : 'stretch',
                            background: 'none',
                            border: 'none',
                            color: 'var(--ink-soft)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: sending ? 'not-allowed' : 'pointer',
                            padding: topicOptions.length > 0 ? '4px 2px' : '8px 12px',
                            textAlign: topicOptions.length > 0 ? 'start' : 'center',
                            opacity: sending ? 0.6 : 1,
                          }}
                        >
                          {t(moreOption.label)} ⋯
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                {t('Thinking…')}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '6px 10px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <button
              type="button"
              onClick={resetIdentity}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink-soft)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              ↺ {t('Start over')}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid var(--border)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Ask a question…')}
              aria-label={t('Ask a question…')}
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-s)',
                padding: '9px 11px',
                fontSize: '13.5px',
                fontFamily: 'inherit',
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{
                background: 'var(--gold)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: 'var(--radius-s)',
                padding: '9px 14px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !input.trim() ? 0.6 : 1,
              }}
            >
              {t('Send')}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!open) logEvent('open', { zone: effectiveZone });
          setOpen((o) => !o);
        }}
        aria-label={open ? t('Close assistant') : t('Open institute assistant')}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--brand)',
          color: 'var(--on-accent)',
          border: 'none',
          boxShadow: 'var(--shadow-raised)',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {open ? (
          '×'
        ) : logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          '💬'
        )}
      </button>
    </div>
  );
}
