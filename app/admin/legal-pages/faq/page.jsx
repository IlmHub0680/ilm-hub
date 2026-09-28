'use client';

import { useEffect, useState } from 'react';

const EMPTY_ITEM = { question: '', answer: '', category: 'general', isActive: true };

export default function FaqAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/legal-pages/faq');
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load FAQ.');
        setItems(result.data.length > 0 ? result.data : [{ ...EMPTY_ITEM }]);
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index, dir) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      const cleaned = items.filter((it) => it.question.trim() && it.answer.trim());
      const res = await fetch('/api/admin/legal-pages/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cleaned }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to save FAQ.');

      setItems(result.data.length > 0 ? result.data : [{ ...EMPTY_ITEM }]);
      setMessage('Saved successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14.5,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  if (loading) return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading…</main>;

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 900 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Legal & Info Pages
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>Frequently Asked Questions</h1>
      <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        General questions are shown publicly at /faq; Technical Support questions are shown separately at
        /it-support. Drag order with the arrows; a question left blank is dropped on save.
      </p>

      <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Question {index + 1}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select
                  value={item.category || 'general'}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  style={{
                    padding: '5px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 12.5,
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <option value="general">General (/faq)</option>
                  <option value="technical">Technical Support (/it-support)</option>
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => moveItem(index, -1)} style={miniBtnStyle}>↑</button>
                  <button type="button" onClick={() => moveItem(index, 1)} style={miniBtnStyle}>↓</button>
                  <button type="button" onClick={() => removeItem(index)} style={{ ...miniBtnStyle, color: 'var(--danger)' }}>✕</button>
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Question"
              value={item.question}
              onChange={(e) => updateItem(index, 'question', e.target.value)}
              style={{ ...inputStyle, marginBottom: 8, fontWeight: 700 }}
            />

            <textarea
              placeholder="Answer"
              rows={3}
              value={item.answer}
              onChange={(e) => updateItem(index, 'answer', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        style={{
          marginBottom: 24,
          border: '1px dashed var(--border)',
          borderRadius: 9,
          background: 'transparent',
          color: 'var(--brand)',
          padding: '10px 18px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        + Add Question
      </button>

      {message && (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 16px',
            borderRadius: 8,
            background: message === 'Saved successfully.' ? 'var(--success-tint)' : 'var(--danger-tint)',
            color: message === 'Saved successfully.' ? 'var(--brand-light)' : 'var(--danger)',
            border: `1px solid ${message === 'Saved successfully.' ? 'var(--success)' : 'var(--danger)'}`,
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          border: 'none',
          borderRadius: 9,
          background: saving ? 'var(--ink-soft)' : 'var(--brand)',
          color: 'var(--on-accent)',
          padding: '13px 24px',
          fontSize: 15,
          fontWeight: 800,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Saving…' : 'Save FAQ'}
      </button>
    </main>
  );
}

const miniBtnStyle = {
  width: 28,
  height: 28,
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--paper)',
  color: 'var(--ink)',
  cursor: 'pointer',
  fontSize: 13,
};
