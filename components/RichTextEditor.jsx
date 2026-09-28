'use client';

import { useCallback, useEffect, useRef } from 'react';

// Small, dependency-free rich text editor shared across the app
// wherever someone needs to write formatted content without a full
// document-editing suite: student assignment answers, and admin-
// managed page bodies (About, Privacy Policy, Terms of Use, Refund
// Policy, News, Community Guidelines, ...). Deliberately minimal --
// bold/italic/underline/strikethrough, headings, bullet/numbered
// lists, blockquote, links, alignment, clear formatting, undo/redo --
// backed by a plain contentEditable div, so it adds no new
// dependency and no new failure mode. Stores/returns sanitized HTML.
//
// Model 27/28 follow-up: reported bug was "bullet list only bolds
// text, no bullet icon" in an exported Word document (a separate,
// unrelated code path -- this component was never involved in that),
// and separately, here, that clicking Bullet/Numbered List after
// pasting content did nothing or produced broken markup. The second
// issue is real and is fixed below: document.execCommand's list
// commands are a legacy, famously inconsistent browser API, and they
// get especially confused by (a) HTML pasted from Word/other apps
// carrying inline mso-* styles and stray tags, which our old paste
// handling didn't clean up at all, and (b) toggling a list command
// against a selection execCommand doesn't expect. Both are addressed
// below with a dedicated paste handler that strips foreign markup
// down to clean semantic HTML, and a manual (non-execCommand) list
// implementation that reliably works regardless of what was just
// pasted or clicked.

const TOOLBAR_BUTTONS = [
  { command: 'bold', label: 'B', title: 'Bold (Ctrl+B)', style: { fontWeight: 800 } },
  { command: 'italic', label: 'I', title: 'Italic (Ctrl+I)', style: { fontStyle: 'italic' } },
  { command: 'underline', label: 'U', title: 'Underline (Ctrl+U)', style: { textDecoration: 'underline' } },
  { command: 'strikeThrough', label: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
  { type: 'sep' },
  { command: 'formatBlock', value: 'H1', label: 'H1', title: 'Title' },
  { command: 'formatBlock', value: 'H2', label: 'H2', title: 'Heading' },
  { command: 'formatBlock', value: 'H3', label: 'H3', title: 'Subheading' },
  { command: 'formatBlock', value: 'P', label: 'P', title: 'Paragraph' },
  { command: 'formatBlock', value: 'BLOCKQUOTE', label: '"', title: 'Quote' },
  { type: 'sep' },
  { command: 'insertUnorderedList', label: '•—', title: 'Bullet list' },
  { command: 'insertOrderedList', label: '1.', title: 'Numbered list' },
  { command: 'outdent', label: '⇽', title: 'Decrease indent' },
  { command: 'indent', label: '⇾', title: 'Increase indent' },
  { type: 'sep' },
  { command: 'justifyLeft', label: '⇤', title: 'Align left' },
  { command: 'justifyCenter', label: '↔', title: 'Align center' },
  { command: 'justifyRight', label: '⇥', title: 'Align right' },
  { command: 'justifyFull', label: '▤', title: 'Justify' },
  { type: 'sep' },
  { command: 'createLink', label: '🔗', title: 'Insert link' },
  { command: 'unlink', label: 'Unlink', title: 'Remove link' },
  { command: 'removeFormat', label: 'Tx', title: 'Clear formatting' },
  { type: 'sep' },
  { command: 'undo', label: '↶', title: 'Undo (Ctrl+Z)' },
  { command: 'redo', label: '↷', title: 'Redo (Ctrl+Y)' },
];

function sanitize(html) {
  // Strip <script>/<style> tags and inline event handlers -- this
  // content can be rendered publicly (legal pages, news) or read by
  // instructors (assignment answers), so it must never carry
  // executable markup even though it only ever comes from
  // authenticated users of this system.
  return String(html || '')
    .replace(/<\/(script|style)>/gi, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/ on[a-z]+="[^"]*"/gi, '')
    .replace(/ on[a-z]+='[^']*'/gi, '');
}

// Cleans HTML pasted from Word, Google Docs, or other rich sources
// down to the small set of tags this editor actually supports --
// without this, Word's own mso-* inline styles, conditional comments,
// <o:p> tags and deeply nested spans can leave the contentEditable
// DOM in a state where execCommand's list/format commands stop
// working correctly on subsequent clicks (the exact symptom
// reported: paste content, then click Bullet List, and nothing
// happens or the markup comes out broken).
function cleanPastedHtml(html) {
  const container = document.createElement('div');
  container.innerHTML = String(html || '');

  // Drop Word's conditional-comment / XML islands and any <style>/
  // <script>/<meta>/<link> blocks entirely.
  container.querySelectorAll('style, script, meta, link, xml').forEach((el) => el.remove());

  const ALLOWED_TAGS = new Set([
    'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE',
    'H1', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'SPAN', 'DIV',
  ]);

  function unwrap(el) {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }

  // Walk every element; strip disallowed tags down to their text/
  // children, and strip all attributes except href on links (no
  // mso-* styles, no class names, no inline positioning survives).
  const all = Array.from(container.querySelectorAll('*'));
  for (const el of all) {
    if (!ALLOWED_TAGS.has(el.tagName)) {
      unwrap(el);
      continue;
    }
    const href = el.tagName === 'A' ? el.getAttribute('href') : null;
    for (const attr of Array.from(el.attributes)) {
      el.removeAttribute(attr.name);
    }
    if (href) el.setAttribute('href', href);
  }

  // SPAN/DIV that survive (Word wraps almost everything in these)
  // carry no useful semantics once their styles are stripped --
  // unwrap them so headings/lists/paragraphs aren't buried inside
  // meaningless wrapper divs that confuse list-toggling later.
  container.querySelectorAll('span, div').forEach((el) => unwrap(el));

  return sanitize(container.innerHTML);
}

// Manual list handling: instead of relying on execCommand's toggle
// behavior (unreliable right after a paste, or when the selection
// spans mixed content), this wraps/unwraps the selected top-level
// block(s) in a real <ul>/<ol> directly via the DOM. Falls back to
// execCommand only if there's no usable selection at all.
//
// Root-cause fix (reported symptom: type a sentence directly into the
// editor -- no Enter pressed yet, so it's still a bare text node with
// no <p>/<div> wrapper around it -- then highlight it and click
// Bullet/Numbered List: nothing visibly happens). Two things were
// wrong together:
//   1) execCommand's list commands can return `true` for a selection
//      that isn't inside any block element while doing nothing
//      visible (Chrome-specific quirk), so a truthy return value
//      alone was trusted as success. Fixed by verifying a real
//      UL/OL now actually exists in the editor before trusting it.
//   2) The manual fallback below required climbing from the
//      selection up to an existing P/DIV/H1/H2/H3/BLOCKQUOTE ancestor
//      -- but a bare text node typed directly into the editor has no
//      such ancestor (its parent IS the editor itself), so the walk
//      immediately hit `node === editor` and bailed out with no list
//      ever created. Fixed by wrapping the selected range's own
//      contents directly when no block ancestor exists, instead of
//      giving up.
function applyList(editor, ordered) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
    editor.focus();
  }

  const tag = ordered ? 'OL' : 'UL';

  // Snapshot the list count before running execCommand so success can
  // be verified by an actual DOM change, not just by editor.querySelector
  // finding SOME list -- content can already contain an earlier,
  // unrelated UL/OL from a previous edit, and querying for "any list
  // exists" would wrongly count that as success for a completely
  // different, still-untouched selection.
  const listCountBefore = editor.querySelectorAll(tag).length;

  try {
    const ok = document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
    // Don't trust the boolean alone -- confirm a list actually landed
    // in the DOM (see root-cause note above, point 1). A real change
    // either adds a new list (the common case) or removes one (toggling
    // list formatting back off on an already-listed selection) -- both
    // count as success; an unchanged count means execCommand silently
    // did nothing, the actual failure mode being fixed here.
    if (ok && editor.querySelectorAll(tag).length !== listCountBefore) {
      // execCommand succeeded -- but Chrome/Word-pasted content
      // sometimes still leaves the list nested inside a stray <p> or
      // <div>, so normalize: any UL/OL that's the sole child of a
      // block-level parent gets that parent unwrapped.
      editor.querySelectorAll(`${tag}`).forEach((list) => {
        const parent = list.parentElement;
        if (parent && parent !== editor && parent.children.length === 1 && /^(P|DIV)$/i.test(parent.tagName)) {
          parent.replaceWith(list);
        }
      });
      // Second root cause, found after the CSS fix alone still didn't
      // show markers: Chrome's native execCommand list commands can
      // carry the selection's PRIOR computed style forward as an
      // inline `style` attribute onto the list/list-item elements they
      // create -- and since Tailwind's Preflight reset means that
      // prior computed style was `list-style: none`, execCommand can
      // literally write `style="list-style-type: none"` (or similar)
      // straight onto the new <ul>/<ol>/<li>. An inline style attribute
      // always wins over any stylesheet rule, no matter how specific
      // (the earlier CSS-specificity fix), so that inline override
      // silently defeated it. It also gets saved into the stored HTML
      // (sanitize() only strips <script>/<style> tags and event
      // handlers, never a plain style attribute), so once written it
      // stays broken on every reload. Fixed by stripping any inline
      // list-style* declaration off every list/list-item element this
      // command just touched or created.
      editor.querySelectorAll(`${tag}, ${tag} > li`).forEach((el) => {
        if (el.style) {
          el.style.removeProperty('list-style');
          el.style.removeProperty('list-style-type');
          el.style.removeProperty('list-style-position');
        }
      });
      return true;
    }
  } catch (err) {
    // fall through to the manual path below
  }

  // Manual fallback. Prefer a real range over stale selection state.
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  if (!range) return false;

  let node = range.startContainer;
  while (node && node !== editor && node.nodeType !== 1) node = node.parentNode;
  while (node && node !== editor && !/^(P|DIV|H1|H2|H3|BLOCKQUOTE)$/i.test(node.tagName)) {
    node = node.parentNode;
  }

  if (node && node !== editor) {
    // Found a real block ancestor (the common case once content has
    // at least one Enter press in it) -- wrap it as before.
    const list = document.createElement(tag);
    const li = document.createElement('li');
    li.innerHTML = node.innerHTML || node.textContent || '';
    list.appendChild(li);
    node.replaceWith(list);
    return true;
  }

  // No block ancestor at all -- the selection sits in bare text
  // directly inside the editor (root-cause note above, point 2).
  // Wrap the selection's own contents instead of the (nonexistent)
  // block. If the selection is collapsed (just a caret, nothing
  // highlighted), wrap that whole top-level text run so clicking the
  // button still produces a visible list rather than doing nothing.
  let target = range;
  if (range.collapsed) {
    let run = range.startContainer;
    while (run && run.parentNode && run.parentNode !== editor) run = run.parentNode;
    if (!run || run === editor) return false;
    target = document.createRange();
    target.selectNode(run);
  }

  const list = document.createElement(tag);
  const li = document.createElement('li');
  try {
    li.appendChild(target.extractContents());
  } catch (err) {
    return false;
  }
  if (!li.textContent || !li.textContent.trim()) return false;
  list.appendChild(li);
  target.insertNode(list);
  return true;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = 220,
  disabled = false,
}) {
  const editorRef = useRef(null);
  // Seeded to null (never a real value, which is always a string --
  // even '' -- so null !== value always holds) rather than
  // useRef(value): the parent only mounts this component once the
  // real content has already been fetched, so the FIRST value this
  // component ever receives IS the real content. Seeding with
  // useRef(value) makes the sync effect's guard below false on its
  // very first run, so the initial innerHTML write never happens and
  // the editor renders permanently blank. Seeding with null instead
  // guarantees the effect's first run always performs that initial
  // sync, while the document.activeElement check still protects any
  // later external value change from clobbering in-progress typing.
  const lastValueRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastValueRef.current = value;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = sanitize(editorRef.current.innerHTML);
    lastValueRef.current = html;
    onChange?.(html);
  }, [onChange]);

  function runCommand(command, cmdValue) {
    if (disabled || !editorRef.current) return;
    editorRef.current.focus();

    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      applyList(editorRef.current, command === 'insertOrderedList');
      emitChange();
      return;
    }

    if (command === 'createLink') {
      const url = window.prompt('Link URL:', 'https://');
      if (!url) return;
      try {
        document.execCommand('createLink', false, url);
      } catch (err) {
        // unsupported -- no-op
      }
      emitChange();
      return;
    }

    try {
      document.execCommand(command, false, cmdValue);
    } catch (err) {
      // execCommand can throw for unsupported commands in some
      // browsers -- formatting simply doesn't apply, nothing breaks.
    }
    emitChange();
  }

  function handlePaste(e) {
    if (disabled) return;
    const clipboard = e.clipboardData;
    if (!clipboard) return;

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    // Only intercept when there's HTML to clean up (Word, Google
    // Docs, a web page). Plain-text paste (e.g. from a .txt file or
    // another contentEditable) goes through the browser's default
    // handling untouched.
    if (!html) return;

    e.preventDefault();

    const cleaned = cleanPastedHtml(html) || (text ? text.replace(/\n/g, '<br>') : '');
    if (!cleaned) return;

    try {
      document.execCommand('insertHTML', false, cleaned);
    } catch (err) {
      // Fallback: insert as plain text if insertHTML isn't supported.
      document.execCommand('insertText', false, text || '');
    }
    emitChange();
  }

  function handleKeyDown(e) {
    if (disabled) return;
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;

    // A handful of standard Word-style shortcuts -- browsers already
    // handle bold/italic/underline via execCommand's default keymap
    // in most cases, but redo (Ctrl+Y) is inconsistent across
    // browsers, so it's wired explicitly here.
    if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      runCommand('redo');
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'var(--surface)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--paper)',
        }}
      >
        {TOOLBAR_BUTTONS.map((btn, i) =>
          btn.type === 'sep' ? (
            <span
              key={`sep-${i}`}
              style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }}
            />
          ) : (
            <button
              key={btn.command + (btn.value || '')}
              type="button"
              title={btn.title}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(btn.command, btn.value)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 8px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--surface)',
                color: 'var(--ink)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                lineHeight: '30px',
                ...btn.style,
              }}
            >
              {btn.label}
            </button>
          )
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="ih-rich-text-editor"
        style={{
          minHeight: `${minHeight}px`,
          padding: '16px',
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--ink)',
          outline: 'none',
          overflowY: 'auto',
        }}
      />

      <style jsx>{`
        .ih-rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: var(--ink-soft);
        }
        .ih-rich-text-editor h1 {
          font-size: 1.8em;
          font-weight: 800;
          margin: 0.6em 0 0.3em;
        }
        .ih-rich-text-editor h2 {
          font-size: 1.4em;
          font-weight: 800;
          margin: 0.6em 0 0.3em;
        }
        .ih-rich-text-editor h3 {
          font-size: 1.15em;
          font-weight: 700;
          margin: 0.6em 0 0.3em;
        }
        .ih-rich-text-editor p {
          margin: 0 0 0.8em;
        }
        /* !important here on purpose: content saved from before this
           fix (or pasted from elsewhere) can already carry an inline
           style="list-style-type: none" that Chrome's execCommand
           wrote directly onto the element -- see the matching note in
           applyList() above. An inline style attribute otherwise beats
           any stylesheet rule regardless of specificity, so without
           !important this couldn't fix content already saved to the
           database, only brand-new edits. */
        .ih-rich-text-editor ul {
          list-style-type: disc !important;
        }
        .ih-rich-text-editor ol {
          list-style-type: decimal !important;
        }
        .ih-rich-text-editor ul,
        .ih-rich-text-editor ol {
          margin: 0 0 0.8em;
          padding-left: 1.4em;
        }
        .ih-rich-text-editor li {
          margin-bottom: 0.3em;
        }
        .ih-rich-text-editor blockquote {
          margin: 0.8em 0;
          padding: 0.7em 1em;
          border-left: 3px solid var(--gold, #a3792f);
          background: var(--brand-tint, #eaf1ec);
          border-radius: 0 8px 8px 0;
          color: var(--ink);
        }
        .ih-rich-text-editor a {
          color: var(--brand);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
