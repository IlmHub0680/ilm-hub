'use client';

import { useLanguage } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// Applies the applicant's chosen language as real <html>-level RTL
// behavior (dir + lang attributes on the wrapping element, which the
// existing global [dir="rtl"] CSS rule already turns into the correct
// direction, text alignment and Arabic font) and keeps the language
// switcher visible across every page under /admission.
export default function AdmissionChrome({ children }) {
  const { dir, lang } = useLanguage();

  return (
    <div dir={dir} lang={lang}>
      <SiteHeader />
      <LanguageSwitcher />
      {children}
      <SiteFooter />
    </div>
  );
}
