'use client';
import { useState } from 'react';
import { useRecords } from '../context';

type CalendarEntryDraft = {
    section: string;
    procedure: string;
    gregorianDate: string;
    hijriDate: string;
};

export default function AcademicCalendarPage() {
    const { calendars, loadingCalendars, calendarsError, refetchCalendars, message, setMessage } = useRecords();

    const [newYearLabel, setNewYearLabel] = useState('');
    const [newHijriLabel, setNewHijriLabel] = useState('');
    const [creatingCalendar, setCreatingCalendar] = useState(false);

    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [selectedCalendarStatus, setSelectedCalendarStatus] = useState<string | null>(null);
    const [editYearLabel, setEditYearLabel] = useState('');
    const [editHijriLabel, setEditHijriLabel] = useState('');
    const [editEntries, setEditEntries] = useState<CalendarEntryDraft[]>([]);
    const [loadingSelectedCalendar, setLoadingSelectedCalendar] = useState(false);
    const [savingCalendar, setSavingCalendar] = useState(false);
    const [publishingCalendar, setPublishingCalendar] = useState(false);
    const [deletingCalendarId, setDeletingCalendarId] = useState<string | null>(null);

    const handleSelectCalendar = async (id: string) => {
        setSelectedCalendarId(id);
        setLoadingSelectedCalendar(true);
        setMessage('');
        try {
            const res = await fetch(`/api/records/academic-calendar/${id}`, { credentials: 'include' });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to load this calendar.');
                setSelectedCalendarId(null);
                return;
            }
            setSelectedCalendarStatus(result.calendar.status);
            setEditYearLabel(result.calendar.academicYearLabel);
            setEditHijriLabel(result.calendar.hijriYearLabel);
            setEditEntries(
                result.calendar.entries.map((e: any) => ({
                    section: e.section,
                    procedure: e.procedure,
                    gregorianDate: e.gregorianDate,
                    hijriDate: e.hijriDate,
                }))
            );
        } catch {
            setMessage('Unable to load this calendar.');
            setSelectedCalendarId(null);
        } finally {
            setLoadingSelectedCalendar(false);
        }
    };

    const handleCreateCalendar = async () => {
        if (!newYearLabel.trim() || !newHijriLabel.trim()) {
            setMessage('Enter both the academic year and the Hijri year.');
            return;
        }
        setCreatingCalendar(true);
        setMessage('');
        try {
            const res = await fetch('/api/records/academic-calendar', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academicYearLabel: newYearLabel, hijriYearLabel: newHijriLabel }),
            });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to create this academic calendar.');
                return;
            }
            setNewYearLabel('');
            setNewHijriLabel('');
            refetchCalendars();
            handleSelectCalendar(result.calendar.id);
        } catch {
            setMessage('Unable to create this academic calendar.');
        } finally {
            setCreatingCalendar(false);
        }
    };

    const handleAddEntryRow = () => {
        setEditEntries((prev) => [...prev, { section: '', procedure: '', gregorianDate: '', hijriDate: '' }]);
    };

    const handleEntryFieldChange = (index: number, field: keyof CalendarEntryDraft, value: string) => {
        setEditEntries((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const handleRemoveEntryRow = (index: number) => {
        setEditEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveCalendar = async () => {
        if (!selectedCalendarId) return;
        setSavingCalendar(true);
        setMessage('');
        try {
            const res = await fetch(`/api/records/academic-calendar/${selectedCalendarId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academicYearLabel: editYearLabel, hijriYearLabel: editHijriLabel, entries: editEntries }),
            });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to save this academic calendar.');
                return;
            }
            setMessage('Draft saved.');
            refetchCalendars();
        } catch {
            setMessage('Unable to save this academic calendar.');
        } finally {
            setSavingCalendar(false);
        }
    };

    const handlePublishCalendar = async () => {
        if (!selectedCalendarId) return;
        if (!window.confirm('Publish this calendar? It will immediately become the calendar every portal shows, and the current published calendar (if any) will be archived.')) {
            return;
        }
        setPublishingCalendar(true);
        setMessage('');
        try {
            const res = await fetch(`/api/records/academic-calendar/${selectedCalendarId}/publish`, {
                method: 'POST',
                credentials: 'include',
            });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to publish this academic calendar.');
                return;
            }
            setMessage('Academic calendar published.');
            setSelectedCalendarStatus('PUBLISHED');
            refetchCalendars();
        } catch {
            setMessage('Unable to publish this academic calendar.');
        } finally {
            setPublishingCalendar(false);
        }
    };

    const handleDeleteCalendar = async (id: string) => {
        if (!window.confirm('Delete this draft calendar? This cannot be undone.')) return;
        setDeletingCalendarId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/records/academic-calendar/${id}`, { method: 'DELETE', credentials: 'include' });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to delete this draft.');
                return;
            }
            if (selectedCalendarId === id) {
                setSelectedCalendarId(null);
                setSelectedCalendarStatus(null);
            }
            refetchCalendars();
        } catch {
            setMessage('Unable to delete this draft.');
        } finally {
            setDeletingCalendarId(null);
        }
    };

    return (
        <>
            <div className="ih-card" style={{ marginBottom: 20 }}>
                {message && (
                    <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 16, borderRadius: 8 }}>
                        {message}
                    </div>
                )}
                <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Academic Calendar</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                    The one official Academic Calendar shown across every portal (Student, Faculty, Department, staff and
                    Admin). Only one calendar is ever published at a time — publishing a new draft archives whichever
                    calendar was published before it, so every past academic calendar stays on file.
                </p>

                {loadingCalendars ? (
                    <p>Loading academic calendars…</p>
                ) : calendarsError ? (
                    <p style={{ color: 'var(--danger)' }}>{calendarsError}</p>
                ) : (
                    <div className="ih-tbl-wrap" style={{ marginBottom: 16 }}>
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Academic Year</th>
                                    <th>Hijri Year</th>
                                    <th>Status</th>
                                    <th>Rows</th>
                                    <th>Created By</th>
                                    <th>Published</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {calendars.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No academic calendars yet.</td></tr>
                                ) : (
                                    calendars.map((c: any) => (
                                        <tr key={c.id}>
                                            <td>{c.academicYearLabel}</td>
                                            <td>{c.hijriYearLabel}</td>
                                            <td><span className={`ih-badge ${c.status === 'PUBLISHED' ? 'ih-b-success' : c.status === 'ARCHIVED' ? 'ih-b-neutral' : 'ih-b-warning'}`}>{c.status}</span></td>
                                            <td>{c.entryCount}</td>
                                            <td>{c.createdByName}</td>
                                            <td>{c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : '—'}</td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => handleSelectCalendar(c.id)} className="ih-btn ih-btn-ghost" style={{ fontSize: 12.5, padding: '5px 10px' }}>
                                                    {c.status === 'DRAFT' ? 'Edit' : 'View'}
                                                </button>
                                                {c.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleDeleteCalendar(c.id)}
                                                        disabled={deletingCalendarId === c.id}
                                                        className="ih-btn ih-btn-danger"
                                                        style={{ fontSize: 12.5, padding: '5px 10px' }}
                                                    >
                                                        {deletingCalendarId === c.id ? '…' : 'Delete'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Academic Year</label>
                        <input
                            type="text"
                            placeholder="e.g. 2026/2027"
                            value={newYearLabel}
                            onChange={(e) => setNewYearLabel(e.target.value)}
                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Hijri Year</label>
                        <input
                            type="text"
                            placeholder="e.g. 1448/1449 AH"
                            value={newHijriLabel}
                            onChange={(e) => setNewHijriLabel(e.target.value)}
                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 }}
                        />
                    </div>
                    <button onClick={handleCreateCalendar} disabled={creatingCalendar} className="ih-btn ih-btn-gold">
                        {creatingCalendar ? 'Creating…' : 'New Draft Calendar'}
                    </button>
                </div>
            </div>

            {selectedCalendarId && (
                <div className="ih-card">
                    {loadingSelectedCalendar ? (
                        <p>Loading…</p>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                                <h3 style={{ margin: 0, fontSize: 16 }}>
                                    {selectedCalendarStatus === 'DRAFT' ? 'Editing Draft' : 'Viewing'} — {editYearLabel || 'Untitled'}
                                </h3>
                                <button onClick={() => { setSelectedCalendarId(null); setSelectedCalendarStatus(null); }} className="ih-btn ih-btn-ghost" style={{ fontSize: 12.5 }}>
                                    Close
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Academic Year</label>
                                    <input
                                        type="text"
                                        value={editYearLabel}
                                        disabled={selectedCalendarStatus !== 'DRAFT'}
                                        onChange={(e) => setEditYearLabel(e.target.value)}
                                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Hijri Year</label>
                                    <input
                                        type="text"
                                        value={editHijriLabel}
                                        disabled={selectedCalendarStatus !== 'DRAFT'}
                                        onChange={(e) => setEditHijriLabel(e.target.value)}
                                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 }}
                                    />
                                </div>
                            </div>

                            <div className="ih-tbl-wrap" style={{ marginBottom: 12 }}>
                                <table className="ih-tbl">
                                    <thead>
                                        <tr>
                                            <th>Semester / Section</th>
                                            <th>Procedure</th>
                                            <th>Gregorian Date</th>
                                            <th>Hijri Date</th>
                                            {selectedCalendarStatus === 'DRAFT' && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editEntries.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No rows yet.</td></tr>
                                        ) : (
                                            editEntries.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.section}
                                                            disabled={selectedCalendarStatus !== 'DRAFT'}
                                                            placeholder="e.g. First Semester"
                                                            onChange={(e) => handleEntryFieldChange(index, 'section', e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 6, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, width: '100%' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.procedure}
                                                            disabled={selectedCalendarStatus !== 'DRAFT'}
                                                            placeholder="e.g. Start of the New Academic Year"
                                                            onChange={(e) => handleEntryFieldChange(index, 'procedure', e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 6, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, width: '100%' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.gregorianDate}
                                                            disabled={selectedCalendarStatus !== 'DRAFT'}
                                                            placeholder="e.g. September 1, 2026"
                                                            onChange={(e) => handleEntryFieldChange(index, 'gregorianDate', e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 6, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, width: '100%' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.hijriDate}
                                                            disabled={selectedCalendarStatus !== 'DRAFT'}
                                                            placeholder="e.g. 19 Safar 1448"
                                                            onChange={(e) => handleEntryFieldChange(index, 'hijriDate', e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 6, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, width: '100%' }}
                                                        />
                                                    </td>
                                                    {selectedCalendarStatus === 'DRAFT' && (
                                                        <td>
                                                            <button onClick={() => handleRemoveEntryRow(index)} className="ih-btn ih-btn-danger" style={{ fontSize: 12, padding: '4px 8px' }}>
                                                                Remove
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {selectedCalendarStatus === 'DRAFT' && (
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <button onClick={handleAddEntryRow} className="ih-btn ih-btn-ghost">
                                        + Add Row
                                    </button>
                                    <button onClick={handleSaveCalendar} disabled={savingCalendar} className="ih-btn ih-btn-gold">
                                        {savingCalendar ? 'Saving…' : 'Save Draft'}
                                    </button>
                                    <button onClick={handlePublishCalendar} disabled={publishingCalendar || editEntries.length === 0} className="ih-btn ih-btn-primary">
                                        {publishingCalendar ? 'Publishing…' : 'Publish'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
