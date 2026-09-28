import { prisma } from '@/lib/prisma';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SectionBannerProvider } from '@/components/SectionBannerProvider';

/*
 * Shared layout for the whole Library area (/library and
 * /library/[slug]) — written/reference content, separate from Media.
 * Uses the same shared SiteHeader as the rest of the public site
 * (sectionMode="library"), matching app/bookstore/page.jsx's
 * pattern -- previously a separate LibraryNav component with its
 * own hardcoded "ع" placeholder that never picked up the real
 * uploaded logo. SiteHeader checks auth itself client-side, so
 * this layout no longer needs to resolve the session server-side.
 */
async function getLibraryBanner() {
  try {
    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'library' } });
    return banner?.imageUrl || '';
  } catch (error) {
    console.error('Library layout banner lookup failed:', error);
    return '';
  }
}

export default async function LibraryLayout({ children }) {
  const bannerUrl = await getLibraryBanner();

  return (
    <SectionBannerProvider bannerUrl={bannerUrl}>
      <SiteHeader sectionMode="library" />
      {children}
      <SiteFooter />
    </SectionBannerProvider>
  );
}
