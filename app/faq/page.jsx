'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useEffect, useState } from 'react';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/legal-content')
      .then((res) => res.json())
      .then((result) => setFaqs(result?.data?.faqs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 34px', boxShadow: '0 4px 20px rgba(27,36,31,.06)' }}>
          <h1 style={{ margin: '0 0 26px', fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>
            Frequently Asked Questions
          </h1>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {faqs.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div key={index} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`faq-answer-${index}`}
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
                      <span aria-hidden="true">{open ? '−' : '+'}</span>
                    </button>
                    {open && (
                      <div id={`faq-answer-${index}`} style={{ padding: '0 16px 16px', color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 14.5 }}>
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
