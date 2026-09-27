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

path = "app/admin/homepage/hero/page.jsx"
c = load(path)

# 1. New state for the independent Brand Assets save.
c = r1(
    c,
    "  const [saving, setSaving] = useState(false);\n"
    "  const [message, setMessage] = useState('');\n"
    "  const [uploading, setUploading] = useState({ logo: false, hero: false });",
    "  const [saving, setSaving] = useState(false);\n"
    "  const [message, setMessage] = useState('');\n"
    "  const [savingAssets, setSavingAssets] = useState(false);\n"
    "  const [assetsMessage, setAssetsMessage] = useState('');\n"
    "  const [uploading, setUploading] = useState({ logo: false, hero: false });",
    "hero page: add savingAssets/assetsMessage state",
)

# 2. New handler -- PATCH only {logoUrl, heroImageUrl}, independent of
# the rest of the form and its required fields.
c = r1(
    c,
    "  async function handleSave(e) {",
    "  async function handleSaveBrandAssets(e) {\n"
    "    e.preventDefault();\n"
    "    setSavingAssets(true);\n"
    "    setAssetsMessage('');\n"
    "\n"
    "    try {\n"
    "      const res = await fetch('/api/admin/homepage/hero', {\n"
    "        method: 'PATCH',\n"
    "        credentials: 'include',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ logoUrl: form.logoUrl, heroImageUrl: form.heroImageUrl }),\n"
    "      });\n"
    "\n"
    "      const result = await res.json();\n"
    "\n"
    "      if (!res.ok || !result.success) {\n"
    "        throw new Error(result.error || 'Failed to save brand assets.');\n"
    "      }\n"
    "\n"
    "      setForm((prev) => ({ ...prev, logoUrl: result.data.logoUrl, heroImageUrl: result.data.heroImageUrl }));\n"
    "      setAssetsMessage('Brand assets saved successfully. The change is already live.');\n"
    "    } catch (err) {\n"
    "      setAssetsMessage(err.message);\n"
    "    } finally {\n"
    "      setSavingAssets(false);\n"
    "    }\n"
    "  }\n"
    "\n"
    "  async function handleSave(e) {",
    "hero page: add handleSaveBrandAssets",
)

# 3. Split the markup: Brand Assets becomes its own <form>, with its
# own message + Save button, closed before the existing big form
# (headline/Arabic/CTA/features) opens.
c = r1(
    c,
    "      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>\n"
    "        <section className=\"ih-card\" style={{ padding: 24 }}>\n"
    "          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Brand Assets</h2>\n"
    "          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>",
    "      <form onSubmit={handleSaveBrandAssets} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>\n"
    "        <section className=\"ih-card\" style={{ padding: 24 }}>\n"
    "          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Brand Assets</h2>\n"
    "          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>\n"
    "            Saved independently of the Hero Section below — update just the logo or\n"
    "            banner without needing to fill in or resubmit the headline, description,\n"
    "            buttons or Arabic translation. The change is live as soon as you save it.\n"
    "          </p>\n"
    "          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>",
    "hero page: Brand Assets section intro + its own form",
)

c = r1(
    c,
    "              previewStyle={{ width: 160, height: 90, borderRadius: 10, objectFit: 'cover' }}\n"
    "            />\n"
    "          </div>\n"
    "        </section>\n"
    "\n"
    "        <section className=\"ih-card\" style={{ padding: 24 }}>\n"
    "          <label style={{ display: 'block', marginBottom: 16 }}>\n"
    "            <span style={labelStyle}>Badge line</span>",
    "              previewStyle={{ width: 160, height: 90, borderRadius: 10, objectFit: 'cover' }}\n"
    "            />\n"
    "          </div>\n"
    "\n"
    "          {assetsMessage && (\n"
    "            <div\n"
    "              className=\"ih-card\"\n"
    "              style={{\n"
    "                marginTop: 16,\n"
    "                padding: '10px 14px',\n"
    "                background: assetsMessage.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',\n"
    "                color: assetsMessage.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',\n"
    "              }}\n"
    "            >\n"
    "              {assetsMessage}\n"
    "            </div>\n"
    "          )}\n"
    "\n"
    "          <button type=\"submit\" disabled={savingAssets} className=\"ih-btn ih-btn-primary\" style={{ marginTop: 16 }}>\n"
    "            {savingAssets ? 'Saving...' : 'Save Brand Assets'}\n"
    "          </button>\n"
    "        </section>\n"
    "      </form>\n"
    "\n"
    "      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>\n"
    "        <section className=\"ih-card\" style={{ padding: 24 }}>\n"
    "          <label style={{ display: 'block', marginBottom: 16 }}>\n"
    "            <span style={labelStyle}>Badge line</span>",
    "hero page: close Brand Assets form with its own Save button, reopen the rest as a second form",
)

save(path, c)
print("app/admin/homepage/hero/page.jsx: Brand Assets now saves independently via its own Save button.")
