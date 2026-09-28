'use client';
import { useState, useEffect, type CSSProperties } from 'react';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
    { href: '/registry-dashboard', label: 'Admission Applications', icon: '📥' },
    { href: '/registry-dashboard/fees', label: 'Application Fee Settings', icon: '💵' },
];

const EMPTY_FEES = {
    juniorGhana: '',
    seniorGhana: '',
    matureGhana: '',
    juniorInternational: '',
    seniorInternational: '',
    matureInternational: '',
};

const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 13px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14.5,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
};

export default function RegistryFeeSettingsPage() {
    const [fees, setFees] = useState({ ...EMPTY_FEES });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admissions/fees');
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Failed to load application fees.');
            }

            setFees({
                juniorGhana: String(result.data.juniorGhana),
                seniorGhana: String(result.data.seniorGhana),
                matureGhana: String(result.data.matureGhana),
                juniorInternational: String(result.data.juniorInternational),
                seniorInternational: String(result.data.seniorInternational),
                matureInternational: String(result.data.matureInternational),
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load application fees.');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(field: string, value: string) {
        setFees((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/admissions/fees', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fees),
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Failed to save application fees.');
            }

            setMessage('Application fees updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to save application fees.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <DashboardShell
            brandSub="Registry / Admissions"
            brandIcon="📥"
            navItems={NAV_ITEMS}
            activeId="fees"
            title="Application Fee Settings"
            subtitle="Set the student admission application fee for each learner category, by country of residence."
        >
            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: 'var(--success-tint)', color: 'var(--success)' }}>
                    {message}
                </div>
            )}
            {error && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div>
            ) : (
                <form onSubmit={handleSave}>
                    <div className="ih-card" style={{ marginBottom: 20 }}>
                        <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--brand)' }}>Ghana Resident Fees</h2>
                        <p style={{ margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: 13.5 }}>
                            Applied when the applicant's country of residence is Ghana.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Junior Learner — GHS</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.juniorGhana} onChange={(e) => handleChange('juniorGhana', e.target.value)} />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Senior Learner — GHS</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.seniorGhana} onChange={(e) => handleChange('seniorGhana', e.target.value)} />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Mature Learner — GHS</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.matureGhana} onChange={(e) => handleChange('matureGhana', e.target.value)} />
                            </label>
                        </div>
                    </div>

                    <div className="ih-card" style={{ marginBottom: 20 }}>
                        <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--brand)' }}>International Resident Fees</h2>
                        <p style={{ margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: 13.5 }}>
                            Applied when the applicant's country of residence is outside Ghana.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Junior Learner — USD</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.juniorInternational} onChange={(e) => handleChange('juniorInternational', e.target.value)} />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Senior Learner — USD</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.seniorInternational} onChange={(e) => handleChange('seniorInternational', e.target.value)} />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Mature Learner — USD</span>
                                <input type="number" min={0} step="0.01" required style={inputStyle} value={fees.matureInternational} onChange={(e) => handleChange('matureInternational', e.target.value)} />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            border: 'none',
                            borderRadius: 9,
                            background: saving ? 'var(--ink-soft)' : 'var(--brand)',
                            color: 'var(--on-accent)',
                            padding: '12px 22px',
                            fontSize: 14.5,
                            fontWeight: 800,
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? 'Saving…' : 'Save Application Fees'}
                    </button>
                </form>
            )}
        </DashboardShell>
    );
}
