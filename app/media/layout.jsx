import { prisma } from '@/lib/prisma';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SectionBannerProvider } from '@/components/SectionBannerProvider';

/*
 * Shared layout for the whole Media area (/media and
 * /media/[slug]).
 *
 * Uses the same shared SiteHeader as the rest of the public site
 * (sectionMode="media"), matching app/bookstore/page.jsx's pattern
 * -- previously a separate MediaNav component with its own
 * hardcoded "ع" placeholder that never picked up the real uploaded
 * logo. SiteHeader checks auth itself client-side, so this layout
 * no longer needs to resolve the session server-side.
 */
async function getMediaBanner() {
  try {
    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'media' } });
    return banner?.imageUrl || '';
  } catch (error) {
    console.error('Media layout banner lookup failed:', error);
    return '';
  }
}

export default async function MediaLayout({ children }) {
  const bannerUrl = await getMediaBanner();

  return (
    <SectionBannerProvider bannerUrl={bannerUrl}>
      <SiteHeader sectionMode="media" />
      {children}
      <SiteFooter />
    </SectionBannerProvider>
  );
}
