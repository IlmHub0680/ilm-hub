'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEFAULT_CONTENT = {
  heroEyebrow: '',
  heroTitle: '',
  heroSubtitle: '',
  statsHeading: '',
  spotlightLabel: '',
  spotlightHeading: '',
  spotlightSubtitle: '',
  ctaHeading: '',
  ctaText: '',
};

function emptyStat() {
  return { value: '', label: '', isActive: true };
}

function emptyProfile() {
  return { name: '', graduationYear: '', program: '', photoUrl: '', currentRole: '', quote: '', isActive: true };
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 13px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14.5,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 };

export default function AlumniAdminPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [stats, setStats] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/alumni', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setContent(result.data.content ? { ...DEFAULT_CONTENT, ...result.data.content } : DEFAULT_CONTENT);
        setStats(result.data.stats || []);
        setProfiles(result.data.profiles || []);
      } else {
        setMessage(result.error || 'Failed to load.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load.');
    } finally {
      setLoading(false);
    }
  }

  function set(field, value) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateStat(index, field, value) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function moveStat(index, direction) {
    setStats((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addStat() {
    setStats((prev) => [...prev, emptyStat()]);
  }

  function removeStat(index) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProfile(index, field, value) {
    setProfiles((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function moveProfile(index, direction) {
    setProfiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addProfile() {
    setProfiles((prev) => [...prev, emptyProfile()]);
  }

  function removeProfile(index) {
    setProfiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/alumni', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, stats, profiles }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save.');
      }

      setContent({ ...DEFAULT_CONTENT, ...result.data.content });
      setStats(result.data.stats);
      setProfiles(result.data.profiles);
      setMessage('Alumni page updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading alumni page content...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 820 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Alumni Page</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The public /alumni page -- hero copy, the statistics strip, and the alumni spotlight stories. The
          Statistics and Spotlight sections start empty and only appear on the public page once you add real
          entries here; nothing is invented or filled in automatically.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Hero</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={content.heroEyebrow} onChange={(e) => set('heroEyebrow', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={content.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={content.heroSubtitle}
              onChange={(e) => set('heroSubtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Statistics</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Real figures only -- e.g. a graduate count you can stand behind. Leave this list empty to hide the
            statistics strip on the public page entirely.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.map((stat, i) => (
              <div key={stat.id || i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input
                  value={stat.value}
                  onChange={(e) => updateStat(i, 'value', e.target.value)}
                  style={{ ...inputStyle, flex: '1 1 120px' }}
                  placeholder="e.g. 120+"
                />
                <input
                  value={stat.label}
                  onChange={(e) => updateStat(i, 'label', e.target.value)}
                  style={{ ...inputStyle, flex: '2 1 220px' }}
                  placeholder="e.g. Graduates since founding"
                />
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => moveStat(i, -1)} disabled={i === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
                  <button type="button" onClick={() => moveStat(i, 1)} disabled={i === stats.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
                  <button type="button" onClick={() => removeStat(i)} className="ih-btn ih-btn-danger">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addStat} className="ih-btn ih-btn-secondary" style={{ marginTop: 12 }}>
            + Add Statistic
          </button>

          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={labelStyle}>Statistics section heading</span>
            <input value={content.statsHeading} onChange={(e) => set('statsHeading', e.target.value)} style={inputStyle} required />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Alumni Spotlight</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Real graduates only, with their permission. Leave this list empty to hide the spotlight section on
            the public page entirely.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {profiles.map((profile, i) => (
              <div
                key={profile.id || i}
                style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    value={profile.name}
                    onChange={(e) => updateProfile(i, 'name', e.target.value)}
                    style={{ ...inputStyle, flex: '2 1 180px' }}
                    placeholder="Full name"
                  />
                  <input
                    value={profile.graduationYear}
                    onChange={(e) => updateProfile(i, 'graduationYear', e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 100px' }}
                    placeholder="Grad. year"
                  />
                  <input
                    value={profile.program}
                    onChange={(e) => updateProfile(i, 'program', e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 160px' }}
                    placeholder="Programme"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    value={profile.currentRole}
                    onChange={(e) => updateProfile(i, 'currentRole', e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 200px' }}
                    placeholder="Current role (e.g. Imam, XYZ Mosque)"
                  />
                  <input
                    value={profile.photoUrl}
                    onChange={(e) => updateProfile(i, 'photoUrl', e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 200px' }}
                    placeholder="Photo URL (optional)"
                  />
                </div>
                <textarea
                  value={profile.quote}
                  onChange={(e) => updateProfile(i, 'quote', e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="A short quote from them (optional)"
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                  <input
                    type="checkbox"
                    checked={profile.isActive !== false}
                    onChange={(e) => updateProfile(i, 'isActive', e.target.checked)}
                  />
                  Active
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => moveProfile(i, -1)} disabled={i === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
                  <button type="button" onClick={() => moveProfile(i, 1)} disabled={i === profiles.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
                  <button type="button" onClick={() => removeProfile(i)} className="ih-btn ih-btn-danger">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addProfile} className="ih-btn ih-btn-secondary" style={{ marginTop: 12 }}>
            + Add Alumni Story
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
            <label>
              <span style={labelStyle}>Spotlight label</span>
              <input value={content.spotlightLabel} onChange={(e) => set('spotlightLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>Spotlight heading</span>
              <input value={content.spotlightHeading} onChange={(e) => set('spotlightHeading', e.target.value)} style={inputStyle} required />
            </label>
          </div>
          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={labelStyle}>Spotlight description</span>
            <input value={content.spotlightSubtitle} onChange={(e) => set('spotlightSubtitle', e.target.value)} style={inputStyle} required />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Stay Connected Call-to-Action</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Heading</span>
            <input value={content.ctaHeading} onChange={(e) => set('ctaHeading', e.target.value)} style={inputStyle} required />
          </label>
          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={content.ctaText}
              onChange={(e) => set('ctaText', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        {message && (
          <div
            className="ih-card"
            style={{
              padding: '12px 14px',
              background: message.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',
              color: message.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',
            }}
          >
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="ih-btn ih-btn-primary" style={{ alignSelf: 'flex-start', padding: '13px 28px' }}>
          {saving ? 'Saving...' : 'Save Alumni Page'}
        </button>
      </form>
    </main>
  );
}
