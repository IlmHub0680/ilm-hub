# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "app/page.jsx"
c = load(path)

# 1. Add mobile accordion state next to the existing mobile menu state.
c = r1(
    c,
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);",
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);",
    "page.jsx: add academyMobileOpen state",
)

# 2. Desktop nav: replace the plain Academy NavLink with a real dropdown.
c = r1(
    c,
    """            <NavLink href="/academy">
              Academy
            </NavLink>""",
    """            <NavDropdown label="Academy" href="/academy" items={ACADEMY_DROPDOWN_ITEMS} />""",
    "page.jsx: desktop Academy -> NavDropdown",
)

# 3. Mobile nav: replace the plain Academy link with an accordion toggle
#    (its own "Academy Hub" link stays first inside the revealed panel,
#    so tapping "Academy" itself never dead-ends -- it just expands).
c = r1(
    c,
    """            <Link
              href="/academy"
              style={mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Academy
            </Link>""",
    """            <button
              type="button"
              onClick={() => setAcademyMobileOpen((open) => !open)}
              style={{
                ...mobileNavLink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                textAlign: 'left',
                cursor: 'pointer',
                font: 'inherit',
              }}
              aria-expanded={academyMobileOpen}
              aria-controls="mobile-academy-panel"
            >
              Academy
              <span
                aria-hidden="true"
                style={{
                  transform: academyMobileOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }}
              >
                ▾
              </span>
            </button>

            {academyMobileOpen && (
              <div id="mobile-academy-panel" style={mobileAccordionPanel}>
                <Link
                  href="/academy"
                  style={mobileAccordionLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Academy Hub — All Programmes &amp; Documents
                </Link>
                {ACADEMY_DROPDOWN_ITEMS.map((item) => (
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
            )}""",
    "page.jsx: mobile Academy -> accordion",
)

save(path, c)
print("app/page.jsx: header dropdown/accordion wired in.")

# 4. NavDropdown component, right after NavLink.
c = load(path)
c = r1(
    c,
    """function NavLink({ href, children }) {
  return (
    <Link href={href} style={navLink}>
      {children}
    </Link>
  );
}""",
    """function NavLink({ href, children }) {
  return (
    <Link href={href} style={navLink}>
      {children}
    </Link>
  );
}

// A hover/focus dropdown for a nav item that has its own sub-pages --
// clicking or tapping Enter still navigates straight to `href` (the
// section's hub page), the caret only reveals the sub-page shortcuts.
// Desktop only; the mobile menu uses its own accordion pattern below.
function NavDropdown({ label, href, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={navDropdownWrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        style={navDropdownTrigger}
        onClick={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <span
          aria-hidden="true"
          style={{
            fontSize: '10px',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        >
          ▾
        </span>
      </Link>

      {open && (
        <div
          style={navDropdownPanel}
          role="menu"
          aria-label={`${label} sections`}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={navDropdownItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}""",
    "page.jsx: add NavDropdown component",
)
save(path, c)
print("app/page.jsx: NavDropdown component added.")

# 5. Data + styles, placed alongside the other nav-related consts.
c = load(path)
c = r1(
    c,
    "const navStyle = {",
    """const ACADEMY_DROPDOWN_ITEMS = [
  { label: 'Academy Foundation', href: '/academy-foundation' },
  { label: 'Academy Governance', href: '/academy-governance' },
  { label: 'Academy Pathways', href: '/academy-pathways' },
  { label: 'Academy Curriculum', href: '/academy-curriculum' },
  { label: 'Department Curriculum', href: '/academy-department-curriculum' },
  { label: 'Course Catalogue', href: '/academy-course-catalogue' },
  { label: 'Course Specifications', href: '/academy-course-specifications' },
  { label: 'Assessment & Grading', href: '/academy-assessment-grading' },
  { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },
  { label: 'Faculty & Portals', href: '/academy-faculty-portals' },
  { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },
  { label: 'Website & Master Integration', href: '/academy-master-integration' },
];

const navStyle = {""",
    "page.jsx: add ACADEMY_DROPDOWN_ITEMS",
)

c = r1(
    c,
    """const mobileNavLink = {""",
    """const navDropdownWrap = {
  position: 'relative',
  display: 'inline-block',
};

const navDropdownTrigger = {
  ...navLink,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const navDropdownPanel = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  minWidth: '270px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  boxShadow: 'var(--shadow-raised)',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  zIndex: 40,
};

const navDropdownItem = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '700',
  padding: '9px 10px',
  borderRadius: 'var(--radius-s)',
};

const mobileAccordionPanel = {
  background: 'var(--brand-tint)',
  borderBottom: '1px solid var(--border)',
};

const mobileAccordionLink = {
  display: 'block',
  color: 'var(--ink-soft)',
  textDecoration: 'none',
  padding: '11px 15px 11px 30px',
  borderTop: '1px solid var(--border-soft)',
  fontSize: '13px',
  fontWeight: '700',
};

const mobileNavLink = {""",
    "page.jsx: add dropdown/accordion styles",
)
save(path, c)
print("app/page.jsx: dropdown data + styles added.")
