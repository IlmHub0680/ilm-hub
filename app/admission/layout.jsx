import { LanguageProvider } from './LanguageContext';
import AdmissionChrome from './AdmissionChrome';

export const metadata = {
  title: 'Admission Application | Ulul Azm Institute',
  description:
    'Apply for admission to Ulul Azm Institute, track your application, and review admission requirements.',
};

export default function AdmissionLayout({ children }) {
  return (
    <LanguageProvider>
      <AdmissionChrome>{children}</AdmissionChrome>
    </LanguageProvider>
  );
}
