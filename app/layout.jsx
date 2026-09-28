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

// app/icon.js was previously removed to fix a "Duplicate export
// 'GET'" crash (Next's App Router auto-generates its own GET handler
// for that reserved filename, which collided with a hand-written one
// here) -- the site has had no favicon since. A plain `metadata`
// export was used for a while instead of generateMetadata() to rule
// out a separate reported "images missing site-wide" regression,
// which later turned out to be an unrelated database-connection
// issue (see lib/prisma.js) -- now resolved, so it's safe to go back
// to generateMetadata() here for real Open Graph/Twitter Card tags
// (site had none at all: shared links showed a bare URL with no
// title, description or image). SITE_URL falls back to the
// production domain rather than throwing if NEXT_PUBLIC_APP_URL is
// ever unset, since broken social previews are much less disruptive
// than a site-wide crash.
const DEFAULT_SITE_URL = 'https://ulul-azm-institute-psi.vercel.app';

// process.env.NEXT_PUBLIC_APP_URL is operator-set in Vercel and has
// already been entered wrong twice in production (missing the
// https:// scheme, and pointing at a stale pre-"-psi" domain) --
// each time crashing every single page at build time with
// `TypeError: Invalid URL` from new URL() below, since that throws
// on anything that isn't a fully-qualified URL string. Validate it
// actually parses before trusting it, so a bad value in Vercel can
// never take the whole site down again -- it just silently falls
// back to the known-good default instead.
function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return DEFAULT_SITE_URL;
  try {
    // Reject bare hostnames like "example.vercel.app" -- new URL()
    // happily "parses" those as relative and throws later when used
    // as a base, so require an explicit http(s) scheme up front.
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('non-http(s) scheme');
    }
    return raw.replace(/\/+$/, '');
  } catch (error) {
    console.error(
      `NEXT_PUBLIC_APP_URL is set to an invalid URL ("${raw}") -- falling back to ${DEFAULT_SITE_URL}. Fix this in Vercel's Environment Variables.`,
      error
    );
    return DEFAULT_SITE_URL;
  }
}

const SITE_URL = resolveSiteUrl();

export async function generateMetadata() {
  const { heroImageUrl } = await getBranding();

  // Open Graph/Twitter images must be absolute URLs -- heroImageUrl
  // is already an absolute /api/assets/public/... URL once branding
  // is uploaded (see getBranding() above), but falls back to '' when
  // nothing has been uploaded yet, so build the absolute form only
  // when there's actually an image to point at.
  const ogImage = heroImageUrl
    ? (heroImageUrl.startsWith('http') ? heroImageUrl : `${SITE_URL}${heroImageUrl}`)
    : undefined;

  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: 'Ulul Azm Institute',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ogImage ? [ogImage] : undefined,
    },
  }
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
