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
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "components/SiteHeader.jsx"
c = load(path)

# 1. Add ADMISSION_DROPDOWN_ITEMS -- real existing pages only (Apply Now,
#    Admission Requirements on Academy Pathways, Track Your Application).
c = r1(
    c,
    "const RESULT_GROUPS = [",
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];\n\n"
    "const RESULT_GROUPS = [",
    "add ADMISSION_DROPDOWN_ITEMS",
)

# 2. Accept a showSearch prop (default true) -- Bookstore already has its
#    own real product search, so it hides this one instead of stacking a
#    second, redundant search box.
c = r1(
    c,
    "export default function SiteHeader({ rightExtra }) {",
    "export default function SiteHeader({ rightExtra, showSearch = true }) {",
    "add showSearch prop",
)

# 3. Add admissionMobileOpen state, next to academyMobileOpen.
c = r1(
    c,
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);\n",
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);\n"
    "  const [admissionMobileOpen, setAdmissionMobileOpen] = useState(false);\n",
    "add admissionMobileOpen state",
)

# 4. Reset it on route change too.
c = r1(
    c,
    "    setMobileMenuOpen(false);\n    setAcademyMobileOpen(false);\n  }, [pathname]);",
    "    setMobileMenuOpen(false);\n    setAcademyMobileOpen(false);\n    setAdmissionMobileOpen(false);\n  }, [pathname]);",
    "reset admissionMobileOpen on route change",
)

# 5. Desktop nav: Admission & Registration becomes a dropdown, matching
#    Academy's pattern, instead of a single flat link.
c = r1(
    c,
    '          <NavLink href="/admission">Admission &amp; Registration</NavLink>\n',
    "          <NavDropdown label=\"Admission & Registration\" href=\"/admission\" items={ADMISSION_DROPDOWN_ITEMS} />\n",
    "desktop: Admission dropdown",
)

# 6. Desktop search -- only rendered when showSearch is true.
OLD_DESKTOP_SEARCH_OPEN = """        <div style={headerActions}>
          <div ref={searchBoxRef} style={searchWrap}>"""
NEW_DESKTOP_SEARCH_OPEN = """        <div style={headerActions}>
          {showSearch && (
          <div ref={searchBoxRef} style={searchWrap}>"""
c = r1(c, OLD_DESKTOP_SEARCH_OPEN, NEW_DESKTOP_SEARCH_OPEN, "desktop search: open showSearch guard")

OLD_DESKTOP_SEARCH_CLOSE = """                )}
              </div>
            )}
          </div>

          {rightExtra}"""
NEW_DESKTOP_SEARCH_CLOSE = """                )}
              </div>
            )}
          </div>
          )}

          {rightExtra}"""
c = r1(c, OLD_DESKTOP_SEARCH_CLOSE, NEW_DESKTOP_SEARCH_CLOSE, "desktop search: close showSearch guard")

# 7. Un-box the Student Portal button -- icon + label, no pill/border,
#    matching a plain nav link instead of sitting inside a rectangle.
c = r1(
    c,
    "const portalButton = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '7px',\n"
    "  padding: '9px 16px',\n"
    "  borderRadius: '8px',\n"
    "  textDecoration: 'none',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: '800',\n"
    "  border: '1px solid var(--brand)',\n"
    "  fontSize: '13.5px',\n"
    "};",
    "const portalButton = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '6px',\n"
    "  padding: '8px 4px',\n"
    "  textDecoration: 'none',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: '800',\n"
    "  fontSize: '13.5px',\n"
    "};",
    "un-box portalButton style",
)

# 8. Mobile search -- only rendered when showSearch is true.
OLD_MOBILE_SEARCH = """      {mobileMenuOpen && (
        <div style={mobileMenuContainer}>
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

          {query.trim().length >= 2 && (
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
            Home"""
NEW_MOBILE_SEARCH = """      {mobileMenuOpen && (
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
            Home"""
c = r1(c, OLD_MOBILE_SEARCH, NEW_MOBILE_SEARCH, "mobile search: showSearch guards")

# 9. Mobile nav: Admission & Registration becomes an accordion too,
#    matching the Academy one right above it.
OLD_MOBILE_ADMISSION = """          <Link href="/admission" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            Admission &amp; Registration
          </Link>"""
NEW_MOBILE_ADMISSION = """          <button
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
              {ADMISSION_DROPDOWN_ITEMS.map((item) => (
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
          )}"""
c = r1(c, OLD_MOBILE_ADMISSION, NEW_MOBILE_ADMISSION, "mobile: Admission accordion")

save(path, c)
print("components/SiteHeader.jsx: Admission dropdown, un-boxed portal button, showSearch prop wired.")
