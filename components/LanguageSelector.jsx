'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';

// Every real language this site is written in today, plus the two
// the Institute wants to offer next. English and Arabic are fully
// translated (every page's content genuinely exists in both); French
// and Hausa are listed and selectable-looking but marked "Coming
// soon" and disabled -- honest about what's actually translated
// right now rather than silently falling back to English text under
// a French or Hausa label.
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'fr', label: 'French', native: 'Français', comingSoon: true },
  { code: 'ha', label: 'Hausa', native: 'Hausa', comingSoon: true },
];

// A single globe icon that opens a dropdown of languages to pick
// from, replacing a plain "EN | العربية" two-button toggle everywhere
// it appeared on the site. `lang`/`onChange` are controlled by
// whichever language context/state owns this instance (the homepage's
// own HomeLanguageContext, the admission flow's separate
// LanguageContext, or AssistantWidget's own local state) -- this
// component only renders the picker UI, it holds no language state
// of its own.
export default function LanguageSelector({ lang, onChange, dir = 'ltr', theme = 'light', align = 'end' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const current = LANGUAGE_OPTIONS.find((option) => option.code === lang) || LANGUAGE_OPTIONS[0];

  return (
    <div ref={rootRef} style={wrap}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change language (currently ${current.label})`}
        style={theme === 'dark' ? triggerDark : triggerLight}
      >
        <Globe size={theme === 'dark' ? 15 : 17} strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose a language"
          style={{ ...menu, ...(align === 'start' ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' }) }}
          dir={dir}
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.code === lang;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={option.comingSoon}
                onClick={() => {
                  if (option.comingSoon) return;
                  onChange(option.code);
                  setOpen(false);
                }}
                style={{
                  ...menuItem,
                  ...(isActive ? menuItemActive : null),
                  ...(option.comingSoon ? menuItemDisabled : null),
                }}
              >
                <span>{option.native}</span>
                {option.comingSoon ? (
                  <span style={comingSoonBadge}>Coming soon</span>
                ) : (
                  isActive && <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const wrap = {
  position: 'relative',
  display: 'inline-block',
};

const triggerLight = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--brand)',
  cursor: 'pointer',
};

const triggerDark = {
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'transparent',
  color: 'var(--on-accent)',
  cursor: 'pointer',
};

const menu = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  minWidth: '170px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(15,23,42,.14)',
  padding: '6px',
  zIndex: 60,
};

const menuItem = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  width: '100%',
  padding: '9px 10px',
  borderRadius: '8px',
  border: 'none',
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: '13.5px',
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
};

const menuItemActive = {
  background: 'var(--brand-tint)',
  color: 'var(--brand)',
  fontWeight: 800,
};

const menuItemDisabled = {
  color: 'var(--ink-soft)',
  cursor: 'default',
  opacity: 0.7,
};

const comingSoonBadge = {
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  background: 'var(--border-soft, var(--border))',
  padding: '2px 6px',
  borderRadius: '999px',
  whiteSpace: 'nowrap',
};
