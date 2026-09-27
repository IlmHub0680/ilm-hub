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

# ---------------------------------------------------------------------
# MediaNav.jsx -- add Academy / Admission / Bookstore to both the
# desktop and mobile link lists, so a visitor in the Media/Library area
# can reach the rest of the site without going back to the homepage
# first. The real, auth-aware Dashboard/Sign-In behaviour already in
# this component (server-resolved user from app/media/layout.jsx) is
# untouched.
# ---------------------------------------------------------------------
path = "components/MediaNav.jsx"
c = load(path)

c = r1(
    c,
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n",
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/academy\" active={isActive('/academy')}>Academy</NavLink>\n"
    "          <NavLink href=\"/admission\" active={isActive('/admission')}>Admission</NavLink>\n"
    "          <NavLink href=\"/bookstore\" active={isActive('/bookstore')}>Bookstore</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n",
    "MediaNav: desktop nav -- add Academy/Admission/Bookstore",
)

c = r1(
    c,
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n",
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
    "          </Link>\n",
    "MediaNav: mobile nav -- add Academy/Admission/Bookstore",
)

save(path, c)
print("components/MediaNav.jsx: Academy/Admission/Bookstore links added.")

# ---------------------------------------------------------------------
# LibraryNav.jsx -- same treatment.
# ---------------------------------------------------------------------
path = "components/LibraryNav.jsx"
c = load(path)

c = r1(
    c,
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n",
    "          <NavLink href=\"/\" active={isActive('/')}>Home</NavLink>\n"
    "          <NavLink href=\"/academy\" active={isActive('/academy')}>Academy</NavLink>\n"
    "          <NavLink href=\"/admission\" active={isActive('/admission')}>Admission</NavLink>\n"
    "          <NavLink href=\"/bookstore\" active={isActive('/bookstore')}>Bookstore</NavLink>\n"
    "          <NavLink href=\"/media\" active={isActive('/media')}>Media</NavLink>\n",
    "LibraryNav: desktop nav -- add Academy/Admission/Bookstore",
)

c = r1(
    c,
    "          <Link href=\"/\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Home\n"
    "          </Link>\n"
    "          <Link href=\"/media\" style={mobileNavLink} onClick={() => setMobileMenuOpen(false)}>\n"
    "            Media\n"
    "          </Link>\n",
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
    "          </Link>\n",
    "LibraryNav: mobile nav -- add Academy/Admission/Bookstore",
)

save(path, c)
print("components/LibraryNav.jsx: Academy/Admission/Bookstore links added.")
