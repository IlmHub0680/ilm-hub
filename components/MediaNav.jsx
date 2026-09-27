'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';

/*
 * Shared header/navigation for the Media area
 * (/media and /media/[slug]).
 *
 * `user` is the real, server-resolved session user (from getCurrentUser()
 * in app/media/layout.jsx) — not client-guessed state — so the
 * Sign In/Register vs. My Media Dashboard/Sign Out links always reflect
 * actual authentication.
 *
 * Visual language matches the homepage header (app/page.jsx): sticky bar,
 * brand mark, deep-green/gold Ulul Azm tokens.
 */
export default function MediaNav({ user }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      // Non-fatal — still send the user back to a signed-out view.
    }
    window.location.href = '/media';
  }

  const isActive = (href) => pathname === href;

  return (
    <header style={headerStyle}>
      <div style={headerInner}>
        <Link href="/" style={brandStyle}>
          <div style={logoStyle}>ع</div>
          <div>
            <div style={brandName}>Ulul Azm</div>
            <div style={brandSubtitle}>Media</div>
          </div>
        </Link>

        <nav style={navStyle}>
          <NavLink href="/" active={isActive('/')}>Home</NavLink>
          <NavLink href="/media" active={isActive('/media')}>Media</NavLink>
          <NavLink href="/media#plans">Subscription Plans</NavLink>
        </nav>

        <div style={headerActions}>
          {user ? (
            <>
              <Link href="/account/media" style={dashboardButton}>
                My Media Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                style={signOutButton}
              >
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </>
          ) : (
            <Link href="/account?next=/media" style={loginButton}>
              <LogIn size={16} strokeWidth={2.2} />
              Sign In / Register
            </Link>
          )}
        </div>

        <div className="mlnav-mobile-btn-container">
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
        .mlnav-mobile-btn-container {
          display: none;
        }

        @media (max-width: 900px) {
          nav {
            display: none !important;
          }

          .mlnav-mobile-btn-container {
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
          <Link href="/media" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Media
          </Link>
          <Link href="/media#plans" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Subscription Plans
          </Link>

          {user ? (
            <>
              <Link href="/account/media" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                My Media Dashboard
              </Link>
              <Link href="/account" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                My Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                style={{ ...mobileNavLink, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/account?next=/media"
              style={mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In / Register
            </Link>
          )}
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
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
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
