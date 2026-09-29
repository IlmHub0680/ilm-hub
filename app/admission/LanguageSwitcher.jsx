'use client';

import { useLanguage } from './LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

// A clearly visible language picker, fixed to the top-right (or
// top-left in RTL) of every page under /admission so it is reachable
// from anywhere in the application flow, not just the first screen.
// Shares the same globe-icon dropdown as the rest of the site
// (components/LanguageSelector) -- only English and Arabic are wired
// to this flow's own LanguageContext (its actual translated content),
// French and Hausa show as "Coming soon" the same as everywhere else.
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
      <LanguageSelector lang={lang} onChange={setLang} dir={dir} />
    </div>
  );
}
