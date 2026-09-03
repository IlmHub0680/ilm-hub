'use client';

import { useEffect, useState } from 'react';

const DEFAULT_FEES = {
  juniorGhana: '',
  seniorGhana: '',
  matureGhana: '',
  juniorInternational: '',
  seniorInternational: '',
  matureInternational: '',
};

export default function AdmissionFeesPage() {
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    try {
      const response = await fetch('/api/admin/admission-fees');

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load admission fees.');
      }

      setFees({
        juniorGhana: result.data.juniorGhana,
        seniorGhana: result.data.seniorGhana,
        matureGhana: result.data.matureGhana,
        juniorInternational: result.data.juniorInternational,
        seniorInternational: result.data.seniorInternational,
        matureInternational: result.data.matureInternational,
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
      const response = await fetch('/api/admin/admission-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fees),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save admission fees.');
      }

      setFees({
        juniorGhana: result.data.juniorGhana,
        seniorGhana: result.data.seniorGhana,
        matureGhana: result.data.matureGhana,
        juniorInternational: result.data.juniorInternational,
        seniorInternational: result.data.seniorInternational,
        matureInternational: result.data.matureInternational,
      });

      setMessage('Admission fees updated successfully.');
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
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          padding: '40px',
          color: '#0f172a',
        }}
      >
        Loading admission fee settings...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '40px 24px 80px',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: '#64748b',
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
              color: '#0f172a',
            }}
          >
            Admission Fees
          </h1>

          <p
            style={{
              marginTop: '10px',
              color: '#64748b',
              lineHeight: 1.6,
            }}
          >
            Set the admission application fee for each learner category.
            Fees are determined by country of residence, not nationality.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '28px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '20px',
                color: '#14532d',
              }}
            >
              Ghana Resident Fees
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Applied when the applicant's country of residence is Ghana.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Junior Learner — GHS
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.juniorGhana}
                  onChange={(e) => handleChange('juniorGhana', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Senior Learner — GHS
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.seniorGhana}
                  onChange={(e) => handleChange('seniorGhana', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Mature Learner — GHS
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.matureGhana}
                  onChange={(e) => handleChange('matureGhana', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </section>

          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '28px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '20px',
                color: '#14532d',
              }}
            >
              International Resident Fees
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Applied when the applicant's country of residence is outside Ghana.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Junior Learner — USD
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.juniorInternational}
                  onChange={(e) => handleChange('juniorInternational', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Senior Learner — USD
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.seniorInternational}
                  onChange={(e) => handleChange('seniorInternational', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={{ display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  Mature Learner — USD
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={fees.matureInternational}
                  onChange={(e) => handleChange('matureInternational', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </section>

          {message && (
            <div
              style={{
                marginBottom: '20px',
                padding: '13px 16px',
                borderRadius: '8px',
                background: message.includes('successfully')
                  ? '#ecfdf5'
                  : '#fef2f2',
                color: message.includes('successfully')
                  ? '#166534'
                  : '#991b1b',
                border: `1px solid ${
                  message.includes('successfully') ? '#bbf7d0' : '#fecaca'
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
              background: saving ? '#94a3b8' : '#14532d',
              color: '#ffffff',
              padding: '13px 24px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Admission Fees'}
          </button>
        </form>
      </div>
    </main>
  );
}
