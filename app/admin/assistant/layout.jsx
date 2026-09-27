'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  { href: '/admin/assistant', label: 'Assistant Settings', icon: '💬' },
  { href: '/admin/assistant/community', label: 'Community Moderation', icon: '🗣️' },
  { href: '/admin', label: 'Back to Admin', icon: '◂' },
];

export default function AssistantAdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside
          style={{
            width: 250,
            background: 'var(--brand-dark)',
            color: 'var(--on-accent)',
            padding: '24px 16px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '8px 12px 24px',
              borderBottom: '1px solid var(--brand-deepest)',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: 'var(--on-accent)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Administration
            </div>

            <h2 style={{ margin: '6px 0 0', fontSize: 21 }}>
              AI Assistant
            </h2>
          </div>

          <nav style={{ display: 'grid', gap: 6 }}>
            {sections.map((item) => {
              const active =
                item.href === '/admin'
                  ? false
                  : item.href === '/admin/assistant'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '11px 13px',
                    borderRadius: 9,
                    color: 'var(--on-accent)',
                    background: active
                      ? 'color-mix(in srgb, currentColor 14%, transparent)'
                      : 'transparent',
                    boxShadow: active ? 'inset 3px 0 0 var(--gold)' : 'none',
                    textDecoration: 'none',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: 28,
              padding: '14px 13px',
              borderRadius: 9,
              background: 'color-mix(in srgb, currentColor 10%, transparent)',
              color: 'var(--on-accent)',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            Manage the sitewide AI Assistant widget's availability and
            welcome message, and moderate the Ulul Azm Community —
            changes take effect immediately across the live site.
          </div>
        </aside>

        <section style={{ flex: 1, minWidth: 0 }}>{children}</section>
      </div>
    </div>
  );
}
