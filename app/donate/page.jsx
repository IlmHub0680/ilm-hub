'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DonationsPage() {
  const [donationType, setDonationType] = useState('One-Time');
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState('USD');
  const [purpose, setPurpose] = useState('General Institute Support');
  const [donorName, setDonorName] = useState('');
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleDonate = (e) => {
    e.preventDefault();
    const data = {
      id: 'DON-' + Math.floor(100000 + Math.random() * 900000),
      donorName: donorName || 'Anonymous Supporter',
      amount,
      currency,
      purpose,
      type: donationType,
      date: new Date().toISOString().split('T')[0],
      status: 'Successful'
    };
    setReceiptData(data);
    setReceiptGenerated(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← Back to Home
        </Link>
        
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Support Ilm Hub Institute</h1>
          <p style={{ color: '#4b5563', marginBottom: '30px' }}>
            Your contributions directly fund authentic Islamic education, student support, and community outreach.
          </p>

          {!receiptGenerated ? (
            <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Donation Type</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {['One-Time', 'Recurring'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDonationType(type)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: donationType === type ? '2px solid #059669' : '1px solid #d1d5db',
                        backgroundColor: donationType === type ? '#ecfdf5' : '#ffffff',
                        color: donationType === type ? '#047857' : '#374151',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {type} Donation
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="GHS">GHS (₵)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Purpose / Fund</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                  <option value="General Institute Support">General Institute Support</option>
                  <option value="Student Scholarship Fund">Student Scholarship Fund</option>
                  <option value="Library & Publication Expansion">Library & Publication Expansion</option>
                  <option value="Online Media & Broadcasting">Online Media & Broadcasting</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Donor Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank for Anonymous"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '14px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginTop: '10px'
                }}
              >
                Proceed with Secure Donation
              </button>
            </form>
          ) : (
            <div style={{ backgroundColor: '#f3f4f6', padding: '24px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <h2 style={{ color: '#059669', marginBottom: '15px' }}>✓ Donation Successful & Receipt Generated</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#374151', marginBottom: '20px' }}>
                <p><strong>Receipt ID:</strong> {receiptData.id}</p>
                <p><strong>Donor Name:</strong> {receiptData.donorName}</p>
                <p><strong>Amount:</strong> {receiptData.amount} {receiptData.currency}</p>
                <p><strong>Purpose:</strong> {receiptData.purpose}</p>
                <p><strong>Type:</strong> {receiptData.type}</p>
                <p><strong>Date:</strong> {receiptData.date}</p>
                <p><strong>Status:</strong> <span style={{ color: '#059669', fontWeight: '600' }}>{receiptData.status}</span></p>
              </div>
              <button
                onClick={() => setReceiptGenerated(false)}
                style={{ backgroundColor: '#374151', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Make Another Donation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}