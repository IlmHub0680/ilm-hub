'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  { href: '/admin/academy-hub', label: 'Academy Hub', icon: '🧭' },
  { href: '/admin/academy-foundation', label: 'Academy Foundation', icon: '🕌' },
  { href: '/admin/academy-governance', label: 'Academy Governance', icon: '🏛' },
  { href: '/admin/academy-pathways', label: 'Academy Pathways', icon: '🎓' },
  { href: '/admin/academy-curriculum', label: 'Academy Curriculum', icon: '📚' },
  { href: '/admin/academy-department-curriculum', label: 'Department Curriculum', icon: '🗂' },
  { href: '/admin/academy-course-catalogue', label: 'Course Catalogue', icon: '🔢' },
  { href: '/admin/academy-course-specifications', label: 'Course Specifications', icon: '📝' },
  { href: '/admin/academy-assessment-grading', label: 'Assessment & Grading', icon: '📊' },
  { href: '/admin/academy-student-lifecycle', label: 'Student Lifecycle', icon: '🪪' },
  { href: '/admin/academy-faculty-portals', label: 'Faculty & Portals', icon: '👥' },
  { href: '/admin/academy-academic-regulations', label: 'Academic Regulations & QA', icon: '⚖️' },
  { href: '/admin/academy-master-integration', label: 'Website & Master Integration', icon: '🧩' },
  { href: '/admin/homepage', label: 'Homepage Management', icon: '📰' },
  { href: '/admin/legal-pages', label: 'Legal & Info Pages', icon: '📜' },
  { href: '/admin', label: 'Back to Admin', icon: '◂' },
];

export default function AcademyFoundationLayout({ children }) {
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
              Institutional Identity
            </h2>
          </div>

          <nav style={{ display: 'grid', gap: 6 }}>
            {sections.map((item) => {
              const active =
                item.href === '/admin'
                  ? false
                  : ['/admin/academy-hub', '/admin/academy-foundation', '/admin/academy-governance', '/admin/academy-pathways', '/admin/academy-curriculum', '/admin/academy-department-curriculum', '/admin/academy-course-catalogue', '/admin/academy-course-specifications', '/admin/academy-assessment-grading', '/admin/academy-student-lifecycle', '/admin/academy-faculty-portals', '/admin/academy-academic-regulations', '/admin/academy-master-integration'].includes(item.href)
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
            The Academy's institutional identity and educational philosophy
            live here, admin-editable like the Legal & Info Pages —
            and are grouped alongside Homepage Management since both shape
            how the Institute presents itself publicly.
          </div>
        </aside>

        <section style={{ flex: 1, minWidth: 0 }}>{children}</section>
      </div>
    </div>
  );
}
