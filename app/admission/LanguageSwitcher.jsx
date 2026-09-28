'use client';

import { useLanguage } from './LanguageContext';

// A clearly visible English/Arabic toggle, fixed to the top-right (or
// top-left in RTL) of every page under /admission so it is reachable
// from anywhere in the application flow, not just the first screen.
export default function LanguageSwitcher() {
  const { lang, setLang, dir } = useLanguage();

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        justifyContent: dir === 'rtl' ? 'flex-start' : 'flex-end',
        padding: '14px 20px 0',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="group"
        aria-label="Language selector"
        style={{
          display: 'inline-flex',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '4px',
          gap: '2px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
          style={{
            padding: '7px 16px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            background: lang === 'en' ? 'var(--brand)' : 'transparent',
            color: lang === 'en' ? 'var(--on-accent)' : 'var(--ink-soft)',
          }}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang('ar')}
          aria-pressed={lang === 'ar'}
          style={{
            padding: '7px 16px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-arabic-display), var(--font-arabic)',
            background: lang === 'ar' ? 'var(--brand)' : 'transparent',
            color: lang === 'ar' ? 'var(--on-accent)' : 'var(--ink-soft)',
          }}
        >
          العربية
        </button>
      </div>
    </div>
  );
}
