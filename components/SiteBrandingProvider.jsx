'use client';

// Shares the site logo and homepage hero banner image across every
// client component that needs them (SiteHeader, SiteFooter, the
// homepage hero) via React Context, seeded from a server-side fetch
// in the root layout instead of each component fetching it itself on
// mount.
//
// Before this, SiteHeader, SiteFooter and the homepage each ran their
// own useEffect + fetch('/api/homepage-content') independently -- three
// separate network round trips on a single homepage load, and every
// one of them rendered with no logo/image for a moment before its own
// fetch resolved (a visible "pop-in" on every page, and again on every
// client-side navigation, since each component's local state reset).
// Seeding this context from the server means the logo/banner are
// already present in the very first HTML response, and because this
// provider lives in the root layout (never unmounted between page
// navigations), the value also survives client-side navigation with
// no re-fetch and no repeat flash.
import { createContext, useContext } from 'react';

const SiteBrandingContext = createContext({ logoUrl: '', heroImageUrl: '', logoSize: 100 });

export function SiteBrandingProvider({ logoUrl, heroImageUrl, logoSize, children }) {
  return (
    <SiteBrandingContext.Provider
      value={{ logoUrl: logoUrl || '', heroImageUrl: heroImageUrl || '', logoSize: logoSize || 100 }}
    >
      {children}
    </SiteBrandingContext.Provider>
  );
}

export function useSiteBranding() {
  return useContext(SiteBrandingContext);
}
