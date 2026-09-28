# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "components/AssistantWidget.jsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. New settings state, fetched once on mount from the real admin-
#    configured (or safely-defaulted) settings endpoint.
c = r1(
    c,
    "  const [open, setOpen] = useState(false);",
    "  const [open, setOpen] = useState(false);\n"
    "  const [settings, setSettings] = useState(null); // null while loading\n"
    "  const settingsLoadedRef = useRef(false);",
    "widget: add settings state",
)

# 2. Fetch it once, before the widget's own render decides anything.
c = r1(
    c,
    """  // Remembered language preference only — never the conversation itself,
  // and never anything that could stand in for authentication.
  useEffect(() => {""",
    """  useEffect(() => {
    if (settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;

    fetch('/api/assistant/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result?.success) setSettings(result.data);
      })
      .catch(() => {
        // A failed settings lookup falls back to the widget's own
        // built-in defaults below rather than hiding the assistant.
        setSettings({ isEnabled: true, welcomeMessageEn: '', welcomeMessageAr: '', supportedLanguages: ['en', 'ar'] });
      });
  }, []);

  // Remembered language preference only — never the conversation itself,
  // and never anything that could stand in for authentication.
  useEffect(() => {""",
    "widget: fetch public assistant settings once",
)

# 3. Use the admin-configured greeting when one is set, per language.
c = r1(
    c,
    "      setMessages([\n        { role: 'assistant', text: GREETING_TEXT },",
    "      const configuredGreeting = lang === 'ar' ? settings?.welcomeMessageAr : settings?.welcomeMessageEn;\n"
    "      setMessages([\n"
    "        { role: 'assistant', text: configuredGreeting || GREETING_TEXT, skipTranslate: Boolean(configuredGreeting) },",
    "widget: use configured greeting when present",
)

# 4. skipTranslate support in the message renderer, so an admin-typed
#    greeting (already in whichever language they typed it in) is never
#    run back through the client dictionary.
c = r1(
    c,
    "                  {t(m.text)}\n                  {m.department",
    "                  {m.skipTranslate ? m.text : t(m.text)}\n                  {m.department",
    "widget: respect skipTranslate on render",
)

# 5. Hide the whole widget when an admin has turned it off. Render
#    nothing rather than a disabled-looking button, matching how the
#    rest of the site simply omits unavailable features.
c = r1(
    c,
    "  const visibleMessages = messages || [];\n\n  return (",
    "  const visibleMessages = messages || [];\n\n"
    "  if (settings && settings.isEnabled === false) {\n"
    "    return null;\n"
    "  }\n\n"
    "  return (",
    "widget: hide entirely when disabled",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("components/AssistantWidget.jsx: wired to real /api/assistant/settings.")
