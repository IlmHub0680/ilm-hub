# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "components/AssistantWidget.jsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. A tiny best-effort logger, right after the t() helper is defined.
c = r1(
    c,
    "  const t = (text) => at(lang, text);",
    """  const t = (text) => at(lang, text);

  // Best-effort, fire-and-forget -- never lets an analytics hiccup
  // touch the actual conversation. Logs only structured event metadata,
  // never the visitor's typed text (see app/api/assistant/event/route.js).
  function logEvent(type, extra = {}) {
    try {
      fetch('/api/assistant/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...extra }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }""",
    "widget: add logEvent helper",
)

# 2. Log 'open' the first time the widget is actually opened.
c = r1(
    c,
    """  function handleOptionClick(option) {
    if (sending) return;
    sendMessage(option.value);
  }""",
    """  function handleOptionClick(option) {
    if (sending) return;
    logEvent('quick_option', { zone: effectiveZone, label: option.label });
    sendMessage(option.value);
  }""",
    "widget: log quick_option clicks",
)

c = r1(
    c,
    """  function selectIdentity(id) {
    setIdentity(id);""",
    """  function selectIdentity(id) {
    logEvent('identity_selected', { identity: id });
    setIdentity(id);""",
    "widget: log identity_selected",
)

c = r1(
    c,
    """  function changeLang(next) {
    setLang(next);""",
    """  function changeLang(next) {
    logEvent('language_selected', { language: next });
    setLang(next);""",
    "widget: log language_selected",
)

c = r1(
    c,
    """        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t('Close assistant') : t('Open institute assistant')}""",
    """        onClick={() => {
          if (!open) logEvent('open', { zone: effectiveZone });
          setOpen((o) => !o);
        }}
        aria-label={open ? t('Close assistant') : t('Open institute assistant')}""",
    "widget: log open event on launcher click",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("components/AssistantWidget.jsx: event logging wired in.")
