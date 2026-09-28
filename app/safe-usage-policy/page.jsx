'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageFeedback from '@/components/PageFeedback';

export default function SafeUsagePolicyPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '36px 34px',
              boxShadow: '0 4px 20px rgba(27,36,31,.06)',
            }}
          >
            <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>
              Safe Usage Policy
            </h1>
            <p style={{ margin: '0 0 30px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              This policy sets out how to use the Institute&apos;s website, Student Portal, Admin Portal and
              related systems safely and responsibly. It applies to every student, staff member and visitor who
              uses these systems.
            </p>

            <Section title="Protect Your Account">
              <ul style={list}>
                <li>Keep your password private and do not share your login with anyone else.</li>
                <li>Log out of the Student Portal or Admin Portal when using a shared or public device.</li>
                <li>Report a lost, stolen or compromised password immediately through Contact Support.</li>
                <li>Do not attempt to access another person&apos;s account or impersonate someone else.</li>
              </ul>
            </Section>

            <Section title="Respect the Systems">
              <ul style={list}>
                <li>Do not attempt to gain unauthorised access to any part of the Institute&apos;s systems.</li>
                <li>Do not upload viruses, malware or any content intended to disrupt the platform.</li>
                <li>Do not attempt to bypass security controls, rate limits or access restrictions.</li>
                <li>Report bugs or security concerns responsibly through Contact Support rather than exploiting them.</li>
              </ul>
            </Section>

            <Section title="Respect Others">
              <ul style={list}>
                <li>Communicate respectfully in any discussion, community or messaging feature.</li>
                <li>Do not post content that is abusive, harassing, discriminatory or dishonest.</li>
                <li>Do not use the platform to share another person&apos;s private information without consent.</li>
              </ul>
            </Section>

            <Section title="Use Data Responsibly">
              <ul style={list}>
                <li>Only access student, academic or administrative records you are authorised to see.</li>
                <li>Do not copy, share or publish records or data obtained through the Institute&apos;s systems.</li>
                <li>
                  See our{' '}
                  <Link href="/privacy" style={link}>
                    Privacy Policy
                  </Link>{' '}
                  for how personal data is handled, and our{' '}
                  <Link href="/terms" style={link}>
                    Terms of Use
                  </Link>{' '}
                  for the full terms covering use of these systems.
                </li>
              </ul>
            </Section>

            <Section title="If Something Goes Wrong">
              If you notice unsafe, abusive or suspicious activity on any Institute system, or you run into a
              technical or security issue yourself, please let us know through{' '}
              <Link href="/contact" style={link}>
                Contact Support
              </Link>{' '}
              or visit our{' '}
              <Link href="/it-support" style={link}>
                Help &amp; FAQ
              </Link>{' '}
              page. Violations of this policy may result in restricted access to the Institute&apos;s systems.
            </Section>

            <PageFeedback pageSlug="safe-usage-policy" pageTitle="Safe Usage Policy -- Ulul Azm Institute" />
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: 'var(--brand)' }}>{title}</h2>
      <div style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15 }}>{children}</div>
    </div>
  );
}

const list = {
  margin: 0,
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const link = { color: 'var(--brand)', fontWeight: 700 };
