"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Shared staff-dashboard shell: persistent sidebar (brand, section nav,
 * signed-in user, logout) + a main content column.
 *
 * Nav items support two modes:
 *
 * - Route mode (preferred): pass `navItems` as [{ href, label, icon }].
 *   Each entry is a real Next.js route rendered with <Link>; the active
 *   item is whichever `href` matches (or prefixes) the current
 *   pathname. Put this shell in a `layout.jsx` so the sidebar persists
 *   across navigations while `children` (a real page per section) is
 *   swapped in — refresh, back/forward, and direct linking all work
 *   because each section is an actual route.
 *
 * - Legacy anchor/tab mode: pass `navItems` as [{ id, label, icon }]
 *   plus `activeId` (and optionally `onSelect` for a client-state tab
 *   switch instead of an in-page `#anchor` jump). Kept only for
 *   dashboards not yet migrated to real routes — prefer route mode for
 *   any new or updated dashboard.
 */
export default function DashboardShell({
  brandSub,
  brandIcon,
  navItems = [],
  activeId,
  onSelect = null,
  title,
  subtitle,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [internalCurrent, setInternalCurrent] = useState(activeId || navItems[0]?.id);
  // Controlled mode (onSelect provided, e.g. a tabbed dashboard driving its own
  // fetches per tab) vs. uncontrolled anchor mode (plain in-page #section jumps).
  const current = onSelect ? activeId : internalCurrent;

  const isRouteMode = navItems.length > 0 && navItems[0].href !== undefined;

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success) setUser(result.user);
      })
      .catch(() => {});
  }, []);

  // Model 32 §1: a dashboard/system switcher for a staff member whose
  // position legitimately grants edit access to more than one
  // department's dashboard -- see getStaffDestinations() in
  // lib/permissions.ts. Hidden entirely (not just a disabled single
  // option) when there's nothing to switch to, which is the common
  // case: most positions map to exactly one dashboard.
  useEffect(() => {
    fetch("/api/auth/staff-destinations", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success && Array.isArray(result.destinations)) {
          setDestinations(result.destinations);
        }
      })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/staff-login");
    router.refresh();
  };

  return (
    <div className="ih-shell">
      <nav className="ih-shell-nav">
        <div>
          <div className="ih-shell-brand-row">
            {brandIcon && (
              <span className="ih-shell-brand-badge" aria-hidden="true">
                {brandIcon}
              </span>
            )}
            <div>
              <div className="ih-shell-brand">Ulul Azm</div>
              {brandSub && <div className="ih-shell-brand-sub">{brandSub}</div>}
            </div>
          </div>
          {isRouteMode
            ? navItems.map((item) => {
                // Plain prefix-match, except when an item opts into
                // `exact` (e.g. a dashboard root like /admin that is
                // also the shared URL namespace for sibling routes
                // outside this nav — without `exact` it would light up
                // as active on every one of those sibling pages too).
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                    {item.icon ? (
                      <span className="ih-shell-nav-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    ) : (
                      <span className="dot" />
                    )}
                    {item.label}
                  </Link>
                );
              })
            : navItems.map((item) => (
                <a
                  key={item.id}
                  href={onSelect ? undefined : `#${item.id}`}
                  className={item.id === current ? "active" : ""}
                  onClick={(e) => {
                    if (onSelect) {
                      e.preventDefault();
                      onSelect(item.id);
                    } else {
                      setInternalCurrent(item.id);
                    }
                  }}
                  style={onSelect ? { cursor: "pointer" } : undefined}
                >
                  {item.icon ? (
                    <span className="ih-shell-nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  ) : (
                    <span className="dot" />
                  )}
                  {item.label}
                </a>
              ))}
        </div>
        <div className="ih-shell-nav-foot">
          {user ? (
            <>
              {user.name}
              <br />
              {user.email}
            </>
          ) : (
            " "
          )}
          {destinations.length > 1 && (
            <select
              value={destinations.find((d) => pathname?.startsWith(d.href))?.href || ""}
              onChange={(e) => {
                if (e.target.value) router.push(e.target.value);
              }}
              className="ih-btn ih-btn-ghost"
              style={{
                marginTop: 10, width: "100%", color: "inherit",
                borderColor: "currentColor", opacity: 0.85,
                background: "transparent", cursor: "pointer",
              }}
              aria-label="Switch dashboard"
            >
              <option value="" disabled>Switch Dashboard…</option>
              {destinations.map((d) => (
                <option key={d.href} value={d.href} style={{ color: "#000" }}>
                  {d.label}
                </option>
              ))}
            </select>
          )}
          <Link
            href="/staff-payroll"
            className="ih-btn ih-btn-ghost"
            style={{ marginTop: 10, width: "100%", justifyContent: "center", color: "inherit", borderColor: "currentColor", opacity: 0.85, textDecoration: "none", display: "flex" }}
          >
            My Payslip
          </Link>
          <button
            onClick={logout}
            className="ih-btn ih-btn-ghost"
            style={{ marginTop: 8, width: "100%", justifyContent: "center", color: "inherit", borderColor: "currentColor", opacity: 0.85 }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="ih-shell-main">
        {title && <h1>{title}</h1>}
        {subtitle && <div className="sub">{subtitle}</div>}
        {children}
      </main>
    </div>
  );
}
