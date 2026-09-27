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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:120])
    return content.replace(old, new)

path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "model HomepageHero {\n"
    "  id             String   @id @default(cuid())\n"
    "  badge          String\n"
    "  title          String\n"
    "  subtitle       String   @db.Text\n"
    "  primaryLabel   String\n"
    "  primaryHref    String\n"
    "  secondaryLabel String\n"
    "  secondaryHref  String\n"
    "  features       String[]\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n",
    "model HomepageHero {\n"
    "  id             String   @id @default(cuid())\n"
    "  badge          String\n"
    "  title          String\n"
    "  subtitle       String   @db.Text\n"
    "  primaryLabel   String\n"
    "  primaryHref    String\n"
    "  secondaryLabel String\n"
    "  secondaryHref  String\n"
    "  features       String[]\n"
    "  // Arabic translations (Model 15/16 follow-up) -- all optional. When a\n"
    "  // field's Arabic version is blank, the public homepage's EN/AR toggle\n"
    "  // falls back to the English text rather than showing nothing, so this\n"
    "  // is safe to leave unset until an admin actually fills it in.\n"
    "  badgeAr          String?\n"
    "  titleAr          String?\n"
    "  subtitleAr       String?  @db.Text\n"
    "  primaryLabelAr   String?\n"
    "  secondaryLabelAr String?\n"
    "  featuresAr       String[] @default([])\n"
    "  // Uploaded brand assets (Model 15/16 follow-up) -- both store a\n"
    "  // /api/assets/<key> path (see lib/r2.ts + app/api/assets), not a raw\n"
    "  // R2 key or an external URL. logoUrl is the site's own mark, shown in\n"
    "  // the header/footer alongside the hero; heroImageUrl is an optional\n"
    "  // image/photo for the hero banner itself. Both null until an admin\n"
    "  // uploads one -- the site falls back to the existing text glyph and\n"
    "  // plain gradient background respectively.\n"
    "  logoUrl      String?\n"
    "  heroImageUrl String?\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n",
    "schema: HomepageHero -- add Arabic fields + logo/hero image URLs",
)

save(path, c)
print("prisma/schema.prisma: HomepageHero extended (Arabic fields + logoUrl/heroImageUrl).")
