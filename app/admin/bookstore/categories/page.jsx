'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useState } from 'react';

const EMPTY_FORM = { nameEn: '', nameAr: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingId, setSavingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/publishing/categories', { cache: 'no-store' });
      const result = await response.json();

      setCategories(Array.isArray(result) ? result : result.data || result.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/publishing/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create this category.');
      }

      setForm(EMPTY_FORM);
      setMessage(`"${result.data.nameEn}" was added.`);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to create this category.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditForm({ nameEn: category.nameEn || '', nameAr: category.nameAr || '' });
    setMessage('');
    setError('');
  }

  async function handleSaveEdit(id) {
    setSavingId(id);
    setError('');

    try {
      const response = await fetch(`/api/admin/publishing/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update this category.');
      }

      setEditingId('');
      setMessage('Category updated.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update this category.');
    } finally {
      setSavingId('');
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/publishing/categories/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete this category.');
      }

      setMessage('Category deleted.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to delete this category.');
    } finally {
      setDeletingId('');
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 6px', color: 'var(--ink)' }}>
          Categories
        </h1>
        <p style={{ color: 'var(--ink-soft)' }}>
          Shared across the Bookstore, the academic Course catalog, and Programmes — add a new
          category here (e.g. a new Islamic subject area) and it becomes selectable everywhere at once.
        </p>

        {message && (
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--success-tint)', color: 'var(--success)', fontSize: 13.5, fontWeight: 600 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          style={{
            marginTop: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 4px 18px rgba(27,36,31,.08)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <label style={{ flex: '1 1 220px' }}>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>English name</span>
            <input
              type="text"
              required
              value={form.nameEn}
              onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
              placeholder="e.g. Usul al-Fiqh"
              style={inputStyle}
            />
          </label>
          <label style={{ flex: '1 1 220px' }}>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Arabic name</span>
            <input
              type="text"
              dir="rtl"
              required
              value={form.nameAr}
              onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
              placeholder="أصول الفقه"
              style={inputStyle}
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--brand)',
              color: 'var(--on-accent)',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {creating ? 'Adding…' : 'Add Category'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 4px 18px rgba(27,36,31,.08)',
          }}
        >
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories yet — add the first one above.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
                gap: 14,
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 16,
                    background: 'var(--paper)',
                  }}
                >
                  {editingId === category.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        value={editForm.nameEn}
                        onChange={(e) => setEditForm((p) => ({ ...p, nameEn: e.target.value }))}
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={editForm.nameAr}
                        onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))}
                        style={{ ...inputStyle, fontFamily: 'var(--font-arabic-display)' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          disabled={savingId === category.id}
                          onClick={() => handleSaveEdit(category.id)}
                          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId('')}
                          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-display)',
                          fontSize: 15.5,
                          color: 'var(--ink)',
                        }}
                      >
                        {category.nameEn || category.name || 'Unnamed'}
                      </strong>

                      {category.nameAr && (
                        <div
                          dir="rtl"
                          lang="ar"
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: '1px solid var(--border)',
                            fontFamily: 'var(--font-arabic-display)',
                            fontSize: 17,
                            fontWeight: 600,
                            lineHeight: 1.5,
                            color: 'var(--ink)',
                          }}
                        >
                          {category.nameAr}
                        </div>
                      )}

                      {category.slug && (
                        <small style={{ display: 'block', marginTop: 8, color: 'var(--ink-soft)' }}>
                          /{category.slug}
                        </small>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === category.id}
                          onClick={() => handleDelete(category.id)}
                          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--danger-tint)', background: 'var(--surface)', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          {deletingId === category.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
