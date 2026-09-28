"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSiteBranding } from "@/components/SiteBrandingProvider";

// Top-right profile + sign-out dropdown (only rendered when
// `showTopProfile` is on). Style values copied from the student
// portal's equivalent styles in app/login/page.jsx.
const topBarStyles = {
  wrapper: { position: "relative" },
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    font: "inherit",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--brand-dark)",
    color: "var(--on-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 800,
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  nameBlock: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    textAlign: "left",
  },
  name: { fontSize: "14px", fontWeight: 800, color: "var(--ink)" },
  role: { fontSize: "12px", color: "var(--ink-soft)" },
  chevron: {
    color: "var(--ink)",
    fontSize: "18px",
    fontWeight: 900,
    lineHeight: 1,
    transition: "transform .15s ease",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    zIndex: 30,
    width: "260px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    boxShadow: "var(--shadow-card)",
    overflow: "hidden",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderBottom: "1px solid var(--border-soft)",
  },
  dropdownName: {
    fontSize: "14px",
    fontWeight: 800,
    color: "var(--ink)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownMeta: { fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" },
  dropdownFooter: { display: "flex", flexDirection: "column", padding: "6px" },
  dropdownAction: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 10px",
    border: "none",
    background: "transparent",
    borderRadius: "9px",
    font: "inherit",
    fontSize: "13.5px",
    fontWeight: 700,
    color: "var(--ink)",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownActionDanger: { color: "var(--danger)" },
};

function userInitials(name) {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

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
  // --- Optional, additive enhancements (all default off/unused so
  // existing consumers render exactly as before unless they opt in) ---
  // Mini-profile block under the brand row: an avatar (first-letter
  // initial) plus the signed-in user's name/subtitle. Uses the
  // already-fetched `user` state below; pass a `profileSubtitle`
  // (e.g. a role) to show under the name.
  showProfile = false,
  profileSubtitle,
  // Search input pinned above the page title inside `.ih-shell-main`.
  // Controlled by the caller: `searchValue`/`onSearchChange`. Purely
  // decorative unless the caller wires up filtering with them.
  showSearch = false,
  searchValue = "",
  onSearchChange = null,
  searchPlaceholder = "Search…",
  // Top-right profile + sign-out dropdown inside `.ih-shell-main`,
  // matching the student portal's pattern (app/login/page.jsx). When
  // on, this becomes the single, authoritative sign-out control and
  // the sidebar-bottom Logout button below is hidden -- so it must
  // stay opt-in, since 13+ other dashboards still rely on that
  // sidebar button and must keep rendering exactly as before.
  showTopProfile = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logoUrl } = useSiteBranding();
  const [user, setUser] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [internalCurrent, setInternalCurrent] = useState(activeId || navItems[0]?.id);
  // Top-right profile dropdown (only used when `showTopProfile` is on).
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  // Controlled mode (onSelect provided, e.g. a tabbed dashboard driving its own
  // fetches per tab) vs. uncontrolled anchor mode (plain in-page #section jumps).
  const current = onSelect ? activeId : internalCurrent;

  const isRouteMode = navItems.length > 0 && navItems[0].href !== undefined;

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handleOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

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
            {(logoUrl || brandIcon) && (
              <span className="ih-shell-brand-badge" aria-hidden="true">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }}
                  />
                ) : (
                  brandIcon
                )}
              </span>
            )}
            <div>
              <div className="ih-shell-brand">Ulul Azm</div>
              {brandSub && <div className="ih-shell-brand-sub">{brandSub}</div>}
            </div>
          </div>
          {showProfile && user && (
            <div className="ih-shell-profile">
              <span className="ih-shell-avatar" aria-hidden="true">
                {user.name ? user.name.trim().charAt(0).toUpperCase() : "?"}
              </span>
              <div className="ih-shell-profile-text">
                <div className="ih-shell-profile-name">{user.name}</div>
                <div className="ih-shell-profile-sub">
                  {profileSubtitle || user.email}
                </div>
              </div>
            </div>
          )}
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
          {/* Sign Out lives in the top-right dropdown -- and only there --
              when `showTopProfile` is on, per an explicit instruction to
              keep that the single, authoritative control. Every other
              consumer (showTopProfile unset) keeps this button as before. */}
          {!showTopProfile && (
            <button
              onClick={logout}
              className="ih-btn ih-btn-ghost"
              style={{ marginTop: 8, width: "100%", justifyContent: "center", color: "inherit", borderColor: "currentColor", opacity: 0.85 }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>
      <main className="ih-shell-main">
        {showTopProfile ? (
          <div className="ih-shell-topbar">
            {showSearch && (
              <div className="ih-shell-search">
                <span className="ih-shell-search-icon" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            {user && (
              <div style={topBarStyles.wrapper} ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  style={topBarStyles.trigger}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                >
                  <div style={topBarStyles.avatar}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" style={topBarStyles.avatarImage} />
                    ) : (
                      userInitials(user.name)
                    )}
                  </div>
                  <div style={topBarStyles.nameBlock}>
                    <span style={topBarStyles.name}>{user.name}</span>
                    <span style={topBarStyles.role}>{user.role}</span>
                  </div>
                  <span
                    style={{ ...topBarStyles.chevron, transform: profileMenuOpen ? "rotate(180deg)" : "none" }}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {profileMenuOpen && (
                  <div style={topBarStyles.dropdown}>
                    <div style={topBarStyles.dropdownHeader}>
                      <div style={topBarStyles.avatar}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" style={topBarStyles.avatarImage} />
                        ) : (
                          userInitials(user.name)
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={topBarStyles.dropdownName}>{user.name}</div>
                        <div style={topBarStyles.dropdownMeta}>{user.email || user.role}</div>
                      </div>
                    </div>

                    <div style={topBarStyles.dropdownFooter}>
                      {/* Sign Out lives here -- and only here -- per an
                          explicit instruction to remove it from the
                          sidebar and keep this the single, authoritative
                          control. */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        style={{ ...topBarStyles.dropdownAction, ...topBarStyles.dropdownActionDanger }}
                      >
                        <span aria-hidden="true">⇥</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          showSearch && (
            <div className="ih-shell-search">
              <span className="ih-shell-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            </div>
          )
        )}
        {title && <h1>{title}</h1>}
        {subtitle && <div className="sub">{subtitle}</div>}
        {children}
      </main>
    </div>
  );
}
