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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:100])
    return content.replace(old, new)

# =======================================================================
# components/AssistantWidget.jsx
# =======================================================================
path = "components/AssistantWidget.jsx"
c = load(path)

# 1. New state: awaitingFirstMessage + idle-timer ref.
c = r1(
    c,
    "  const [identity, setIdentity] = useState(null); // null | 'student' | 'employee' | 'visitor'\n",
    "  const [identity, setIdentity] = useState(null); // null | 'student' | 'employee' | 'visitor'\n"
    "  const [awaitingFirstMessage, setAwaitingFirstMessage] = useState(true);\n"
    "  const idleTimerRef = useRef(null);\n",
    "add awaitingFirstMessage state + idleTimerRef",
)

# 2. identityRef (mirrors identity, read from timer/async callbacks that
#    must never see a stale closure) + the zone-change reset: moving to
#    a genuinely different part of the site closes the widget and drops
#    the old thread, instead of Bookstore's chat following the visitor
#    into Media, or a student's into the homepage.
c = r1(
    c,
    "  const zoneRef = useRef(effectiveZone);\n  zoneRef.current = effectiveZone;\n",
    "  const zoneRef = useRef(effectiveZone);\n"
    "  zoneRef.current = effectiveZone;\n"
    "  const identityRef = useRef(identity);\n"
    "  identityRef.current = identity;\n"
    "\n"
    "  // A fresh section deserves a fresh conversation: when the visitor\n"
    "  // moves to a genuinely different part of the site (not just another\n"
    "  // page within the same one), close the widget and drop the old\n"
    "  // thread rather than carrying it along. Skipped on first mount --\n"
    "  // only an actual zone change resets anything.\n"
    "  const prevZoneRef = useRef(pathZone);\n"
    "  useEffect(() => {\n"
    "    if (prevZoneRef.current !== pathZone) {\n"
    "      prevZoneRef.current = pathZone;\n"
    "      setOpen(false);\n"
    "      setMessages(null);\n"
    "      setIdentity(null);\n"
    "      setAwaitingFirstMessage(true);\n"
    "    }\n"
    "  }, [pathZone]);\n",
    "add identityRef + zone-change conversation reset",
)

# 3. Seeding effect: greeting ONLY (no chooser, no menu yet) -- plus the
#    shared pushReveal() helper and the 35s idle-nudge timer that both
#    the first-message flow (in sendMessage) and idle silence use to
#    show the identity chooser / zone menu on their own.
c = r1(
    c,
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
    "  // Greeting only -- who's asking (the identity chooser) or what they\n"
    "  // might want (the zone menu) is revealed only once the visitor says\n"
    "  // something, or after a short idle wait (see the idle-nudge effect\n"
    "  // below) -- never stacked onto the greeting itself. Seeded once,\n"
    "  // the first time the widget is opened for this zone.\n"
    "  useEffect(() => {\n"
    "    if (messages === null && autoIdentity !== undefined) {\n"
    "      const configuredGreeting = lang === 'ar' ? settings?.welcomeMessageAr : settings?.welcomeMessageEn;\n"
    "      const firstName = authUser?.name ? authUser.name.split(' ')[0] : null;\n"
    "      const greetingText = configuredGreeting\n"
    "        ? configuredGreeting\n"
    "        : firstName\n"
    "        ? `${firstName}! ${GREETING_TEXT}`\n"
    "        : GREETING_TEXT;\n"
    "\n"
    "      setMessages([\n"
    "        { role: 'assistant', text: greetingText, skipTranslate: Boolean(configuredGreeting || firstName) },\n"
    "      ]);\n"
    "      setIdentity(autoIdentity || null);\n"
    "      setAwaitingFirstMessage(true);\n"
    "    }\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [open, autoIdentity]);\n"
    "\n"
    "  // Reveals the identity chooser (if we still don't know who's asking)\n"
    "  // or the current zone's welcome + quick-option menu (if we do) --\n"
    "  // the one moment this widget offers its menu on its own, instead of\n"
    "  // an answer stacking the menu on every single reply. Used both\n"
    "  // right after the first message of a conversation and by the\n"
    "  // idle-nudge timer below.\n"
    "  function pushReveal(promptText) {\n"
    "    setAwaitingFirstMessage(false);\n"
    "    setMessages((m) => {\n"
    "      if (identityRef.current === null) {\n"
    "        return [\n"
    "          ...(m || []),\n"
    "          { role: 'assistant', kind: 'identity', text: promptText || IDENTITY_PROMPT_TEXT },\n"
    "        ];\n"
    "      }\n"
    "      return [\n"
    "        ...(m || []),\n"
    "        {\n"
    "          role: 'assistant',\n"
    "          text: promptText ? `${promptText}\\n\\n${ACK_TEXT}` : ACK_TEXT,\n"
    "          options: menuFor(zoneRef.current),\n"
    "        },\n"
    "      ];\n"
    "    });\n"
    "  }\n"
    "\n"
    "  // Idle nudge: if the conversation sits quiet for 35s while the\n"
    "  // widget is open, gently resurface \"how may I help you\" + the menu\n"
    "  // -- the same reveal as above, just triggered by silence instead of\n"
    "  // a message. Re-arms after firing, so a second long pause nudges\n"
    "  // again.\n"
    "  useEffect(() => {\n"
    "    if (!open || messages === null) return undefined;\n"
    "\n"
    "    const timer = setTimeout(() => {\n"
    "      pushReveal(GREETING_TEXT);\n"
    "    }, 35000);\n"
    "    idleTimerRef.current = timer;\n"
    "\n"
    "    return () => clearTimeout(timer);\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [messages, open]);",
    "AssistantWidget: seeding effect greeting-only + pushReveal + idle-nudge timer",
)

# 4. selectIdentity: clear awaitingFirstMessage too (defensive -- covers
#    the chooser having been shown by the idle nudge before anyone typed
#    anything, so a later typed message isn't mistaken for "the first").
c = r1(
    c,
    "  function selectIdentity(id) {\n"
    "    logEvent('identity_selected', { identity: id });\n"
    "    setIdentity(id);\n",
    "  function selectIdentity(id) {\n"
    "    logEvent('identity_selected', { identity: id });\n"
    "    setIdentity(id);\n"
    "    setAwaitingFirstMessage(false);\n",
    "selectIdentity: clear awaitingFirstMessage",
)

# 5. sendMessage: stop attaching a fresh menu to every reply; only the
#    server's own deliberate menu offers (a plain greeting, or an
#    explicit "help"/"menu" ask) pass their options through, and the
#    visitor's very first message in a conversation still earns the one
#    spontaneous reveal (identity chooser or zone menu) if the server
#    didn't already give one.
c = r1(
    c,
    "  async function sendMessage(text) {\n"
    "    const trimmed = text.trim();\n"
    "    if (!trimmed || sending) return;\n"
    "\n"
    "    setMessages((m) => [...(m || []), { role: 'user', text: trimmed }]);\n"
    "    setSending(true);\n"
    "\n"
    "    try {\n"
    "      const res = await fetch('/api/assistant', {\n"
    "        method: 'POST',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ message: trimmed, zone: zoneRef.current }),\n"
    "      });\n"
    "      const data = await res.json();\n"
    "      setMessages((m) => [\n"
    "        ...(m || []),\n"
    "        {\n"
    "          role: 'assistant',\n"
    "          text: data.reply || 'Sorry, something went wrong — please try again.',\n"
    "          department: data.department,\n"
    "          href: data.href || null,\n"
    "          options: Array.isArray(data.options) ? data.options : null,\n"
    "        },\n"
    "      ]);\n"
    "    } catch {\n"
    "      setMessages((m) => [\n"
    "        ...(m || []),\n"
    "        { role: 'assistant', text: \"Sorry, I couldn't reach the server — please try again shortly.\" },\n"
    "      ]);\n"
    "    } finally {\n"
    "      setSending(false);\n"
    "    }\n"
    "  }",
    "  async function sendMessage(text) {\n"
    "    const trimmed = text.trim();\n"
    "    if (!trimmed || sending) return;\n"
    "\n"
    "    const isFirstMessage = awaitingFirstMessage;\n"
    "    setAwaitingFirstMessage(false);\n"
    "\n"
    "    setMessages((m) => [...(m || []), { role: 'user', text: trimmed }]);\n"
    "    setSending(true);\n"
    "\n"
    "    try {\n"
    "      const res = await fetch('/api/assistant', {\n"
    "        method: 'POST',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ message: trimmed, zone: zoneRef.current }),\n"
    "      });\n"
    "      const data = await res.json();\n"
    "      // The menu is never re-attached to every reply -- only when the\n"
    "      // server flags this particular one as a deliberate menu offer\n"
    "      // (a plain greeting, or the visitor explicitly asking for help).\n"
    "      const serverShowsMenu =\n"
    "        identityRef.current !== null &&\n"
    "        Boolean(data.showMenu) &&\n"
    "        Array.isArray(data.options) &&\n"
    "        data.options.length > 0;\n"
    "\n"
    "      setMessages((m) => [\n"
    "        ...(m || []),\n"
    "        {\n"
    "          role: 'assistant',\n"
    "          text: data.reply || 'Sorry, something went wrong — please try again.',\n"
    "          department: data.department,\n"
    "          href: data.href || null,\n"
    "          options: serverShowsMenu ? data.options : null,\n"
    "        },\n"
    "      ]);\n"
    "\n"
    "      // The first thing the visitor ever says in this conversation\n"
    "      // still earns the one spontaneous reveal (identity chooser, or\n"
    "      // the zone menu) -- unless the server already offered one for\n"
    "      // this exact reply.\n"
    "      if (isFirstMessage && !serverShowsMenu) {\n"
    "        pushReveal();\n"
    "      }\n"
    "    } catch {\n"
    "      setMessages((m) => [\n"
    "        ...(m || []),\n"
    "        { role: 'assistant', text: \"Sorry, I couldn't reach the server — please try again shortly.\" },\n"
    "      ]);\n"
    "    } finally {\n"
    "      setSending(false);\n"
    "    }\n"
    "  }",
    "sendMessage: stop auto-attaching menu, first-message reveal via pushReveal",
)

# 6. Identity cards -- pentagon icon badges (clip-path) instead of a
#    plain emoji, so the "who are you" step carries the same stylish
#    pentagon motif as the menu below.
c = r1(
    c,
    "                {m.kind === 'identity' && !identity && (\n"
    "                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>\n"
    "                    {IDENTITY_CARDS.map((card) => (\n"
    "                      <button\n"
    "                        key={card.id}\n"
    "                        type=\"button\"\n"
    "                        onClick={() => selectIdentity(card.id)}\n"
    "                        style={{\n"
    "                          flex: '1 1 90px',\n"
    "                          display: 'flex',\n"
    "                          flexDirection: 'column',\n"
    "                          alignItems: 'center',\n"
    "                          gap: '4px',\n"
    "                          background: 'var(--surface)',\n"
    "                          border: '1px solid var(--border)',\n"
    "                          borderRadius: 'var(--radius-m)',\n"
    "                          padding: '12px 8px',\n"
    "                          cursor: 'pointer',\n"
    "                          fontSize: '12.5px',\n"
    "                          fontWeight: 700,\n"
    "                          color: 'var(--ink)',\n"
    "                        }}\n"
    "                      >\n"
    "                        <span style={{ fontSize: '20px' }} aria-hidden=\"true\">{card.icon}</span>\n"
    "                        {t(card.label)}\n"
    "                      </button>\n"
    "                    ))}\n"
    "                  </div>\n"
    "                )}",
    "                {m.kind === 'identity' && !identity && (\n"
    "                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>\n"
    "                    {IDENTITY_CARDS.map((card) => (\n"
    "                      <button\n"
    "                        key={card.id}\n"
    "                        type=\"button\"\n"
    "                        onClick={() => selectIdentity(card.id)}\n"
    "                        style={{\n"
    "                          flex: '1 1 90px',\n"
    "                          display: 'flex',\n"
    "                          flexDirection: 'column',\n"
    "                          alignItems: 'center',\n"
    "                          gap: '8px',\n"
    "                          background: 'var(--surface)',\n"
    "                          border: '1px solid var(--border)',\n"
    "                          borderRadius: 'var(--radius-m)',\n"
    "                          padding: '14px 8px 10px',\n"
    "                          cursor: 'pointer',\n"
    "                          fontSize: '12.5px',\n"
    "                          fontWeight: 700,\n"
    "                          color: 'var(--ink)',\n"
    "                        }}\n"
    "                      >\n"
    "                        <span\n"
    "                          aria-hidden=\"true\"\n"
    "                          style={{\n"
    "                            width: '40px',\n"
    "                            height: '40px',\n"
    "                            display: 'flex',\n"
    "                            alignItems: 'center',\n"
    "                            justifyContent: 'center',\n"
    "                            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',\n"
    "                            background: 'linear-gradient(135deg, var(--gold) 0%, var(--brand) 100%)',\n"
    "                            fontSize: '18px',\n"
    "                          }}\n"
    "                        >\n"
    "                          {card.icon}\n"
    "                        </span>\n"
    "                        {t(card.label)}\n"
    "                      </button>\n"
    "                    ))}\n"
    "                  </div>\n"
    "                )}",
    "AssistantWidget: identity cards get pentagon badges",
)

# 7. Quick-option menu -- stacked rows, each with a numbered pentagon
#    badge (clip-path), instead of small wrapped pills. Text stays in a
#    normal rectangle so long labels never get clipped by the pentagon
#    itself -- only the small badge is pentagon-shaped.
c = r1(
    c,
    "                {Array.isArray(m.options) && m.options.length > 0 && (\n"
    "                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>\n"
    "                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>\n"
    "                      {t('What would you like to do next?')}\n"
    "                    </div>\n"
    "                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>\n"
    "                      {m.options.map((opt, oi) => (\n"
    "                        <button\n"
    "                          key={oi}\n"
    "                          type=\"button\"\n"
    "                          onClick={() => handleOptionClick(opt)}\n"
    "                          disabled={sending}\n"
    "                          style={{\n"
    "                            background: 'var(--brand-tint)',\n"
    "                            color: 'var(--brand-dark)',\n"
    "                            border: '1px solid var(--border)',\n"
    "                            borderRadius: '999px',\n"
    "                            padding: '6px 12px',\n"
    "                            fontSize: '12px',\n"
    "                            fontWeight: 600,\n"
    "                            cursor: sending ? 'not-allowed' : 'pointer',\n"
    "                            opacity: sending ? 0.6 : 1,\n"
    "                          }}\n"
    "                        >\n"
    "                          {t(opt.label)}\n"
    "                        </button>\n"
    "                      ))}\n"
    "                    </div>\n"
    "                  </div>\n"
    "                )}",
    "                {Array.isArray(m.options) && m.options.length > 0 && (\n"
    "                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>\n"
    "                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)' }}>\n"
    "                      {t('What would you like to do next?')}\n"
    "                    </div>\n"
    "                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>\n"
    "                      {m.options.map((opt, oi) => (\n"
    "                        <button\n"
    "                          key={oi}\n"
    "                          type=\"button\"\n"
    "                          onClick={() => handleOptionClick(opt)}\n"
    "                          disabled={sending}\n"
    "                          style={{\n"
    "                            display: 'flex',\n"
    "                            alignItems: 'center',\n"
    "                            gap: '10px',\n"
    "                            background: 'var(--surface)',\n"
    "                            color: 'var(--ink)',\n"
    "                            border: '1px solid var(--border)',\n"
    "                            borderRadius: 'var(--radius-m)',\n"
    "                            padding: '8px 12px',\n"
    "                            fontSize: '12.5px',\n"
    "                            fontWeight: 600,\n"
    "                            textAlign: 'start',\n"
    "                            cursor: sending ? 'not-allowed' : 'pointer',\n"
    "                            opacity: sending ? 0.6 : 1,\n"
    "                          }}\n"
    "                        >\n"
    "                          <span\n"
    "                            aria-hidden=\"true\"\n"
    "                            style={{\n"
    "                              width: '24px',\n"
    "                              height: '24px',\n"
    "                              flexShrink: 0,\n"
    "                              display: 'flex',\n"
    "                              alignItems: 'center',\n"
    "                              justifyContent: 'center',\n"
    "                              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',\n"
    "                              background: 'linear-gradient(135deg, var(--gold) 0%, var(--brand) 100%)',\n"
    "                              color: 'var(--on-accent)',\n"
    "                              fontSize: '10.5px',\n"
    "                              fontWeight: 800,\n"
    "                            }}\n"
    "                          >\n"
    "                            {oi + 1}\n"
    "                          </span>\n"
    "                          {t(opt.label)}\n"
    "                        </button>\n"
    "                      ))}\n"
    "                    </div>\n"
    "                  </div>\n"
    "                )}",
    "AssistantWidget: menu options get numbered pentagon badges",
)

save(path, c)
print("components/AssistantWidget.jsx: wait-for-input reveal flow, pentagon-badge design, zone-change reset, 35s idle nudge -- all applied.")

# =======================================================================
# app/api/assistant/route.js -- flag the two "this is a deliberate menu
# offer" replies (a plain greeting, an explicit help/menu ask) so the
# client can tell those apart from every other real answer, instead of
# stacking the menu onto literally every reply.
# =======================================================================
path = "app/api/assistant/route.js"
c = load(path)

c = r1(
    c,
    "  if (greetingType && isPureGreeting(message)) {\n"
    "    return NextResponse.json({\n"
    "      reply: greetingReply(greetingType, firstName),\n"
    "      department: null,\n"
    "      options: menuFor(zone),\n"
    "    });\n"
    "  }",
    "  if (greetingType && isPureGreeting(message)) {\n"
    "    return NextResponse.json({\n"
    "      reply: greetingReply(greetingType, firstName),\n"
    "      department: null,\n"
    "      options: menuFor(zone),\n"
    "      showMenu: true,\n"
    "    });\n"
    "  }",
    "route.js: showMenu on pure-greeting reply",
)

c = r1(
    c,
    "  if (wantsMenu(text)) {\n"
    "    return NextResponse.json({\n"
    "      reply: 'Here are a few things I can help with:',\n"
    "      department: null,\n"
    "      options: menuFor(zone),\n"
    "    });\n"
    "  }",
    "  if (wantsMenu(text)) {\n"
    "    return NextResponse.json({\n"
    "      reply: 'Here are a few things I can help with:',\n"
    "      department: null,\n"
    "      options: menuFor(zone),\n"
    "      showMenu: true,\n"
    "    });\n"
    "  }",
    "route.js: showMenu on explicit help/menu ask",
)

save(path, c)
print("app/api/assistant/route.js: showMenu flag added to the two deliberate-menu-offer replies.")
