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

path = "components/SiteHeader.jsx"
c = load(path)

# 1. Import the real, fixed category lists from Media/Library's own
# lib files -- generating the dropdown items from these instead of
# retyping a second copy of the same labels here, so they can never
# drift out of sync with lib/media.js / lib/library.js.
c = r1(
    c,
    "import { CircleUserRound, Search, Menu, X } from 'lucide-react';",
    "import { CircleUserRound, Search, Menu, X } from 'lucide-react';\n"
    "import { MEDIA_CATEGORIES } from '@/lib/media';\n"
    "import { LIBRARY_CATEGORIES } from '@/lib/library';",
    "SiteHeader: import MEDIA_CATEGORIES/LIBRARY_CATEGORIES",
)

# 2. Dropdown item lists for Bookstore, Media and Library -- same
# pattern as ACADEMY_DROPDOWN_ITEMS/ADMISSION_DROPDOWN_ITEMS above.
# Bookstore's categories are admin-managed database rows (Category
# model, no fixed enum), not a small fixed list like Media/Library's,
# so hardcoding them here would risk drifting stale the moment an
# admin adds or renames one -- its dropdown stays to the one stable,
# always-correct link.
c = r1(
    c,
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];",
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];\n"
    "\n"
    "const BOOKSTORE_DROPDOWN_ITEMS = [\n"
    "  { label: 'Browse Collection', href: '/bookstore#collection' },\n"
    "];\n"
    "\n"
    "const MEDIA_DROPDOWN_ITEMS = [\n"
    "  ...MEDIA_CATEGORIES.map((c) => ({ label: c.label, href: `/media?category=${c.value}` })),\n"
    "  { label: 'Subscription Plans', href: '/media#plans' },\n"
    "];\n"
    "\n"
    "const LIBRARY_DROPDOWN_ITEMS = LIBRARY_CATEGORIES.map((c) => ({\n"
    "  label: c.label,\n"
    "  href: `/library?category=${c.value}`,\n"
    "}));",
    "SiteHeader: add BOOKSTORE/MEDIA/LIBRARY dropdown item lists",
)

# 3. Desktop nav -- Bookstore/Media/Library become NavDropdown,
# matching Academy/Admission & Registration exactly.
c = r1(
    c,
    "          <NavLink href=\"/bookstore\">Bookstore</NavLink>\n"
    "          <NavLink href=\"/media\">Media</NavLink>\n"
    "          <NavLink href=\"/library\">Library</NavLink>",
    "          <NavDropdown label=\"Bookstore\" href=\"/bookstore\" items={BOOKSTORE_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Media\" href=\"/media\" items={MEDIA_DROPDOWN_ITEMS} />\n"
    "          <NavDropdown label=\"Library\" href=\"/library\" items={LIBRARY_DROPDOWN_ITEMS} />",
    "SiteHeader: desktop Bookstore/Media/Library become dropdowns",
)

# 4. Mobile accordion state -- one open/closed flag per new dropdown,
# matching academyMobileOpen/admissionMobileOpen.
c = r1(
    c,
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);\n"
    "  const [admissionMobileOpen, setAdmissionMobileOpen] = useState(false);",
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);\n"
    "  const [admissionMobileOpen, setAdmissionMobileOpen] = useState(false);\n"
    "  const [bookstoreMobileOpen, setBookstoreMobileOpen] = useState(false);\n"
    "  const [mediaMobileOpen, setMediaMobileOpen] = useState(false);\n"
    "  const [libraryMobileOpen, setLibraryMobileOpen] = useState(false);",
    "SiteHeader: mobile accordion state for Bookstore/Media/Library",
)

# 5. Mobile menu -- replace the three flat links with three accordions,
# same trigger+panel structure as the Academy/Admission blocks above
# them, reusing the exact same *_DROPDOWN_ITEMS arrays as desktop.
c = r1(
    c,
    "          <Link href=\"/bookstore\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Bookstore\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n"
    "          <Link href=\"/library\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Library\n"
    "          </Link>",
    "          <button\n"
    "            type=\"button\"\n"
    "            onClick={() => setBookstoreMobileOpen((open) => !open)}\n"
    "            style={mobileAccordionTrigger}\n"
    "            aria-expanded={bookstoreMobileOpen}\n"
    "            aria-controls=\"mobile-bookstore-panel\"\n"
    "          >\n"
    "            Bookstore\n"
    "            <span\n"
    "              aria-hidden=\"true\"\n"
    "              style={{\n"
    "                transform: bookstoreMobileOpen ? 'rotate(180deg)' : 'none',\n"
    "                transition: 'transform 0.15s',\n"
    "              }}\n"
    "            >\n"
    "              ▾\n"
    "            </span>\n"
    "          </button>\n"
    "\n"
    "          {bookstoreMobileOpen && (\n"
    "            <div id=\"mobile-bookstore-panel\" style={mobileAccordionPanel}>\n"
    "              <Link href=\"/bookstore\" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                Bookstore Home\n"
    "              </Link>\n"
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
    "            onClick={() => setMediaMobileOpen((open) => !open)}\n"
    "            style={mobileAccordionTrigger}\n"
    "            aria-expanded={mediaMobileOpen}\n"
    "            aria-controls=\"mobile-media-panel\"\n"
    "          >\n"
    "            Media\n"
    "            <span\n"
    "              aria-hidden=\"true\"\n"
    "              style={{\n"
    "                transform: mediaMobileOpen ? 'rotate(180deg)' : 'none',\n"
    "                transition: 'transform 0.15s',\n"
    "              }}\n"
    "            >\n"
    "              ▾\n"
    "            </span>\n"
    "          </button>\n"
    "\n"
    "          {mediaMobileOpen && (\n"
    "            <div id=\"mobile-media-panel\" style={mobileAccordionPanel}>\n"
    "              <Link href=\"/media\" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                Media Home\n"
    "              </Link>\n"
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
    "            onClick={() => setLibraryMobileOpen((open) => !open)}\n"
    "            style={mobileAccordionTrigger}\n"
    "            aria-expanded={libraryMobileOpen}\n"
    "            aria-controls=\"mobile-library-panel\"\n"
    "          >\n"
    "            Library\n"
    "            <span\n"
    "              aria-hidden=\"true\"\n"
    "              style={{\n"
    "                transform: libraryMobileOpen ? 'rotate(180deg)' : 'none',\n"
    "                transition: 'transform 0.15s',\n"
    "              }}\n"
    "            >\n"
    "              ▾\n"
    "            </span>\n"
    "          </button>\n"
    "\n"
    "          {libraryMobileOpen && (\n"
    "            <div id=\"mobile-library-panel\" style={mobileAccordionPanel}>\n"
    "              <Link href=\"/library\" style={mobileAccordionLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "                Library Home\n"
    "              </Link>\n"
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
    "          )}",
    "SiteHeader: mobile Bookstore/Media/Library become accordions",
)

save(path, c)
print("components/SiteHeader.jsx: Bookstore/Media/Library are now dropdowns (desktop) and accordions (mobile), on both matching Academy/Admission's pattern.")
