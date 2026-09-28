'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useEffect, useState } from 'react';

const ITEMS = [
  { key: 'address', icon: '📍', label: 'Institute Address' },
  { key: 'poBox', icon: '📮', label: 'P.O. Box' },
  { key: 'phone', icon: '☎️', label: 'Telephone' },
  { key: 'whatsapp', icon: '💬', label: 'WhatsApp' },
  { key: 'email', icon: '✉️', label: 'Email' },
  { key: 'admissionsEmail', icon: '🎓', label: 'Admissions' },
  { key: 'bookstoreEmail', icon: '📚', label: 'Bookstore' },
  { key: 'officeHours', icon: '🕘', label: 'Office Hours' },
];

export default function ContactPage() {
  const [contact, setContact] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/legal-content')
      .then((res) => res.json())
      .then((result) => setContact(result?.data?.contact || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 34px', boxShadow: '0 4px 20px rgba(27,36,31,.06)' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>
            Contact Ulul Azm
          </h1>
          <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
            We welcome enquiries from prospective students, current students, parents, scholars, authors, publishers, and educational partners.
          </p>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              {ITEMS.filter((item) => contact[item.key]).map((item) => (
                <div key={item.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {item.label}
                    </div>
                    <div style={{ color: 'var(--ink)', fontSize: 15 }}>{contact[item.key]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
      <SiteFooter />
    </>
  );
}
