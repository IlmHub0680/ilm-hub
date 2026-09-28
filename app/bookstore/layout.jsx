import { prisma } from '@/lib/prisma';
import { SectionBannerProvider } from '@/components/SectionBannerProvider';

/*
 * Server-side wrapper for the whole Bookstore area (/bookstore and
 * /bookstore/[id]) -- fetches the section's banner image once, on the
 * server, and hands it down via SectionBannerProvider so the page never
 * shows its plain gradient background for a moment before a client
 * fetch resolves (see components/SectionBannerProvider.jsx). Matches
 * the same fix already applied to the site logo/hero image via
 * SiteBrandingProvider in the root layout.
 */
async function getBookstoreBanner() {
  try {
    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'bookstore' } });
    return banner?.imageUrl || '';
  } catch (error) {
    console.error('Bookstore layout banner lookup failed:', error);
    return '';
  }
}

export default async function BookstoreLayout({ children }) {
  const bannerUrl = await getBookstoreBanner();

  return <SectionBannerProvider bannerUrl={bannerUrl}>{children}</SectionBannerProvider>;
}
