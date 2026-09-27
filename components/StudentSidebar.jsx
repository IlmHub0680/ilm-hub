'use client';

// ============================================================
// STUDENT SIDEBAR -- shared between the student portal SPA
// (app/login/page.jsx, tab-based navigation) and the dedicated
// /academics/* page tree (app/academics/layout.jsx's
// AcademicsShell, route-based navigation), so both show the exact
// same persistent, always-expanded sidebar with no visual seam
// when moving between the two.
//
// This owns only presentation + the category-collapse UI state --
// the menu structure itself, active-item detection, and the
// sign-out action are all supplied by the caller so neither call
// site's own logic (activeStudentTab vs. usePathname, in-page
// handleLogout vs. router.push('/login')) has to move or change.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';

// One category shape: { id, label, items: [{ id, href?, label, icon, badge? }] }
// An item with `href` renders as a real <Link>; one without renders as a
// <button> and calls onItemSelect(item) so the caller can drive its own
// local tab state.

export default function StudentSidebar({
  categories,
  isItemActive,
  onItemSelect,
  brandTitle = 'Ulul Azm',
  brandSubtitle = 'Student Portal',
  profileName,
  profileSubtitle,
  profileImage,
  onSignOut,
  isTouchViewport = false,
  mobileOpen = false,
  onCloseMobile,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (categoryId) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isCategoryOpen = (category) => {
    const containsActiveItem = category.items.some(isItemActive);
    if (containsActiveItem) return true;
    return !collapsedCategories[category.id];
  };

  return (
    <>
      {isTouchViewport && mobileOpen && (
        <div
          className="ih-sidebar-scrim"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`ih-student-sidebar${
          isTouchViewport ? ' ih-sidebar-mobile' : ''
        }${isTouchViewport && mobileOpen ? ' ih-sidebar-mobile-open' : ''}`}
      >
        <div className="ih-sb-brand">
          <div className="ih-sb-brand-mark">UA</div>

          <div>
            <div className="ih-sb-brand-title">{brandTitle}</div>
            <div className="ih-sb-brand-subtitle">{brandSubtitle}</div>
          </div>
        </div>

        {(profileName || profileSubtitle) && (
          <div className="ih-sb-mini-profile">
            <div className="ih-sb-avatar">
              {profileImage ? (
                <img src={profileImage} alt="" className="ih-sb-avatar-image" />
              ) : (
                (profileName || '?').charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="ih-sb-mini-name">{profileName}</div>
              {profileSubtitle && (
                <div className="ih-sb-mini-id">{profileSubtitle}</div>
              )}
            </div>
          </div>
        )}

        <div className="ih-sb-menu">
          {categories.map((category) => {
            const categoryOpen = isCategoryOpen(category);

            return (
              <div key={category.id} className="ih-sb-category">
                {/* A "flat" category (e.g. the single-item Dashboard
                    entry) has nothing worth collapsing -- its own
                    heading row would just repeat the one item below it
                    ("Dashboard" then "🏠 Dashboard"), so it renders
                    straight through with no heading/chevron at all. */}
                {!category.flat && (
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="ih-sb-category-heading"
                  >
                    <span>{category.label}</span>
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-block',
                        transition: 'transform .15s ease',
                        transform: categoryOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    >
                      ▾
                    </span>
                  </button>
                )}

                {(category.flat || categoryOpen) &&
                  category.items.map((item) => {
                    const active = isItemActive(item);

                    return item.href ? (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`ih-sb-item${active ? ' ih-sb-item-active' : ''}`}
                      >
                        <span className="ih-sb-item-icon">{item.icon}</span>
                        <span className="ih-sb-item-text">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="ih-sb-item-badge">{item.badge}</span>
                        )}
                      </Link>
                    ) : (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onItemSelect && onItemSelect(item)}
                        className={`ih-sb-item${active ? ' ih-sb-item-active' : ''}`}
                      >
                        <span className="ih-sb-item-icon">{item.icon}</span>
                        <span className="ih-sb-item-text">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="ih-sb-item-badge">{item.badge}</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* Sign Out intentionally lives in exactly one place -- the
            top-bar profile dropdown in app/login/page.jsx -- per an
            explicit later instruction reversing an earlier choice, so
            it is not duplicated here even though `onSignOut` is still
            accepted as a prop (kept for API stability; simply unused
            for now). A student on a /academics/* page reaches it via
            the "Back to Student Portal" link, one click away. */}
      </aside>
    </>
  );
}
