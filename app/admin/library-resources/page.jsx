'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { categoryLabel } from '@/lib/library';

export default function LibraryResourcesOverviewPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/library-resources/items', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load Library items.');
      setItems(data.items);
    } catch (err) {
      setError(err.message || 'Failed to load Library items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      published: items.filter((i) => i.isPublished).length,
      draft: items.filter((i) => !i.isPublished).length,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    if (categoryFilter === 'ALL') return items;
    return items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  async function togglePublished(item) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/library-resources/items/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update item.');
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    } catch (err) {
      alert(err.message || 'Failed to update item.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Delete "${item.titleEn}"? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/library-resources/items/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete item.');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err.message || 'Failed to delete item.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 1180 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>Library</h1>
          <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
            Articles, fatwas, research papers, manuscripts and other written
            content — freely published, independent of Media subscriptions.
          </div>
        </div>

        <Link href="/admin/library-resources/items/new" className="ih-btn ih-btn-primary">
          + Add New Item
        </Link>
      </div>

      <div className="ih-stat-grid" style={{ marginBottom: 24 }}>
        <div className="ih-stat-tile accent">
          <div className="n">{stats.total}</div>
          <div className="l">Total items</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{stats.published}</div>
          <div className="l">Published</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{stats.draft}</div>
          <div className="l">Draft</div>
        </div>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)' }}>
            Filter by category:
          </span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`ih-badge ${categoryFilter === 'ALL' ? 'ih-b-info' : 'ih-b-neutral'}`}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`ih-badge ${categoryFilter === c ? 'ih-b-info' : 'ih-b-neutral'}`}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="ih-tbl-wrap">
        <table className="ih-tbl">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  Loading Library items…
                </td>
              </tr>
            )}

            {!loading && visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  No Library items yet. Click "Add New Item" to add the first one.
                </td>
              </tr>
            )}

            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.titleEn}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }} dir="rtl">
                    {item.titleAr}
                  </div>
                </td>
                <td>
                  <span className="ih-badge ih-b-neutral">{categoryLabel(item.category)}</span>
                </td>
                <td>{item.author || '—'}</td>
                <td>
                  <button
                    onClick={() => togglePublished(item)}
                    disabled={busyId === item.id}
                    className={`ih-badge ${item.isPublished ? 'ih-b-success' : 'ih-b-neutral'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href={`/admin/library-resources/items/${item.id}`}
                      className="ih-btn ih-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12.5 }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteItem(item)}
                      disabled={busyId === item.id}
                      className="ih-btn ih-btn-danger"
                      style={{ padding: '6px 12px', fontSize: 12.5 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
