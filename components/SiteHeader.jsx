'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, LayoutDashboard, LogIn, Search } from 'lucide-react';
import { ChevronRightIcon } from '@/components/Icons';
import { MEDIA_CATEGORIES } from '@/lib/media';
import { LIBRARY_CATEGORIES } from '@/lib/library';
import { useSiteBranding } from '@/components/SiteBrandingProvider';
import { useSiteAuth } from '@/components/SiteAuthProvider';

// Same clamp the server already enforces on save (see
// app/api/admin/homepage/hero/route.js LOGO_SIZE_PRESETS) -- clamped
// again here so a stale/unexpected value from the API can never
// render a logo bigger or smaller than the header is designed for.
function clampLogoSize(size) {
  const n = Number(size) || 100;
  return Math.min(160, Math.max(70, n));
}

/*
 * Shared public site header/navigation -- Home | Academy (dropdown) |
 * Admission & Registration | Bookstore | Media | Library, plus search
 * and Student Portal access.
 *
 * This is the single source of truth for the public nav (Model 14).
 * Previously the homepage (app/page.jsx) had its own hand-written header,
 * app/bookstore/page.jsx had a second, independent one, and every other
 * public page (Academy, Programs, the academy-* documents, About,
 * Contact, FAQ, Admission) had none at all. This component replaces all
 * of that with one real, reusable header mounted everywhere.
 *
 * `rightExtra`: optional node rendered in the header-actions area, before
 * the Student Portal button -- used by the Bookstore page for its
 * currency selector and cart button, so page-specific controls don't
 * require a second header implementation.
 */

// Public-facing only. The internal governance/curriculum/spec/
// build-tracking documents that used to fill out this dropdown
// (Academy Governance, Academy Curriculum, Department Curriculum,
// Course Catalogue, Course Specifications, Assessment & Grading,
// Student Lifecycle, Faculty & Portals, Academic Regulations & QA,
// Website & Master Integration) were written to brief the real
// build, not to stay published as a public sitemap -- and the real
// systems they describe already exist in their own dashboards
// (Coordinator/HOD/Dean/QA/Instructor/Records), so nothing here
// was rebuilt, only un-surfaced from public nav. Academy Foundation
// and Academy Pathways stay -- both are genuinely public-facing
// (institutional identity, and the real pathway/qualification
// framework a prospective learner needs).
const ACADEMY_DROPDOWN_ITEMS = [
  { label: 'Academic Departments', href: '/departments' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Academic Calendar', href: '/academic-calendar' },
  { label: 'Academy Foundation', href: '/academy-foundation' },
  { label: 'Academy Pathways', href: '/academy-pathways' },
  { label: 'Alumni', href: '/alumni' },
];

// Two-group structure (2026-09, per user request): "Admissions" is
// the action of applying, "Registration & Enrollment" is what
// happens once a student is admitted -- previously all six items
// were one flat list and three of them (How to Apply / Registration
// & Enrollment / Apply Now) all pointed at the same admission
// wizard with no distinction. "Academic Pathways & Qualifications"
// was also a pure duplicate of "Academy Pathways" already in the
// Academy dropdown (identical href) -- removed rather than kept
// twice. Enrollment Information and the two Deadlines items point
// at the real Academic Calendar (the institute's actual source for
// these dates once Academic Records staff publish them); Course
// Registration points at the Student Portal, where that real,
// working feature already lives -- none of these are fabricated
// new pages.
const ADMISSION_DROPDOWN_GROUPS = [
  {
    label: 'Admissions',
    items: [
      { label: 'How to Apply', href: '/admission' },
      { label: 'Apply Now', href: '/admission' },
      { label: 'Admission Requirements', href: '/admission-requirements' },
      { label: 'Application Deadlines', href: '/academic-calendar' },
      { label: 'Track Your Application', href: '/admission/track' },
    ],
  },
  {
    label: 'Registration & Enrollment',
    items: [
      { label: 'Enrollment Information', href: '/academic-calendar' },
      { label: 'Course Registration', href: '/login' },
      { label: 'Registration Deadlines', href: '/academic-calendar' },
    ],
  },
];

const BOOKSTORE_DROPDOWN_ITEMS = [
  { label: 'Browse Collection', href: '/bookstore#collection' },
];

const MEDIA_DROPDOWN_ITEMS = [
  ...MEDIA_CATEGORIES.map((c) => ({ label: c.label, href: `/media?category=${c.value}` })),
  { label: 'Subscription Plans', href: '/media#plans' },
];

const LIBRARY_DROPDOWN_ITEMS = LIBRARY_CATEGORIES.map((c) => ({
  label: c.label,
  href: `/library?category=${c.value}`,
}));

const RESULT_GROUPS = [
  { key: 'academy', label: 'Academy' },
  { key: 'programs', label: 'Programmes' },
  { key: 'courses', label: 'Courses' },
  { key: 'departments', label: 'Departments' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'media', label: 'Media' },
  { key: 'library', label: 'Library' },
  { key: 'bookstore', label: 'Bookstore' },
  { key: 'news', label: 'News' },
  { key: 'events', label: 'Events' },
];

export default function SiteHeader({ rightExtra, showSearch = true, sectionMode }) {
  const pathname = usePathname();
  const { logoUrl, logoSize } = useSiteBranding();
  const logoScale = clampLogoSize(logoSize) / 100;
  // Base sizes scaled by the admin's chosen percentage. The mobile
  // breakpoint's own size is passed down as CSS custom properties
  // (see the @media rule below) since that override lives in a
  // static <style jsx> block, not inline style.
  const dynamicLogoImgStyle = {
    ...logoImgStyle,
    height: Math.round(60 * logoScale) + 'px',
    maxWidth: Math.round(210 * logoScale) + 'px',
    '--logo-mobile-height': Math.round(48 * logoScale) + 'px',
    '--logo-mobile-max-width': Math.round(150 * logoScale) + 'px',
  };
  const dynamicLogoStyle = {
    ...logoStyle,
    width: Math.round(60 * logoScale) + 'px',
    height: Math.round(60 * logoScale) + 'px',
    fontSize: Math.round(30 * logoScale) + 'px',
    '--logo-mobile-height': Math.round(48 * logoScale) + 'px',
    '--logo-mobile-max-width': Math.round(150 * logoScale) + 'px',
  };

  // Seeded from the server via the root layout -- see
  // components/SiteAuthProvider.jsx. No client fetch, no flash: the
  // correct Dashboard/Student Portal label is already known on the
  // very first paint, and authChecked is always true because of it.
  const { user, destination } = useSiteAuth();
  const authChecked = true;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

  // "More" overflow menu -- see the 900-1280px CSS block below for
  // why this exists: Media, Library and Donate move in here instead
  // of shrinking the nav's text indefinitely or letting one of them
  // wrap to its own row.
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // Debounced live search -- real, server-side, queried against the
  // Academy documents, Programs, Courses, Media, Library and Bookstore's
  // own existing data (see app/api/search/route.js). Not a hardcoded
  // suggestion list.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const handle = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) setResults(data.results);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    // Close the "More" overflow menu on route change so it doesn't
    // stay open after a link is followed.
    setMoreMenuOpen(false);
  }, [pathname]);

  const hasResults =
    results && RESULT_GROUPS.some((group) => (results[group.key] || []).length > 0);

  // destination is resolved server-side per account type (student,
  // staff, or bookstore/media customer) -- see lib/permissions.ts's
  // getAccountDestination() and app/layout.jsx.
  //
  // BUT that destination is the signed-in account's *native* home, and
  // Bookstore, Media and Library are their own independent sections --
  // a real student can also separately hold (or create) a bookstore or
  // media account with no connection to their student record at all
  // (User.studentProfile is optional; someone browsing Bookstore is
  // not automatically "the student" just because their current session
  // happens to have a StudentProfile too). So while sectionMode is
  // 'bookstore' or 'media', the header must not send a signed-in
  // visitor to the Student Portal just because their account happens
  // to have one -- it shows that section's own account page instead,
  // regardless of what other roles the signed-in account also holds.
  // Library needs no account at all (it's free, open reading for
  // everyone -- see ZONE_WELCOME's own "no subscription needed" copy
  // in components/AssistantWidget.jsx), so no portal/account link is
  // shown there at all.
  let portalHref;
  let portalLabel;

  if (sectionMode === 'library') {
    portalHref = null;
    portalLabel = null;
  } else if (sectionMode === 'bookstore') {
    // Straight to the Bookstore's OWN dashboard (My Books, My Orders)
    // -- not the shared /account/dashboard router and never the Media
    // dashboard, even if this same signed-in account also has a Media
    // subscription. See app/account/bookstore/page.jsx.
    // Signed OUT, this must go to /account (the shared bookstore/media/
    // author sign-in page) -- NOT /login, which is the Student Portal
    // and previously showed a hardcoded "Student Portal" title to
    // bookstore customers who had never enrolled as students.
    // ?from=bookstore tells /account to show bookstore-specific
    // copy/back-link instead of generic or (worse) media/student text.
    portalHref = user ? '/account/bookstore' : '/account?from=bookstore';
    portalLabel = user ? 'My Account' : 'Sign In';
  } else if (sectionMode === 'media') {
    // Straight to Media's OWN dashboard (subscription status/history)
    // -- not the shared /account/dashboard router and never the
    // Bookstore dashboard. See app/account/media/page.jsx.
    // Same reasoning as bookstore above: /account, not /login, for a
    // signed-out visitor, with ?from=media for section-correct copy.
    portalHref = user ? '/account/media' : '/account?from=media';
    portalLabel = user ? 'My Account' : 'Sign In';
  } else {
    // Falls back to the bookstore/media account chooser if, for any
    // reason, destination didn't resolve.
    portalHref = user ? destination?.href || '/account/dashboard' : '/login';
    portalLabel = user ? destination?.label || 'My Account' : 'Student Portal';
  }

  return (
    <header style={headerStyle}>
      <div style={headerInner} className="site-header-inner">
        <Link href="/" style={brandStyle}>
          {logoUrl ? (
            <img src={logoUrl} alt="Ulul Azm Institute" style={dynamicLogoImgStyle} className="site-header-logo" />
          ) : (
            <div style={dynamicLogoStyle} className="site-header-logo">ع</div>
          )}
          <div>
            <div style={brandName} className="site-header-brand-name">Ulul Azm Institute</div>
            <div style={brandSubtitle} className="site-header-brand-subtitle">A Digital Home For Islamic Knowledge</div>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav style={navStyle} className="site-header-nav">
          <NavLink href="/">Home</NavLink>
          {!sectionMode && (
            <NavDropdown label="Academy" href="/academy" items={ACADEMY_DROPDOWN_ITEMS} />
          )}
          {/* Nav label was "Admission & Registration" -- the single
              longest item in this nav, and the main reason "Donate"
              kept getting squeezed onto its own row even after
              trimming the brand name and the nav's own font size.
              The dropdown panel underneath still spells the office
              name out in full. */}
          {!sectionMode && (
            <NavDropdown label="Admission" href="/admission" groups={ADMISSION_DROPDOWN_GROUPS} />
          )}
          {(!sectionMode || sectionMode === 'bookstore') && (
            <NavDropdown label="Bookstore" href="/bookstore" items={BOOKSTORE_DROPDOWN_ITEMS} />
          )}

          {/* At 1280px and below (tablet through phone -- the nav
              never hides behind a hamburger, it just condenses) there
              isn't room for Media, Library and Donate at full size
              even with the shrink below -- rather than let one of
              them wrap to its own row, they move into this single
              "More" trigger for the whole of that range (hidden
              entirely above 1280px: .uai-nav-more-wrap in the
              stylesheet below). The three items themselves stay in
              the DOM as normal nav items (.uai-nav-overflow-item),
              just hidden by the same breakpoint. */}
          {!sectionMode && (
            <div ref={moreMenuRef} style={navDropdownWrap} className="uai-nav-more-wrap">
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                style={navDropdownTrigger}
                className="uai-nav-link"
                aria-haspopup="true"
                aria-expanded={moreMenuOpen}
              >
                More
                <ChevronRightIcon
                  size={13}
                  style={{
                    transform: moreMenuOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                />
              </button>

              {moreMenuOpen && (
                <div style={navDropdownPanel} role="menu">
                  <Link
                    href="/media"
                    style={navDropdownItem}
                    className="uai-nav-dropdown-item"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Media
                  </Link>
                  <Link
                    href="/library"
                    style={navDropdownItem}
                    className="uai-nav-dropdown-item"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Library
                  </Link>
                  <Link
                    href="/donate"
                    style={navDropdownItem}
                    className="uai-nav-dropdown-item"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    Donate
                  </Link>
                </div>
              )}
            </div>
          )}

          {(!sectionMode || sectionMode === 'media') && (
            <NavDropdown
              label="Media"
              href="/media"
              items={MEDIA_DROPDOWN_ITEMS}
              className={sectionMode ? undefined : 'uai-nav-overflow-item'}
            />
          )}
          {(!sectionMode || sectionMode === 'library') && (
            <NavDropdown
              label="Library"
              href="/library"
              items={LIBRARY_DROPDOWN_ITEMS}
              className={sectionMode ? undefined : 'uai-nav-overflow-item'}
            />
          )}
          {!sectionMode && (
            <NavLink href="/donate" className="uai-nav-overflow-item">
              Donate
            </NavLink>
          )}
        </nav>

        {/* HEADER ACTIONS */}
        <div style={headerActions}>
          {showSearch && (
          <div ref={searchBoxRef} style={searchWrap}>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              style={searchButton}
              aria-label="Search the site"
              aria-expanded={searchOpen}
            >
              <Search size={18} strokeWidth={2.2} />
            </button>

            {searchOpen && (
              <div style={searchPanel} role="search">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Academy, Programmes, Media, Library, Bookstore…"
                  style={searchInput}
                  aria-label="Search the site"
                />

                {query.trim().length >= 2 && (
                  <div style={searchResultsBox}>
                    {searching && <div style={searchStateText}>Searching…</div>}

                    {!searching && !hasResults && (
                      <div style={searchStateText}>No results for &ldquo;{query.trim()}&rdquo;.</div>
                    )}

                    {!searching &&
                      hasResults &&
                      RESULT_GROUPS.map((group) => {
                        const items = (results && results[group.key]) || [];
                        if (items.length === 0) return null;

                        return (
                          <div key={group.key} style={searchGroup}>
                            <div style={searchGroupLabel}>{group.label}</div>
                            {items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                style={searchResultLink}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setQuery('');
                                }}
                              >
                                <span style={searchResultTitle}>{item.title}</span>
                                {item.meta && <span style={searchResultMeta}>{item.meta}</span>}
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {rightExtra}

          {portalHref && (
            <Link
              href={portalHref}
              style={sectionMode === 'bookstore' || sectionMode === 'media' ? portalButton : portalIconButton}
              className={sectionMode === 'bookstore' || sectionMode === 'media' ? undefined : 'uai-portal-icon-btn site-header-portal-btn'}
              aria-label={portalLabel || 'Portal'}
            >
              {sectionMode === 'bookstore' || sectionMode === 'media' ? (
                user ? (
                  <LayoutDashboard size={18} strokeWidth={2.2} />
                ) : (
                  <LogIn size={18} strokeWidth={2.2} />
                )
              ) : (
                <UserRound size={19} strokeWidth={2.1} />
              )}
              {(sectionMode === 'bookstore' || sectionMode === 'media') && (
                <span>{portalLabel}</span>
              )}
            </Link>
          )}

          {/* Apply Now is the last item in the header -- after the
              portal icon, not sandwiched between the search icon and
              the portal icon -- only shown in the default/general
              header (not on the Bookstore or Media section headers,
              where it's off-topic). */}
          {!sectionMode && (
            <Link href="/admission" style={applyNowButton} className="uai-gold-btn site-header-apply-btn">
              Apply Now
            </Link>
          )}

        </div>
      </div>

      <style jsx>{`
        .uai-portal-icon-btn {
          border: 1px solid var(--border);
          transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        .uai-portal-icon-btn:hover {
          background: var(--brand-tint);
          border-color: var(--brand);
          box-shadow: 0 2px 8px rgba(20,83,45,.18);
        }

        @media (prefers-reduced-motion: reduce) {
          .uai-portal-icon-btn {
            transition: none;
          }
        }

        /* The "More" overflow trigger (Media/Library/Donate) is
           hidden above 1280px -- see the media query below, which
           now covers everything at or under that width, tablet
           through phone, since the nav no longer hides behind a
           hamburger at any width. */
        /* !important is required here -- the trigger's own inline
           style (navDropdownWrap: display:'inline-block', needed for
           its position:relative dropdown-panel anchor) otherwise beats
           this plain class rule outright regardless of viewport width,
           which was quietly leaving "More" visible on desktop at the
           same time as the individual Media/Library/Donate items. */
        .uai-nav-more-wrap {
          display: none !important;
        }

        /* At 1280px (headerInner's own max-width, past which it has
           all the room it will ever use) and every width below it,
           down through phones, the nav's actual width equals the
           viewport's, and seven items -- one of them "Admission &
           Registration" -- plus the brand name genuinely don't all
           fit at their full desktop size. Rather than let flex-wrap
           strand an item on its own row, two things happen together
           for this whole range: the nav's items and the brand name
           shrink a notch, AND Media/Library/Donate move behind a
           single "More" trigger (.uai-nav-overflow-item hidden,
           .uai-nav-more-wrap shown) -- so what's left (Home, Academy,
           Admission, Bookstore, More) comfortably fits on one line
           all the way down to the narrowest phones. Above 1280px
           this block does nothing and everything stays at full
           desktop size/layout. !important because these are
           overriding inline styles, same pattern as the rest of this
           file's responsive overrides. */
        @media (max-width: 1280px) {
          .uai-nav-link {
            font-size: 13px !important;
            padding: 7px 7px !important;
          }

          .site-header-nav {
            gap: 2px !important;
          }

          .site-header-brand-name {
            font-size: 18px !important;
          }

          .site-header-brand-subtitle {
            font-size: 7.5px !important;
          }

          .uai-nav-overflow-item {
            display: none !important;
          }

          .uai-nav-more-wrap {
            display: inline-block !important;
          }
        }

        @media (max-width: 700px) {
          .site-header-logo {
            height: var(--logo-mobile-height, 48px) !important;
            max-width: var(--logo-mobile-max-width, 150px) !important;
          }
        }

        /* Extra safety margin for narrow phones now that the nav
           (Home/Academy/Admission/Bookstore/More) never hides behind
           a hamburger -- shrinks the nav items and the fixed-width
           search/portal/Apply Now cluster a notch further so the row
           has the best chance of staying on one line all the way
           down. If a device is narrower still, .site-header-nav's
           own flexWrap:'wrap' (see navStyle) lets it wrap to a second
           line as a graceful fallback rather than breaking anything. */
        @media (max-width: 560px) {
          .uai-nav-link {
            font-size: 12px !important;
            padding: 6px 5px !important;
          }

          .site-header-nav {
            gap: 1px !important;
          }

          .site-header-portal-btn,
          .uai-portal-icon-btn {
            width: 34px !important;
            height: 34px !important;
          }

          .site-header-apply-btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .site-header-inner {
            padding-left: 14px !important;
            padding-right: 14px !important;
            gap: 10px !important;
          }

          .site-header-brand-name {
            font-size: 19px !important;
          }

          .site-header-brand-subtitle {
            font-size: 7px !important;
            letter-spacing: 0.1px !important;
            white-space: normal !important;
          }
        }
      `}</style>

      <style jsx global>{`
        .uai-nav-link,
        .uai-nav-dropdown-item {
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .uai-nav-link:hover,
        .uai-nav-link:focus-visible {
          background-color: var(--brand-tint);
          color: var(--brand);
        }

        .uai-nav-dropdown-item:hover,
        .uai-nav-dropdown-item:focus-visible {
          background-color: var(--brand-tint);
          color: var(--brand);
        }
      `}</style>
    </header>
  );
}

function NavLink({ href, children, className }) {
  return (
    <Link href={href} style={navLink} className={`uai-nav-link${className ? ` ${className}` : ''}`}>
      {children}
    </Link>
  );
}

// A hover/focus dropdown for a nav item that has its own sub-pages --
// clicking or tapping Enter still navigates straight to `href` (the
// section's hub page), the caret only reveals the sub-page shortcuts.
// Desktop only; the mobile menu uses its own accordion pattern above.
function NavDropdown({ label, href, items, groups, className }) {
  const [open, setOpen] = useState(false);
  // Hover-intent close delay -- the dropdown panel sits a few
  // pixels below its trigger (see navDropdownPanel's `top`), which
  // falls outside this wrapper's own hoverable box since an
  // absolutely-positioned child never grows its parent's box. A
  // cursor moving from the trigger down into the panel briefly
  // crosses that gap, so closing on mouseLeave immediately made the
  // menu vanish mid-move. A short cancellable delay fixes it without
  // changing the panel's visual position.
  const closeTimer = useRef(null);

  function openNow() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 250);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Hover alone can't open this on a touch device -- a tablet
  // showing the full desktop nav (>=900px) has no hover state, so a
  // tap on the trigger would navigate straight through `href` and
  // the dropdown's own items would be unreachable. First tap opens
  // the panel and stays on this page instead of navigating; the
  // Link's normal href/onClick behavior (navigate + close) is
  // untouched for mouse and keyboard users, since this only
  // intercepts when the dropdown is not already open.
  function handleTriggerClick(e) {
    if (!open) {
      e.preventDefault();
      openNow();
      return;
    }
    setOpen(false);
  }

  return (
    <div
      style={navDropdownWrap}
      className={className}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <Link
        href={href}
        style={navDropdownTrigger}
        className="uai-nav-link"
        onClick={handleTriggerClick}
        onFocus={openNow}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span
          aria-hidden="true"
          style={{
            fontSize: '10px',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        >
          ▾
        </span>
      </Link>

      {open && (
        <div
          style={navDropdownPanel}
          role="menu"
          aria-label={`${label} sections`}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          {groups
            ? groups.map((group, gi) => (
                <div key={group.label} style={gi > 0 ? navDropdownGroupSpacing : undefined}>
                  <div style={navDropdownGroupLabel}>{group.label}</div>
                  {group.items.map((item) => (
                    <Link
                      key={group.label + item.label}
                      href={item.href}
                      style={navDropdownItem}
                      className="uai-nav-dropdown-item"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={navDropdownItem}
                  className="uai-nav-dropdown-item"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,.97)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)',
  // Was rgba(15,23,42,.05) -- a blue-slate shadow color that doesn't
  // match --ink (#1b241f, green-tinted) used everywhere else the
  // site casts a shadow (--shadow-card / --shadow-raised in
  // globals.css). Matched to that same ink tone here so the header's
  // shadow reads as part of the same system instead of a stray hue.
  boxShadow: '0 4px 20px rgba(27,36,31,.07)',
};

const headerInner = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '15px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  // Was 'wrap' -- with the larger brand/nav text this let the whole
  // actions cluster (search + Dashboard) drop to its own row below
  // the logo/nav. Desktop nav is only ever shown above 900px (see
  // the @media rule below), so this row must stay on one line; the
  // nav block itself (flex:1, minWidth:0 below) absorbs any squeeze
  // by wrapping its own items instead.
  flexWrap: 'nowrap',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
  flexShrink: 0,
};

const logoImgStyle = {
  height: '60px',
  width: 'auto',
  maxWidth: '210px',
  objectFit: 'contain',
  flexShrink: 0,
};

const logoStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',
  color: 'var(--gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  fontWeight: '900',
  border: '1px solid rgba(197,157,95,.5)',
  flexShrink: 0,
};

// Was 27px when this was just "Ulul Azm" -- now that it reads
// "Ulul Azm Institute" on one line, the full name at that size ran
// the desktop nav out of room and pushed "Donate" (the last item) to
// its own row. Sized down so the merged name still reads as one
// clear line without starving the nav next to it.
const brandName = {
  fontSize: '21px',
  fontWeight: '900',
  color: 'var(--brand)',
  whiteSpace: 'nowrap',
};

// Was the standalone "Institute" line under "Ulul Azm" -- now that
// the brand name reads as one line ("Ulul Azm Institute"), this slot
// carries the tagline that used to sit in the hero text side instead
// ("A Digital Home For Islamic Knowledge"), sized small enough to
// stay well under the brand name's own width rather than competing
// with it.
// Sized (and cased) to always stay narrower than the brand name
// above it -- "A Digital Home For Islamic Knowledge" is nearly twice
// the character count of "Ulul Azm Institute", so matching its width
// instead of its font-size needed both a much smaller size AND
// dropping the uppercase transform (all-caps runs noticeably wider
// per character than mixed case), not just a smaller number.
const brandSubtitle = {
  fontSize: '9px',
  color: 'var(--gold-dark)',
  fontWeight: '700',
  letterSpacing: '0.2px',
  whiteSpace: 'nowrap',
};

const navStyle = {
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  flex: '1 1 auto',
  minWidth: 0,
};

// Nudged down from 17px/900 -- read as slightly too big/heavy at
// the top of every page. Still bold and easy to scan, just not
// overpowering the rest of the header.
const navLink = {
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '800',
  padding: '9px 10px',
  borderRadius: '7px',
  whiteSpace: 'nowrap',
};

const navDropdownWrap = {
  position: 'relative',
  display: 'inline-block',
};

const navDropdownTrigger = {
  ...navLink,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const navDropdownPanel = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  minWidth: '270px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  boxShadow: 'var(--shadow-raised)',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  zIndex: 40,
};

const navDropdownItem = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '700',
  padding: '9px 10px',
  borderRadius: 'var(--radius-s)',
};

const navDropdownGroupLabel = {
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  opacity: 0.7,
  padding: '6px 10px 4px',
};

const navDropdownGroupSpacing = {
  marginTop: '6px',
  paddingTop: '6px',
  borderTop: '1px solid var(--border)',
};

const headerActions = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  flexShrink: 0,
};

const searchWrap = {
  position: 'relative',
};

const searchButton = {
  width: '38px',
  height: '38px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--brand)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const searchPanel = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '340px',
  maxWidth: '86vw',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  boxShadow: 'var(--shadow-raised)',
  padding: '10px',
  zIndex: 60,
};

const searchInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13.5px',
  fontFamily: 'inherit',
};

const searchResultsBox = {
  marginTop: '8px',
  maxHeight: '360px',
  overflowY: 'auto',
};

const searchStateText = {
  padding: '10px 6px',
  fontSize: '13px',
  color: 'var(--ink-soft)',
};

const searchGroup = {
  marginBottom: '6px',
};

const searchGroupLabel = {
  fontSize: '10.5px',
  fontWeight: '900',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  color: 'var(--gold-dark)',
  padding: '6px 6px 2px',
};

const searchResultLink = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  padding: '8px 6px',
  borderRadius: '6px',
  textDecoration: 'none',
};

const searchResultTitle = {
  fontSize: '13.5px',
  fontWeight: '700',
  color: 'var(--ink)',
};

const searchResultMeta = {
  fontSize: '11.5px',
  color: 'var(--ink-soft)',
};

const portalButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 4px',
  textDecoration: 'none',
  color: 'var(--brand)',
  fontWeight: '800',
  fontSize: '13.5px',
};

// Icon-only variant for the default/general header (matches the
// unlabeled circular portal icon the user asked to match), used only
// when there's no text label to show alongside the icon.
const portalIconButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  textDecoration: 'none',
  color: 'var(--brand)',
  flexShrink: 0,
  // border/background/box-shadow all live on .uai-portal-icon-btn
  // below instead of here -- an inline style has higher specificity
  // than any stylesheet rule (including :hover), so a border set
  // here would have silently blocked the CSS class's hover state
  // from ever changing it. That was the actual "doesn't hover" bug.
};

const applyNowButton = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '9px 16px',
  borderRadius: '999px',
  background: 'var(--gold)',
  color: 'var(--on-accent, #fff)',
  fontWeight: '800',
  fontSize: '13px',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

