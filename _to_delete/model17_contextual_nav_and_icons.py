# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

# =======================================================================
# components/SiteHeader.jsx
#   1. New `sectionMode` prop ('bookstore' | 'media' | 'library' | undefined).
#      When set, only Home + that section's own dropdown show in the nav
#      (desktop and mobile) -- Academy, Admission & Registration and the
#      other two of Bookstore/Media/Library are hidden. Search, rightExtra
#      and the portal button are untouched -- pages control those the way
#      the Bookstore page already does via `showSearch`/`rightExtra`.
#   2. Portal button icon: swap the generic CircleUserRound for LogIn
#      (signed out) / LayoutDashboard (signed in) -- a clearer "sign in"
#      vs "go to my dashboard" signal than one static person icon.
#   3. Nav links/dropdown items get a hover/focus shade so the currently
#      highlighted item is visually obvious; the dropdown already stays
#      open until the cursor leaves it (onMouseEnter/onMouseLeave below),
#      that part needed no change.
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "import { CircleUserRound, Search, Menu, X } from 'lucide-react';",
    "import { LayoutDashboard, LogIn, Search, Menu, X } from 'lucide-react';",
    "SiteHeader: swap CircleUserRound import for LayoutDashboard/LogIn",
)

c = r1(
    c,
    "export default function SiteHeader({ rightExtra, showSearch = true }) {",
    "export default function SiteHeader({ rightExtra, showSearch = true, sectionMode }) {",
    "SiteHeader: add sectionMode prop",
)

# --- desktop nav: only Home + the active section's dropdown when sectionMode is set ---
c = r1(
    c,
    "        <nav style={navStyle} className=\"site-header-nav\">\n"
    "          <NavLink href=\"/\">Home</NavLink>\n"
    "          <NavDropdown label=\"Academy\" href=\"/academy\" items={ACADEMY_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Admission & Registration\" href=\"/admission\" items={ADMISSION_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Bookstore\" href=\"/bookstore\" items={BOOKSTORE_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Media\" href=\"/media\" items={MEDIA_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Library\" href=\"/library\" items={LIBRARY_DROPDOWN_ITEMS} />\n"
    "        </nav>",
    "        <nav style={navStyle} className=\"site-header-nav\">\n"
    "          <NavLink href=\"/\">Home</NavLink>\n"
    "          {!sectionMode && (\n"
    "            <NavDropdown label=\"Academy\" href=\"/academy\" items={ACADEMY_DROPDOWN_ITEMS} />\n"
    "          )}\n"
    "          {!sectionMode && (\n"
    "            <NavDropdown label=\"Admission & Registration\" href=\"/admission\" items={ADMISSION_DROPDOWN_ITEMS} />\n"
    "          )}\n"
    "          {(!sectionMode || sectionMode === 'bookstore') && (\n"
    "            <NavDropdown label=\"Bookstore\" href=\"/bookstore\" items={BOOKSTORE_DROPDOWN_ITEMS} />\n"
    "          )}\n"
    "          {(!sectionMode || sectionMode === 'media') && (\n"
    "            <NavDropdown label=\"Media\" href=\"/media\" items={MEDIA_DROPDOWN_ITEMS} />\n"
    "          )}\n"
    "          {(!sectionMode || sectionMode === 'library') && (\n"
    "            <NavDropdown label=\"Library\" href=\"/library\" items={LIBRARY_DROPDOWN_ITEMS} />\n"
    "          )}\n"
    "        </nav>",
    "SiteHeader: desktop nav respects sectionMode",
)

# --- mobile accordions: same section gating, each button+panel pair wrapped together ---
c = r1(
    c,
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setAcademyMobileOpen((open) => !open)}\n"
    "            style={mobileAccordionTrigger}\n"
    "            aria-expanded={academyMobileOpen}\n"
    "            aria-controls=\"mobile-academy-panel\"\n"
    "          >\n"
    "            Academy\n"
    "            <span\n"
    "              aria-hidden=\"true\"\n"
    "              style={{\n"
    "                transform: academyMobileOpen ? 'rotate(180deg)' : 'none',\n"
    "                transition: 'transform 0.15s',\n"
    "              }}\n"
    "            >\n"
    "              ▾\n"
    "            </span>\n"
    "          </button>\n"
    "\n"
    "          {academyMobileOpen && (\n"
    "            <div id=\"mobile-academy-panel\" style={mobileAccordionPanel}>\n"
    "              <Link href=\"/academy\" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                Academy Hub — All Programmes &amp; Documents\n"
    "              </Link>\n"
    "              {ACADEMY_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n",
    "          {!sectionMode && (\n"
    "          <>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setAcademyMobileOpen((open) => !open)}\n"
    "            style={mobileAccordionTrigger}\n"
    "            aria-expanded={academyMobileOpen}\n"
    "            aria-controls=\"mobile-academy-panel\"\n"
    "          >\n"
    "            Academy\n"
    "            <span\n"
    "              aria-hidden=\"true\"\n"
    "              style={{\n"
    "                transform: academyMobileOpen ? 'rotate(180deg)' : 'none',\n"
    "                transition: 'transform 0.15s',\n"
    "              }}\n"
    "            >\n"
    "              ▾\n"
    "            </span>\n"
    "          </button>\n"
    "\n"
    "          {academyMobileOpen && (\n"
    "            <div id=\"mobile-academy-panel\" style={mobileAccordionPanel}>\n"
    "              <Link href=\"/academy\" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                Academy Hub — All Programmes &amp; Documents\n"
    "              </Link>\n"
    "              {ACADEMY_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          </>\n"
    "          )}\n",
    "SiteHeader: gate mobile Academy accordion behind sectionMode",
)

c = r1(
    c,
    "          {admissionMobileOpen && (\n"
    "            <div id=\"mobile-admission-panel\" style={mobileAccordionPanel}>\n"
    "              {ADMISSION_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setBookstoreMobileOpen((open) => !open)}",
    "          {admissionMobileOpen && (\n"
    "            <div id=\"mobile-admission-panel\" style={mobileAccordionPanel}>\n"
    "              {ADMISSION_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          </>\n"
    "          )}\n"
    "          {(!sectionMode || sectionMode === 'bookstore') && (\n"
    "          <>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setBookstoreMobileOpen((open) => !open)}",
    "SiteHeader: gate mobile Admission accordion (start) and open Bookstore's gate",
)

# Close the Admission button's own opening tag was implicit above; now
# wrap its trigger button's preceding markup -- add the opening wrapper
# right before the Admission button itself too.
c = r1(
    c,
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setAdmissionMobileOpen((open) => !open)}",
    "          {!sectionMode && (\n"
    "          <>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setAdmissionMobileOpen((open) => !open)}",
    "SiteHeader: open Admission mobile accordion's sectionMode wrapper",
)

# Close Bookstore's accordion wrapper (its panel end), open Media's.
c = r1(
    c,
    "              {BOOKSTORE_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setMediaMobileOpen((open) => !open)}",
    "              {BOOKSTORE_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          </>\n"
    "          )}\n"
    "\n"
    "          {(!sectionMode || sectionMode === 'media') && (\n"
    "          <>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setMediaMobileOpen((open) => !open)}",
    "SiteHeader: close Bookstore mobile accordion wrapper, open Media's",
)

# Close Media's accordion wrapper, open Library's.
c = r1(
    c,
    "              {MEDIA_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setLibraryMobileOpen((open) => !open)}",
    "              {MEDIA_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          </>\n"
    "          )}\n"
    "\n"
    "          {(!sectionMode || sectionMode === 'library') && (\n"
    "          <>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setLibraryMobileOpen((open) => !open)}",
    "SiteHeader: close Media mobile accordion wrapper, open Library's",
)

# Close Library's accordion wrapper (right before the portal Link).
c = r1(
    c,
    "              {LIBRARY_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          <Link\n"
    "            href={portalHref}",
    "              {LIBRARY_DROPDOWN_ITEMS.map((item) => (\n"
    "                <Link\n"
    "                  key={item.href}\n"
    "                  href={item.href}\n"
    "                  style={mobileAccordionLink}\n"
    "                  onClick={() => setMobileMenuOpen(false)}\n"
    "                >\n"
    "                  {item.label}\n"
    "                </Link>\n"
    "              ))}\n"
    "            </div>\n"
    "          )}\n"
    "          </>\n"
    "          )}\n"
    "          <Link\n"
    "            href={portalHref}",
    "SiteHeader: close Library mobile accordion wrapper",
)

# --- portal button icon swap (desktop) ---
c = r1(
    c,
    "          <Link href={portalHref} style={portalButton}>\n"
    "            <CircleUserRound size={18} strokeWidth={2.2} />\n"
    "            <span>{authChecked ? portalLabel : 'Student Portal'}</span>\n"
    "          </Link>",
    "          <Link href={portalHref} style={portalButton}>\n"
    "            {authChecked && user ? (\n"
    "              <LayoutDashboard size={18} strokeWidth={2.2} />\n"
    "            ) : (\n"
    "              <LogIn size={18} strokeWidth={2.2} />\n"
    "            )}\n"
    "            <span>{authChecked ? portalLabel : 'Student Portal'}</span>\n"
    "          </Link>",
    "SiteHeader: desktop portal button icon swap",
)

# --- portal button icon swap (mobile) ---
c = r1(
    c,
    "            <CircleUserRound size={16} strokeWidth={2.2} />\n"
    "            {authChecked ? portalLabel : 'Student Portal'}\n"
    "          </Link>\n"
    "        </div>\n"
    "      )}",
    "            {authChecked && user ? (\n"
    "              <LayoutDashboard size={16} strokeWidth={2.2} />\n"
    "            ) : (\n"
    "              <LogIn size={16} strokeWidth={2.2} />\n"
    "            )}\n"
    "            {authChecked ? portalLabel : 'Student Portal'}\n"
    "          </Link>\n"
    "        </div>\n"
    "      )}",
    "SiteHeader: mobile portal link icon swap",
)

# --- hover/focus shading on nav links and dropdown items ---
c = r1(
    c,
    "function NavLink({ href, children }) {\n"
    "  return (\n"
    "    <Link href={href} style={navLink}>\n"
    "      {children}\n"
    "    </Link>\n"
    "  );\n"
    "}",
    "function NavLink({ href, children }) {\n"
    "  return (\n"
    "    <Link href={href} style={navLink} className=\"uai-nav-link\">\n"
    "      {children}\n"
    "    </Link>\n"
    "  );\n"
    "}",
    "SiteHeader: NavLink gets hover-shade class",
)

c = r1(
    c,
    "      <Link\n"
    "        href={href}\n"
    "        style={navDropdownTrigger}\n"
    "        onClick={() => setOpen(false)}\n"
    "        onFocus={() => setOpen(true)}\n"
    "        aria-haspopup=\"true\"\n"
    "        aria-expanded={open}\n"
    "      >",
    "      <Link\n"
    "        href={href}\n"
    "        style={navDropdownTrigger}\n"
    "        className=\"uai-nav-link\"\n"
    "        onClick={() => setOpen(false)}\n"
    "        onFocus={() => setOpen(true)}\n"
    "        aria-haspopup=\"true\"\n"
    "        aria-expanded={open}\n"
    "      >",
    "SiteHeader: NavDropdown trigger gets hover-shade class",
)

c = r1(
    c,
    "            <Link key={item.href} href={item.href} style={navDropdownItem} role=\"menuitem\" onClick={() => setOpen(false)}>\n"
    "              {item.label}\n"
    "            </Link>",
    "            <Link\n"
    "              key={item.href}\n"
    "              href={item.href}\n"
    "              style={navDropdownItem}\n"
    "              className=\"uai-nav-dropdown-item\"\n"
    "              role=\"menuitem\"\n"
    "              onClick={() => setOpen(false)}\n"
    "            >\n"
    "              {item.label}\n"
    "            </Link>",
    "SiteHeader: NavDropdown item gets hover-shade class",
)

c = r1(
    c,
    "        @media (max-width: 700px) {\n"
    "          .mobile-menu-button-container {\n"
    "            padding-left: 16px;\n"
    "            padding-right: 16px;\n"
    "          }\n"
    "        }\n"
    "      `}</style>\n"
    "    </header>",
    "        @media (max-width: 700px) {\n"
    "          .mobile-menu-button-container {\n"
    "            padding-left: 16px;\n"
    "            padding-right: 16px;\n"
    "          }\n"
    "        }\n"
    "      `}</style>\n"
    "\n"
    "      <style jsx global>{`\n"
    "        .uai-nav-link,\n"
    "        .uai-nav-dropdown-item {\n"
    "          transition: background-color 0.15s ease, color 0.15s ease;\n"
    "        }\n"
    "\n"
    "        .uai-nav-link:hover,\n"
    "        .uai-nav-link:focus-visible {\n"
    "          background-color: var(--brand-tint);\n"
    "          color: var(--brand);\n"
    "        }\n"
    "\n"
    "        .uai-nav-dropdown-item:hover,\n"
    "        .uai-nav-dropdown-item:focus-visible {\n"
    "          background-color: var(--brand-tint);\n"
    "          color: var(--brand);\n"
    "        }\n"
    "      `}</style>\n"
    "    </header>",
    "SiteHeader: add hover-shade global style block",
)

save(path, c)
print("components/SiteHeader.jsx: sectionMode prop, portal icon swap, and nav hover shading applied.")

# =======================================================================
# app/bookstore/page.jsx -- turn on the new sectionMode so the Bookstore
# page's header matches the requested minimal list (Home, Bookstore,
# then its own currency/cart/dashboard controls -- nothing else).
# =======================================================================
path = "app/bookstore/page.jsx"
c = load(path)

c = r1(
    c,
    "      <SiteHeader\n"
    "        showSearch={false}\n"
    "        rightExtra={",
    "      <SiteHeader\n"
    "        showSearch={false}\n"
    "        sectionMode=\"bookstore\"\n"
    "        rightExtra={",
    "bookstore page: turn on SiteHeader sectionMode",
)

save(path, c)
print("app/bookstore/page.jsx: now uses SiteHeader's sectionMode=\"bookstore\".")

# =======================================================================
# components/MediaNav.jsx -- this is a SEPARATE, older nav implementation
# from before SiteHeader existed (Media/Library mount their own nav via
# app/media/layout.jsx / app/library/layout.jsx, not SiteHeader) -- so
# it never picked up the Bookstore/Media/Library dropdown work done on
# SiteHeader, and still shows the full flat Academy/Admission/Bookstore/
# Media/Library link row the user asked to simplify. Trimmed to the
# requested Home / Media / Subscription Plans, kept its real, working
# Dashboard + Sign Out (server-resolved auth, unlike SiteHeader's own
# client-fetched state), and swapped in a lucide icon for Sign In.
# =======================================================================
path = "components/MediaNav.jsx"
c = load(path)

c = r1(
    c,
    "import { usePathname } from 'next/navigation';",
    "import { usePathname } from 'next/navigation';\n"
    "import { LogIn } from 'lucide-react';",
    "MediaNav: import LogIn icon",
)

c = r1(
    c,
    "        <nav style={navStyle}>\n"
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/academy\" active={isActive('/academy')}>Academy</NavLink>\n"
    "          <NavLink href=\"/admission\" active={isActive('/admission')}>Admission</NavLink>\n"
    "          <NavLink href=\"/bookstore\" active={isActive('/bookstore')}>Bookstore</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n"
    "          <NavLink href=\"/library\" active={isActive('/library')}>Library</NavLink>\n"
    "          <NavLink href=\"/media#plans\">Subscription Plans</NavLink>\n"
    "        </nav>",
    "        <nav style={navStyle}>\n"
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n"
    "          <NavLink href=\"/media#plans\">Subscription Plans</NavLink>\n"
    "        </nav>",
    "MediaNav: trim desktop nav to Home / Media / Subscription Plans",
)

c = r1(
    c,
    "            <Link href=\"/account?next=/media\" style={loginButton}>\n"
    "              Sign In / Register\n"
    "            </Link>",
    "            <Link href=\"/account?next=/media\" style={loginButton}>\n"
    "              <LogIn size={16} strokeWidth={2.2} />\n"
    "              Sign In / Register\n"
    "            </Link>",
    "MediaNav: add LogIn icon to the sign-in link",
)

c = r1(
    c,
    "const loginButton = {\n"
    "  padding: '10px 17px',\n"
    "  borderRadius: '8px',\n"
    "  textDecoration: 'none',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: '800',\n"
    "  border: '1px solid var(--brand)',\n"
    "  fontSize: '14px',\n"
    "  whiteSpace: 'nowrap',\n"
    "};",
    "const loginButton = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '6px',\n"
    "  padding: '10px 17px',\n"
    "  borderRadius: '8px',\n"
    "  textDecoration: 'none',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: '800',\n"
    "  border: '1px solid var(--brand)',\n"
    "  fontSize: '14px',\n"
    "  whiteSpace: 'nowrap',\n"
    "};",
    "MediaNav: loginButton style becomes a flex row for the icon",
)

c = r1(
    c,
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/academy\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Academy\n"
    "          </Link>\n"
    "          <Link href=\"/admission\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Admission\n"
    "          </Link>\n"
    "          <Link href=\"/bookstore\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Bookstore\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n"
    "          <Link href=\"/library\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Library\n"
    "          </Link>\n"
    "          <Link href=\"/media#plans\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Subscription Plans\n"
    "          </Link>",
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n"
    "          <Link href=\"/media#plans\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Subscription Plans\n"
    "          </Link>",
    "MediaNav: trim mobile nav to Home / Media / Subscription Plans",
)

save(path, c)
print("components/MediaNav.jsx: trimmed to the requested minimal nav, sign-in now has a lucide icon.")

# =======================================================================
# components/LibraryNav.jsx -- same second-copy-of-truth issue as
# MediaNav. Trimmed to exactly what was requested: Home + Library, with
# no other section links and no account controls in the header (the
# user's spec for Library was just "Home Library", unlike Media/
# Bookstore which explicitly kept Dashboard/Sign Out/Cart).
# =======================================================================
path = "components/LibraryNav.jsx"
c = load(path)

c = r1(
    c,
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    "  const [signingOut, setSigningOut] = useState(false);\n"
    "\n"
    "  async function handleSignOut() {\n"
    "    setSigningOut(true);\n"
    "    try {\n"
    "      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });\n"
    "    } catch (err) {\n"
    "      // Non-fatal — still send the user back to a signed-out view.\n"
    "    }\n"
    "    window.location.href = '/library';\n"
    "  }\n"
    "\n"
    "  const isActive = (href) => pathname === href;",
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    "\n"
    "  const isActive = (href) => pathname === href;",
    "LibraryNav: drop the now-unused sign-out state/handler",
)

c = r1(
    c,
    "        <nav style={navStyle}>\n"
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/academy\" active={isActive('/academy')}>Academy</NavLink>\n"
    "          <NavLink href=\"/admission\" active={isActive('/admission')}>Admission</NavLink>\n"
    "          <NavLink href=\"/bookstore\" active={isActive('/bookstore')}>Bookstore</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n"
    "          <NavLink href=\"/library\" active={isActive('/library')}>Library</NavLink>\n"
    "        </nav>\n"
    "\n"
    "        <div style={headerActions}>\n"
    "          {user ? (\n"
    "            <>\n"
    "              <Link href=\"/dashboard\" style={dashboardButton}>\n"
    "                My Dashboard\n"
    "              </Link>\n"
    "              <button\n"
    "                type=\"button\"\n"
    "                onClick={handleSignOut}\n"
    "                disabled={signingOut}\n"
    "                style={signOutButton}\n"
    "              >\n"
    "                {signingOut ? 'Signing out…' : 'Sign Out'}\n"
    "              </button>\n"
    "            </>\n"
    "          ) : (\n"
    "            <Link href=\"/account?next=/library\" style={loginButton}>\n"
    "              Sign In / Register\n"
    "            </Link>\n"
    "          )}\n"
    "        </div>",
    "        <nav style={navStyle}>\n"
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/library\" active={isActive('/library')}>Library</NavLink>\n"
    "        </nav>",
    "LibraryNav: trim desktop nav to Home / Library, drop account controls",
)

c = r1(
    c,
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/academy\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Academy\n"
    "          </Link>\n"
    "          <Link href=\"/admission\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Admission\n"
    "          </Link>\n"
    "          <Link href=\"/bookstore\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Bookstore\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n"
    "          <Link href=\"/library\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Library\n"
    "          </Link>\n"
    "\n"
    "          {user ? (\n"
    "            <>\n"
    "              <Link href=\"/dashboard\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                My Dashboard\n"
    "              </Link>\n"
    "              <Link href=\"/account\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                My Account\n"
    "              </Link>\n"
    "              <button\n"
    "                type=\"button\"\n"
    "                onClick={() => {\n"
    "                  setMobileMenuOpen(false);\n"
    "                  handleSignOut();\n"
    "                }}\n"
    "                style={{ ...mobileNavLink, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}\n"
    "              >\n"
    "                Sign Out\n"
    "              </button>\n"
    "            </>\n"
    "          ) : (\n"
    "            <Link\n"
    "              href=\"/account?next=/library\"\n"
    "              style={mobileNavLink}\n"
    "              onClick={() => setMobileMenuOpen(false)}\n"
    "            >\n"
    "              Sign In / Register\n"
    "            </Link>\n"
    "          )}",
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/library\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Library\n"
    "          </Link>",
    "LibraryNav: trim mobile nav to Home / Library, drop account controls",
)

save(path, c)
print("components/LibraryNav.jsx: trimmed to the requested Home / Library minimal nav.")
