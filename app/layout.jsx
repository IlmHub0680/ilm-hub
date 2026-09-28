import './globals.css'
import AssistantWidget from '@/components/AssistantWidget'
import { SiteBrandingProvider } from '@/components/SiteBrandingProvider'
import { SiteAuthProvider } from '@/components/SiteAuthProvider'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getHeaderDestination } from '@/lib/permissions'

const SITE_TITLE = 'Ulul Azm Institute - Islamic Educational Platform';
const SITE_DESCRIPTION = 'Access Islamic knowledge, books, courses, and lectures';

// Fetched once, server-side, on every request -- this is what lets
// SiteBrandingProvider hand the logo and hero banner image to
// SiteHeader/SiteFooter/the homepage already resolved, instead of each
// of them fetching it client-side and showing nothing until it
// resolves. Never throws: the site must render its default branding
// rather than break if this lookup fails for any reason.
async function getBranding() {
  try {
    const hero = await prisma.homepageHero.findUnique({
      where: { id: 'default-homepage-hero' },
      select: { logoUrl: true, heroImageUrl: true, logoSize: true },
    });

    return {
      logoUrl: hero?.logoUrl || '',
      heroImageUrl: hero?.heroImageUrl || '',
      logoSize: hero?.logoSize || 100,
    };
  } catch (error) {
    console.error('Root layout branding lookup failed:', error);
    return { logoUrl: '', heroImageUrl: '', logoSize: 100 };
  }
}

// A plain `metadata` export again (not generateMetadata()) -- the
// app/icon.js removal below is what actually fixed the "Duplicate
// export 'GET'" crash; the dynamic favicon (icons.icon pointed at the
// DB-backed logoUrl) turned out to be a second, separable change and
// is reverted here while that's isolated from a reported "images
// missing site-wide" regression. Next's App Router used to
// auto-generate a GET handler for `app/icon.js` and collided with
// this project's own hand-written one there -- that file is deleted
// (see the removed app/icon.js), which alone resolves the crash. The
// site simply has no favicon again for now, same as before app/icon.js
// was ever added -- never a build-breaking state.
export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
}

export default async function RootLayout({ children }) {
  // Same server-side session read app/dashboard/page.jsx already
  // does -- run alongside the branding lookup so seeding auth state
  // adds no extra sequential wait. Never throws: getCurrentUser()
  // itself already returns null rather than throwing when there is
  // no session.
  const [{ logoUrl, heroImageUrl, logoSize }, user] = await Promise.all([
    getBranding(),
    getCurrentUser().catch(() => null),
  ]);

  // Resolved here (server-side, alongside the session read above) so
  // SiteHeader's Dashboard/Student Portal link is correct on first
  // paint too -- no client round trip, same reasoning as
  // SiteAuthProvider's own comment below. Every account type shares
  // one public header, so this is what makes that one link land a
  // student on their portal and a bookstore customer on their account
  // page instead of both going to the same place.
  const destination = user
    ? await getHeaderDestination(user.id).catch((error) => {
        // Was previously a silent .catch(() => null): any thrown error
        // here (Prisma hiccup, etc.) fell straight through to
        // SiteHeader's fallback, which is the BOOKSTORE account page --
        // so a real student could silently land on /account/dashboard
        // instead of /login with zero trace of why. Logging first means
        // the next time this fires, the actual cause is in the server
        // console instead of just another confusing bug report.
        console.error(
          `getHeaderDestination failed for user ${user.id}:`,
          error
        );
        return null;
      })
    : null;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteBrandingProvider logoUrl={logoUrl} heroImageUrl={heroImageUrl} logoSize={logoSize}>
          <SiteAuthProvider user={user} destination={destination}>
            {children}
            {/* Must stay INSIDE both providers -- AssistantWidget reads
                useSiteBranding() (for the institute's real logo on its
                toggle button) and useSiteAuth() indirectly via its own
                /api/auth/me check. It was previously a sibling of
                SiteBrandingProvider, outside its subtree, so
                useSiteBranding() always saw that context's default
                value (logoUrl: '') no matter what was actually
                uploaded -- context only flows to descendants, never to
                siblings. */}
            <AssistantWidget />
          </SiteAuthProvider>
        </SiteBrandingProvider>
      </body>
    </html>
  )
}
