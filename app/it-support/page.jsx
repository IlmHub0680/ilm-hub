'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useEffect, useState } from 'react';

export default function ItSupportPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/legal-content')
      .then((res) => res.json())
      .then((result) => setFaqs(result?.data?.faqsTechnical || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 34px', boxShadow: '0 4px 20px rgba(27,36,31,.06)' }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>
            IT Support &amp; Help
          </h1>
          <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Answers to common account and technical issues -- for programme, admissions or academic questions, see
            our <Link href="/faq" style={{ color: 'var(--brand)', fontWeight: 700 }}>general FAQ</Link> instead.
          </p>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : faqs.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)' }}>
              No technical support questions are published yet. Please use the{' '}
              <Link href="/contact" style={{ color: 'var(--brand)', fontWeight: 700 }}>Contact page</Link> for help.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {faqs.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div key={index} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : index)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 16px',
                        background: 'var(--paper)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        fontSize: 15,
                      }}
                    >
                      <span>{item.question}</span>
                      <span>{open ? '\u2212' : '+'}</span>
                    </button>
                    {open && (
                      <div style={{ padding: '0 16px 16px', color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 14.5 }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
      <SiteFooter />
    </>
  );
}
