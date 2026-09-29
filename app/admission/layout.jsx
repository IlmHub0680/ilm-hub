import { prisma } from '@/lib/prisma';
import { LanguageProvider } from './LanguageContext';
import { SectionBannerProvider } from '@/components/SectionBannerProvider';
import AdmissionChrome from './AdmissionChrome';

export const metadata = {
  title: 'Admission Application | Ulul Azm Institute',
  description:
    'Apply for admission to Ulul Azm Institute, track your application, and review admission requirements.',
};

// Fetches the Admission section's banner image server-side, same
// pattern as app/bookstore/layout.jsx / app/media/layout.jsx /
// app/library/layout.jsx -- the page never shows a flash of "no
// banner" before a client fetch resolves, because the image is
// already in the very first HTML response.
async function getAdmissionBanner() {
  try {
    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'admission' } });
    return banner?.imageUrl || '';
  } catch (error) {
    console.error('Admission layout banner lookup failed:', error);
    return '';
  }
}

export default async function AdmissionLayout({ children }) {
  const bannerUrl = await getAdmissionBanner();

  return (
    <LanguageProvider>
      <SectionBannerProvider bannerUrl={bannerUrl}>
        <AdmissionChrome>{children}</AdmissionChrome>
      </SectionBannerProvider>
    </LanguageProvider>
  );
}
