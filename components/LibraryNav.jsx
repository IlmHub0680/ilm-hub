'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/*
 * Shared header/navigation for the Library area (/library and
 * /library/[slug]) — written/reference content, separate from Media
 * (video/audio, see components/MediaNav.jsx). The Library has no
 * subscription gate, so this nav has no "Subscription Plans" link.
 *
 * `user` is the real, server-resolved session user (from getCurrentUser()
 * in app/library/layout.jsx), matching the same pattern as MediaNav.
 */
export default function LibraryNav({ user }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) => pathname === href;

  return (
    <header style={headerStyle}>
      <div style={headerInner}>
        <Link href="/" style={brandStyle}>
          <div style={logoStyle}>ع</div>
          <div>
            <div style={brandName}>Ulul Azm</div>
            <div style={brandSubtitle}>Library</div>
          </div>
        </Link>

        <nav style={navStyle}>
          <NavLink href="/" active={isActive('/')}>Home</NavLink>
          <NavLink href="/library" active={isActive('/library')}>Library</NavLink>
        </nav>

        <div className="libnav-mobile-btn-container">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={mobileMenuButton}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .libnav-mobile-btn-container {
          display: none;
        }

        @media (max-width: 900px) {
          nav {
            display: none !important;
          }

          .libnav-mobile-btn-container {
            display: flex;
            justify-content: flex-end;
          }
        }
      `}</style>

      {mobileMenuOpen && (
        <div style={mobileMenuContainer}>
          <Link href="/" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/library" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Library
          </Link>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      style={active ? { ...navLinkStyle, ...navLinkActive } : navLinkStyle}
    >
      {children}
    </Link>
  );
}

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
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '15px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
};

const logoStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',
  color: 'var(--gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: '900',
  border: '1px solid rgba(197,157,95,.5)',
  flexShrink: 0,
};

const brandName = {
  fontSize: '21px',
  fontWeight: '900',
  color: 'var(--brand)',
};

const brandSubtitle = {
  fontSize: '10px',
  color: 'var(--gold-dark)',
  fontWeight: '800',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
};

const navStyle = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const navLinkStyle = {
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '800',
  padding: '10px 12px',
  borderRadius: '7px',
};

const navLinkActive = {
  color: 'var(--brand)',
  background: 'var(--brand-tint)',
};

const headerActions = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
};

const loginButton = {
  padding: '10px 17px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'var(--brand)',
  fontWeight: '800',
  border: '1px solid var(--brand)',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const dashboardButton = {
  padding: '10px 17px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'var(--on-accent)',
  fontWeight: '800',
  background: 'var(--brand)',
  border: '1px solid var(--brand)',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const signOutButton = {
  padding: '10px 15px',
  borderRadius: '8px',
  color: 'var(--ink-soft)',
  fontWeight: '700',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  fontSize: '13.5px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const mobileMenuButton = {
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--brand)',
  width: '42px',
  height: '42px',
  borderRadius: '9px',
  cursor: 'pointer',
  fontSize: '21px',
  fontWeight: '800',
};

const mobileMenuContainer = {
  borderTop: '1px solid var(--border)',
  background: 'var(--surface)',
  padding: '5px 0',
};

const mobileNavLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '12px 15px',
  borderBottom: '1px solid var(--border)',
  fontWeight: '700',
  fontSize: '14px',
};
