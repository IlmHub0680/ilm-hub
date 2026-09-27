'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const MODULE_LABELS = {
  STUDENT_MATTERS: 'Student Matters',
  ACADEMIC_RECORDS: 'Academic Records',
  FACULTY_MATTERS: 'Faculty Matters',
  DEPARTMENT_MATTERS: 'Department Matters',
  PROGRAM_MATTERS: 'Program Matters',
  COURSES_GRADES: 'Courses & Grades',
  EXAMINATIONS: 'Examinations',
  FINANCE_FEES: 'Finance — Fees',
  FINANCE_PAYROLL: 'Finance — Payroll',
  LIBRARY_OPS: 'Library Operations',
  ICT_OPS: 'ICT Operations',
  ADMISSIONS: 'Admissions',
  QUALITY_ASSURANCE: 'Quality Assurance',
  OTHER_ADMIN: 'Other Admin',
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, width: '100%', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)' };

const positionCardStyle = {
  padding: '18px 20px',
  borderRadius: 14,
  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
};

const permRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 14px',
  borderRadius: 10,
  background: 'var(--paper)',
  border: '1px solid var(--border)',
};

const toggleLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
};

export default function AdminPositionsPage() {
  const [positions, setPositions] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [newPosition, setNewPosition] = useState({ nameEn: '', nameAr: '', code: '', description: '', isAcademic: false });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/admin/positions', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load positions.');
      setPositions(result.data);
    } catch (err) {
      setError(err.message);
      setPositions([]);
    }
  }

  function toggleExpand(position) {
    if (expandedId === position.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(position.id);
    setDrafts((prev) => ({
      ...prev,
      [position.id]: prev[position.id] || {
        permissions: position.permissions.map((p) => ({ ...p })),
        isAcademic: position.isAcademic,
        isActive: position.isActive,
      },
    }));
  }

  function updateDraftPermission(positionId, moduleName, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        permissions: prev[positionId].permissions.map((p) =>
          p.module === moduleName ? { ...p, [field]: value } : p
        ),
      },
    }));
  }

  async function savePosition(positionId) {
    const draft = drafts[positionId];
    if (!draft) return;
    setBusyId(positionId);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/positions/${positionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAcademic: draft.isAcademic,
          isActive: draft.isActive,
          permissions: draft.permissions,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save.');
      setMessage('Position updated — this is logged in the Audit Log.');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function createPosition() {
    if (!newPosition.nameEn.trim() || !newPosition.nameAr.trim() || !newPosition.code.trim()) {
      setMessage('English name, Arabic name, and a code are required.');
      return;
    }
    setCreating(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/positions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosition),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to create position.');
      setNewPosition({ nameEn: '', nameAr: '', code: '', description: '', isAcademic: false });
      setMessage('Position created with no permissions granted — set its access below.');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 1040 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Positions & Permissions</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 760 }}>
          Every position's module access, in one place. Changing a toggle here
          immediately changes what every staff member holding that position can
          view or edit — every save is recorded in the Audit Log. New positions
          start with no access at all, so nothing is ever granted by accident.
          This defines what a <em>role</em> can do — assigning people to roles
          happens in <Link href="/admin/staff" style={{ color: 'var(--brand)', fontWeight: 700 }}>Staff Management</Link>.
        </p>
      </div>

      <section className="ih-card" style={{ padding: 22, marginBottom: 28, borderRadius: 14 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>➕</span> Create Position
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, marginBottom: 14 }}>
          <input type="text" placeholder="Name (English)" value={newPosition.nameEn} onChange={(e) => setNewPosition({ ...newPosition, nameEn: e.target.value })} style={fieldStyle} />
          <input type="text" placeholder="Name (Arabic)" value={newPosition.nameAr} onChange={(e) => setNewPosition({ ...newPosition, nameAr: e.target.value })} style={fieldStyle} dir="rtl" />
          <input type="text" placeholder="Code (e.g. REGISTRAR)" value={newPosition.code} onChange={(e) => setNewPosition({ ...newPosition, code: e.target.value })} style={fieldStyle} />
          <input type="text" placeholder="Description (optional)" value={newPosition.description} onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })} style={fieldStyle} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, marginBottom: 16 }}>
          <input type="checkbox" checked={newPosition.isAcademic} onChange={(e) => setNewPosition({ ...newPosition, isAcademic: e.target.checked })} />
          This is an academic position
        </label>
        <button className="ih-btn ih-btn-primary" disabled={creating} onClick={createPosition}>
          {creating ? 'Creating…' : 'Create Position'}
        </button>
      </section>

      {error && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16, color: 'var(--danger)' }}>{error}</div>}
      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16, fontSize: 13.5 }}>{message}</div>}

      {positions === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}

      {positions && positions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {positions.map((position) => {
            const isExpanded = expandedId === position.id;
            const draft = drafts[position.id];
            const grantedCount = position.permissions.filter((p) => p.canView || p.canEdit).length;
            return (
              <div
                key={position.id}
                className="ih-card"
                style={{
                  ...positionCardStyle,
                  border: `1px solid ${isExpanded ? 'var(--brand)' : 'var(--border)'}`,
                  opacity: position.isActive ? 1 : 0.6,
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', cursor: 'pointer' }}
                  onClick={() => toggleExpand(position)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: position.isAcademic ? 'var(--brand-tint, #eef3fb)' : 'var(--gold-tint, #fbf3df)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>
                      {position.isAcademic ? '🎓' : '🏛'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15.5 }}>
                        {position.nameEn}{' '}
                        <span style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 500 }}>({position.code})</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span>{position.isAcademic ? 'Academic' : 'Non-academic'}</span>
                        <span>·</span>
                        <span>{position.activeStaffCount} active staff</span>
                        <span>·</span>
                        <span>{grantedCount} module{grantedCount === 1 ? '' : 's'} granted</span>
                        {!position.isActive && (
                          <span style={{ color: 'var(--danger)', fontWeight: 700 }}>· Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12.5, color: 'var(--brand)', fontWeight: 800,
                    padding: '6px 14px', borderRadius: 999, background: 'var(--brand-tint, #eef3fb)',
                  }}>
                    {isExpanded ? 'Close ▲' : 'Manage ▼'}
                  </span>
                </div>

                {isExpanded && draft && (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={draft.isAcademic}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], isAcademic: e.target.checked } }))}
                        />
                        Academic position
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={draft.isActive}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], isActive: e.target.checked } }))}
                        />
                        Active (can be assigned to staff)
                      </label>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
                      Module Access
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 18 }}>
                      {draft.permissions.map((p) => {
                        const active = p.canView || p.canEdit;
                        return (
                          <div
                            key={p.module}
                            style={{
                              ...permRowStyle,
                              background: active ? 'var(--brand-tint, #eef3fb)' : 'var(--paper)',
                              borderColor: active ? 'var(--brand)' : 'var(--border)',
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{MODULE_LABELS[p.module] || p.module}</span>
                            <div style={{ display: 'flex', gap: 14 }}>
                              <label style={toggleLabelStyle}>
                                <input
                                  type="checkbox"
                                  checked={p.canView}
                                  onChange={(e) => updateDraftPermission(position.id, p.module, 'canView', e.target.checked)}
                                />
                                View
                              </label>
                              <label style={toggleLabelStyle}>
                                <input
                                  type="checkbox"
                                  checked={p.canEdit}
                                  onChange={(e) => updateDraftPermission(position.id, p.module, 'canEdit', e.target.checked)}
                                />
                                Edit
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className="ih-btn ih-btn-primary"
                      disabled={busyId === position.id}
                      onClick={() => savePosition(position.id)}
                    >
                      {busyId === position.id ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
