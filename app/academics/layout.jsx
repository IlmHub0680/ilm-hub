'use client';

import { useRouter, usePathname } from 'next/navigation';
import { AcademicsProvider, useAcademics } from './context';
import StudentSidebar from '@/components/StudentSidebar';

// Same category/menu data as app/login/page.jsx's own MENU_CATEGORIES,
// restricted to the entries that are real /academics/* pages (a local
// SPA tab like "dashboard" or "profile" has no meaning as a route here,
// so it isn't included -- clicking "Back to Student Portal" is how a
// user reaches those). Keeping this list in sync with MENU_CATEGORIES
// is what gives both trees the exact same sidebar with no visual seam.
const NAV_CATEGORIES = [
  {
    id: 'academic-records',
    label: 'Academic Records',
    items: [
      { id: 'academic-system', href: '/academics/overview', label: 'Academic System', icon: '📖' },
      { id: 'my-courses', href: '/academics/my-courses', label: 'My Courses', icon: '📚' },
      { id: 'study-plan', href: '/academics/study-plan', label: 'Study Plan & Curriculum', icon: '🗂️' },
      { id: 'records', href: '/academics/records', label: 'Grades & Academic History', icon: '📊' },
      { id: 'remaining-courses', href: '/academics/remaining-courses', label: 'Courses & Academic Progress', icon: '📈' },
      { id: 'grading-policy', href: '/academics/grading-policy', label: 'Grading Policy', icon: '⚖️' },
      { id: 'attendance', href: '/academics/attendance', label: 'Attendance Record', icon: '✅' },
      { id: 'exams', href: '/academics/exams', label: 'Final Exam Timetable', icon: '🗓️' },
      // Real, admin-managed public policy pages (see
      // app/login/page.jsx's MENU_CATEGORIES for the same entry) --
      // not a duplicate of Grading Policy, and not invented content.
      { id: 'handbook', href: '/academic-policies', label: 'Student Handbook & Policies', icon: '📘' },
    ],
  },
  {
    id: 'services',
    label: 'Student Services',
    items: [
      { id: 'communication', href: '/academics/communication', label: 'Communication & Complaints', icon: '📧' },
      { id: 'graduation', href: '/academics/graduation', label: 'Graduation Procedures', icon: '🎓' },
      { id: 'graduation-documents', href: '/academics/graduation-documents', label: 'Graduation Documents', icon: '📜' },
    ],
  },
  {
    id: 'community',
    label: 'Communication & Community',
    items: [
      { id: 'ulul-azm-community', href: '/academics/community', label: 'Ulul Azm Community', icon: '🕌' },
      { id: 'live-classes', href: '/academics/live-classes', label: 'Live Classes', icon: '🎥' },
    ],
  },
];

// Shown only once a student has actually graduated -- irrelevant (and
// would just crowd the nav) for anyone still active.
const GRADUATE_NAV_ITEM = {
  id: 'graduate-assistance',
  href: '/academics/graduate-assistance',
  label: 'Graduate Assistant',
  icon: '🎖',
};

function AcademicsShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useAcademics();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/login');
  };

  const categories =
    data?.profile?.academicStatus === 'GRADUATED'
      ? [
          ...NAV_CATEGORIES,
          { id: 'graduate-cat', label: 'Graduation', items: [GRADUATE_NAV_ITEM] },
        ]
      : NAV_CATEGORIES;

  return (
    <div className="ih-portal-shell">
      <StudentSidebar
        categories={categories}
        isItemActive={(item) => pathname === item.href}
        brandTitle="Ulul Azm"
        brandSubtitle="Academics"
        onSignOut={handleLogout}
      />

      <main className="ih-portal-main">
        {/* This links back to /login on purpose -- despite the name, that
            route IS the student portal (its tabbed dashboard, profile,
            quizzes, discussions, etc.) once signed in. /dashboard is a
            different page entirely (the bookstore/media account page,
            now at /account/dashboard) -- see lib/permissions.ts's
            getAccountDestination() for how every account type's real
            destination is decided. */}
        <a
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--brand-dark)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          <span aria-hidden="true">←</span>
          Back to Student Portal
        </a>

        {children}
      </main>
    </div>
  );
}

export default function AcademicsLayout({ children }) {
  return (
    <AcademicsProvider>
      <AcademicsShell>{children}</AcademicsShell>
    </AcademicsProvider>
  );
}
