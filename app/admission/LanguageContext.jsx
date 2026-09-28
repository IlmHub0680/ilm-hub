'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translate } from './i18n';

const STORAGE_KEY = 'ilm_admission_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [ready, setReady] = useState(false);

  // Load the applicant's saved choice once on mount, then persist every
  // change — this is what makes the language stick as they move between
  // /admission and /admission/track, and across a reload mid-application.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        setLang(stored);
      }
    } catch (error) {
      // localStorage unavailable — default to English for this visit.
    } finally {
      setReady(true);
    }
  }, []);

  const changeLang = useCallback((next) => {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      // Non-fatal — the choice just won't persist across reloads.
    }
  }, []);

  const t = useCallback((text) => translate(lang, text), [lang]);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, dir, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return ctx;
}
