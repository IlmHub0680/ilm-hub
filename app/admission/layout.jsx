import { LanguageProvider } from './LanguageContext';
import AdmissionChrome from './AdmissionChrome';

export default function AdmissionLayout({ children }) {
  return (
    <LanguageProvider>
      <AdmissionChrome>{children}</AdmissionChrome>
    </LanguageProvider>
  );
}
