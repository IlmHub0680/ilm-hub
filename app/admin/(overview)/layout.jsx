export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminShell from './AdminShell';

// This route group — /admin, /admin/duties, /admin/delegated — is the
// Institution Oversight landing dashboard. It is scoped to a route
// group (rather than living at app/admin/layout.jsx) so this shell
// wraps only these three overview sections and not the ~25 other real
// admin tools nested under /admin/* (staff, fees, media, bookstore…),
// which each manage their own page chrome.
export default async function AdminOverviewLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const [
    studentCount,
    facultyCount,
    departmentCount,
    programCount,
    pendingRequests,
    pendingTutoring,
    activeAnnouncements,
    outstandingFees,
    pendingAdmissions,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.faculty.count(),
    prisma.department.count(),
    prisma.program.count(),
    prisma.request.count({ where: { status: 'SUBMITTED' } }),
    prisma.tutoringRequest.count({ where: { status: 'PENDING' } }),
    prisma.announcement.count({ where: { isActive: true } }),
    prisma.studentFee.count({
      where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
    }),
    prisma.admissionApplication.count({
      where: { status: { in: ['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'] } },
    }),
  ]);

  const stats = [
    { label: 'Students', value: studentCount },
    { label: 'Faculties', value: facultyCount },
    { label: 'Departments', value: departmentCount },
    { label: 'Programmes', value: programCount },
    { label: 'Pending Requests', value: pendingRequests },
    { label: 'Pending Tutoring Requests', value: pendingTutoring },
    { label: 'Active Announcements', value: activeAnnouncements },
    { label: 'Students with Outstanding Fees', value: outstandingFees },
    { label: 'Admissions In Review', value: pendingAdmissions },
  ];

  // Model: Personal/Platform Management vs. Institute Management vs.
  // Delegated Operations (see below) are three deliberately separate
  // scopes -- previously all merged into one flat "Admin-Managed
  // Functions" list with no structural distinction at all. Splitting
  // the single array below into these named groups is the actual fix:
  // it's read by AdminShell/the nav pages, not just a renamed heading.

  // 👤 PERSONAL MANAGEMENT -- the user's own personal/platform-owned
  // commercial operations. NOT institute departments. Never merge
  // these with institute-owned functionality below.
  const personalManagementSections = [
    { title: 'Bookstore', href: '/admin/bookstore', icon: '📚', description: 'Manage books, categories, and orders.' },
    { title: 'Bookstore Orders', href: '/admin/orders', icon: '🧾', description: 'Bookstore order history.' },
    { title: 'Media', href: '/admin/media', icon: '🎧', description: 'Manage sermons, poems, mutoon, lectures, video lessons and audio recordings, with subscription pricing.' },
    { title: 'My Library', href: '/admin/library-resources', icon: '📖', description: 'Your personal public reading library — articles, fatwas, research papers, manuscripts and other written content — no subscription, publish/unpublish only. Separate from the institute\'s Digital Library (Delegated Operations).' },
    { title: 'Publishing', href: '/admin/publishing', icon: '🖋', description: 'Review manuscript submissions and quotes.' },
    { title: 'Author Approvals', href: '/admin/author-approvals', icon: '✒', description: 'Approve or reject author applications.' },
    { title: 'Author Application Fee', href: '/admin/author-fees', icon: '💳', description: 'Configure the application fee prospective authors pay — separate from the Student Admission Fee.' },
    { title: 'Author Royalty & Payouts', href: '/admin/royalty', icon: '💰', description: 'Configure royalty rates, review each author\'s real earnings, and manage payouts.' },
  ];

  // 🏛 INSTITUTE MANAGEMENT -- everything Admin manages on behalf of
  // the Islamic institute and its public website. Grouped by the
  // spec's own three sub-scopes: institutional framework, public
  // website, and administration/oversight (institute CONFIGURATION
  // items are listed separately below, as `institutionalConfigSections`,
  // since several of them are currently read-only oversight mirrors
  // rather than real configuration surfaces -- see that array's own
  // comment).
  const instituteFrameworkSections = [
    { title: 'Academy Hub', href: '/admin/academy-hub', icon: '🧭', description: 'Manage the public /academy landing page — its hero copy and the card grid linking to every institutional document.' },
    { title: 'Academy Foundation', href: '/admin/academy-foundation', icon: '🕌', description: "Manage the Academy's institutional identity, educational philosophy and governing principles." },
    { title: 'Academy Governance', href: '/admin/academy-governance', icon: '🏛', description: "Manage the Academy's organizational structure, academic governance, departments and committees." },
    { title: 'Academy Pathways', href: '/admin/academy-pathways', icon: '🎓', description: "Manage the Academy's academic pathways and qualification framework — Foundation through Diploma and Specialized Certificates." },
    { title: 'Academy Curriculum', href: '/admin/academy-curriculum', icon: '📚', description: "Manage the Academy's program architecture and curriculum framework — study plans, prerequisites and learning outcomes." },
    { title: 'Department Curriculum', href: '/admin/academy-department-curriculum', icon: '🗂', description: "Manage which department owns which curriculum topic, program-to-department mapping, and the course duplication audit." },
    { title: 'Course Catalogue', href: '/admin/academy-course-catalogue', icon: '🔢', description: "Manage the permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type." },
    { title: 'Course Specifications', href: '/admin/academy-course-specifications', icon: '📝', description: "Manage full course specifications and weekly syllabi — CLOs, weekly topics, assessment design and alignment." },
    { title: 'Assessment & Grading', href: '/admin/academy-assessment-grading', icon: '📊', description: "Manage the Academy's assessment, grading and progression framework — assessment families, grading scale, practical rubrics, progression and graduation requirements." },
    { title: 'Student Lifecycle', href: '/admin/academy-student-lifecycle', icon: '🪪', description: "Manage the Academy's student lifecycle and academic administration framework — the student journey, application form specification, placement, registration, attendance, advising, records and graduation." },
    { title: 'Faculty & Portals', href: '/admin/academy-faculty-portals', icon: '👥', description: "Manage the Academy's faculty and staff structure, Instructor Profile, and academic portals framework — roles, the role/permission matrix, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals." },
    { title: 'Academic Regulations & QA', href: '/admin/academy-academic-regulations', icon: '⚖️', description: "Manage the Academy's academic regulations, records framework, quality assurance cycle, program and course review, and computed academic KPIs — including the real academic integrity case-tracking and course/program approval workflow." },
    { title: 'Website & Master Integration', href: '/admin/academy-master-integration', icon: '🧩', description: 'Manage the Academy read as one master model — website structure, the Academic Programs homepage section, programme pages, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and the final audit.' },
    { title: 'Course Readings (Oversight)', href: '/admin/course-readings', icon: '📖', description: "Read-only — each course's required/recommended readings are managed by that programme's Coordinator at their own dashboard." },
  ];

  const institutePublicWebsiteSections = [
    { title: 'Homepage Management', href: '/admin/homepage', icon: '📰', description: 'Manage the public homepage: hero section, institution-wide announcements, social links and footer navigation columns.' },
    { title: 'Events', href: '/admin/events', icon: '📅', description: 'Create and publish public events — date, time, location or online link, thumbnail, and registration link.' },
    { title: 'News', href: '/admin/news', icon: '🗞', description: 'Write and publish news articles shown publicly at /news, with categories and featured images.' },
    { title: 'Alumni', href: '/admin/alumni', icon: '🎓', description: 'Manage the public Alumni page — hero copy, real graduate statistics, and alumni spotlight stories.' },
    { title: 'Legal & Info Pages', href: '/admin/legal-pages', icon: '📜', description: 'Manage the public About, Contact, FAQ, Privacy Policy, Terms of Use, Refund Policy, Academic Policies and Student Resources pages — no code changes needed.' },
    { title: 'AI Assistant', href: '/admin/assistant', icon: '💬', description: 'Control the sitewide AI Assistant widget — availability, opening greeting in English and Arabic, and moderation of the Ulul Azm Community.' },
    { title: 'Newsletter', href: '/admin/newsletter', icon: '✉', description: 'Manage newsletter subscribers.' },
    { title: 'Sponsor Manager', href: '/admin/sponsor-manager', icon: '🤝', description: 'Manage sponsorships.' },
  ];

  const instituteAdministrationSections = [
    { title: 'Staff Management', href: '/admin/staff', icon: '👥', description: 'Onboard staff and assign positions.' },
    { title: 'Positions & Permissions', href: '/admin/positions', icon: '🔑', description: 'Create positions and manage exactly which modules each one can view or edit — every change is logged.' },
    { title: 'Analytics', href: '/admin/analytics', icon: '📊', description: 'Institution-wide analytics.' },
    { title: 'Student Complaints & Enquiries', href: '/admin/complaints', icon: '📮', description: 'Read-only oversight — reviewed, responded to, transferred and closed by Student Affairs staff at their own dashboard.' },
    { title: 'Graduate Assistant Requests', href: '/admin/graduate-support', icon: '🎓', description: 'Read-only oversight — actioned by Student Affairs staff at their own dashboard.' },
    { title: 'Graduation Clearance', href: '/admin/graduation', icon: '🎓', description: 'Read-only oversight — each office clears its own requirement and the Registrar issues final approval, at their own dashboards.' },
    { title: 'Audit Log', href: '/admin/audit-log', icon: '🧾', description: 'Who did what, when, and to which record — admission decisions, grade corrections, graduation and document finalization, and Community moderation, all in one read-only view.' },
    { title: 'Permission Review', href: '/admin/permission-review', icon: '🛡️', description: 'A read-only scan flagging finance-isolation violations, unrelated academic permissions, unused or duplicate roles, and orphaned accounts.' },
  ];

  // Institute CONFIGURATION -- Admin owns the institution-wide
  // policy/framework; the delegated role operates within it day to
  // day. Per this session's own audit, most of these are CURRENTLY
  // read-only mirrors of the delegated role's queue, not real
  // configuration surfaces yet (flagged directly here rather than
  // silently overstated as "configuration" -- Application Fees is
  // the one exception that already has a real settings surface,
  // owned by Registry per a documented prior decision).
  const instituteConfigSections = [
    { title: 'Application Fees (Oversight)', href: '/admin/admission-fees', icon: '💳', description: 'Read-only overview of the current fee configuration — set by Admission & Registration at their own portal (a documented, deliberate prior decision, not a gap).' },
    { title: 'Admissions (Oversight)', href: '/admin/admissions', icon: '📥', description: 'Read-only oversight of admissions activity — processing happens at the Registry dashboard. No distinct institution-wide admissions-policy configuration surface exists yet.' },
    { title: 'Academic Records (Oversight)', href: '/admin/academic-records', icon: '📄', description: 'Read-only oversight — transcript requests are actioned at the Academic Records dashboard. No distinct configuration surface exists yet.' },
    { title: 'Examinations (Oversight)', href: '/admin/examinations', icon: '📝', description: 'Read-only oversight — exam scheduling and grade appeals are actioned at the Examinations dashboard. No distinct configuration surface exists yet.' },
    { title: 'Fees & Billing (Oversight)', href: '/admin/fees', icon: '💰', description: 'Read-only oversight — payments are recorded at the Finance dashboard. No distinct institution-wide fee-policy configuration surface exists yet.' },
    { title: 'Student Affairs (Oversight)', href: '/admin/student-affairs', icon: '🧑‍🎓', description: 'Read-only oversight — requests are actioned at the Student Affairs dashboard. No distinct configuration surface exists yet.' },
    { title: 'Academic Advising (Oversight)', href: '/admin/advising', icon: '🧭', description: 'Read-only oversight — advisors correspond with students at their own dashboard. No distinct configuration surface exists yet.' },
  ];

  const delegatedDuties = [
    { title: 'Faculty Oversight', owner: 'Deans', href: '/admin/faculties', icon: '🏛', note: 'View only here — each Dean manages their own faculty at their own dashboard.' },
    { title: 'Department Oversight', owner: 'Heads of Department', href: '/admin/departments', icon: '🏢', note: 'View only here — each Head manages their own department at their own dashboard.' },
    { title: 'Programme Curriculum', owner: 'Programme Coordinators', href: '/coordinator-dashboard', icon: '📘', note: 'View only here — each Coordinator manages their own programme at their own dashboard.' },
    { title: 'Course Management & Grading', owner: 'Instructors', href: '/instructor-dashboard', icon: '🎓', note: 'View only here — each Instructor manages their own courses and grading at their own dashboard.' },
    { title: 'Admissions Processing', owner: 'Registry / Admissions staff', href: '/admin/admissions', icon: '📥', note: 'View only here — processing happens at the Registry dashboard.' },
    { title: 'Academic Records & Transcripts', owner: 'Registrar', href: '/admin/academic-records', icon: '📄', note: 'View only here — transcript requests are actioned at the Academic Records dashboard.' },
    { title: 'Examinations', owner: 'Examinations Officer', href: '/admin/examinations', icon: '📝', note: 'View only here — exam scheduling and grade appeals are actioned at the Examinations dashboard.' },
    { title: 'Student Fees & Billing', owner: 'Finance', href: '/admin/fees', icon: '💰', note: 'View only here — payments are recorded at the Finance dashboard.' },
    { title: 'Library Catalogue, Loans & Digital Library', owner: 'Library', href: '/admin/library', icon: '📖', note: 'View only here — issuing/returning loans and digital resource publishing happen at the Library dashboard.' },
    { title: 'IT Support Tickets', owner: 'ICT', href: '/admin/ict', icon: '🖥', note: 'View only here — tickets are actioned at the ICT dashboard.' },
    { title: 'Quality Assurance', owner: 'Quality Assurance', href: '/admin/qa', icon: '✅', note: 'View only here — reviews are run at the QA dashboard.' },
    { title: 'Student Affairs', owner: 'Student Affairs', href: '/admin/student-affairs', icon: '🧑‍🎓', note: 'View only here — requests are actioned at the Student Affairs dashboard.' },
    { title: 'Academic Advising', owner: 'Academic Advisors', href: '/admin/advising', icon: '🧭', note: 'View only here — advisors correspond with students at their own dashboard.' },
    { title: 'Research & Scholarly Affairs', owner: 'Research & Scholarly Affairs Officer', href: '/admin/research', icon: '🔬', note: 'View only here — projects, proposals, publications, collaboration, supervision and funding are all actioned at the Research & Scholarly Affairs dashboard.' },
  ];

  return (
    <AdminShell
      user={{ name: user.name, role: user.role }}
      stats={stats}
      personalManagementSections={personalManagementSections}
      instituteFrameworkSections={instituteFrameworkSections}
      institutePublicWebsiteSections={institutePublicWebsiteSections}
      instituteAdministrationSections={instituteAdministrationSections}
      instituteConfigSections={instituteConfigSections}
      delegatedDuties={delegatedDuties}
    >
      {children}
    </AdminShell>
  );
}
