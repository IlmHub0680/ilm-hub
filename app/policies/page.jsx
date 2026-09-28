'use client';

import Link from 'next/link';

export default function PoliciesHub() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--brand)', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ? Back to Home
        </Link>

        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '15px' }}>Institute Policies & Transparency</h1>
            <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6' }}>
              Ulul Azm maintains absolute integrity and transparency regarding ads, sponsorships, and affiliate partnerships. Below are our official governing guidelines.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          <section id="affiliate-disclosure">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--brand)', marginBottom: '10px' }}>Affiliate Disclosure</h2>
            <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6' }}>
              In compliance with ethical standards, please assume that any links leading to products or services on external partner websites are affiliate links. Ulul Azm receives a small commission from purchases made through these links at no additional cost to you. We only recommend products aligned with Islamic educational values.
            </p>
          </section>

          <section id="sponsorship-policy">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--brand)', marginBottom: '10px' }}>Sponsorship Policy</h2>
            <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6' }}>
              All sponsored articles, banners, courses, and book promotions hosted on Ulul Azm are strictly vetted for ethical and religious compliance. Sponsored content is clearly marked with a visible <strong>SPONSORED</strong> badge, along with fixed start and end dates managed by our Sponsor Managers.
            </p>
          </section>

          <section id="ads-policy">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--brand)', marginBottom: '10px' }}>Ads Management Policy</h2>
            <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6' }}>
              Ad slots including Homepage Banners, Sidebar slots, and In-Content ads are regulated to maintain a distraction-free learning environment. Advertisements containing inappropriate material, misleading claims, or conflicting values are strictly prohibited. The administration retains full activation and deactivation control over all slots.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
