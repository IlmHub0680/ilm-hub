'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageFeedback from '@/components/PageFeedback';

export default function ItDepartmentPage() {
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
              IT Department
            </h1>
            <p style={{ margin: '0 0 30px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              The IT Department keeps the Institute&apos;s digital systems -- the Student Portal, Admin Portal,
              website and the platforms built on them -- available, secure and easy to use for students, staff
              and faculty.
            </p>

            <Section title="Our Mission">
              To provide reliable, secure and accessible technology that supports teaching, learning,
              administration and student services across Ulul Azm Institute, and to help every member of the
              community use it with confidence.
            </Section>

            <Section title="Our Vision">
              A digitally-enabled Institute where technology works quietly and dependably in the background, so
              students and staff can focus on learning and teaching rather than on the systems that support them.
            </Section>

            <Section title="Our Goals">
              <ul style={list}>
                <li>Keep the website, Student Portal and Admin Portal available, fast and easy to use.</li>
                <li>Protect student, staff and institutional data and use it responsibly.</li>
                <li>Support students, faculty and staff promptly with technical issues they run into.</li>
                <li>Maintain clear, honest documentation and help resources, such as our Help &amp; FAQ page.</li>
                <li>Keep improving the platform based on feedback from the people who use it.</li>
                <li>
                  Promote safe and responsible use of the Institute&apos;s digital systems -- see our{' '}
                  <Link href="/safe-usage-policy" style={link}>
                    Safe Usage Policy
                  </Link>
                  .
                </li>
              </ul>
            </Section>

            <Section title="Need Help?">
              For account or technical issues, start with our{' '}
              <Link href="/it-support" style={link}>
                Help &amp; FAQ
              </Link>{' '}
              page, or reach out directly through{' '}
              <Link href="/contact" style={link}>
                Contact Support
              </Link>
              .
            </Section>

            <PageFeedback pageSlug="it-department" pageTitle="IT Department -- Ulul Azm Institute" />
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
