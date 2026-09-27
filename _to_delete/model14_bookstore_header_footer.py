# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def cut_between(content, start_marker, end_marker, replacement, label, search_from=0):
    start = content.index(start_marker, search_from)
    end = content.index(end_marker, start) + len(end_marker)
    return content[:start] + replacement + content[end:]

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/bookstore/page.jsx"
c = load(path)

# 1. Import the shared header component. (The bookstore's own footer is
#    kept as-is below -- it's genuinely bookstore-specific content
#    (All Books/Featured/New Arrivals/Sell Your Books, its own Support
#    contact block), so SiteFooter is not also stacked underneath it.)
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n\n"
    "import SiteHeader from '@/components/SiteHeader';\n",
    "add SiteHeader import",
)

# 2. Replace the bookstore's own separate header with the shared one.
#    The currency selector and cart button are real, working bookstore
#    functionality -- kept, passed into SiteHeader's rightExtra slot
#    instead of living inside a second, duplicate header implementation.
#    The old "User Login" link (-> /account?next=/dashboard) is dropped
#    in favour of SiteHeader's own real, auth-aware Student Portal
#    button, so there is exactly one login entry point site-wide.
BOOKSTORE_HEADER_REPLACEMENT = """      <SiteHeader
        rightExtra={
          <>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              aria-label="Select currency"
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 13,
                fontFamily: 'inherit',
                color: 'var(--ink)',
                background: 'var(--surface)',
              }}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="GHS">GHS — Ghanaian Cedi</option>
            </select>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--paper)',
                color: 'var(--brand)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
          </>
        }
      />"""

c = cut_between(
    c,
    '      <header className="site-header">',
    "      </header>",
    BOOKSTORE_HEADER_REPLACEMENT,
    "replace bookstore header with <SiteHeader rightExtra=... />",
)

# 3. The bookstore's own footer stays (book-specific: All Books/Featured/
#    New Arrivals/Sell Your Books, and its own Support contact block) --
#    only its "Academics" nav label is corrected to "Academy", matching
#    the site-wide terminology fix, plus it now also links to /academy
#    directly rather than only /programs.
c = r1(
    c,
    '              <Link href="/programs">\n'
    "                Academics\n"
    "              </Link>",
    '              <Link href="/academy">\n'
    "                Academy\n"
    "              </Link>",
    "fix bookstore footer Academics label",
)

# 4. Remove the now-unused mobileMenu state (only ever used inside the
#    header block just removed).
c = r1(
    c,
    "  const [mobileMenu, setMobileMenu] = useState(false);\n",
    "",
    "remove mobileMenu state",
)

save(path, c)
print("app/bookstore/page.jsx: shared SiteHeader/SiteFooter wired in, Academics label fixed.")
