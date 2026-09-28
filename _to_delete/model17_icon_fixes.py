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
# components/SiteHeader.jsx -- the earlier icon swap went further than
# intended: it replaced the round user icon everywhere the portal button
# appears, including the real Student Portal button on every ordinary
# page. Per the correction: the Student Portal button keeps its original
# CircleUserRound icon everywhere -- only the Bookstore's own portal
# button (sectionMode="bookstore") uses a different icon, since that
# button is a store account/dashboard link, not the Student Portal.
# (Media never used CircleUserRound -- its own Sign In link already got
# a LogIn icon earlier, which already satisfies "media should look
# different from student portal".)
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "import { LayoutDashboard, LogIn, Search, Menu, X } from 'lucide-react';",
    "import { CircleUserRound, LayoutDashboard, LogIn, Search, Menu, X } from 'lucide-react';",
    "SiteHeader: restore CircleUserRound import alongside the bookstore-only icons",
)

c = r1(
    c,
    "          <Link href={portalHref} style={portalButton}>\n"
    "            {authChecked && user ? (\n"
    "              <LayoutDashboard size={18} strokeWidth={2.2} />\n"
    "            ) : (\n"
    "              <LogIn size={18} strokeWidth={2.2} />\n"
    "            )}\n"
    "            <span>{authChecked ? portalLabel : 'Student Portal'}</span>\n"
    "          </Link>",
    "          <Link href={portalHref} style={portalButton}>\n"
    "            {sectionMode === 'bookstore' ? (\n"
    "              authChecked && user ? (\n"
    "                <LayoutDashboard size={18} strokeWidth={2.2} />\n"
    "              ) : (\n"
    "                <LogIn size={18} strokeWidth={2.2} />\n"
    "              )\n"
    "            ) : (\n"
    "              <CircleUserRound size={18} strokeWidth={2.2} />\n"
    "            )}\n"
    "            <span>{authChecked ? portalLabel : 'Student Portal'}</span>\n"
    "          </Link>",
    "SiteHeader: desktop portal icon -- CircleUserRound everywhere except Bookstore",
)

c = r1(
    c,
    "            {authChecked && user ? (\n"
    "              <LayoutDashboard size={16} strokeWidth={2.2} />\n"
    "            ) : (\n"
    "              <LogIn size={16} strokeWidth={2.2} />\n"
    "            )}\n"
    "            {authChecked ? portalLabel : 'Student Portal'}\n"
    "          </Link>\n"
    "        </div>\n"
    "      )}",
    "            {sectionMode === 'bookstore' ? (\n"
    "              authChecked && user ? (\n"
    "                <LayoutDashboard size={16} strokeWidth={2.2} />\n"
    "              ) : (\n"
    "                <LogIn size={16} strokeWidth={2.2} />\n"
    "              )\n"
    "            ) : (\n"
    "              <CircleUserRound size={16} strokeWidth={2.2} />\n"
    "            )}\n"
    "            {authChecked ? portalLabel : 'Student Portal'}\n"
    "          </Link>\n"
    "        </div>\n"
    "      )}",
    "SiteHeader: mobile portal icon -- CircleUserRound everywhere except Bookstore",
)

save(path, c)
print("components/SiteHeader.jsx: Student Portal button keeps CircleUserRound everywhere; only Bookstore's dashboard/sign-in button uses the alternate icon.")

# =======================================================================
# components/SiteFooter.jsx -- add a small lucide icon in front of each
# contact line (Address / Phone / Email / Academic Enquiries), as asked.
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "import { Children, useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';",
    "import { Children, useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { MapPin, Phone as PhoneIcon, Mail, GraduationCap } from 'lucide-react';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';",
    "SiteFooter: import contact-line icons",
)

c = r1(
    c,
    "          <div style={footerContactStrip}>\n"
    "            {contact.address && (\n"
    "              <div style={footerContactItem}>\n"
    "                <span style={footerContactLabel}>Address</span>\n"
    "                <span style={footerContactValue}>{contact.address}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.phone && (\n"
    "              <div style={footerContactItem}>\n"
    "                <span style={footerContactLabel}>Phone</span>\n"
    "                <span style={footerContactValue}>{contact.phone}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.email && (\n"
    "              <div style={footerContactItem}>\n"
    "                <span style={footerContactLabel}>Email</span>\n"
    "                <span style={footerContactValue}>{contact.email}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.admissionsEmail && (\n"
    "              <div style={footerContactItem}>\n"
    "                <span style={footerContactLabel}>Academic Enquiries</span>\n"
    "                <span style={footerContactValue}>{contact.admissionsEmail}</span>\n"
    "              </div>\n"
    "            )}\n"
    "          </div>",
    "          <div style={footerContactStrip}>\n"
    "            {contact.address && (\n"
    "              <div style={footerContactItem}>\n"
    "                <MapPin size={14} strokeWidth={2.2} style={footerContactIcon} />\n"
    "                <span style={footerContactLabel}>Address</span>\n"
    "                <span style={footerContactValue}>{contact.address}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.phone && (\n"
    "              <div style={footerContactItem}>\n"
    "                <PhoneIcon size={14} strokeWidth={2.2} style={footerContactIcon} />\n"
    "                <span style={footerContactLabel}>Phone</span>\n"
    "                <span style={footerContactValue}>{contact.phone}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.email && (\n"
    "              <div style={footerContactItem}>\n"
    "                <Mail size={14} strokeWidth={2.2} style={footerContactIcon} />\n"
    "                <span style={footerContactLabel}>Email</span>\n"
    "                <span style={footerContactValue}>{contact.email}</span>\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {contact.admissionsEmail && (\n"
    "              <div style={footerContactItem}>\n"
    "                <GraduationCap size={14} strokeWidth={2.2} style={footerContactIcon} />\n"
    "                <span style={footerContactLabel}>Academic Enquiries</span>\n"
    "                <span style={footerContactValue}>{contact.admissionsEmail}</span>\n"
    "              </div>\n"
    "            )}\n"
    "          </div>",
    "SiteFooter: add icons to each contact line",
)

c = r1(
    c,
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'baseline',\n"
    "  gap: '8px',\n"
    "};",
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'center',\n"
    "  gap: '8px',\n"
    "};\n"
    "\n"
    "const footerContactIcon = {\n"
    "  color: 'var(--gold)',\n"
    "  flexShrink: 0,\n"
    "};",
    "SiteFooter: center-align the contact row for the new icon, add its style",
)

save(path, c)
print("components/SiteFooter.jsx: each contact line now has a matching icon.")
