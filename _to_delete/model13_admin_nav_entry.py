# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/admin/(overview)/layout.jsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

OLD = "    { title: 'Website & Master Integration', href: '/admin/academy-master-integration', icon: '\U0001F9E9', description: 'Manage the Academy read as one master model — website structure, the Academic Programs homepage section, programme pages, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and the final audit.' },"
NEW = (
    OLD
    + "\n    { title: 'AI Assistant', href: '/admin/assistant', icon: '\U0001F4AC', description: 'Control the sitewide AI Assistant widget — availability, opening greeting in English and Arabic, and moderation of the Ulul Azm Community.' },"
)

c = r1(c, OLD, NEW, "(overview)/layout.jsx: add AI Assistant nav entry")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("Added AI Assistant entry to admin overview nav.")
