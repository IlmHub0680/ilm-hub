'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, LayoutDashboard, LogIn, Search, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);
  const [admissionMobileOpen, setAdmissionMobileOpen] = useState(false);
  const [bookstoreMobileOpen, setBookstoreMobileOpen] = useState(false);
  const [mediaMobileOpen, setMediaMobileOpen] = useState(false);
  const [libraryMobileOpen, setLibraryMobileOpen] = useState(false);

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
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setSearchOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu on route change so it doesn't stay open after
    // a link is followed.
    setMobileMenuOpen(false);
    setAcademyMobileOpen(false);
    setAdmissionMobileOpen(false);
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
    portalHref = user ? '/account/bookstore' : '/login';
    portalLabel = user ? 'My Account' : 'Sign In';
  } else if (sectionMode === 'media') {
    // Straight to Media's OWN dashboard (subscription status/history)
    // -- not the shared /account/dashboard router and never the
    // Bookstore dashboard. See app/account/media/page.jsx.
    portalHref = user ? '/account/media' : '/login';
    portalLabel = user ? 'My Account' : 'Sign In';
  } else {
    // Falls back to the bookstore/media account chooser if, for any
    // reason, destination didn't resolve.
    portalHref = user ? destination?.href || '/account/dashboard' : '/login';
    portalLabel = user ? destination?.label || 'My Account' : 'Student Portal';
  }

  return (
    <header style={headerStyle}>
      <div style={headerInner}>
        <Link href="/" style={brandStyle}>
          {logoUrl ? (
            <img src={logoUrl} alt="Ulul Azm Institute" style={dynamicLogoImgStyle} className="site-header-logo" />
          ) : (
            <div style={dynamicLogoStyle} className="site-header-logo">ع</div>
          )}
          <div>
            <div style={brandName}>Ulul Azm</div>
            <div style={brandSubtitle}>Institute</div>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav style={navStyle} className="site-header-nav">
          <NavLink href="/">Home</NavLink>
          {!sectionMode && (
            <NavDropdown label="Academy" href="/academy" items={ACADEMY_DROPDOWN_ITEMS} />
          )}
          {!sectionMode && (
            <NavDropdown label="Admission & Registration" href="/admission" groups={ADMISSION_DROPDOWN_GROUPS} />
          )}
          {(!sectionMode || sectionMode === 'bookstore') && (
            <NavDropdown label="Bookstore" href="/bookstore" items={BOOKSTORE_DROPDOWN_ITEMS} />
          )}
          {(!sectionMode || sectionMode === 'media') && (
            <NavDropdown label="Media" href="/media" items={MEDIA_DROPDOWN_ITEMS} />
          )}
          {(!sectionMode || sectionMode === 'library') && (
            <NavDropdown label="Library" href="/library" items={LIBRARY_DROPDOWN_ITEMS} />
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
            <Link href={portalHref} style={portalButton}>
              {sectionMode === 'bookstore' || sectionMode === 'media' ? (
                user ? (
                  <LayoutDashboard size={18} strokeWidth={2.2} />
                ) : (
                  <LogIn size={18} strokeWidth={2.2} />
                )
              ) : (
                <CircleUserRound size={18} strokeWidth={2.2} />
              )}
              <span>{portalLabel}</span>
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}
      <div className="mobile-menu-button-container">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          style={mobileMenuButton}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div style={mobileMenuContainer}>
          {showSearch && (
          <div style={mobileSearchWrap}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the site…"
              style={mobileSearchInput}
              aria-label="Search the site"
            />
          </div>
          )}

          {showSearch && query.trim().length >= 2 && (
            <div style={mobileSearchResultsBox}>
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
                            setMobileMenuOpen(false);
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

          <Link href="/" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {!sectionMode && (
          <>
          <button
            type="button"
            onClick={() => setAcademyMobileOpen((open) => !open)}
            style={mobileAccordionTrigger}
            aria-expanded={academyMobileOpen}
            aria-controls="mobile-academy-panel"
          >
            Academy
            <span
              aria-hidden="true"
              style={{
                transform: academyMobileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              ▾
            </span>
          </button>

          {academyMobileOpen && (
            <div id="mobile-academy-panel" style={mobileAccordionPanel}>
              <Link href="/academy" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>
                Academy Hub — All Programmes &amp; Documents
              </Link>
              {ACADEMY_DROPDOWN_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={mobileAccordionLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          </>
          )}

          {!sectionMode && (
          <>
          <button
            type="button"
            onClick={() => setAdmissionMobileOpen((open) => !open)}
            style={mobileAccordionTrigger}
            aria-expanded={admissionMobileOpen}
            aria-controls="mobile-admission-panel"
          >
            Admission &amp; Registration
            <span
              aria-hidden="true"
              style={{
                transform: admissionMobileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              ▾
            </span>
          </button>

          {admissionMobileOpen && (
            <div id="mobile-admission-panel" style={mobileAccordionPanel}>
              {ADMISSION_DROPDOWN_GROUPS.map((group) => (
                <div key={group.label}>
                  <div style={mobileAccordionGroupLabel}>{group.label}</div>
                  {group.items.map((item) => (
                    <Link
                      key={group.label + item.label}
                      href={item.href}
                      style={mobileAccordionLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
          </>
          )}
          {(!sectionMode || sectionMode === 'bookstore') && (
          <>
          <button
            type="button"
            onClick={() => setBookstoreMobileOpen((open) => !open)}
            style={mobileAccordionTrigger}
            aria-expanded={bookstoreMobileOpen}
            aria-controls="mobile-bookstore-panel"
          >
            Bookstore
            <span
              aria-hidden="true"
              style={{
                transform: bookstoreMobileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              ▾
            </span>
          </button>

          {bookstoreMobileOpen && (
            <div id="mobile-bookstore-panel" style={mobileAccordionPanel}>
              <Link href="/bookstore" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>
                Bookstore Home
              </Link>
              {BOOKSTORE_DROPDOWN_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={mobileAccordionLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          </>
          )}

          {(!sectionMode || sectionMode === 'media') && (
          <>
          <button
            type="button"
            onClick={() => setMediaMobileOpen((open) => !open)}
            style={mobileAccordionTrigger}
            aria-expanded={mediaMobileOpen}
            aria-controls="mobile-media-panel"
          >
            Media
            <span
              aria-hidden="true"
              style={{
                transform: mediaMobileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              ▾
            </span>
          </button>

          {mediaMobileOpen && (
            <div id="mobile-media-panel" style={mobileAccordionPanel}>
              <Link href="/media" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>
                Media Home
              </Link>
              {MEDIA_DROPDOWN_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={mobileAccordionLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          </>
          )}

          {(!sectionMode || sectionMode === 'library') && (
          <>
          <button
            type="button"
            onClick={() => setLibraryMobileOpen((open) => !open)}
            style={mobileAccordionTrigger}
            aria-expanded={libraryMobileOpen}
            aria-controls="mobile-library-panel"
          >
            Library
            <span
              aria-hidden="true"
              style={{
                transform: libraryMobileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              ▾
            </span>
          </button>

          {libraryMobileOpen && (
            <div id="mobile-library-panel" style={mobileAccordionPanel}>
              <Link href="/library" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>
                Library Home
              </Link>
              {LIBRARY_DROPDOWN_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={mobileAccordionLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          </>
          )}
          {portalHref && (
            <Link
              href={portalHref}
              style={{ ...mobileNavLink, display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {sectionMode === 'bookstore' || sectionMode === 'media' ? (
                user ? (
                  <LayoutDashboard size={16} strokeWidth={2.2} />
                ) : (
                  <LogIn size={16} strokeWidth={2.2} />
                )
              ) : (
                <CircleUserRound size={16} strokeWidth={2.2} />
              )}
              {portalLabel}
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        .mobile-menu-button-container {
          display: none;
          padding: 0 24px 15px;
        }

        @media (max-width: 700px) {
          .site-header-logo {
            height: var(--logo-mobile-height, 48px) !important;
            max-width: var(--logo-mobile-max-width, 150px) !important;
          }
        }

        @media (max-width: 900px) {
          .site-header-nav {
            display: none !important;
          }

          .mobile-menu-button-container {
            display: flex;
            justify-content: flex-end;
          }
        }

        @media (max-width: 700px) {
          .mobile-menu-button-container {
            padding-left: 16px;
            padding-right: 16px;
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

function NavLink({ href, children }) {
  return (
    <Link href={href} style={navLink} className="uai-nav-link">
      {children}
    </Link>
  );
}

// A hover/focus dropdown for a nav item that has its own sub-pages --
// clicking or tapping Enter still navigates straight to `href` (the
// section's hub page), the caret only reveals the sub-page shortcuts.
// Desktop only; the mobile menu uses its own accordion pattern above.
function NavDropdown({ label, href, items, groups }) {
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

  return (
    <div style={navDropdownWrap} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <Link
        href={href}
        style={navDropdownTrigger}
        className="uai-nav-link"
        onClick={() => setOpen(false)}
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
  boxShadow: '0 4px 20px rgba(15,23,42,.05)',
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
  gap: '12px',
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

const brandName = {
  fontSize: '27px',
  fontWeight: '900',
  color: 'var(--brand)',
};

const brandSubtitle = {
  fontSize: '13.5px',
  color: 'var(--gold-dark)',
  fontWeight: '800',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
};

const navStyle = {
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  flex: '1 1 auto',
  minWidth: 0,
};

const navLink = {
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  fontSize: '17px',
  fontWeight: '900',
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

const mobileAccordionGroupLabel = {
  padding: '10px 15px 4px 30px',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  opacity: 0.75,
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

const mobileMenuButton = {
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--brand)',
  width: '42px',
  height: '42px',
  borderRadius: '9px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const mobileMenuContainer = {
  borderTop: '1px solid var(--border)',
  background: 'var(--surface)',
  padding: '5px 0',
};

const mobileSearchWrap = {
  padding: '10px 15px',
};

const mobileSearchInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13.5px',
  fontFamily: 'inherit',
};

const mobileSearchResultsBox = {
  padding: '0 15px 10px',
  maxHeight: '300px',
  overflowY: 'auto',
};

const mobileAccordionTrigger = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '12px 15px',
  borderBottom: '1px solid var(--border)',
  background: 'none',
  border: 'none',
  borderBottomStyle: 'solid',
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: '700',
  color: 'var(--ink-soft)',
};

const mobileAccordionPanel = {
  background: 'var(--brand-tint)',
  borderBottom: '1px solid var(--border)',
};

const mobileAccordionLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '11px 15px 11px 30px',
  borderTop: '1px solid var(--border-soft)',
  fontSize: '13px',
  fontWeight: '700',
};

const mobileNavLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '12px 15px',
  borderBottom: '1px solid var(--border)',
  fontWeight: '700',
};
