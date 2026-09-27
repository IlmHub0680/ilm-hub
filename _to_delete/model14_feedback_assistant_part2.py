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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:80])
    return content.replace(old, new)

# components/AssistantWidget.jsx already has (from part 1): authUser /
# authChecked state, the /api/auth/me fetch effect, and the autoIdentity
# useMemo. This part finishes the job: the message-seeding effect only
# seeds once autoIdentity is resolved, and branches -- a known zone skips
# the identity-card chooser and seeds straight into that zone's welcome +
# menu; an unknown zone (logged-out visitor, homepage/general) seeds the
# identity-card chooser exactly as before.
path = "components/AssistantWidget.jsx"
c = load(path)

c = r1(
    c,
    "  // Greeting -> \"How may I help you today?\" -> \"Welcome! You are:\" cards.\n"
    "  // Seeded once, the first time the widget is ever opened.\n"
    "  useEffect(() => {\n"
    "    if (messages === null) {\n"
    "      const configuredGreeting = lang === 'ar' ? settings?.welcomeMessageAr : settings?.welcomeMessageEn;\n"
    "      setMessages([\n"
    "        { role: 'assistant', text: configuredGreeting || GREETING_TEXT, skipTranslate: Boolean(configuredGreeting) },\n"
    "        { role: 'assistant', kind: 'identity', text: IDENTITY_PROMPT_TEXT },\n"
    "      ]);\n"
    "    }\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [open]);",
    "  // Greeting -> then either the identity chooser (only when we\n"
    "  // genuinely don't know who's asking) or straight into that person's\n"
    "  // own zone. Seeded once, the first time the widget is ever opened.\n"
    "  useEffect(() => {\n"
    "    if (messages === null && autoIdentity !== undefined) {\n"
    "      const configuredGreeting = lang === 'ar' ? settings?.welcomeMessageAr : settings?.welcomeMessageEn;\n"
    "      const greeting = {\n"
    "        role: 'assistant',\n"
    "        text: configuredGreeting || GREETING_TEXT,\n"
    "        skipTranslate: Boolean(configuredGreeting),\n"
    "      };\n"
    "\n"
    "      if (autoIdentity === null) {\n"
    "        setMessages([greeting, { role: 'assistant', kind: 'identity', text: IDENTITY_PROMPT_TEXT }]);\n"
    "      } else {\n"
    "        setIdentity(autoIdentity);\n"
    "        const zone =\n"
    "          autoIdentity === 'student'\n"
    "            ? 'student'\n"
    "            : autoIdentity === 'employee'\n"
    "            ? 'employee'\n"
    "            : ['bookstore', 'media', 'library'].includes(pathZone)\n"
    "            ? pathZone\n"
    "            : 'general';\n"
    "        setMessages([\n"
    "          greeting,\n"
    "          {\n"
    "            role: 'assistant',\n"
    "            text: `${ZONE_WELCOME[zone] || ZONE_WELCOME.general}\\n\\n${ACK_TEXT}`,\n"
    "            options: menuFor(zone),\n"
    "          },\n"
    "        ]);\n"
    "      }\n"
    "    }\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [open, autoIdentity]);",
    "AssistantWidget: seeding effect branches on autoIdentity",
)

save(path, c)
print("components/AssistantWidget.jsx: seeding effect now branches on autoIdentity (part 2 complete).")
