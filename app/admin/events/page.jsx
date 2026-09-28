'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const EMPTY_FORM = {
  titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
  eventDate: '', eventTime: '', location: '', onlineLink: '',
  thumbnailUrl: '', detailsLink: '', isPublished: false,
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
  color: 'var(--ink)', backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 };

export default function AdminEventsPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setEvents(null);
    setError('');
    try {
      const res = await fetch('/api/admin/events', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load events.');
      setEvents(result.data);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(event) {
    setEditingId(event.id);
    setForm({
      titleEn: event.titleEn, titleAr: event.titleAr, descriptionEn: event.descriptionEn,
      descriptionAr: event.descriptionAr, eventDate: event.eventDate.slice(0, 10),
      eventTime: event.eventTime, location: event.location, onlineLink: event.onlineLink,
      thumbnailUrl: event.thumbnailUrl, detailsLink: event.detailsLink, isPublished: event.isPublished,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'events');
      const res = await fetch('/api/admin/uploads/image', { method: 'POST', credentials: 'include', body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Upload failed.');
      set('thumbnailUrl', result.url);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.titleEn.trim() || !form.descriptionEn.trim() || !form.eventDate) {
      setMessage('Please fill in a title, description, and event date.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const url = editingId ? `/api/admin/events/${editingId}` : '/api/admin/events';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save.');
      setMessage(editingId ? 'Event updated.' : 'Event created.');
      cancelEdit();
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(event) {
    setBusyId(event.id);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !event.isPublished }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update.');
      setEvents((prev) => prev.map((e) => (e.id === event.id ? result.data : e)));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 880 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Events</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Create and manage events shown publicly at /events. Only events
          marked Published are visible to the public; everything else stays
          a draft.
        </p>
      </div>

      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>{message}</div>}

      <form onSubmit={submit} className="ih-card" style={{ padding: 22, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{editingId ? 'Edit Event' : 'New Event'}</h2>

        <div>
          <label style={labelStyle}>Title (English) *</label>
          <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Title (Arabic)</label>
          <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }} />
        </div>
        <div>
          <label style={labelStyle}>Description (English) *</label>
          <textarea value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} required />
        </div>
        <div>
          <label style={labelStyle}>Description (Arabic)</label>
          <textarea value={form.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: 'vertical', direction: 'rtl', textAlign: 'right' }} />
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Time</label>
            <input placeholder="e.g. 6:00 PM" value={form.eventTime} onChange={(e) => set('eventTime', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label style={labelStyle}>Location</label>
            <input placeholder="Physical location, if any" value={form.location} onChange={(e) => set('location', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 260px' }}>
            <label style={labelStyle}>Online Link</label>
            <input placeholder="Zoom / stream link, if any" value={form.onlineLink} onChange={(e) => set('onlineLink', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Details / Registration Link</label>
          <input value={form.detailsLink} onChange={(e) => set('detailsLink', e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Thumbnail Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {form.thumbnailUrl && (
              <div style={{ width: 80, height: 54, borderRadius: 8, backgroundImage: `url(${form.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading && <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Uploading…</span>}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
          Published (visible on the public site)
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={primaryButtonStyle}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={secondaryButtonStyle}>Cancel</button>
          )}
        </div>
      </form>

      {events === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
      {events && events.length === 0 && (
        <div className="ih-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>No events yet.</div>
      )}

      {events && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((event) => (
            <div key={event.id} className="ih-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{event.titleEn}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: event.isPublished ? 'var(--brand-tint)' : 'var(--border)', color: event.isPublished ? 'var(--brand)' : 'var(--ink-soft)' }}>
                    {event.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  {new Date(event.eventDate).toLocaleDateString()}{event.eventTime ? ` · ${event.eventTime}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="button" onClick={() => startEdit(event)} style={secondaryButtonStyle}>Edit</button>
                <button
                  type="button"
                  disabled={busyId === event.id}
                  onClick={() => togglePublish(event)}
                  style={event.isPublished ? secondaryButtonStyle : primaryButtonStyle}
                >
                  {event.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const primaryButtonStyle = {
  padding: '10px 18px', borderRadius: 8, border: 'none',
  background: 'var(--brand)', color: 'var(--on-accent)',
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
};

const secondaryButtonStyle = {
  padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
};
