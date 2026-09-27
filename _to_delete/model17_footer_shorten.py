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
# components/SiteFooter.jsx
#   1. Long CMS link columns (e.g. the 12-link "Academic Governance"
#      group) were stretching the whole footer row very tall since every
#      column sits in one grid row. Nothing is removed -- every link the
#      user asked to keep stays -- but a column with more than 6 links
#      now packs into two short CSS columns instead of one long one, the
#      standard way a dense footer list is kept compact.
#   2. The contact strip was a wide, full-width horizontal row of
#      label/value pairs. It's now a short, stacked address block (label:
#      value per line, narrow width) -- the standard, professional
#      footer-contact layout, not spread horizontally.
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "import { useEffect, useState } from 'react';",
    "import { Children, useEffect, useState } from 'react';",
    "SiteFooter: import Children for the link-count check",
)

c = r1(
    c,
    "function FooterColumn({ title, children }) {\n"
    "  return (\n"
    "    <div>\n"
    "      <h3 style={footerHeading}>{title}</h3>\n"
    "      <div style={footerColumnLinks}>{children}</div>\n"
    "    </div>\n"
    "  );\n"
    "}",
    "function FooterColumn({ title, children }) {\n"
    "  // A column with a lot of links (e.g. a CMS-managed group covering\n"
    "  // every Academy governance page) packs into two short CSS columns\n"
    "  // instead of one long one -- same links, half the vertical height.\n"
    "  const isLong = Children.count(children) > 6;\n"
    "\n"
    "  return (\n"
    "    <div>\n"
    "      <h3 style={footerHeading}>{title}</h3>\n"
    "      <div style={isLong ? footerColumnLinksCompact : footerColumnLinks}>{children}</div>\n"
    "    </div>\n"
    "  );\n"
    "}",
    "SiteFooter: FooterColumn packs long link lists into two columns",
)

c = r1(
    c,
    "const footerColumnLinks = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: '11px',\n"
    "};\n"
    "\n"
    "const footerLink = {\n"
    "  color: 'var(--on-dark-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '13px',\n"
    "};\n"
    "\n"
    "const footerButton = {\n"
    "  border: 'none',\n"
    "  background: 'none',\n"
    "  padding: 0,\n"
    "  color: 'var(--on-dark-soft)',\n"
    "  fontSize: '13px',\n"
    "  cursor: 'pointer',\n"
    "  fontFamily: 'inherit',\n"
    "  textAlign: 'left',\n"
    "};",
    "const footerColumnLinks = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "};\n"
    "\n"
    "// Same list, packed into up to two ~140px CSS columns instead of one\n"
    "// long vertical run -- for columns with many links (see FooterColumn).\n"
    "const footerColumnLinksCompact = {\n"
    "  columns: '140px 2',\n"
    "  columnGap: '20px',\n"
    "};\n"
    "\n"
    "const footerLink = {\n"
    "  display: 'block',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '13px',\n"
    "  marginBottom: '11px',\n"
    "  breakInside: 'avoid',\n"
    "};\n"
    "\n"
    "const footerButton = {\n"
    "  display: 'block',\n"
    "  border: 'none',\n"
    "  background: 'none',\n"
    "  padding: 0,\n"
    "  color: 'var(--on-dark-soft)',\n"
    "  fontSize: '13px',\n"
    "  cursor: 'pointer',\n"
    "  fontFamily: 'inherit',\n"
    "  textAlign: 'left',\n"
    "  marginBottom: '11px',\n"
    "  breakInside: 'avoid',\n"
    "};",
    "SiteFooter: link/button spacing moves from container gap to per-item margin (works in both layouts)",
)

c = r1(
    c,
    "const footerContactStrip = {\n"
    "  marginTop: '45px',\n"
    "  paddingTop: '26px',\n"
    "  borderTop: '1px solid var(--on-dark-border)',\n"
    "  display: 'flex',\n"
    "  flexWrap: 'wrap',\n"
    "  columnGap: '40px',\n"
    "  rowGap: '16px',\n"
    "};\n"
    "\n"
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: '4px',\n"
    "  minWidth: '150px',\n"
    "};\n"
    "\n"
    "const footerContactLabel = {\n"
    "  fontSize: '10.5px',\n"
    "  fontWeight: '800',\n"
    "  letterSpacing: '0.6px',\n"
    "  textTransform: 'uppercase',\n"
    "  color: 'var(--gold)',\n"
    "};\n"
    "\n"
    "const footerContactValue = {\n"
    "  fontSize: '13px',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "};",
    "// A short, stacked address block -- standard footer-contact layout,\n"
    "// not a wide horizontal strip. \"Label: value\" per line, narrow width.\n"
    "const footerContactStrip = {\n"
    "  marginTop: '40px',\n"
    "  paddingTop: '22px',\n"
    "  borderTop: '1px solid var(--on-dark-border)',\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: '8px',\n"
    "  maxWidth: '360px',\n"
    "};\n"
    "\n"
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'baseline',\n"
    "  gap: '8px',\n"
    "};\n"
    "\n"
    "const footerContactLabel = {\n"
    "  flexShrink: 0,\n"
    "  fontSize: '10.5px',\n"
    "  fontWeight: '800',\n"
    "  letterSpacing: '0.6px',\n"
    "  textTransform: 'uppercase',\n"
    "  color: 'var(--gold)',\n"
    "};\n"
    "\n"
    "const footerContactValue = {\n"
    "  fontSize: '13px',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "};",
    "SiteFooter: contact block becomes a short vertical address block",
)

save(path, c)
print("components/SiteFooter.jsx: long link columns now pack into two compact columns, and the contact block is a short vertical address-style block instead of a wide horizontal strip.")
