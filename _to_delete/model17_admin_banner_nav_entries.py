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

# Bookstore admin sidebar
path = "app/admin/bookstore/layout.jsx"
c = load(path)
c = r1(
    c,
    "  { href: '/admin/bookstore/categories', label: 'Categories', icon: '🏷' },\n"
    "];",
    "  { href: '/admin/bookstore/categories', label: 'Categories', icon: '🏷' },\n"
    "  { href: '/admin/bookstore/banner', label: 'Banner', icon: '🖼' },\n"
    "];",
    "bookstore admin layout: add Banner nav entry",
)
save(path, c)
print("app/admin/bookstore/layout.jsx: Banner nav entry added.")

# Media admin sidebar
path = "app/admin/media/layout.jsx"
c = load(path)
c = r1(
    c,
    "  { href: '/admin/media/subscribers', label: 'Subscribers', icon: '👥' },\n"
    "  { href: '/admin/bookstore', label: 'Back to Bookstore', icon: '📚' },",
    "  { href: '/admin/media/subscribers', label: 'Subscribers', icon: '👥' },\n"
    "  { href: '/admin/media/banner', label: 'Banner', icon: '🖼' },\n"
    "  { href: '/admin/bookstore', label: 'Back to Bookstore', icon: '📚' },",
    "media admin layout: add Banner nav entry",
)
save(path, c)
print("app/admin/media/layout.jsx: Banner nav entry added.")

# Library Resources admin sidebar
path = "app/admin/library-resources/layout.jsx"
c = load(path)
c = r1(
    c,
    "  { href: '/admin/library-resources/items/new', label: 'Add New Item', icon: '➕' },\n"
    "  { href: '/admin/media', label: 'Media (separate)', icon: '🎧' },",
    "  { href: '/admin/library-resources/items/new', label: 'Add New Item', icon: '➕' },\n"
    "  { href: '/admin/library-resources/banner', label: 'Banner', icon: '🖼' },\n"
    "  { href: '/admin/media', label: 'Media (separate)', icon: '🎧' },",
    "library-resources admin layout: add Banner nav entry",
)
save(path, c)
print("app/admin/library-resources/layout.jsx: Banner nav entry added.")
