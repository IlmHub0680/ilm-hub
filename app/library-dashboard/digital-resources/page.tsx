'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { INSTITUTE_LIBRARY_VISIBILITY_TIERS } from '@/lib/institute-library-visibility.constants';

const VISIBILITY_LABEL_MAP = Object.fromEntries(
  INSTITUTE_LIBRARY_VISIBILITY_TIERS.map((t: any) => [t.value, t.label])
);

const CATEGORY_LABELS: Record<string, string> = {
  DIGITAL_BOOKS: 'Digital Books',
  EBOOKS: 'E-Books',
  ARTICLES: 'Articles',
  FATWAS: 'Fatwas',
  RESEARCH_PAPERS: 'Research Papers',
  MANUSCRIPTS: 'Manuscripts',
  MUTOON_TEXTS: 'Mutoon / Texts',
  ACADEMIC_RESOURCES: 'Academic Resources',
  ISLAMIC_SCHOLARLY_RESOURCES: 'Islamic Scholarly Resources',
  COURSE_RESOURCES: 'Course Resources',
};

export default function DigitalResourcesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/library/institute-resources', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load Digital Library items.');
      setItems(data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load Digital Library items.');
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
      public: items.filter((i) => i.isPublished && i.visibility === 'PUBLIC').length,
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

  async function togglePublished(item: any) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/library/institute-resources/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update item.');
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    } catch (err: any) {
      alert(err.message || 'Failed to update item.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item: any) {
    if (!confirm(`Delete "${item.titleEn}"? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/library/institute-resources/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete item.');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
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
          <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
            The institute's own e-books, articles, fatwas, research papers,
            manuscripts, mutoon/texts and other digital scholarly resources --
            separate from the platform owner's personal Library and from the
            physical circulation catalogue.
          </div>
        </div>

        <Link href="/library-dashboard/digital-resources/new" className="ih-btn ih-btn-primary">
          + Add New Resource
        </Link>
      </div>

      <div className="ih-stat-grid" style={{ marginBottom: 24 }}>
        <div className="ih-stat-tile accent">
          <div className="n">{stats.total}</div>
          <div className="l">Total resources</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{stats.published}</div>
          <div className="l">Published</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{stats.draft}</div>
          <div className="l">Draft / Under Review</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{stats.public}</div>
          <div className="l">Public tier</div>
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
              {CATEGORY_LABELS[c] || c}
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
              <th>Visibility</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  Loading Digital Library resources…
                </td>
              </tr>
            )}

            {!loading && visibleItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  No Digital Library resources yet. Click "Add New Resource" to add the first one.
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
                  <span className="ih-badge ih-b-neutral">{CATEGORY_LABELS[item.category] || item.category}</span>
                </td>
                <td>{item.author || '—'}</td>
                <td>
                  <span className="ih-badge ih-b-neutral">
                    {VISIBILITY_LABEL_MAP[item.visibility] || item.visibility}
                  </span>
                </td>
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
                      href={`/library-dashboard/digital-resources/${item.id}`}
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
    </>
  );
}
