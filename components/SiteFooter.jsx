'use client';

import { Children, useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone as PhoneIcon, Mail, GraduationCap } from 'lucide-react';
import { useSiteBranding } from '@/components/SiteBrandingProvider';

// Renders a comma-separated address as short label-style lines --
// e.g. "Ulul Azm Institute, [Street], Accra, Ghana" becomes:
//   Ulul Azm Institute,
//   [Street],
//   Accra, Ghana
// The last two segments (city, country) stay together on one line
// instead of each getting its own -- the previous version put every
// comma-separated segment on its own line, which split "Accra,
// Ghana" across two lines.
function renderAddressLines(address, poBox) {
  const parts = (address || '').split(',').map((p) => p.trim()).filter(Boolean);
  const poBoxText = (poBox || '').trim();

  if (parts.length === 0) {
    return poBoxText ? <div>{poBoxText}</div> : null;
  }

  if (parts.length <= 2) {
    const single = parts.join(', ');
    if (!poBoxText) return <div>{single}</div>;
    return (
      <>
        <div>{single}</div>
        <div>{poBoxText}</div>
      </>
    );
  }

  const name = parts[0];
  const lastLine = parts.slice(-2).join(', ');
  const middleParts = parts.slice(1, -2);
  if (poBoxText) middleParts.push(poBoxText);
  const middleLine = middleParts.length ? middleParts.join(', ') : null;

  return (
    <>
      <div>{name},</div>
      {middleLine && <div>{middleLine}</div>}
      <div>{lastLine}</div>
    </>
  );
}

/*
 * Shared public site footer -- single source of truth (Model 14).
 * Previously this markup lived only inside app/page.jsx (the homepage);
 * every other public page had no footer at all, and app/bookstore/page.jsx
 * had its own separate, book-specific one (left as-is -- it links back
 * to Home/Media/Library/Admission/Academy and is genuinely bookstore
 * content, not duplicated here).
 *
 * Footer navigation columns, social links and the "About" copy remain
 * CMS-managed via /admin/homepage (same /api/homepage-content endpoint
 * the homepage always used). The contact strip now reads the same real
 * ContactInfo data /contact already uses (via /api/legal-content),
 * replacing the hardcoded "[Accra-Ghana]" placeholder that was here
 * before.
 */

const DEFAULT_SOCIAL_LINKS = [
  { name: 'Facebook', icon: 'f', url: 'https://www.facebook.com/' },
  { name: 'YouTube', icon: '▶', url: 'https://www.youtube.com/' },
  { name: 'X', icon: '𝕏', url: 'https://x.com/' },
  { name: 'Telegram', icon: '✈', url: 'https://t.me/' },
];

// Only Academy and Institute now -- the old "Academic Governance"
// group exposed 12 raw internal planning/spec documents as if they
// were routine public reading. Those documents were written to
// brief the real build, not to stay published as a public sitemap,
// and the systems they describe already exist in their own
// dashboards. The two genuinely public ones -- Academy Foundation
// (institutional identity) and Academy Pathways (the real
// qualification framework) -- move into Academy below.
const DEFAULT_FOOTER_LINK_GROUPS = [
  {
    title: 'Academy',
    links: [
      { label: 'Academic Programmes', href: '/programs' },
      { label: 'Academic Departments', href: '/departments' },
      { label: 'Faculty', href: '/faculty' },
      { label: 'Academic Calendar', href: '/academic-calendar' },
      { label: 'Academy Foundation', href: '/academy-foundation' },
      { label: 'Academy Pathways', href: '/academy-pathways' },
      { label: 'Admission & Registration', href: '/admission' },
      { label: 'Student & Staff Portal Login', href: '/login' },
      { label: 'Events & News', href: '/updates' },
    ],
  },
  {
    title: 'Institute',
    links: [
      { label: 'About Ulul Azm', href: '/about' },
      { label: 'Alumni', href: '/alumni' },
      { label: 'Verify a Document', href: '/verify' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Academic Policies', href: '/academic-policies' },
      { label: 'Student Resources', href: '/student-resources' },
    ],
  },
];

// address is a placeholder ('[Street / Building Name]') until the
// real one is entered at /admin/legal-pages/contact -- shows the
// requested Address / Ulul Azm Institute, / [Street], / Accra,
// Ghana layout immediately rather than hiding the block entirely.
const CONTACT_DEFAULTS = {
  address: 'Ulul Azm Institute, [Street / Building Name], Accra, Ghana',
  poBox: null,
  phone: null,
  email: 'info@ululazm.org',
  admissionsEmail: 'admissions@ululazm.org',
};

const DEFAULT_CTA_BANNER = {
  arabicLine: 'BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE',
  title: 'Begin Your Journey of Knowledge',
  description: 'Explore academic programmes, educational resources, media library, and admissions opportunities.',
};

// Same clamp the server enforces on save (see
// app/api/admin/homepage/hero/route.js LOGO_SIZE_PRESETS), applied
// again here so a stale/unexpected value can never render a logo
// bigger or smaller than the footer is designed for.
function clampLogoSize(size) {
  const n = Number(size) || 100;
  return Math.min(160, Math.max(70, n));
}

export default function SiteFooter() {
  const { logoUrl, logoSize } = useSiteBranding();
  const logoScale = clampLogoSize(logoSize) / 100;
  const dynamicFooterLogoImg = {
    ...footerLogoImg,
    height: Math.round(46 * logoScale) + 'px',
    maxWidth: Math.round(130 * logoScale) + 'px',
  };
  const dynamicFooterLogo = {
    ...footerLogo,
    width: Math.round(46 * logoScale) + 'px',
    height: Math.round(46 * logoScale) + 'px',
  };
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);
  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);
  const [contact, setContact] = useState(CONTACT_DEFAULTS);
  const [footerModal, setFooterModal] = useState(null);
  // The "Begin Your Journey of Knowledge" banner -- previously its
  // own standalone section between page content and the footer on
  // the homepage (and only the homepage). It's now the footer's own
  // masthead strip, so every page that renders SiteFooter carries it
  // consistently, sourced from the same CMS content
  // (/admin/homepage/sections) as before -- nothing new to edit.
  const [ctaBanner, setCtaBanner] = useState(DEFAULT_CTA_BANNER);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/homepage-content')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled || !result?.data) return;
        if (Array.isArray(result.data.socialLinks) && result.data.socialLinks.length > 0) {
          setSocialLinks(result.data.socialLinks);
        }
        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {
          setFooterLinkGroups(result.data.footerLinkGroups);
        }
        if (result.data.ctaBanner) setCtaBanner(result.data.ctaBanner);
      })
      .catch(() => {});

    fetch('/api/legal-content')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        const data = result?.data?.contact;
        if (data) setContact({ ...CONTACT_DEFAULTS, ...data });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const footerContent = {
    resources: {
      title: 'Student Resources',
      content: (
        <>
          <p>
            Ulul Azm provides resources designed to help students remain organized, consistent and purposeful in
            their pursuit of knowledge.
          </p>

          <div style={resourceGridStyle}>
            <ResourceCard
              icon="📚"
              title="Course Materials"
              text="Access recommended texts, course information and learning materials through your programme."
            />
            <ResourceCard
              icon="📖"
              title="Digital Library"
              text="Explore books and educational publications available through the Ulul Azm Bookstore."
              link="/bookstore"
            />
            <ResourceCard
              icon="🎓"
              title="Student Guidance"
              text="Develop a regular study routine, attend lessons consistently and maintain good academic discipline."
            />
            <ResourceCard
              icon="📚"
              title="Academic Support"
              text="Contact the institute for questions relating to programmes, admissions or academic matters."
              link="/contact"
            />
          </div>
        </>
      ),
    },
  };

  // 2026-09: the footer grid's column count must match how many
  // columns actually render (About + each CMS-managed footer link
  // group + Resources + Technical Support + Address (conditional on
  // contact.address) + Follow Us) -- a value hardcoded for exactly
  // two link groups silently strands "Follow Us" alone on its own row
  // the moment the database carries more (or fewer) footer link
  // groups than the Academy/Institute defaults, which is exactly what
  // a leftover or not-yet-migrated group in the live database can
  // cause. Computed at render instead of hardcoded so it always
  // matches reality.
  //
  // Mobile App no longer contributes its own column (2026-09) -- its
  // content now renders stacked below Technical Support's links,
  // inside that same column (see the Technical Support JSX below), so
  // it's intentionally left out of this count.
  const footerColumnCount =
    1 /* About */ +
    footerLinkGroups.length +
    1 /* Resources */ +
    1 /* Technical Support (includes Mobile App content) */ +
    (contact.address ? 1 : 0) /* Address */ +
    1; /* Follow Us */
  // Every column an equal 1fr share left Address (three address lines
  // plus three stacked Phone/Email/Academic Enquiries rows) crowded
  // against Follow Us. Address now gets a noticeably wider track and
  // Follow Us -- specifically, not every other column -- gives up
  // some of its own share to make room, so Address's track visibly
  // starts and ends further along the row instead of Follow Us simply
  // being squeezed by an across-the-board size bump.
  //
  // 2026-09: Mobile App merging into Technical Support (see its JSX
  // below) drops the grid from 7 non-About columns to 6, so Follow Us
  // is no longer competing with as many neighbors for width. Its
  // track widened from 0.75fr to 0.9fr to match, but that still
  // wrapped the single-sentence blurb into 8 cramped lines -- 0.9fr
  // was still narrower than a plain 1fr link-list column even though
  // the blurb is prose, not short link labels. Widened again to
  // 1.2fr (now the second-widest track after Address) so the
  // sentence wraps to roughly 4 lines instead of 8.
  const nonAboutColumnCount = footerColumnCount - 1;
  const addressTrackIndex = contact.address
    ? footerLinkGroups.length + 1 /* Resources */ + 1 /* Technical Support (includes Mobile App content) */
    : -1;
  const followUsTrackIndex = nonAboutColumnCount - 1; // Follow Us always renders last
  const nonAboutTracks = Array.from({ length: nonAboutColumnCount }, (_, i) => {
    if (i === addressTrackIndex) return 'minmax(170px,1.8fr)';
    if (i === followUsTrackIndex) return 'minmax(85px,1.2fr)';
    return 'minmax(100px,1fr)';
  });
  const dynamicFooterGrid = {
    ...footerGrid,
    gridTemplateColumns: `minmax(170px,1.1fr) ${nonAboutTracks.join(' ')}`,
  };

  return (
    <>
      <footer style={footerStyle}>
        {/* The Bismillah / "Begin Your Journey of Knowledge" masthead
            banner that used to render here (on every page, not just
            the homepage) has been removed at the user's request -- it
            duplicated the homepage's own hero messaging and made the
            footer occupy too much of the page. ctaBanner state and its
            CMS source (/admin/homepage/sections, /api/homepage-content)
            are left in place untouched in case they're wanted again or
            reused elsewhere; only the render here was removed. */}

        <div style={footerInner}>
          <div className="footer-grid" style={dynamicFooterGrid}>
            {/* ABOUT */}
            <div>
              <div style={footerBrand}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Ulul Azm Institute" style={dynamicFooterLogoImg} />
                ) : (
                  <div style={dynamicFooterLogo}>ع</div>
                )}
                <div>
                  <div style={footerBrandName}>Ulul Azm Institute</div>
                  <div style={footerBrandTagline}>A DIGITAL HOME FOR ISLAMIC KNOWLEDGE</div>
                </div>
              </div>

              <p style={footerText}>
                An institute dedicated to beneficial Islamic knowledge, structured learning, scholarly study and the
                development of students who combine knowledge with sound character.
              </p>

              <p style={footerArabic}>وَقُلْ رَبِّ زِدْنِي عِلْمًا</p>

              <p style={footerQuote}>&ldquo;And say: My Lord, increase me in knowledge.&rdquo;</p>

              <div style={footerPrinciple}>
                <strong style={footerPrincipleTitle}>Our guiding principle</strong>
                <p style={footerPrincipleText}>
                  Knowledge is a trust. We seek to learn it sincerely, understand it responsibly, and share it
                  beneficially.
                </p>
              </div>
            </div>

            {/* CMS-MANAGED FOOTER LINK COLUMNS (edited at /admin/homepage/footer-links) */}
            {footerLinkGroups.map((group) => (
              <FooterColumn key={group.title} title={group.title}>
                {group.links.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </FooterColumn>
            ))}

            {/* RESOURCES */}
            <FooterColumn title="Resources">
              <FooterButton onClick={() => setFooterModal('resources')}>Student Resources</FooterButton>
              <FooterLink href="/bookstore">Bookstore</FooterLink>
              <FooterLink href="/media">Media</FooterLink>
              <FooterLink href="/library">Library</FooterLink>
              <FooterLink href="/donate">Donate</FooterLink>
              <FooterLink href="/faq">Frequently Asked Questions</FooterLink>
            </FooterColumn>

            {/* TECHNICAL SUPPORT -- things a user may need but not on
                every visit, so it belongs here rather than the top nav.
                Mobile App content (below) now sits stacked underneath
                these links, inside this same column, instead of being
                its own standalone grid column (2026-09) -- see
                mobileAppSection for the seam between the two. */}
            <FooterColumn title="Technical Support">
              <FooterLink href="/contact">Contact Support</FooterLink>
              <FooterLink href="/it-support">Help &amp; FAQ</FooterLink>
              <FooterLink href="/it-department">IT Department</FooterLink>
              <FooterLink href="/safe-usage-policy">Safe Usage Policy</FooterLink>

              {/* MOBILE APP -- moved here from its own standalone column
                  (2026-09) so it no longer takes an extra grid track;
                  it now reads as a sub-section of Technical Support. No
                  app exists yet, so these are honestly-labeled
                  placeholders (structure ready for real store links once
                  an app ships), not live links to a listing that doesn't
                  exist. */}
              <div style={mobileAppSection}>
                <h3 style={footerHeading}>Mobile App</h3>
                <p style={footerTextSmall}>Coming soon for iOS and Android.</p>
                <div style={appBadgeStack}>
                  <span style={appBadge} aria-disabled="true">
                    <span style={appBadgeIcon}>{'📱'}</span>
                    <span>
                      <span style={appBadgeEyebrow}>Coming soon on the</span>
                      <span style={appBadgeName}>App Store</span>
                    </span>
                  </span>
                  <span style={appBadge} aria-disabled="true">
                    <span style={appBadgeIcon}>{'▶'}</span>
                    <span>
                      <span style={appBadgeEyebrow}>Coming soon on</span>
                      <span style={appBadgeName}>Google Play</span>
                    </span>
                  </span>
                </div>
              </div>
            </FooterColumn>

            {/* ADDRESS -- moved into the grid next to Follow Us
                (2026-09). Phone, email and admissions email render
                directly under the address lines here too (2026-09) --
                one complete Address block, not split between this
                column and a separate strip elsewhere in the footer. */}
            {contact.address && (
              <div>
                <h3 style={footerHeading}>Address</h3>
                <div style={footerContactItemAddress}>
                  <MapPin size={14} strokeWidth={2.2} style={{ ...footerContactIcon, marginTop: '2px' }} />
                  <div style={footerContactValue}>{renderAddressLines(contact.address, contact.poBox)}</div>
                </div>

                <div style={footerAddressContactList}>
                  {contact.phone && (
                    <div style={footerContactItem}>
                      <div style={footerContactItemHead}>
                        <PhoneIcon size={14} strokeWidth={2.2} style={footerContactIcon} />
                        <span style={footerContactLabel}>Phone</span>
                      </div>
                      <span style={footerContactValueStacked}>{contact.phone}</span>
                    </div>
                  )}

                  {contact.email && (
                    <div style={footerContactItem}>
                      <div style={footerContactItemHead}>
                        <Mail size={14} strokeWidth={2.2} style={footerContactIcon} />
                        <span style={footerContactLabel}>Email</span>
                      </div>
                      <span style={footerContactValueStacked}>{contact.email}</span>
                    </div>
                  )}

                  {contact.admissionsEmail && (
                    <div style={footerContactItem}>
                      <div style={footerContactItemHead}>
                        <GraduationCap size={14} strokeWidth={2.2} style={footerContactIcon} />
                        <span style={footerContactLabel}>Academic Enquiries</span>
                      </div>
                      <span style={footerContactValueStacked}>{contact.admissionsEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FOLLOW US */}
            <div style={followUsColumn}>
              <h3 style={footerHeading}>Follow Us</h3>
              <p style={footerTextSmall}>
                Stay connected with Ulul Azm for lectures, announcements, educational content, new programmes, and
                institute updates.
              </p>

              <div style={socialGrid}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Follow Ulul Azm on ${social.name}`}
                    aria-label={`Follow Ulul Azm on ${social.name}`}
                    style={socialButton}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}
          <div style={footerBottom}>
            <div className="footer-footnote">© {new Date().getFullYear()} Ulul Azm Institute. All rights reserved.</div>
            <div className="footer-footnote">Knowledge is a trust. Character is its companion.</div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer-footnote {
          transition: color 0.15s ease;
        }
        .footer-footnote:hover {
          color: var(--gold);
        }

        /* Tightens link spacing for a "long" footer column (see
           FooterColumn) so it reads shorter -- without splitting
           into a 2-column grid, which at this footer's narrow
           per-column track width made a long column's links wrap
           and visually bleed into the *next* footer column. */
        .footer-links-dense :global(a) {
          margin-bottom: 6px !important;
        }

        @media (max-width: 1024px) {

          /* Between the full multi-column grid (up to ~8 tracks:
             About + up to 6 CMS link groups + Follow Us) and the
             700px single-column collapse below, each track's
             minmax(100px,1fr) floor left columns cramped and
             link text wrapping into neighboring columns on tablet
             widths. A 3-column wrap gives every column enough room
             to breathe before the full collapse. */
          .footer-grid {
            grid-template-columns: repeat(3, minmax(150px, 1fr)) !important;
            gap: 28px !important;
          }

        }

        @media (max-width: 700px) {

          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }

        }
      `}</style>

      {/* FOOTER MODAL */}
      {footerModal && footerContent[footerModal] && (
        <div onClick={() => setFooterModal(null)} style={modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <div style={modalHeader}>
              <h2 style={modalTitle}>{footerContent[footerModal].title}</h2>
              <button onClick={() => setFooterModal(null)} style={closeButton} aria-label="Close" type="button">
                ✕
              </button>
            </div>
            <div style={modalContent}>{footerContent[footerModal].content}</div>
          </div>
        </div>
      )}
    </>
  );
}

function FooterColumn({ title, children }) {
  // Model 27 (2026-09) took Academy and Institute from 8 links each to
  // 10 (Events/News; Academic Policies/Student Resources) -- at this
  // footer's narrow ~100px-wide column tracks, the old ">8 -> 2-column
  // grid" compact mode made a long column split into two ~40px-wide
  // sub-columns sitting right next to the *next* footer column, with
  // no room for labels like "Academic Departments" to avoid wrapping
  // into that neighbor -- reading as one column bleeding into another.
  // A 2-column horizontal split only ever works with a wide enough
  // track for it (see footerColumnLinksCompact's own comment); this
  // footer's tracks aren't, and never reliably will be while it holds
  // this many columns. So a long column now stays a single vertical
  // list (never splits sideways, never touches its neighbor) and gets
  // tighter link spacing instead, via footerColumnLinksDense --
  // shorter, not narrower.
  const isLong = Children.count(children) > 8;

  return (
    <div>
      <h3 style={footerHeading}>{title}</h3>
      <div
        className={isLong ? 'footer-links-dense' : undefined}
        style={isLong ? footerColumnLinksDense : footerColumnLinks}
      >
        {children}
      </div>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={footerLink}>
      {children}
    </Link>
  );
}

function FooterButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={footerButton} type="button">
      {children}
    </button>
  );
}

function ResourceCard({ icon, title, text, link }) {
  return (
    <div style={resourceCard}>
      <div style={{ fontSize: '28px' }}>{icon}</div>
      <h4 style={{ color: 'var(--brand)', marginBottom: '8px' }}>{title}</h4>
      <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>{text}</p>
      {link && (
        <Link href={link} style={resourceLink}>
          Open →
        </Link>
      )}
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const footerStyle = {
  background: '#020617',
  color: '#cbd5e1',
  borderTop: '4px solid var(--gold)',
};

const footerInner = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '65px 24px 30px',
};

const footerGrid = {
  display: 'grid',
  // Base/fallback template only -- the component overrides
  // gridTemplateColumns at render via dynamicFooterGrid (above),
  // computed from the actual number of columns that will render, so
  // it never drifts out of sync with however many CMS-managed footer
  // link groups the database happens to have. This static value is
  // what applies for one paint before state settles and is never
  // relied on afterward; @media (max-width: 700px) below still
  // collapses everything to a single column on small screens.
  gridTemplateColumns: 'minmax(170px,1.1fr) repeat(6,minmax(100px,1fr))',
  gap: '20px',
};

const footerBrand = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const footerLogoImg = {
  height: '46px',
  width: 'auto',
  maxWidth: '130px',
  objectFit: 'contain',
  flexShrink: 0,
};

const footerLogo = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  background: 'var(--brand)',
  border: '1px solid var(--gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--gold)',
  fontWeight: '900',
  fontSize: '22px',
};

const footerBrandName = {
  color: 'var(--on-accent)',
  fontSize: '19px',
  fontWeight: '900',
};

const footerBrandTagline = {
  fontSize: '9px',
  color: 'var(--gold)',
  letterSpacing: '1px',
};

const footerText = {
  lineHeight: 1.8,
  fontSize: '14px',
  maxWidth: '390px',
  color: 'var(--on-dark-soft)',
};

const footerTextSmall = {
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--on-dark-soft)',
};

const footerArabic = {
  fontFamily: 'var(--font-arabic-display)',
  color: 'var(--gold)',
  fontSize: '19px',
  marginBottom: '0',
};

const footerQuote = {
  color: 'var(--on-dark-soft)',
  fontSize: '13px',
  lineHeight: 1.7,
  margin: '8px 0 0',
  maxWidth: '390px',
};

const footerPrinciple = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid var(--on-dark-border)',
  maxWidth: '390px',
};

const footerPrincipleTitle = {
  color: 'var(--paper)',
  fontSize: '13px',
};

const footerPrincipleText = {
  margin: '7px 0 0',
  color: 'var(--on-dark-soft)',
  fontSize: '12px',
  lineHeight: 1.7,
};

const footerHeading = {
  margin: '0 0 17px',
  color: 'var(--paper)',
  fontSize: '14px',
  fontWeight: '900',
};

const footerColumnLinks = {
  display: 'flex',
  flexDirection: 'column',
};

// A long column (see FooterColumn) stays a single vertical list --
// same footerColumnLinks layout -- but pairs with the .footer-links-
// dense CSS class below to tighten each link's own spacing, so it
// reads shorter without ever splitting sideways into a neighboring
// column's track.
const footerColumnLinksDense = {
  ...footerColumnLinks,
};

const footerLink = {
  display: 'block',
  color: 'var(--on-dark-soft)',
  textDecoration: 'none',
  fontSize: '13px',
  marginBottom: '11px',
  breakInside: 'avoid',
};

const footerButton = {
  display: 'block',
  border: 'none',
  background: 'none',
  padding: 0,
  color: 'var(--on-dark-soft)',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
  marginBottom: '11px',
  breakInside: 'avoid',
};

const socialGrid = {
  display: 'flex',
  gap: '9px',
  flexWrap: 'wrap',
  marginTop: '18px',
};

const socialButton = {
  width: '36px',
  height: '36px',
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  background: 'rgba(248,247,242,0.06)',
  border: '1px solid var(--on-dark-border)',
  color: 'var(--paper)',
  fontWeight: '900',
};

// Phone / Email / Academic Enquiries, stacked directly under the
// address lines inside the Address column (2026-09) -- one complete
// block instead of a separate strip elsewhere in the footer.
const footerAddressContactList = {
  marginTop: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const footerContactItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

// Icon + label row that sits above the value (footerContactValueStacked
// below) -- used for Phone/Email/Academic Enquiries under the Address
// column, where a single inline row of icon+label+value has no room
// to breathe in a narrow grid track.
const footerContactItemHead = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
};

// Indented to align under the label text (icon width 14px + 8px gap).
const footerContactValueStacked = {
  fontSize: '13px',
  color: 'var(--on-dark-soft)',
  paddingInlineStart: '22px',
  wordBreak: 'break-word',
};

// Previously carried a borderInlineStart as a literal divider line
// against the Address column, but with Follow Us now widened
// (0.9fr -> 1.2fr) the line rendered full-height next to a much
// shorter block of content and looked unconstrained/out of place --
// removed per request. The footer grid's own 20px column gap
// (footerGrid, 30px on the <=700px mobile breakpoint) already
// separates every other pair of columns in this row with no border
// at all, so Address/Follow Us reads consistently with its
// neighbors without one.
const followUsColumn = {};

// Same idea as footerContactItem, but the address has multiple
// lines under its label rather than a single inline value, so it
// needs the icon aligned to the top instead of the row centered.
const footerContactItemAddress = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '8px',
};

const footerContactIcon = {
  color: 'var(--gold)',
  flexShrink: 0,
};

const footerContactLabel = {
  flexShrink: 0,
  fontSize: '10.5px',
  fontWeight: '800',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  color: 'var(--gold)',
};

const footerContactValue = {
  fontSize: '13px',
  color: 'var(--on-dark-soft)',
};

const footerBottom = {
  marginTop: '30px',
  paddingTop: '22px',
  borderTop: '1px solid var(--on-dark-border)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '15px',
  flexWrap: 'wrap',
  fontSize: '12px',
  color: 'var(--on-dark-soft)',
};

const footerCtaBanner = {
  background: 'linear-gradient(135deg,var(--brand),var(--brand-deepest))',
  borderBottom: '1px solid var(--on-dark-border)',
};

const footerCtaInner = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '46px 24px',
  textAlign: 'center',
};

const footerCtaArabic = {
  fontFamily: 'var(--font-arabic-display)',
  color: '#f4d58d',
  fontSize: '21px',
  fontWeight: '500',
  letterSpacing: '0.8px',
};

const footerCtaTitle = {
  color: 'var(--on-accent)',
  fontSize: '28px',
  margin: '12px 0 10px',
};

const footerCtaDescription = {
  color: 'var(--on-accent)',
  opacity: 0.9,
  fontSize: '14.5px',
  lineHeight: 1.6,
  margin: 0,
};

// A seam between Technical Support's own links and the Mobile App
// content stacked below them in the same column (2026-09, moved out
// of its own standalone column) -- keeps the two visually distinct
// as sub-sections of one column rather than reading as one
// continuous list of links.
const mobileAppSection = {
  marginTop: '18px',
  paddingTop: '18px',
  borderTop: '1px solid var(--on-dark-border)',
};

const appBadgeStack = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '6px',
};

// Deliberately not a real store link yet -- see the JSX comment
// above where these render. aria-disabled communicates that to
// assistive tech since there's no real href to disable natively.
const appBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--on-dark-border)',
  background: 'rgba(255,255,255,.04)',
  color: 'var(--on-dark-soft)',
  cursor: 'default',
  userSelect: 'none',
};

const appBadgeIcon = {
  fontSize: '18px',
  lineHeight: 1,
};

const appBadgeEyebrow = {
  display: 'block',
  fontSize: '9px',
  letterSpacing: '0.4px',
  opacity: 0.8,
};

const appBadgeName = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '700',
  // Was var(--on-dark-strong, #fff) -- globals.css never defines
  // --on-dark-strong (only --on-dark-soft / --on-dark-border exist),
  // so this always silently fell through to the fallback. Written
  // directly since that's the only value it ever resolved to.
  color: '#fff',
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(2,6,23,.78)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const modalBox = {
  width: '100%',
  maxWidth: '760px',
  maxHeight: '88vh',
  overflowY: 'auto',
  background: 'var(--surface)',
  borderRadius: '18px',
  boxShadow: '0 30px 80px rgba(0,0,0,.35)',
};

const modalHeader = {
  padding: '22px 25px',
  background: 'linear-gradient(135deg,var(--brand-deepest),var(--brand))',
  color: 'var(--on-accent)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
};

const modalTitle = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontSize: '24px',
};

const closeButton = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(255,255,255,.08)',
  color: 'var(--on-accent)',
  fontSize: '22px',
  cursor: 'pointer',
};

const modalContent = {
  padding: '30px',
  color: 'var(--ink-soft)',
  lineHeight: 1.8,
  fontSize: '14px',
};

const resourceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
  gap: '14px',
};

const resourceCard = {
  background: 'var(--paper)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '20px',
};

const resourceLink = {
  color: 'var(--brand)',
  fontWeight: '800',
  textDecoration: 'none',
};
