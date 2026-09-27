'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const EMPTY_FORM = { nameEn: '', nameAr: '', code: '', description: '' };

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 11px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 13.5,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 12.5, color: 'var(--ink-soft)' };

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingId, setSavingId] = useState('');
  const [togglingId, setTogglingId] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/academic/faculties', { cache: 'no-store' });
      const result = await response.json();
      if (response.ok && result.success) {
        setFaculties(result.data || []);
      } else {
        setError(result.error || 'Failed to load faculties.');
      }
    } catch {
      setError('Failed to load faculties.');
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
      const response = await fetch('/api/admin/academic/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create this faculty.');
      }

      setForm(EMPTY_FORM);
      setMessage(`"${result.data.nameEn}" was added.`);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to create this faculty.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(faculty) {
    setEditingId(faculty.id);
    setEditForm({
      nameEn: faculty.nameEn || '',
      nameAr: faculty.nameAr || '',
      code: faculty.code || '',
      description: faculty.description || '',
    });
    setMessage('');
    setError('');
  }

  async function handleSaveEdit(id) {
    setSavingId(id);
    setError('');

    try {
      const response = await fetch(`/api/admin/academic/faculties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameEn: editForm.nameEn, nameAr: editForm.nameAr, description: editForm.description }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update this faculty.');
      }

      setEditingId('');
      setMessage('Faculty updated.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update this faculty.');
    } finally {
      setSavingId('');
    }
  }

  async function handleToggleActive(faculty) {
    setTogglingId(faculty.id);
    setError('');
    setMessage('');

    try {
      if (faculty.isActive) {
        const response = await fetch(`/api/admin/academic/faculties/${faculty.id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Failed to deactivate this faculty.');
        setMessage(result.message || 'Faculty deactivated.');
      } else {
        const response = await fetch(`/api/admin/academic/faculties/${faculty.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Failed to reactivate this faculty.');
        setMessage('Faculty reactivated.');
      }
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update this faculty.');
    } finally {
      setTogglingId('');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/admin" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
        <h1 style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 28, margin: '20px 0 6px' }}>Faculties</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24 }}>
          The top of the academic hierarchy (Faculty → Department → Programme → Course). Create and rename
          faculties here; each Dean manages their own faculty's departments from their own dashboard.
        </p>

        {message && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--success-tint)', color: 'var(--success)', fontSize: 13.5, fontWeight: 600 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="ih-card"
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 24 }}
        >
          <label style={{ flex: '1 1 200px' }}>
            <span style={labelStyle}>English name</span>
            <input required style={inputStyle} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} placeholder="e.g. Faculty of Islamic Studies" />
          </label>
          <label style={{ flex: '1 1 200px' }}>
            <span style={labelStyle}>Arabic name</span>
            <input required dir="rtl" style={inputStyle} value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} placeholder="كلية الدراسات الإسلامية" />
          </label>
          <label style={{ flex: '0 1 140px' }}>
            <span style={labelStyle}>Code</span>
            <input required style={inputStyle} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="FIS" />
          </label>
          <label style={{ flex: '1 1 240px' }}>
            <span style={labelStyle}>Description (optional)</span>
            <input style={inputStyle} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </label>
          <button
            type="submit"
            disabled={creating}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {creating ? 'Adding…' : 'Add Faculty'}
          </button>
        </form>

        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Faculty</th><th>Dean</th><th>Departments</th><th>Programmes</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={6}>Loading…</td></tr>
              ) : faculties.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={6}>No faculties yet — add the first one above.</td></tr>
              ) : (
                faculties.map((f) => (
                  editingId === f.id ? (
                    <tr key={f.id}>
                      <td colSpan={6}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, padding: '12px 0' }}>
                          <label>
                            <span style={labelStyle}>English name</span>
                            <input style={inputStyle} value={editForm.nameEn} onChange={(e) => setEditForm((p) => ({ ...p, nameEn: e.target.value }))} />
                          </label>
                          <label>
                            <span style={labelStyle}>Arabic name</span>
                            <input dir="rtl" style={inputStyle} value={editForm.nameAr} onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))} />
                          </label>
                          <label>
                            <span style={labelStyle}>Description</span>
                            <input style={inputStyle} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" disabled={savingId === f.id} onClick={() => handleSaveEdit(f.id)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                            {savingId === f.id ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingId('')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={f.id}>
                      <td>{f.nameEn}</td>
                      <td>{f.dean ? f.dean.user.name : <span style={{ color: 'var(--ink-soft)' }}>Unassigned</span>}</td>
                      <td>{f._count.departments}</td>
                      <td>{f._count.programs}</td>
                      <td>
                        <span className={`ih-badge ${f.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEdit(f)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={togglingId === f.id}
                            onClick={() => handleToggleActive(f)}
                            style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${f.isActive ? 'var(--danger-tint)' : 'var(--border)'}`, background: 'var(--surface)', color: f.isActive ? 'var(--danger)' : 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            {togglingId === f.id ? 'Working…' : f.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
