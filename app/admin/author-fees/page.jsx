'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEFAULT_FEES = {
  ghana: '',
  ghanaCurrency: 'GHS',
  international: '',
  internationalCurrency: 'USD',
  isActive: true,
  description: '',
  paymentMethod: 'Paystack',
  validityDays: '',
  effectiveDate: '',
};

export default function AuthorFeesPage() {
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    try {
      const response = await fetch('/api/admin/author-fees');

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load author application fees.');
      }

      setFees({
        ghana: result.data.ghana,
        ghanaCurrency: result.data.ghanaCurrency,
        international: result.data.international,
        internationalCurrency: result.data.internationalCurrency,
        isActive: result.data.isActive,
        description: result.data.description || '',
        paymentMethod: result.data.paymentMethod || 'Paystack',
        validityDays: result.data.validityDays ?? '',
        effectiveDate: result.data.effectiveDate || '',
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setFees((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/author-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fees),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save author application fees.');
      }

      setFees({
        ghana: result.data.ghana,
        ghanaCurrency: result.data.ghanaCurrency,
        international: result.data.international,
        internationalCurrency: result.data.internationalCurrency,
        isActive: result.data.isActive,
        description: result.data.description || '',
        paymentMethod: result.data.paymentMethod || 'Paystack',
        validityDays: result.data.validityDays ?? '',
        effectiveDate: result.data.effectiveDate || '',
      });

      setMessage('Author application fee settings updated successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '15px',
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '700' };

  const sectionStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 4px 18px rgba(27,36,31,.08)',
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--paper)',
          padding: '40px',
          color: 'var(--ink)',
        }}
      >
        Loading author application fee settings...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        padding: '40px 24px 80px',
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <Link
          href="/admin"
          style={{ display: 'inline-block', marginBottom: '18px', color: 'var(--brand)', fontWeight: 600, fontSize: '13.5px', textDecoration: 'none' }}
        >
          ← Back to Admin
        </Link>

        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            Administration
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: '800',
              color: 'var(--ink)',
            }}
          >
            Author Application Fee
          </h1>

          <p
            style={{
              marginTop: '10px',
              color: 'var(--ink-soft)',
              lineHeight: 1.6,
            }}
          >
            Set the fee a prospective author must pay when applying to publish
            on Ulul Azm. This is entirely separate from the Student Admission
            Fee — authors are not split by age tier, only by country of
            residence.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--brand)' }}>
              Application Fee Amount
            </h2>

            <p style={{ margin: '0 0 22px', color: 'var(--ink-soft)', fontSize: '14px' }}>
              Determined by the applicant's stated country of residence, not nationality —
              the same convention used for student admission fees.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              <label>
                <span style={labelStyle}>Ghana Resident Fee</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.ghana}
                  onChange={(e) => handleChange('ghana', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Ghana Currency</span>
                <input
                  type="text"
                  maxLength={3}
                  required
                  value={fees.ghanaCurrency}
                  onChange={(e) => handleChange('ghanaCurrency', e.target.value.toUpperCase())}
                  style={inputStyle}
                  placeholder="GHS"
                />
              </label>

              <label>
                <span style={labelStyle}>International Resident Fee</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.international}
                  onChange={(e) => handleChange('international', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>International Currency</span>
                <input
                  type="text"
                  maxLength={3}
                  required
                  value={fees.internationalCurrency}
                  onChange={(e) => handleChange('internationalCurrency', e.target.value.toUpperCase())}
                  style={inputStyle}
                  placeholder="USD"
                />
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: 'var(--brand)' }}>
              Availability
            </h2>

            <p style={{ margin: '0 0 22px', color: 'var(--ink-soft)', fontSize: '14px' }}>
              Control whether new author applications are currently being accepted.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                <input
                  type="checkbox"
                  checked={fees.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Applications currently open
              </label>

              <label>
                <span style={labelStyle}>Effective Date (optional)</span>
                <input
                  type="date"
                  value={fees.effectiveDate}
                  onChange={(e) => handleChange('effectiveDate', e.target.value)}
                  style={inputStyle}
                />
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Leave blank to take effect immediately. If set in the future, applications stay closed until this date.
                </span>
              </label>

              <label>
                <span style={labelStyle}>Application Validity (days, optional)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fees.validityDays}
                  onChange={(e) => handleChange('validityDays', e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. 14"
                />
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  How long an applicant has to pay before their application fee expires. Leave blank for no expiry.
                </span>
              </label>

              <label>
                <span style={labelStyle}>Payment Method</span>
                <input
                  type="text"
                  value={fees.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  style={inputStyle}
                />
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Informational label shown to applicants. Applicants can always pay via Paystack; Stripe (card) is also offered automatically for international (USD) applications.
                </span>
              </label>
            </div>

            <label style={{ display: 'block', marginTop: '20px' }}>
              <span style={labelStyle}>Fee Description (shown to applicants)</span>
              <textarea
                rows={3}
                value={fees.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="One-time non-refundable fee to process a new author application."
              />
            </label>
          </section>

          {message && (
            <div
              style={{
                marginBottom: '20px',
                padding: '13px 16px',
                borderRadius: '8px',
                background: message.includes('successfully')
                  ? 'var(--success-tint)'
                  : 'var(--danger-tint)',
                color: message.includes('successfully')
                  ? 'var(--brand-light)'
                  : 'var(--danger)',
                border: `1px solid ${
                  message.includes('successfully') ? 'var(--success)' : 'var(--danger)'
                }`,
                fontWeight: '600',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              border: 'none',
              borderRadius: '9px',
              background: saving ? 'var(--ink-soft)' : 'var(--brand)',
              color: 'var(--on-accent)',
              padding: '13px 24px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Author Application Fee'}
          </button>
        </form>
      </div>
    </main>
  );
}
