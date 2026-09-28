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

path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "  logoUrl      String?\n"
    "  heroImageUrl String?\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n"
    "\n"
    "model SocialLink {",
    "  logoUrl      String?\n"
    "  heroImageUrl String?\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n"
    "\n"
    "// A single uploaded banner image per public section (Model 17) -- the\n"
    "// same \"upload an image, save it independently, it applies\n"
    "// immediately\" pattern as HomepageHero's brand assets, but scoped to\n"
    "// one section instead of a whole hero. id is the section key itself\n"
    "// ('bookstore' | 'media' | 'library'), matching HomepageHero's fixed\n"
    "// 'default-homepage-hero' id -- one row per section, upserted by key,\n"
    "// never a growing table. Each section's own page keeps its existing\n"
    "// hardcoded eyebrow/title/subtitle text; only the background image is\n"
    "// admin-editable here.\n"
    "model SectionBanner {\n"
    "  id        String   @id\n"
    "  imageUrl  String?\n"
    "  updatedAt DateTime @updatedAt\n"
    "  createdAt DateTime @default(now())\n"
    "}\n"
    "\n"
    "model SocialLink {",
    "schema: add SectionBanner model",
)

save(path, c)
print("prisma/schema.prisma: SectionBanner model added.")
