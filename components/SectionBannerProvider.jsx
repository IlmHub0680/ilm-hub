'use client';

// Shares one section's banner image (Bookstore, Media or Library) with
// the client page that renders it, seeded from a server-side fetch in
// that section's own layout.jsx instead of the page fetching it itself
// on mount. Same reasoning and pattern as SiteBrandingProvider for the
// site logo/hero image: without this, each page showed its plain
// gradient background for a moment before its own client fetch
// resolved, then popped in the banner image -- a visible delay/flash
// on every load. Seeding from the server means the banner is already
// present in the very first HTML response.
import { createContext, useContext } from 'react';

const SectionBannerContext = createContext('');

export function SectionBannerProvider({ bannerUrl, children }) {
  return (
    <SectionBannerContext.Provider value={bannerUrl || ''}>
      {children}
    </SectionBannerContext.Provider>
  );
}

export function useSectionBanner() {
  return useContext(SectionBannerContext);
}
