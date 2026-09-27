'use client';

// Shares the current logged-in user across every client component that
// needs it (SiteHeader today) via React Context, seeded from a
// server-side session check in the root layout -- mirrors
// SiteBrandingProvider's pattern exactly, for the same reason.
//
// Before this, SiteHeader ran its own useEffect + fetch('/api/auth/me')
// on mount, on every single page load and every client-side
// navigation. Because that fetch takes a moment, SiteHeader always
// rendered its logged-out label ("Student Portal") FIRST and only
// flipped to "Dashboard" after the round trip resolved -- a visible
// flash/delay for every signed-in visitor, on every page, exactly the
// "dashboard delays before it comes to what it was set" symptom.
// Seeding this context from the root layout (which already reads the
// session cookie server-side, the same way app/dashboard/page.jsx
// does) means the correct label is present in the very first HTML
// response: no flash, no round trip, no delay.
import { createContext, useContext } from 'react';

const SiteAuthContext = createContext({ user: null, destination: null });

export function SiteAuthProvider({ user, destination, children }) {
  return (
    <SiteAuthContext.Provider value={{ user: user || null, destination: destination || null }}>
      {children}
    </SiteAuthContext.Provider>
  );
}

export function useSiteAuth() {
  return useContext(SiteAuthContext);
}
