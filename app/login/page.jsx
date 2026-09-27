'use client';

// THIS IS THE STUDENT PORTAL, despite the /login route name.
//
// It's both the student sign-in form (see handleLogin below) and, once
// signed in, the full tabbed student SPA: dashboard, profile, live
// classes, quizzes & assignments, section discussion, private tutoring,
// academic calendar, absence excuses, academic supervisor, announcements,
// notifications, and requests & documents. It has no role check, so
// whoever authenticates through its form lands here regardless of
// account type -- it's meant only for students (linked to from
// /academics/* and the site header as "Student Portal").
//
// It is NOT the same as:
//   - /account -- the general sign-in/registration form used by
//     bookstore customers, media subscribers and authors.
//   - /account/dashboard -- their account page (orders, book access,
//     media subscriptions). Nothing academic lives there.
//   - /staff-login -- staff/admin sign-in, routed to their own
//     operational dashboard.
//   - /academics/* -- a complementary, more structured student
//     sub-portal (overview, my-courses, records, communication, etc.)
//     that reads the same /api/student/portal data as this page.
//
// See lib/permissions.ts's getAccountDestination() for how a logged-in
// user's account type now decides which of these they land on.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionDiscussion from '@/components/SectionDiscussion';
import AcademicCalendarView from '@/components/AcademicCalendarView';
import { MAX_GPA, latestGradeByCourse } from '@/lib/grading';
import RichTextEditor from '@/components/RichTextEditor';
import { uploadFileWithProgress } from '@/lib/xhrUpload';
import { useSiteBranding } from '@/components/SiteBrandingProvider';
import StudentSidebar from '@/components/StudentSidebar';

// ============================================================
// ACADEMICS NAVIGATION
// Each of these leads to its own dedicated page under /academics,
// instead of being collapsed inline inside the portal.
// ============================================================

const ACADEMICS_NAV_ITEMS = [
  {
    href: '/academics/overview',
    icon: '📖',
    title: 'Academic System',
    description: 'Your central hub — programme, GPA, CGPA, status, and every academic self-service tool.',
  },
  {
    href: '/academics/my-courses',
    icon: '📚',
    title: 'My Courses',
    description: 'Every enrolled course, with its assignments, quizzes, grades, attendance and discussion in one hub.',
  },
  {
    href: '/academics/study-plan',
    icon: '🗂️',
    title: 'Study Plan & Curriculum',
    description: 'Recommended study habits, your full curriculum, and course add/drop requests.',
  },
  {
    href: '/academics/records',
    icon: '📊',
    title: 'Grades & Academic History',
    description: 'Term-by-term GPA history and recorded course grades.',
  },
  {
    href: '/academics/remaining-courses',
    icon: '📈',
    title: 'Courses & Academic Progress',
    description: 'Your completed, current, and remaining curriculum courses.',
  },
  {
    href: '/academics/grading-policy',
    icon: '⚖️',
    title: 'Grading Policy',
    description: 'The official score-to-grade scale.',
  },
  {
    href: '/academics/communication',
    icon: '📧',
    title: 'Communication & Complaints',
    description: 'Contact a department or office directly, and track your requests to a response.',
  },
  {
    href: '/academics/graduation',
    icon: '🎓',
    title: 'Graduation Procedures',
    description: 'Your graduation eligibility, application, clearance and final approval.',
  },
  {
    href: '/academics/graduation-documents',
    icon: '📜',
    title: 'Graduation Documents',
    description: 'Your graduation certificate, statement of completion, and transcript.',
  },
  {
    href: '/academics/exams',
    icon: '🗓️',
    title: 'Final Exam Timetable',
    description: 'Your official final examination schedule — dates, times, and venues.',
  },
  {
    href: '/academics/attendance',
    icon: '✅',
    title: 'Attendance Record',
    description: 'Your lecture attendance and absence percentage by course.',
  },
  {
    href: '/academics/live-classes',
    icon: '🎥',
    title: 'Live Classes',
    description: 'Your upcoming and past live class sessions.',
  },
  {
    href: '/academics/community',
    icon: '🕌',
    title: 'Ulul Azm Community',
    description: 'Connect with fellow students and alumni.',
  },
];

// ============================================================
// ACADEMIC STATUS
// Maps the real StudentStatus enum (prisma/schema.prisma) to a
// readable label and a semantic tone. This is the single source
// of truth for every "academic status" display on this page —
// there is no separate mock/placeholder status anywhere else.
// ============================================================

const STUDENT_STATUS_META = {
  APPLICANT: { label: 'Applicant', tone: 'neutral' },
  ADMITTED: { label: 'Admitted', tone: 'good' },
  ACTIVE: { label: 'Active', tone: 'good' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
  DEFERRED: { label: 'Deferred', tone: 'warning' },
  GRADUATED: { label: 'Graduated', tone: 'good' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'danger' },
  DISMISSED: { label: 'Dismissed', tone: 'danger' },
};

const STATUS_TONE_STYLE = {
  good: { background: 'var(--success-tint)', color: 'var(--success)' },
  warning: { background: 'var(--warning-tint)', color: 'var(--warning)' },
  danger: { background: 'var(--danger-tint)', color: 'var(--danger)' },
  neutral: { background: 'var(--brand-tint)', color: 'var(--brand)' },
};

// ============================================================
// ULUL AZM - STUDENT PORTAL
// Complete Student Portal
// ============================================================

export default function LoginPage() {
  
  const supabase = null;
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Admin-managed institute hero banner image -- already fetched
  // server-side and shared app-wide via SiteBrandingProvider (see
  // app/layout.jsx / components/SiteBrandingProvider.jsx), the same
  // field the public homepage's own hero section reads. Degrades to
  // '' (no image) automatically if unset, matching this codebase's
  // "branding fetch never throws" convention -- no extra fetch needed
  // here since the provider already sits above this page in the tree.
  const { heroImageUrl: dashboardBannerUrl } = useSiteBranding();

  // Real route pathname, used only to highlight a sidebar item that
  // links to a dedicated /academics/* page (an internal-tab item is
  // still highlighted via activeStudentTab, see menuItems below).
  const pathname = usePathname();

  // ==========================================================
  // LOGIN
  // ==========================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginBackgroundUrl, setLoginBackgroundUrl] = useState('');

  // Admin-managed institute banner behind the login form (Homepage
  // Hero's brand assets -- see app/admin/homepage/hero/page.jsx).
  // Fetched independently of session/auth state since this is public,
  // unauthenticated content the same way the public homepage reads
  // it; a failure here just leaves the page on its existing plain
  // gradient background.
  useEffect(() => {
    let active = true;
    fetch('/api/homepage-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (active && result?.success && result.data?.hero?.loginBackgroundUrl) {
          setLoginBackgroundUrl(result.data.hero.loginBackgroundUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // CHECK SUPABASE SESSION
  // ==========================================================

useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!mounted) return;

      setIsLoggedIn(Boolean(data?.user));
    } catch (error) {
      console.error('Session check error:', error);

      if (mounted) {
        setIsLoggedIn(false);
      }
    } finally {
      if (mounted) {
        setAuthLoading(false);
      }
    }
  };

  loadSession();

  return () => {
    mounted = false;
  };
}, []);

  // ==========================================================
  // LOAD REAL STUDENT PORTAL DATA
  // ==========================================================

  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;

    const loadPortalData = async () => {
      try {
        const response = await fetch('/api/student/portal', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        const result = await response.json();

        if (!mounted || !result?.success) return;

        const d = result.data;

        const totalOwedUSD = d.fees.reduce((sum, f) => sum + f.amountUSD, 0);
        const totalPaidUSD = d.fees.reduce((sum, f) => sum + f.paidUSD, 0);
        const feeStatus =
          d.fees.length === 0
            ? 'No fees on record'
            : totalPaidUSD >= totalOwedUSD
            ? 'Paid in Full'
            : totalPaidUSD > 0
            ? 'Partially Paid'
            : 'Unpaid';

        setStudents([
          {
            id: d.profile.studentId,
            studentId: d.profile.studentId,
            name: d.profile.name,
            email: d.profile.email,
            phone: '',
            enrolledProgramme: d.profile.enrolledProgramme,
            studyType: d.profile.studyType,
            academicStatus: d.profile.academicStatus,
            level: d.profile.level,
            registeredCourses: d.registeredCourses.map((c) => c.title),
            grades: d.grades.map((g) => ({
              course: g.course,
              title: 'Final',
              score: g.final,
              grade: g.letter,
            })),
            semesterGPA: d.academicProgress.semesterGPA,
            cgpa: d.academicProgress.cgpa,
            currentTermName: d.academicProgress.currentTermName,
            standing: d.academicProgress.standing,
            creditsEarned: d.academicProgress.creditsEarned,
            creditsAttempted: d.academicProgress.creditsAttempted,
            feeStatus,
          },
        ]);

        setHasLoadedStudentData(true);

        if (d.programCurriculum) {
          setProgrammes([d.programCurriculum]);
        }

        setAttendanceRecords(d.attendance || []);
        setExamTimetable(d.examTimetable || []);
        setCurriculumInfo({
          registeredCourseIds: (d.registeredCourses || []).map((c) => c.id),
          grades: d.grades || [],
          programCurriculum: d.programCurriculum || null,
        });

        setAcademicSemesters(
          d.academicProgress.history.map((h) => ({
            semester: h.term,
            academicYear: '',
            gpa: h.gpa,
            courses: [],
          }))
        );

        setAnnouncements(
          d.announcements.map((a) => ({
            id: a.id,
            title: a.title,
            message: a.message,
            date: a.date ? new Date(a.date).toISOString().slice(0, 10) : '',
            author: a.author || 'Institution',
            type: a.scope,
          }))
        );

        if (d.profile?.avatarUrl) {
          setProfilePicture(d.profile.avatarUrl);
        }

        setNotifications(
          d.notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: 'academic',
            unread: !n.isRead,
          }))
        );

        setAssignments(d.assignments || []);

        setSessions(
          (d.liveClasses || []).map((c) => {
            const start = new Date(c.scheduledAt);
            const end = new Date(start.getTime() + (c.durationMin || 60) * 60000);
            const pad = (n) => String(n).padStart(2, '0');
            return {
              id: c.id,
              course: c.course,
              topic: c.topic,
              instructor: c.instructor,
              date: start.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              }),
              startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
              endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
              link: c.meetingLink,
              // Raw timestamp, kept alongside the display-formatted
              // date/startTime above, so the dashboard's Upcoming
              // Activities panel can sort/find the soonest class
              // honestly instead of parsing the formatted strings back.
              scheduledAt: c.scheduledAt,
            };
          })
        );

        setMyRequests(d.requests || []);
        setMyTranscripts(d.transcripts || []);

        setInstructors(d.tutoring.availableInstructors);

        setPrivateRequests(
          d.tutoring.requests.map((t) => ({
            id: t.id,
            studentName: d.profile.name,
            course: t.course,
            instructor: t.instructor,
            fee: t.feeUSD,
            isPaid: t.isPaid,
            paidAmount: t.paidAmount,
            status:
              t.status.charAt(0) + t.status.slice(1).toLowerCase(),
            date: new Date(t.createdAt).toISOString().slice(0, 10),
            notes: t.notes,
          }))
        );

        setSupervisorMessages(
          d.advisorMessages
            .filter((m) => m.senderRole === 'STUDENT')
            .map((m) => {
              const match = m.message.match(/^\[(.+?)\]\s*(.*)$/s);
              return {
                id: m.id,
                topic: match ? match[1] : 'General',
                message: match ? match[2] : m.message,
                status: m.isRead ? 'Read' : 'Sent',
                date: new Date(m.createdAt).toLocaleDateString(),
              };
            })
            .reverse()
        );

        setStudentFees(d.fees);

        setAbsenceExcuses(
          (d.absenceExcuses || []).map((a) => ({
            id: a.id,
            type: a.type.charAt(0) + a.type.slice(1).toLowerCase(),
            course: a.course,
            date: new Date(a.absenceDate).toISOString().slice(0, 10),
            reason: a.reason,
            status: formatRequestStatus(a.status),
          }))
        );
      } catch (error) {
        console.error('Student portal data load error:', error);
      }
    };

    loadPortalData();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);


  // ==========================================================
  // NAVIGATION
  // ==========================================================


  const [activeStudentTab, setActiveStudentTab] = useState('dashboard');

  // Lets other pages (e.g. a course hub under /academics/my-courses)
  // deep-link into a specific student portal tab, e.g. /login?tab=quiz.
  const VALID_STUDENT_TABS = [
    'dashboard', 'profile', 'quiz', 'discussion', 'private',
    'calendar', 'excuses', 'supervisor', 'announcements', 'notifications',
    'documents',
  ];
  // 'classes' (Live Classes) was removed from this list -- it now lives
  // solely at /academics/live-classes (see the sidebar menuItems comment
  // below and the removed activeStudentTab === 'classes' render block).
  // Old /login?tab=classes deep links still work: the redirect below
  // sends them straight to the dedicated page instead of a local tab.


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'classes') {
      // Live Classes now lives only at /academics/live-classes -- honor
      // old ?tab=classes links by sending the browser there instead of
      // rendering a (removed) local tab.
      window.location.replace('/academics/live-classes');
      return;
    }
    if (tab && VALID_STUDENT_TABS.includes(tab)) {
      setActiveStudentTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [profilePicture, setProfilePicture] = useState(null);
  const profilePictureRef = useRef(null);

  // ==========================================================
  // STUDENT DATA
  // ==========================================================

  const [students, setStudents] = useState([]);
  // True only once the real portal fetch has resolved -- used to avoid
  // flashing a bare "?" in the top-bar avatar for the instant between
  // first paint and real data arriving (currentStudent.name is '' until
  // then, so the initials fallback would otherwise show "?" briefly).
  const [hasLoadedStudentData, setHasLoadedStudentData] = useState(false);

  // ==========================================================
  // PROGRAMMES / COURSES
  // ==========================================================

  const [programmes, setProgrammes] = useState([]);

  // ==========================================================
  // LIVE CLASSES
  // ==========================================================

  // Real, instructor-scheduled sessions fetched from the student
  // portal API (see setSessions below) — replaces what used to be
  // permanently hardcoded demo data with no connection to anything an
  // instructor actually creates.
  const [sessions, setSessions] = useState([]);

  // ==========================================================
  // ANNOUNCEMENTS
  // Faculty + Instructor announcements
  // ==========================================================

  const [announcements, setAnnouncements] = useState([]);

  // ==========================================================
  // PRIVATE TUTORING
  // ==========================================================

  const [privateRequests, setPrivateRequests] = useState([]);

  const [privateTutoringForm, setPrivateTutoringForm] = useState({
    course: '',
    instructor: '',
    notes: ''
  });

  const [privatePayment, setPrivatePayment] = useState(null);

  const [instructors, setInstructors] = useState([]);

  // ==========================================================
  // ACADEMIC SYSTEM
  // (real academicStatus is derived below, once currentStudent —
  // which holds the real fetched profile — is available)
  // ==========================================================

  const [nameChangeRequest, setNameChangeRequest] = useState('');
  const [nameChangeSubmitted, setNameChangeSubmitted] = useState(false);
  const [nameChangeSubmitting, setNameChangeSubmitting] = useState(false);

  const [nationalityRequest, setNationalityRequest] = useState('');
  const [nationalitySubmitted, setNationalitySubmitted] = useState(false);
  const [nationalitySubmitting, setNationalitySubmitting] = useState(false);

  // ==========================================================
  // ABSENCE EXCUSES
  // ==========================================================

  const [absenceExcuses, setAbsenceExcuses] = useState([]);

  const [absenceForm, setAbsenceForm] = useState({
    type: 'Lecture',
    date: '',
    course: '',
    reason: ''
  });

  // ==========================================================
  // ACADEMIC SUPERVISOR
  // ==========================================================

  const [supervisorMessage, setSupervisorMessage] = useState('');
  const [supervisorTopic, setSupervisorTopic] = useState('');
  const [supervisorMessages, setSupervisorMessages] = useState([]);

  const supervisorTopics = [
    'Academic performance',
    'Low GPA / CGPA',
    'Course selection',
    'Remaining courses',
    'Study plan',
    'Examination preparation',
    'Attendance concerns',
    'Programme progression',
    'Academic probation',
    'Deferral',
    'Returning after suspension',
    'Graduation requirements',
    'Other academic matter'
  ];

  // ==========================================================
  // ASSIGNMENTS
  // ==========================================================

  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [studentFees, setStudentFees] = useState([]);

  // ==========================================================
  // PASSCODE
  // ==========================================================

  const [passcodeForm, setPasscodeForm] = useState({
    oldPasscode: '',
    newPasscode: '',
    confirmPasscode: ''
  });

  // ==========================================================
  // DOCUMENT REQUESTS
  // ==========================================================

  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  // "Requests & Documents" is for official document requests only.
  // COMPLAINT and GRADUATE_SUPPORT requests are the same underlying
  // Request model, but they already have their own dedicated, correctly
  // filtered pages (/academics/communication and
  // /academics/graduate-assistance respectively) — so they're excluded
  // here to keep the two features distinct instead of showing every
  // request type in both places.
  const documentRequests = myRequests.filter(
    (request) => request.type !== 'COMPLAINT' && request.type !== 'GRADUATE_SUPPORT'
  );
  const [myTranscripts, setMyTranscripts] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const REQUEST_TYPE_LABELS = {
    TRANSCRIPT: 'Academic Transcript',
    LEAVE_OF_ABSENCE: 'Leave of Absence',
    DEFERMENT: 'Deferment of Studies',
    COURSE_ADD_DROP: 'Course Add / Drop',
    LETTER_CONFIRMATION: 'Letter of Confirmation',
    GRADE_APPEAL: 'Grade Appeal',
    OTHER: 'Other Request',
  };

  const formatRequestStatus = (status) =>
    (status || '')
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const [notifications, setNotifications] = useState([]);

  // ==========================================================
  // ATTENDANCE / EXAM TIMETABLE / CURRICULUM PROGRESS
  // Real data the /api/student/portal response already returns
  // (see setAttendanceRecords/setExamTimetable/setCurriculumInfo
  // below) but that, until now, was never captured into state on
  // this page -- only used by the dedicated /academics/* pages.
  // Needed for the new dashboard Academic Overview tiles and the
  // Upcoming Activities panel; no new API/schema required.
  // ==========================================================

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  // Raw (unmapped) registeredCourses/grades + programCurriculum, kept
  // separately from the `students`/`currentStudent` shape above (which
  // only keeps course titles / letter grades) so Academic Progress can
  // honestly match a course by id, the same way
  // app/academics/deriveAcademics.js's getCoursePlanOverview does for
  // the dedicated /academics/remaining-courses page.
  const [curriculumInfo, setCurriculumInfo] = useState({
    registeredCourseIds: [],
    grades: [],
    programCurriculum: null,
  });

  // ==========================================================
  // HIDDEN DASHBOARD MENUS
  // ==========================================================


  // ==========================================================
  // CALENDAR
  // ==========================================================

  const [calendarDate, setCalendarDate] = useState(
    () => new Date()
  );

  const [calendarMode, setCalendarMode] = useState('both');

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCalendarDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const today = calendarDate;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );

    const start = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    start.setDate(firstDay.getDate() - dayOfWeek);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      return { date, isToday };
    });
  }, [calendarMonth, today]);

  const formatHijriDate = (date, options = {}) => {
    try {
      return new Intl.DateTimeFormat(
        'en-TN-u-ca-islamic',
        options
      ).format(date);
    } catch (error) {
      return '';
    }
  };

  const formatCalendarDate = (date) => {
    const gregorian = date.toLocaleDateString(
      undefined,
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );

    const hijri = formatHijriDate(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (calendarMode === 'gregorian') return gregorian;
    if (calendarMode === 'hijri') return hijri || gregorian;
    return `${gregorian} · ${hijri || 'Hijri date unavailable'}`;
  };

  const moveCalendarMonth = (amount) => {
    setCalendarMonth((current) =>
      new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1
      )
    );
  };

  const goToCurrentMonth = () => {
    setCalendarMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  };

  // ==========================================================
  // CURRENT STUDENT
  // ==========================================================

  const currentStudent =
    students[0] || {
      id: '',
      studentId: '',
      name: '',
      email: '',
      phone: '',
      enrolledProgramme: '',
      studyType: '',
      academicStatus: '',
      level: null,
      registeredCourses: [],
      grades: [],
      semesterGPA: null,
      cgpa: null,
      currentTermName: null,
      standing: null,
      creditsEarned: null,
      creditsAttempted: null,
      feeStatus: 'No fees on record',
    };

  // ==========================================================
  // ACADEMIC RECORD
  // ==========================================================

  const [academicSemesters, setAcademicSemesters] = useState([]);

  // ==========================================================
  // GPA
  // ==========================================================

  const currentGPA = currentStudent.semesterGPA ?? null;
  const currentGPADisplay = currentGPA != null ? currentGPA.toFixed(2) : 'N/A';
  const currentCGPA = currentStudent.cgpa ?? null;
  const currentCGPADisplay = currentCGPA != null ? currentCGPA.toFixed(2) : 'N/A';

  // Warning threshold: below the institute's C+ grade point on the
  // official 5.00-point GPA scale (i.e. below 60% of MAX_GPA) —
  // scales automatically if the grading policy's ceiling ever changes.
  const isLowGPA = currentGPA != null && currentGPA < MAX_GPA * 0.6;

  // Real academic status (StudentStatus enum from the DB), not a
  // hardcoded placeholder — see STUDENT_STATUS_META above.
  const academicStatusRaw = currentStudent.academicStatus || '';
  const academicStatusMeta =
    STUDENT_STATUS_META[academicStatusRaw] || {
      label: academicStatusRaw || 'Not yet recorded',
      tone: 'neutral',
    };
  const academicStatus = academicStatusMeta.label;
  const academicStatusToneStyle =
    STATUS_TONE_STYLE[academicStatusMeta.tone];

  // Level / Term: both real fields already returned by
  // /api/student/portal (profile.level, academicProgress.currentTermName)
  // -- threaded straight through students[0] above with no derivation.
  // Honest placeholder text when genuinely unset, never a fabricated value.
  const studentLevelDisplay = currentStudent.level || 'Not yet recorded';
  const currentTermDisplay = currentStudent.currentTermName || 'Not yet recorded';

  // ==========================================================
  // DASHBOARD ACADEMIC OVERVIEW -- derived tiles
  // Enrolled Courses / Attendance / Academic Progress. All three
  // read data already present in /api/student/portal's response;
  // no field is invented here.
  // ==========================================================

  // Enrolled Courses: a plain count, real once any enrollment exists.
  const enrolledCoursesCount = currentStudent.registeredCourses.length;

  // Attendance: average of each course's own attendanceRate (already
  // computed server-side by lib/attendancePolicy.js's
  // computeAttendanceStatus -- see /api/student/portal/route.js). Null
  // (not 0) when there are no attendance records at all yet, so the UI
  // can show a genuine "not recorded" empty state instead of a
  // misleading 0%.
  const overallAttendanceRate =
    attendanceRecords.length > 0
      ? Math.round(
          attendanceRecords.reduce(
            (sum, a) => sum + (a.attendanceRate || 0),
            0
          ) / attendanceRecords.length
        )
      : null;

  // Academic Progress: percentage of the student's own programme
  // curriculum already passed, mirroring exactly how
  // app/academics/deriveAcademics.js's getCoursePlanOverview /
  // getAcademicLevelProgress compute "completed" for the dedicated
  // Courses & Academic Progress page -- a course counts as completed
  // only once a real, passing (non-'F') final grade is on record for
  // it, using each course's most recently saved attempt. When the
  // student has no assigned programme/curriculum yet, this is
  // honestly "not available" rather than a fabricated percentage.
  const curriculumCourses = curriculumInfo.programCurriculum?.curriculum || [];
  const registeredCourseIdSet = new Set(curriculumInfo.registeredCourseIds);
  const gradeByCourseId = latestGradeByCourse(curriculumInfo.grades || []);
  const passedCurriculumCourses = curriculumCourses.filter((course) => {
    const isCurrent = registeredCourseIdSet.has(course.id);
    const grade = gradeByCourseId.get(course.id);
    const hasFinalGrade = !!grade && grade.final != null;
    const passed = hasFinalGrade && grade.letter !== 'F';
    return !isCurrent && hasFinalGrade && passed;
  }).length;
  const academicProgressPercent =
    curriculumCourses.length > 0
      ? Math.round((passedCurriculumCourses / curriculumCourses.length) * 100)
      : null;

  // ==========================================================
  // DASHBOARD UPCOMING ACTIVITIES -- derived widgets
  // Every widget below reads data already fetched for this page
  // (sessions/assignments/examTimetable/announcements/notifications);
  // nothing here is a second, parallel data source for the same
  // information the Quizzes & Assignments / Announcements /
  // Notification Center tabs already show.
  // ==========================================================

  const now = Date.now();

  // Next Live Class: soonest upcoming session by its real scheduled
  // time (see the `scheduledAt` field added to setSessions above).
  const nextLiveClass = sessions
    .filter((s) => s.scheduledAt && new Date(s.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] || null;

  // Assignment Deadlines: soonest 3 upcoming (not yet due), by dueDate.
  const upcomingAssignments = assignments
    .filter((a) => a.dueDate && new Date(a.dueDate).getTime() >= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // Examinations: soonest 3 upcoming, by the real scheduled date --
  // never an invented one.
  const upcomingExams = examTimetable
    .filter((e) => e.date && new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Latest Announcements: 2 most recent (announcements state is
  // already sorted newest-first by the API/loader above).
  const latestAnnouncements = announcements.slice(0, 2);

  // Important Alerts: there is no dedicated "alert" model in this
  // codebase, only generic Notification rows (see the API route) --
  // unread notifications are surfaced here as the closest honest
  // match, same records the Notification Center tab shows, not a
  // duplicated or invented alert type. Soonest/most-recent first.
  const importantAlerts = notifications.filter((n) => n.unread).slice(0, 3);

  // ==========================================================
  // FULL (UN-TRUNCATED) VERSIONS -- same real source arrays and same
  // filter/sort as the 5 dashboard tile derivations above, just
  // without the .slice() truncation, for the "All Upcoming
  // Activities" drill-down view (see activeStudentTab === 'upcoming-all').
  // ==========================================================

  const allUpcomingLiveClasses = sessions
    .filter((s) => s.scheduledAt && new Date(s.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const allUpcomingAssignments = assignments
    .filter((a) => a.dueDate && new Date(a.dueDate).getTime() >= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const allUpcomingExams = examTimetable
    .filter((e) => e.date && new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const allLatestAnnouncements = announcements;

  const allImportantAlerts = notifications.filter((n) => n.unread);

  const completedCourseTitles = new Set(
    academicSemesters.flatMap((semester) =>
      semester.courses.map((course) => course.course)
    )
  );

  const coursePlanOverview = programmes.flatMap((programme) =>
    programme.curriculum.map((course) => {
      const isCurrent = currentStudent.registeredCourses.includes(
        course.title
      );

      const isCompleted =
        !isCurrent && completedCourseTitles.has(course.title);

      return {
        ...course,
        programme: programme.name,
        level: programme.level || 'Foundation Level',
        status: isCurrent
          ? 'current'
          : isCompleted
            ? 'completed'
            : 'remaining'
      };
    })
  );

  // ==========================================================
  // REMAINING COURSES
  // ==========================================================

  const remainingCourses = coursePlanOverview.filter(
    (course) => course.status === 'remaining'
  );

  // ==========================================================
  // STUDENT PLAN
  // ==========================================================

  const studentPlan = [
    'Complete current semester registration',
    'Attend all scheduled lectures',
    'Submit assignments before deadlines',
    'Prepare for midterm examinations',
    'Maintain attendance above the required level',
    'Prepare early for final examinations',
    'Consult academic supervisor when necessary'
  ];

  // ==========================================================
  // QUIZZES & ASSIGNMENTS
  // ==========================================================

  // Which screen of the Quizzes & Assignments section is showing:
  // the two-card landing menu, the Assignments-only list, or the
  // Quizzes-only list. Resets to the landing menu whenever the
  // student leaves and re-enters the tab (see the tab click below).
  const [quizAssignmentsView, setQuizAssignmentsView] = useState('menu');
  // Controlled rich-text answer draft per assignment id, so the
  // formatting toolbar (RichTextEditor) has somewhere to write to —
  // replaces the old uncontrolled textarea read via getElementById.
  const [answerDrafts, setAnswerDrafts] = useState({});

  // Quizzes are fetched lazily — only once the student actually opens
  // the Quizzes card — rather than on every portal load.
  useEffect(() => {
    if (quizAssignmentsView !== 'quizzes' || quizzesLoaded) return;

    fetch('/api/student/quizzes', { credentials: 'include' })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setQuizzes(result.data || []);
      })
      .catch(() => {})
      .finally(() => setQuizzesLoaded(true));
  }, [quizAssignmentsView, quizzesLoaded]);

  // ==========================================================
  // LOGIN
  // ==========================================================

const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setAuthError('Please fill in both fields.');
    return;
  }

  setAuthError('');
  setAuthLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAuthError(data?.error || 'Invalid email or password.');
      setIsLoggedIn(false);
      setAuthLoading(false);
      return;
    }

    // Play the form-exit + checkmark micro-interaction before flipping this
    // component into its dashboard view. This component never navigates on
    // login (no router.push) -- it just re-renders in place once
    // isLoggedIn flips, so the animation is sequenced entirely with local
    // state and timers matching the durations defined in globals.css
    // (.ih-login-form-out .32s, .ih-login-check-ring .5s).
    setAuthLoading(false);
    setLoginSuccess(true);
    setTimeout(() => {
      setIsLoggedIn(true);
    }, 820);
  } catch (error) {
    console.error('Student login error:', error);
    setAuthError('Unable to sign in. Please try again.');
    setIsLoggedIn(false);
    setAuthLoading(false);
  }
};



  // ==========================================================
  // LOGOUT
  // ==========================================================

const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  setIsLoggedIn(false);
  setActiveStudentTab('dashboard');
};



  // ==========================================================
  // PRIVATE TUTORING
  // ==========================================================

  const selectedInstructor = instructors.find(
    (instructor) =>
      instructor.name === privateTutoringForm.instructor
  );

  const availablePrivateCourses = selectedInstructor
    ? selectedInstructor.courses
    : [];

  const handlePrivateTutoring = async (e) => {
    e.preventDefault();

    if (
      !privateTutoringForm.course ||
      !privateTutoringForm.instructor
    ) {
      alert('Please select both instructor and course.');
      return;
    }

    const instructor = instructors.find(
      (item) =>
        item.name === privateTutoringForm.instructor
    );

    const courseMatch = (programmes[0]?.curriculum || []).find(
      (c) => c.title === privateTutoringForm.course
    );

    if (!courseMatch) {
      alert('Selected course could not be matched. Please try again.');
      return;
    }

    try {
      const response = await fetch('/api/student/tutoring', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseMatch.id,
          instructorStaffId: instructor ? instructor.id : null,
          notes: privateTutoringForm.notes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit tutoring request.');
        return;
      }

      setPrivateRequests([
        {
          id: result.data.id,
          studentName: currentStudent.name,
          course: privateTutoringForm.course,
          instructor: privateTutoringForm.instructor,
          status: 'Pending',
          date: new Date(result.data.createdAt).toISOString().substring(0, 10),
          notes: privateTutoringForm.notes,
        },
        ...privateRequests,
      ]);

      setPrivateTutoringForm({
        course: '',
        instructor: '',
        notes: ''
      });

      alert(
        'Private tutoring request submitted. It will remain pending until approved by administration.'
      );
    } catch (error) {
      console.error('Tutoring request error:', error);
      alert('Unable to submit tutoring request. Please try again.');
    }
  };

  // ==========================================================
  // PRIVATE TUTORING PAYMENT
  // Only available after admin approval
  // ==========================================================

  const [payingRequestId, setPayingRequestId] = useState(null);

  const handlePrivatePayment = async (request) => {
    if (request.status !== 'Approved') {
      alert(
        'Payment is only available after the administration approves the tutoring request.'
      );
      return;
    }

    if (request.isPaid) {
      alert('This tutoring request has already been paid for.');
      return;
    }

    setPayingRequestId(request.id);

    try {
      const response = await fetch('/api/student/tutoring/pay/initialize', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to start payment.');
        return;
      }

      // Full-page redirect to Paystack's hosted checkout, same pattern
      // as the Media subscription flow (app/media/page.jsx).
      window.location.href = result.data.authorizationUrl;
    } catch (error) {
      console.error('Tutoring payment start error:', error);
      alert('Unable to start payment. Please try again.');
      setPayingRequestId(null);
    }
  };

  // Handle return from Paystack checkout: ?reference=...
  useEffect(() => {
    if (!isLoggedIn) return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');

    if (!reference) return;

    setActiveStudentTab('private');

    fetch('/api/student/tutoring/pay/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then((res) => res.json())
      .then((data) => {
        window.history.replaceState({}, '', '/login');

        if (!data.success) {
          alert(data.error || 'Unable to verify payment.');
          return;
        }

        setPrivateRequests((prev) =>
          prev.map((r) =>
            r.id === data.data.id
              ? { ...r, isPaid: true, paidAmount: data.data.paidAmount }
              : r
          )
        );

        setPrivatePayment({
          studentName: data.data.studentName,
          course: data.data.course,
          instructor: data.data.instructor,
          fee: data.data.paidAmount,
          paymentReference: reference,
          paidAt: new Date().toLocaleString(),
        });

        alert('Payment successful — receipt is ready below.');
      })
      .catch((error) => {
        console.error('Tutoring payment verify error:', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ==========================================================
  // ABSENCE EXCUSE
  // ==========================================================

  const [submittingAbsenceExcuse, setSubmittingAbsenceExcuse] = useState(false);

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();

    if (
      !absenceForm.type ||
      !absenceForm.date ||
      !absenceForm.course ||
      !absenceForm.reason
    ) {
      alert('Please complete all absence excuse fields.');
      return;
    }

    const courseMatch = programmes
      .flatMap((programme) => programme.curriculum)
      .find((c) => c.title === absenceForm.course);

    if (!courseMatch) {
      alert('Selected course could not be matched. Please try again.');
      return;
    }

    setSubmittingAbsenceExcuse(true);

    try {
      const response = await fetch('/api/student/absence-excuses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: absenceForm.type.toUpperCase(),
          courseId: courseMatch.id,
          absenceDate: absenceForm.date,
          reason: absenceForm.reason,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit absence excuse.');
        return;
      }

      setAbsenceExcuses([
        {
          id: result.data.id,
          type: absenceForm.type,
          course: absenceForm.course,
          date: absenceForm.date,
          reason: absenceForm.reason,
          status: 'Pending',
        },
        ...absenceExcuses,
      ]);

      setAbsenceForm({
        type: 'Lecture',
        date: '',
        course: '',
        reason: ''
      });

      alert('Absence excuse submitted.');
    } catch (error) {
      console.error('Absence excuse submit error:', error);
      alert('Unable to submit absence excuse. Please try again.');
    } finally {
      setSubmittingAbsenceExcuse(false);
    }
  };

  // ==========================================================
  // SUPERVISOR
  // ==========================================================

  const handleSupervisorMessage = async (e) => {
    e.preventDefault();

    if (!supervisorTopic || !supervisorMessage) {
      alert('Please select a topic and enter your message.');
      return;
    }

    try {
      const response = await fetch('/api/student/advisor-messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[${supervisorTopic}] ${supervisorMessage}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to send message.');
        return;
      }

      setSupervisorMessages([
        {
          id: result.data.id,
          topic: supervisorTopic,
          message: supervisorMessage,
          status: 'Sent',
          date: new Date(result.data.createdAt).toLocaleDateString(),
        },
        ...supervisorMessages,
      ]);

      setSupervisorTopic('');
      setSupervisorMessage('');

      alert('Message sent to your academic supervisor.');
    } catch (error) {
      console.error('Supervisor message error:', error);
      alert('Unable to send message. Please try again.');
    }
  };

  // ==========================================================
  // NAME CHANGE
  // ==========================================================

  const handleNameChangeRequest = async (e) => {
    e.preventDefault();

    if (!nameChangeRequest.trim()) {
      alert('Please enter the requested name.');
      return;
    }

    setNameChangeSubmitting(true);

    try {
      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OTHER',
          details: `Request to change registered name to: ${nameChangeRequest.trim()}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit request.');
        return;
      }

      setNameChangeSubmitted(true);
      setNameChangeRequest('');
    } catch (error) {
      console.error('Name change request error:', error);
      alert('Unable to submit request. Please try again.');
    } finally {
      setNameChangeSubmitting(false);
    }
  };

  // ==========================================================
  // NATIONALITY CHANGE
  // ==========================================================

  const handleNationalityRequest = async (e) => {
    e.preventDefault();

    if (!nationalityRequest.trim()) {
      alert('Please enter the requested nationality.');
      return;
    }

    setNationalitySubmitting(true);

    try {
      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OTHER',
          details: `Request to change nationality on record to: ${nationalityRequest.trim()}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit request.');
        return;
      }

      setNationalitySubmitted(true);
      setNationalityRequest('');
    } catch (error) {
      console.error('Nationality change request error:', error);
      alert('Unable to submit request. Please try again.');
    } finally {
      setNationalitySubmitting(false);
    }
  };

  // ==========================================================
  // DOCUMENT REQUEST
  // ==========================================================

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!requestType) {
      alert('Please select a request type.');
      return;
    }

    if (!requestDetails.trim()) {
      alert('Please describe your request.');
      return;
    }

    setSubmittingRequest(true);

    try {
      let attachmentUrl = null;
      const fileInput = document.getElementById('request-attachment-file');
      const file = fileInput?.files?.[0];

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/student/requests/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          alert(uploadResult.error || 'Unable to upload attachment.');
          setSubmittingRequest(false);
          return;
        }

        attachmentUrl = uploadResult.key;
      }

      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          details: requestDetails,
          attachmentUrl,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit request.');
        return;
      }

      setMyRequests([
        {
          id: result.data.id,
          type: result.data.type,
          status: result.data.status,
          details: result.data.details,
          attachmentUrl: result.data.attachmentUrl,
          createdAt: result.data.createdAt,
          responseNote: null,
        },
        ...myRequests,
      ]);

      setRequestType('');
      setRequestDetails('');
      if (fileInput) fileInput.value = '';

      alert('Your request has been submitted.');
    } catch (error) {
      console.error('Request submission error:', error);
      alert('Unable to submit request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleViewRequestAttachment = async (requestId) => {
    try {
      const response = await fetch(
        `/api/student/requests/${requestId}/download`,
        { credentials: 'include' }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open attachment.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Request attachment download error:', error);
      alert('Unable to open attachment. Please try again.');
    }
  };

  const handleViewTranscript = async (transcriptId) => {
    try {
      const response = await fetch(
        `/api/student/requests/transcripts/${transcriptId}/download`,
        { credentials: 'include' }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open transcript.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Transcript download error:', error);
      alert('Unable to open transcript. Please try again.');
    }
  };

  // ==========================================================
  // PASSCODE
  // ==========================================================

  const [changingPasscode, setChangingPasscode] = useState(false);

  const handlePasscodeChange = async (e) => {
    e.preventDefault();

    if (
      !passcodeForm.oldPasscode ||
      !passcodeForm.newPasscode ||
      !passcodeForm.confirmPasscode
    ) {
      alert('Please complete all passcode fields.');
      return;
    }

    if (
      passcodeForm.newPasscode !==
      passcodeForm.confirmPasscode
    ) {
      alert('New passcodes do not match.');
      return;
    }

    setChangingPasscode(true);

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passcodeForm.oldPasscode,
          newPassword: passcodeForm.newPasscode,
          confirmPassword: passcodeForm.confirmPasscode,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to change passcode.');
        return;
      }

      alert('Passcode changed successfully.');

      setPasscodeForm({
        oldPasscode: '',
        newPasscode: '',
        confirmPasscode: ''
      });
    } catch (error) {
      console.error('Passcode change error:', error);
      alert('Unable to change passcode. Please try again.');
    } finally {
      setChangingPasscode(false);
    }
  };

  // ==========================================================
  // PROFILE PICTURE
  // ==========================================================

  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [profilePictureProgress, setProfilePictureProgress] = useState(0);

  const handleProfilePicture = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setUploadingProfilePicture(true);
    setProfilePictureProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadFileWithProgress(
        '/api/student/profile/photo',
        formData,
        (percent) => setProfilePictureProgress(percent)
      );

      if (!result || !result.success) {
        alert((result && result.error) || 'Unable to upload profile picture.');
        return;
      }

      setProfilePicture(result.url);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Unable to upload profile picture. Please try again.');
    } finally {
      setUploadingProfilePicture(false);
      setProfilePictureProgress(0);
      if (profilePictureRef.current) profilePictureRef.current.value = '';
    }
  };

  // ==========================================================
  // ASSIGNMENT UPLOAD
  // ==========================================================

  const handleSubmitAssignment = async (assignmentId, file, answerText) => {
    const trimmedAnswer = typeof answerText === 'string' ? answerText.trim() : '';

    if (!file && !trimmedAnswer) {
      alert('Please write an answer or choose a file to submit.');
      return;
    }

    if (file) {
      const allowed =
        file.type === 'application/pdf' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (!allowed) {
        alert('Please upload a PDF or DOCX file.');
        return;
      }
    }

    setSubmittingAssignmentId(assignmentId);

    try {
      let fileKey = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', assignmentId);

        const uploadResponse = await fetch('/api/student/submissions/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          alert(uploadResult.error || 'Unable to upload file.');
          return;
        }

        fileKey = uploadResult.key;
      }

      const response = await fetch('/api/student/submissions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          fileUrl: fileKey,
          answerText: trimmedAnswer || null,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to submit assignment.');
        return;
      }

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, submission: result.data }
            : a
        )
      );

      alert('Assignment submitted successfully.');
    } catch (error) {
      console.error('Assignment submission error:', error);
      alert('Unable to submit assignment. Please try again.');
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await fetch(
        `/api/student/submissions/${submissionId}/download`,
        { credentials: 'include' }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open file.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Submission download error:', error);
      alert('Unable to open file. Please try again.');
    }
  };

  const handleViewAssignmentAttachment = async (assignmentId) => {
    try {
      const response = await fetch(
        `/api/student/assignments/file?type=attachment&id=${assignmentId}`,
        { credentials: 'include' }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open file.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Assignment attachment download error:', error);
      alert('Unable to open file. Please try again.');
    }
  };

  // ==========================================================
  // PRINT HELPERS
  // ==========================================================

  const printCurrentPage = (targetId) => {
    if (typeof window === 'undefined') return;

    const target = targetId
      ? document.getElementById(targetId)
      : null;

    if (target) {
      target.classList.add('ilm-print-target');
    }

    document.body.classList.add('ilm-print-mode');

    const cleanup = () => {
      document.body.classList.remove('ilm-print-mode');
      if (target) {
        target.classList.remove('ilm-print-target');
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const unreadNotifications = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markNotificationsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false
      }))
    );
  };

  // ==========================================================
  // TAB DEFINITIONS
  // ==========================================================

  // ==========================================================
  // SIDEBAR -- categorized menu structure
  // Every item below reuses an existing, already-wired destination
  // exactly: an internal tab id that already has a matching
  // `activeStudentTab === '<id>'` render block further down this file,
  // or a real `href` copied verbatim from ACADEMICS_NAV_ITEMS above
  // (never a guessed path). Grouped into the user's approved
  // categories; each category is independently collapsible, default
  // expanded (that collapse UI state lives inside the shared
  // <StudentSidebar> component -- see components/StudentSidebar.jsx).
  // ==========================================================

  const MENU_CATEGORIES = [
    {
      id: 'dashboard-cat',
      label: 'Dashboard',
      // No collapsible heading for this one -- a category heading of
      // "Dashboard" directly above its own single "Dashboard" item
      // read as a duplicate. See StudentSidebar.jsx's `flat` handling.
      flat: true,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      ],
    },
    {
      id: 'account',
      label: 'My Account',
      items: [
        { id: 'profile', label: 'My Profile', icon: '👤' },
      ],
    },
    {
      id: 'learning',
      label: 'Learning & Courses',
      items: [
        { id: 'my-courses', href: '/academics/my-courses', label: 'My Courses', icon: '📚' },
        {
          // Live Classes used to be a local tab here, duplicating
          // /academics/live-classes (same data.liveClasses source,
          // same columns -- the dedicated page additionally splits
          // upcoming/past and shows live-now status). Kept as a
          // sidebar entry for discoverability, but it links straight
          // to the real page instead of rendering a second copy of
          // the same table.
          id: 'classes',
          href: '/academics/live-classes',
          label: 'Live Classes',
          icon: '🎥',
        },
        { id: 'quiz', label: 'Quizzes & Assignments', icon: '📝' },
        { id: 'discussion', label: 'Section Discussion', icon: '💬' },
        { id: 'study-plan', href: '/academics/study-plan', label: 'Study Plan & Curriculum', icon: '🗂️' },
      ],
    },
    {
      id: 'academic-records',
      label: 'Academic Records',
      items: [
        { id: 'academic-system', href: '/academics/overview', label: 'Academic System', icon: '📖' },
        { id: 'records', href: '/academics/records', label: 'Grades & Academic History', icon: '📊' },
        { id: 'remaining-courses', href: '/academics/remaining-courses', label: 'Courses & Academic Progress', icon: '📈' },
        { id: 'grading-policy', href: '/academics/grading-policy', label: 'Grading Policy', icon: '⚖️' },
        // Student Handbook & Policies -- links to the institute's real,
        // admin-managed public policy pages (already live at
        // /academic-policies and /student-resources, see
        // app/api/legal-content/route.js's PUBLIC_SLUGS) rather than
        // inventing new policy content or duplicating Grading Policy.
        { id: 'handbook', href: '/academic-policies', label: 'Student Handbook & Policies', icon: '📘' },
        { id: 'attendance', href: '/academics/attendance', label: 'Attendance Record', icon: '✅' },
        { id: 'calendar', label: 'Academic Calendar', icon: '📅' },
        { id: 'exams', href: '/academics/exams', label: 'Final Exam Timetable', icon: '🗓️' },
      ],
    },
    {
      id: 'services',
      label: 'Student Services',
      items: [
        { id: 'private', label: 'Private Tutoring', icon: '🧑‍🏫' },
        { id: 'excuses', label: 'Absence Excuses', icon: '📋' },
        { id: 'supervisor', label: 'Academic Supervisor', icon: '🧑‍💼' },
        { id: 'communication', href: '/academics/communication', label: 'Communication & Complaints', icon: '📧' },
        { id: 'documents', label: 'Requests & Documents', icon: '📄' },
        { id: 'graduation', href: '/academics/graduation', label: 'Graduation Procedures', icon: '🎓' },
        { id: 'graduation-documents', href: '/academics/graduation-documents', label: 'Graduation Documents', icon: '📜' },
      ],
    },
    {
      id: 'community',
      label: 'Communication & Community',
      items: [
        { id: 'announcements', label: 'Announcements', icon: '📢' },
        { id: 'notifications', label: 'Notification Center', icon: '🔔', badge: unreadNotifications },
        { id: 'ulul-azm-community', href: '/academics/community', label: 'Ulul Azm Community', icon: '🕌' },
      ],
    },
  ];

  // Active-item detection: an href-based item is active when it
  // matches the real route pathname (a dedicated /academics/* page);
  // a plain tab item is active when it matches the in-page SPA tab.
  // The category-open/collapsed UI state itself now lives inside the
  // shared <StudentSidebar> component (see components/StudentSidebar.jsx),
  // which always forces a category open when it contains this active
  // item.
  const isMenuItemActive = (item) =>
    item.href ? pathname === item.href : activeStudentTab === item.id;

  // Shared navigation mechanism for a non-href menu item -- used by
  // both the sidebar (onItemSelect below) and the top-bar search
  // dropdown, so a search result navigates exactly the same way a
  // sidebar click does.
  const handleMenuItemSelect = (item) => {
    setActiveStudentTab(item.id);
    setOpenDashboardMenu(null);
    if (item.id === 'quiz') setQuizAssignmentsView('menu');
    setPortalSearchQuery('');
    setSearchFocused(false);
  };

  // Top-bar search input (far-left, per reference image). Real,
  // controlled input that live-filters MENU_CATEGORIES items and the
  // student's real registered courses (see matchedMenuItems /
  // matchedCourses below) -- an honest, functional search, not a
  // decorative placeholder. Declared here (ahead of the derivations
  // below that read them) to avoid a temporal-dead-zone crash.
  const [portalSearchQuery, setPortalSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Flattened, real, searchable index: every MENU_CATEGORIES item's
  // label (no invented entries). Case-insensitive substring match
  // against portalSearchQuery.
  const searchableMenuItems = MENU_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryLabel: category.label }))
  );

  const trimmedSearchQuery = portalSearchQuery.trim().toLowerCase();

  const matchedMenuItems = trimmedSearchQuery
    ? searchableMenuItems.filter((item) =>
        item.label.toLowerCase().includes(trimmedSearchQuery)
      )
    : [];

  // Real registered courses also included in the same search, since
  // they're already-fetched, genuine data a student would plausibly
  // search for -- no invented course names. registeredCourses is a
  // plain array of course title strings (see the d.registeredCourses
  // mapping above).
  const matchedCourses = trimmedSearchQuery
    ? (currentStudent.registeredCourses || []).filter((title) =>
        String(title).toLowerCase().includes(trimmedSearchQuery)
      )
    : [];

  const showSearchDropdown = searchFocused && trimmedSearchQuery.length > 0;

  // ==========================================================
  // SIDEBAR -- always fully expanded on desktop (see
  // components/StudentSidebar.jsx); on a touch/narrow viewport it
  // instead renders as an off-canvas overlay toggled by the hamburger
  // button in the header.
  // ==========================================================

  const [isTouchViewport, setIsTouchViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Top-bar profile dropdown (real student info + My Profile + Sign
  // Out) -- replaces the old sidebar mini-profile block, which has
  // been removed from both <StudentSidebar> call sites so the
  // student's profile summary now lives in exactly one place.
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handleOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileMenuOpen]);

  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (!searchFocused) return undefined;

    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [searchFocused]);

  // Top-bar search dropdown: live-filters the real sidebar menu items
  // (flattened from MENU_CATEGORIES below, once it's declared) plus
  // the student's real registered courses -- no invented content.
  // Academic Services grid (ACADEMICS_NAV_ITEMS) show/hide toggle --
  // default expanded so existing users see no regression on first load.
  const [academicsGridExpanded, setAcademicsGridExpanded] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Matches this file's own existing "aside hidden below 700px"
    // breakpoint (see the injected @media (max-width: 700px) rule
    // near the bottom of this file) -- reused here rather than
    // inventing a new breakpoint value.
    const mql = window.matchMedia('(max-width: 700px)');

    const updateViewport = () => setIsTouchViewport(mql.matches);
    updateViewport();

    mql.addEventListener('change', updateViewport);
    return () => mql.removeEventListener('change', updateViewport);
  }, []);

  // Closes the mobile overlay drawer automatically whenever the
  // active tab/page changes, so tapping a destination doesn't leave
  // the overlay covering the new content underneath it.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeStudentTab, pathname]);

  // ==========================================================
  // SESSION LOADING GATE
  // ==========================================================

  if (authLoading) {
    return (
      <div style={styles.loginPage}>
        <p style={{ textAlign: 'center', marginTop: '100px', color: 'var(--ink-soft)' }}>
          Loading your session…
        </p>
      </div>
    );
  }

  // ==========================================================
  // LOGIN PAGE
  // ==========================================================

  if (!isLoggedIn) {
    return (
      <div
        style={{
          ...styles.loginPage,
          ...(loginBackgroundUrl
            ? { backgroundImage: `url(${loginBackgroundUrl})` }
            : {}),
        }}
        className={loginBackgroundUrl ? 'ih-login-page-bg' : ''}
      >
        <div style={styles.loginBack}>
          <Link
            href="/"
            className={`ih-login-backlink${loginBackgroundUrl ? ' on-image' : ''}`}
            style={{
              ...styles.backLink,
              ...(loginBackgroundUrl ? styles.backLinkOnImage : {}),
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <div style={styles.loginCardOuter}>
          <div
            style={styles.loginCard}
            className={loginSuccess ? 'ih-login-form-exit' : ''}
          >
            <div style={styles.loginLogo}>
              <div style={styles.logoCircle}>UA</div>
            </div>

            <div style={styles.loginHeading}>
              <div style={styles.loginKicker}>Ulul Azm Institute</div>

              <h1 style={styles.loginTitle}>
                Student Portal
              </h1>

              <p style={styles.loginSubtitle}>
                Access your Ulul Azm student account
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              style={styles.loginForm}
            >
              <div>
                <label style={styles.label}>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="student@ululazm.edu"
                  required
                  disabled={loginSuccess}
                  className="ih-login-input"
                  style={styles.loginInput}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  disabled={loginSuccess}
                  className="ih-login-input"
                  style={styles.loginInput}
                />
              </div>

{authError && (
  <div
    style={{
      padding: '10px 12px',
      backgroundColor: 'var(--danger-tint)',
      border: '1px solid var(--danger-tint)',
      borderRadius: '6px',
      color: 'var(--danger)',
      fontSize: '13px',
    }}
  >
    {authError}
  </div>
)}

              <button
  type="submit"
  disabled={authLoading || loginSuccess}
  className="ih-login-submit"
  style={{
    ...styles.primaryButton,
    ...styles.loginSubmitButton,
    opacity: (authLoading || loginSuccess) ? 0.7 : 1,
    cursor: (authLoading || loginSuccess) ? 'not-allowed' : 'pointer',
  }}
>
  {authLoading ? 'Signing In...' : 'Login as Student'}
</button>

            </form>

            <div style={styles.loginFooter}>
              New student?{' '}
              <Link
                href="/admission"
                style={styles.link}
              >
                Register for Admission
              </Link>
            </div>
          </div>

          {loginSuccess && (
            <div style={styles.loginSuccessOverlay} className="ih-login-success">
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                className="ih-login-success-ring"
              >
                <circle
                  cx="36"
                  cy="36"
                  r="34"
                  fill="var(--success-tint)"
                  stroke="var(--success)"
                  strokeWidth="2"
                />
                <path
                  d="M22 37 L31 46 L50 25"
                  stroke="var(--success)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="ih-login-success-check"
                  pathLength="48"
                />
              </svg>
              <p style={styles.loginSuccessText}>Signed in — loading your portal…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // STUDENT PORTAL
  // ==========================================================

  return (
    <div style={styles.portal}>
      {/* SIDEBAR */}

      <StudentSidebar
        categories={MENU_CATEGORIES}
        isItemActive={isMenuItemActive}
        onItemSelect={handleMenuItemSelect}
        brandTitle="Ulul Azm"
        brandSubtitle="Student Portal"
        onSignOut={handleLogout}
        isTouchViewport={isTouchViewport}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* MAIN */}

      <main style={styles.main}>
        {/* TOP BAR -- mobile menu toggle + search field on the left, and a
            right-aligned bell + avatar + name/role + chevron cluster,
            matching the reference image's layout. */}

        <div style={styles.topBar}>
          <div style={styles.topBarLeftCluster}>
            {isTouchViewport && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((open) => !open)}
                style={styles.mobileMenuToggle}
                aria-label="Toggle student portal menu"
                aria-expanded={mobileSidebarOpen}
              >
                ☰
              </button>
            )}

            <div style={styles.topBarSearchWrapper} ref={searchBoxRef}>
              <div style={styles.topBarSearchBox}>
                <span style={styles.topBarSearchIcon} aria-hidden="true">🔍</span>
                <input
                  type="text"
                  value={portalSearchQuery}
                  onChange={(e) => setPortalSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setPortalSearchQuery('');
                      setSearchFocused(false);
                    }
                  }}
                  placeholder="Search in student portal..."
                  aria-label="Search in student portal"
                  style={styles.topBarSearchInput}
                />
              </div>

              {showSearchDropdown && (
                <div style={styles.topBarSearchDropdown}>
                  {matchedMenuItems.length === 0 && matchedCourses.length === 0 ? (
                    <div style={styles.topBarSearchNoMatches}>
                      No matches for &ldquo;{portalSearchQuery}&rdquo;.
                    </div>
                  ) : (
                    <>
                      {matchedMenuItems.map((item) =>
                        item.href ? (
                          <Link
                            key={`menu-${item.id}`}
                            href={item.href}
                            style={styles.topBarSearchResult}
                            onClick={() => {
                              setPortalSearchQuery('');
                              setSearchFocused(false);
                            }}
                          >
                            <span aria-hidden="true">{item.icon}</span>
                            <span style={styles.topBarSearchResultText}>
                              {item.label}
                              <small style={styles.topBarSearchResultHint}>{item.categoryLabel}</small>
                            </span>
                          </Link>
                        ) : (
                          <button
                            key={`menu-${item.id}`}
                            type="button"
                            style={{ ...styles.topBarSearchResult, ...styles.topBarSearchResultButtonReset }}
                            onClick={() => handleMenuItemSelect(item)}
                          >
                            <span aria-hidden="true">{item.icon}</span>
                            <span style={styles.topBarSearchResultText}>
                              {item.label}
                              <small style={styles.topBarSearchResultHint}>{item.categoryLabel}</small>
                            </span>
                          </button>
                        )
                      )}

                      {matchedCourses.map((title) => (
                        <Link
                          key={`course-${title}`}
                          href="/academics/my-courses"
                          style={styles.topBarSearchResult}
                          onClick={() => {
                            setPortalSearchQuery('');
                            setSearchFocused(false);
                          }}
                        >
                          <span aria-hidden="true">📚</span>
                          <span style={styles.topBarSearchResultText}>
                            {title}
                            <small style={styles.topBarSearchResultHint}>My Courses</small>
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.topBarProfileCluster}>
            <button
              onClick={() => {
                setActiveStudentTab('notifications');
                markNotificationsRead();
              }}
              style={styles.notificationButton}
              title="Notifications"
            >
              🔔
              {unreadNotifications > 0 && (
                <span style={styles.notificationCount}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div style={styles.topBarProfileMenuWrapper} ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                style={styles.topBarProfileTrigger}
                aria-haspopup="true"
                aria-expanded={profileMenuOpen}
              >
                <div style={styles.topBarAvatar}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt=""
                      style={styles.topBarAvatarImage}
                    />
                  ) : hasLoadedStudentData ? (
                    currentStudent.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join('') || '?'
                  ) : null}
                </div>

                <div style={styles.topBarNameBlock}>
                  <span style={styles.topBarName}>{currentStudent.name}</span>
                  <span style={styles.topBarRole}>Student</span>
                </div>

                <span
                  style={{
                    ...styles.topBarChevron,
                    transform: profileMenuOpen ? 'rotate(180deg)' : 'none',
                  }}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {profileMenuOpen && (
                <div style={styles.topBarProfileDropdown}>
                  <div style={styles.topBarProfileDropdownHeader}>
                    <div style={styles.topBarAvatar}>
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt=""
                          style={styles.topBarAvatarImage}
                        />
                      ) : hasLoadedStudentData ? (
                        currentStudent.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('') || '?'
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.topBarProfileDropdownName}>{currentStudent.name}</div>
                      <div style={styles.topBarProfileDropdownMeta}>{currentStudent.studentId}</div>
                    </div>
                  </div>

                  <div style={styles.topBarProfileDropdownBody}>
                    <div style={styles.topBarProfileDropdownRow}>
                      <span style={styles.topBarProfileDropdownRowLabel}>Email</span>
                      <span style={styles.topBarProfileDropdownRowValue}>{currentStudent.email || '—'}</span>
                    </div>
                    <div style={styles.topBarProfileDropdownRow}>
                      <span style={styles.topBarProfileDropdownRowLabel}>Programme</span>
                      <span style={styles.topBarProfileDropdownRowValue}>
                        {currentStudent.enrolledProgramme || 'Not yet recorded'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.topBarProfileDropdownFooter}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudentTab('profile');
                        setProfileMenuOpen(false);
                      }}
                      style={styles.topBarProfileDropdownAction}
                    >
                      <span aria-hidden="true">👤</span>
                      My Profile
                    </button>
                    {/* Sign Out lives here -- and only here -- per an
                        explicit instruction to remove it from the
                        sidebar and keep this the single, authoritative
                        control. */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      style={{ ...styles.topBarProfileDropdownAction, ...styles.topBarProfileDropdownActionDanger }}
                    >
                      <span aria-hidden="true">⇥</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WELCOME BANNER */}

        <header style={styles.header}>
          <div
            style={{
              ...styles.welcomeBanner,
              ...(dashboardBannerUrl
                ? {
                    // Warm gold/cream base with the institute photo
                    // visible on the right, faded into the cream
                    // background on the left (where the text sits)
                    // via a horizontal gradient mask -- a light,
                    // warm treatment instead of the previous heavy
                    // dark-green overlay that all but hid the photo.
                    backgroundImage: `linear-gradient(90deg, var(--gold-tint) 0%, var(--gold-tint) 32%, rgba(246,239,225,.55) 55%, rgba(246,239,225,0) 78%), url(${dashboardBannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center right',
                  }
                : {}),
            }}
          >
            <div style={styles.welcomeBannerAccentLine} aria-hidden="true" />

            <h1 style={styles.headerTitle}>
              Assalamu Alaikum, {currentStudent.name}
            </h1>

            <p style={styles.headerDescription}>
              Your academic journey at Ulul Azm Institute
            </p>

            <div style={styles.welcomeBannerPillRow}>
              <span style={styles.welcomeBannerPill}>
                <span aria-hidden="true">🎓</span>
                Programme: {currentStudent.enrolledProgramme || 'Not yet recorded'}
              </span>

              <span style={styles.welcomeBannerPill}>
                <span aria-hidden="true">📊</span>
                Level: {studentLevelDisplay}
              </span>

              <span style={styles.welcomeBannerPill}>
                <span
                  aria-hidden="true"
                  style={{
                    ...styles.welcomeBannerPillDot,
                    background: academicStatusToneStyle.color,
                  }}
                />
                Status: {academicStatus}
              </span>

              <span style={styles.welcomeBannerPill}>
                <span aria-hidden="true">📅</span>
                Term: {currentTermDisplay}
              </span>
            </div>
          </div>
        </header>

        {/* LOW GPA WARNING */}

        {isLowGPA && (
          <div style={styles.warningBanner}>
            <div style={styles.warningIcon}>
              !
            </div>

            <div>
              <strong>
                Academic Performance Warning
              </strong>

              <p style={{ margin: '4px 0 0' }}>
                Your GPA is currently {currentGPADisplay}.
                Please speak with your academic supervisor
                and consider improving your study plan.
              </p>
            </div>
          </div>
        )}

        {/* CONTENT */}

        <section style={styles.contentCard}>
          {/* ==================================================
              DASHBOARD
          ================================================== */}

          {activeStudentTab === 'dashboard' && (
            <div>
              <PageHeading
                title="Academic Dashboard"
                description="A quick overview of your current academic standing."
              />

              {/* TWO-COLUMN ROW: LEFT column stacks Academic Overview
                  directly above Academic Services (matching the reference
                  image's tight left-column spacing); RIGHT column is
                  Upcoming Activities alone, which is visibly shorter than
                  the left column's combined height on desktop -- collapses
                  to a single stacked column on narrow viewports, same
                  responsive convention as .ih-overview-tile-row below. */}

              <div style={styles.dashboardTwoColRow} className="ih-dashboard-two-col">

              {/* LEFT COLUMN -- Academic Overview stacked directly above
                  Academic Services, matching the reference image (both
                  belong to the left column; only Upcoming Activities is
                  the right column). */}
              <div style={styles.dashboardLeftCol}>

              {/* ACADEMIC OVERVIEW -- one unified card: Semester GPA, CGPA,
                  Enrolled Courses, Attendance, Academic Progress. Same
                  underlying data/derivations as before (currentGPA,
                  currentCGPA, enrolledCoursesCount, overallAttendanceRate,
                  academicProgressPercent) -- only the presentation is
                  merged into a single 5-tile row instead of two separate
                  blocks (the old gpaHero + overviewTileGrid). */}

              <div style={styles.overviewCard}>
                <div style={styles.overviewCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">📈</span>
                    <h3 style={styles.overviewCardTitle}>Academic Overview</h3>
                  </div>
                  <Link href="/academics/overview" style={styles.overviewCardLink}>
                    View Details →
                  </Link>
                </div>

                <div style={styles.overviewTileRow} className="ih-overview-tile-row">
                  <div style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">📊</span>
                      <span style={styles.overviewTileLabel}>Current Semester GPA</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(currentGPA == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentGPA != null ? currentGPADisplay : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentGPA != null ? 'Semester performance' : 'Not yet recorded'}
                    </span>
                  </div>

                  <div style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">🎯</span>
                      <span style={styles.overviewTileLabel}>CGPA</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(currentCGPA == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentCGPA != null ? currentCGPADisplay : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentCGPA != null ? 'Cumulative average' : 'Not yet recorded'}
                    </span>
                  </div>

                  <Link href="/academics/my-courses" style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">📚</span>
                      <span style={styles.overviewTileLabel}>Enrolled Courses</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(enrolledCoursesCount === 0 ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {enrolledCoursesCount > 0 ? enrolledCoursesCount : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {enrolledCoursesCount > 0
                        ? 'View Courses'
                        : 'No courses assigned yet'}
                    </span>
                  </Link>

                  <Link href="/academics/attendance" style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">✅</span>
                      <span style={styles.overviewTileLabel}>Attendance</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(overallAttendanceRate == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {overallAttendanceRate != null ? `${overallAttendanceRate}%` : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {overallAttendanceRate != null
                        ? 'Average across courses'
                        : 'Not yet available'}
                    </span>
                  </Link>

                  <Link href="/academics/remaining-courses" style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">📈</span>
                      <span style={styles.overviewTileLabel}>Academic Progress</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(academicProgressPercent == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {academicProgressPercent != null ? `${academicProgressPercent}%` : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {academicProgressPercent != null
                        ? 'View Progress'
                        : 'Not yet available'}
                    </span>
                  </Link>
                </div>

                {/* Second row -- same real Academic Overview card, five
                    more genuinely available fields (never invented):
                    academic standing, credits earned/attempted (both
                    from the current term record), study mode, and fee
                    status (already computed above from real Fee rows).
                    Closes the remaining gap before Academic Services. A
                    little top margin keeps it visually separate from
                    the row above rather than reading as one 10-tile
                    block. */}

                <div
                  style={{ ...styles.overviewTileRow, marginTop: '14px' }}
                  className="ih-overview-tile-row"
                >
                  <div style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">🏅</span>
                      <span style={styles.overviewTileLabel}>Academic Standing</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(!currentStudent.standing ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentStudent.standing || '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentStudent.standing ? 'Current term standing' : 'Not yet recorded'}
                    </span>
                  </div>

                  <Link href="/academics/records" style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">🎖️</span>
                      <span style={styles.overviewTileLabel}>Credits Earned</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(currentStudent.creditsEarned == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentStudent.creditsEarned != null ? currentStudent.creditsEarned : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentStudent.creditsEarned != null ? 'This term' : 'Not yet recorded'}
                    </span>
                  </Link>

                  <Link href="/academics/records" style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">📐</span>
                      <span style={styles.overviewTileLabel}>Credits Attempted</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(currentStudent.creditsAttempted == null ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentStudent.creditsAttempted != null ? currentStudent.creditsAttempted : '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentStudent.creditsAttempted != null ? 'This term' : 'Not yet recorded'}
                    </span>
                  </Link>

                  <div style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">🧑‍🎓</span>
                      <span style={styles.overviewTileLabel}>Study Mode</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(!currentStudent.studyType ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentStudent.studyType || '—'}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      {currentStudent.studyType ? 'Enrolment type' : 'Not yet recorded'}
                    </span>
                  </div>

                  <div style={styles.overviewTile}>
                    <div style={styles.overviewTileTopRow}>
                      <span style={styles.overviewTileIconBadge} aria-hidden="true">💳</span>
                      <span style={styles.overviewTileLabel}>Fee Status</span>
                    </div>
                    <strong
                      style={{
                        ...styles.overviewTileValue,
                        ...(currentStudent.feeStatus === 'No fees on record' ? styles.metricValueEmptyLight : {}),
                      }}
                    >
                      {currentStudent.feeStatus}
                    </strong>
                    <span style={styles.overviewTileHint}>
                      Account balance
                    </span>
                  </div>
                </div>
              </div>

              {/* ACADEMIC SERVICES -- second card in the left column,
                  directly below Academic Overview with only a small gap,
                  per the reference image. */}

              <div style={{ ...styles.dashboardSectionsHeading, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={styles.dashboardSectionTitle}>
                    Academic Services
                  </h3>
                  <p style={styles.academicsNavHint}>
                    Each area below opens its own page with everything
                    related to that section.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAcademicsGridExpanded((open) => !open)}
                  style={styles.academicsGridToggle}
                  aria-expanded={academicsGridExpanded}
                  aria-label="Show or hide the Academic Services grid"
                  title="Show or hide the Academic Services grid"
                >
                  ☰
                </button>
              </div>

              </div>
              {/* END LEFT COLUMN */}

              {/* UPCOMING ACTIVITIES (RIGHT COLUMN) -- narrow vertical list.
                  Same data sources/derivations and same empty-state copy as
                  before, per item -- only the container/layout changed to a
                  compact single-column list, one compact row per category. */}

              <div style={styles.upcomingCard}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">🗓️</span>
                    <h3 style={styles.overviewCardTitle}>Upcoming Activities</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStudentTab('upcoming-all')}
                    style={styles.overviewCardLinkButton}
                  >
                    View All →
                  </button>
                </div>

                <Link href="/academics/live-classes" style={styles.upcomingRow}>
                  <span style={styles.upcomingRowIcon}>🎥</span>
                  <div style={styles.upcomingRowBody}>
                    <span style={styles.upcomingRowTitle}>Next Live Class</span>
                    {nextLiveClass ? (
                      <span style={styles.upcomingRowValue}>
                        {nextLiveClass.course} — {nextLiveClass.date} · {nextLiveClass.startTime}
                      </span>
                    ) : (
                      <span style={styles.upcomingRowEmpty}>
                        No upcoming classes are currently scheduled.
                      </span>
                    )}
                  </div>
                  <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStudentTab('quiz');
                    setQuizAssignmentsView('assignments');
                  }}
                  style={{ ...styles.upcomingRow, ...styles.upcomingRowButtonReset }}
                >
                  <span style={styles.upcomingRowIcon}>📝</span>
                  <div style={styles.upcomingRowBody}>
                    <span style={styles.upcomingRowTitle}>Assignment Deadlines</span>
                    {upcomingAssignments.length > 0 ? (
                      upcomingAssignments.map((a) => (
                        <span key={a.id} style={styles.upcomingRowValue}>
                          {a.courseCode ? `${a.courseCode} — ` : ''}{a.title} · Due{' '}
                          {new Date(a.dueDate).toLocaleDateString()}
                          {a.submission?.status ? ` · ${a.submission.status}` : ''}
                        </span>
                      ))
                    ) : (
                      <span style={styles.upcomingRowEmpty}>
                        No assignments have been posted for your courses yet.
                      </span>
                    )}
                  </div>
                  <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                </button>

                <Link href="/academics/exams" style={styles.upcomingRow}>
                  <span style={styles.upcomingRowIcon}>🗓️</span>
                  <div style={styles.upcomingRowBody}>
                    <span style={styles.upcomingRowTitle}>Examinations</span>
                    {upcomingExams.length > 0 ? (
                      upcomingExams.map((e) => (
                        <span key={e.id} style={styles.upcomingRowValue}>
                          {e.course} — {e.examType} ·{' '}
                          {new Date(e.date).toLocaleDateString()}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </span>
                      ))
                    ) : (
                      <span style={styles.upcomingRowEmpty}>
                        No examinations are currently scheduled.
                      </span>
                    )}
                  </div>
                  <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveStudentTab('announcements')}
                  style={{ ...styles.upcomingRow, ...styles.upcomingRowButtonReset }}
                >
                  <span style={styles.upcomingRowIcon}>📢</span>
                  <div style={styles.upcomingRowBody}>
                    <span style={styles.upcomingRowTitle}>Latest Announcements</span>
                    {latestAnnouncements.length > 0 ? (
                      latestAnnouncements.map((a) => (
                        <span key={a.id} style={styles.upcomingRowValue}>
                          {a.title} · {a.date}
                        </span>
                      ))
                    ) : (
                      <span style={styles.upcomingRowEmpty}>
                        No announcements have been posted yet.
                      </span>
                    )}
                  </div>
                  <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStudentTab('notifications')}
                  style={{
                    ...styles.upcomingRow,
                    ...styles.upcomingRowButtonReset,
                    borderBottom: 'none',
                  }}
                >
                  <span style={styles.upcomingRowIcon}>🔔</span>
                  <div style={styles.upcomingRowBody}>
                    <span style={styles.upcomingRowTitle}>Important Alerts</span>
                    {importantAlerts.length > 0 ? (
                      importantAlerts.map((n) => (
                        <span key={n.id} style={styles.upcomingRowValue}>
                          {n.title} · {n.message}
                        </span>
                      ))
                    ) : (
                      <span style={styles.upcomingRowEmpty}>
                        You have no unread alerts right now.
                      </span>
                    )}
                  </div>
                  <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                </button>
              </div>

              </div>
              {/* END TWO-COLUMN ROW. Right column (Upcoming Activities) is
                  intentionally shorter than the left column's combined
                  height on desktop -- that open space below it is where a
                  future Calendar widget can go; alignItems: 'start' on
                  dashboardTwoColRow keeps it from being stretched to match. */}

              {academicsGridExpanded && (
                <div style={styles.academicsNavGrid}>
                  {ACADEMICS_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={styles.academicsNavCard}
                    >
                      <span style={styles.academicsNavIcon}>
                        {item.icon}
                      </span>

                      <span style={styles.academicsNavText}>
                        <strong style={{ color: 'var(--brand-dark)' }}>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>

                      <span style={styles.academicsNavArrow}>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* FOOTER BAND -- purely decorative, no data. Cream/gold
                  strip with a small logo mark + centered motivational
                  copy, matching the reference image's bottom band. */}

              <div style={styles.dashboardFooterBand}>
                <div style={styles.dashboardFooterWedge} aria-hidden="true" />
                <div style={styles.dashboardFooterAccentLine} aria-hidden="true" />
                <div style={styles.dashboardFooterLogo} aria-hidden="true">UA</div>
                <div style={styles.dashboardFooterTextBlock}>
                  <div style={styles.dashboardFooterHeadline}>
                    Stay Focused • Achieve Your Goals • Build Your Future
                  </div>
                  <div style={styles.dashboardFooterSubline}>
                    Knowledge • Character • Excellence
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              ALL UPCOMING ACTIVITIES (drill-down from "View All ->")
              Same real derivations as the dashboard tile, just without
              the .slice() truncation -- see allUpcomingLiveClasses /
              allUpcomingAssignments / allUpcomingExams /
              allLatestAnnouncements / allImportantAlerts above.
          ================================================== */}

          {activeStudentTab === 'upcoming-all' && (
            <div>
              <button
                type="button"
                onClick={() => setActiveStudentTab('dashboard')}
                style={styles.backToMenuLink}
              >
                ← Back to Dashboard
              </button>

              <PageHeading
                title="All Upcoming Activities"
                description="Every upcoming class, deadline, exam, announcement and alert across your courses."
              />

              <div style={styles.upcomingCard}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">🎥</span>
                    <h3 style={styles.overviewCardTitle}>Live Classes</h3>
                  </div>
                </div>

                {allUpcomingLiveClasses.length > 0 ? (
                  allUpcomingLiveClasses.map((s) => (
                    <Link key={s.id} href="/academics/live-classes" style={styles.upcomingRow}>
                      <span style={styles.upcomingRowIcon}>🎥</span>
                      <div style={styles.upcomingRowBody}>
                        <span style={styles.upcomingRowTitle}>{s.course}</span>
                        <span style={styles.upcomingRowValue}>
                          {s.date} · {s.startTime}
                        </span>
                      </div>
                      <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                    </Link>
                  ))
                ) : (
                  <div style={{ ...styles.upcomingRow, borderBottom: 'none' }}>
                    <span style={styles.upcomingRowEmpty}>
                      No upcoming classes are currently scheduled.
                    </span>
                  </div>
                )}
              </div>

              <div style={{ ...styles.upcomingCard, marginTop: '20px' }}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">📝</span>
                    <h3 style={styles.overviewCardTitle}>Assignment Deadlines</h3>
                  </div>
                </div>

                {allUpcomingAssignments.length > 0 ? (
                  allUpcomingAssignments.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setActiveStudentTab('quiz');
                        setQuizAssignmentsView('assignments');
                      }}
                      style={{ ...styles.upcomingRow, ...styles.upcomingRowButtonReset }}
                    >
                      <span style={styles.upcomingRowIcon}>📝</span>
                      <div style={styles.upcomingRowBody}>
                        <span style={styles.upcomingRowTitle}>
                          {a.courseCode ? `${a.courseCode} — ` : ''}{a.title}
                        </span>
                        <span style={styles.upcomingRowValue}>
                          Due {new Date(a.dueDate).toLocaleDateString()}
                          {a.submission?.status ? ` · ${a.submission.status}` : ''}
                        </span>
                      </div>
                      <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                    </button>
                  ))
                ) : (
                  <div style={{ ...styles.upcomingRow, borderBottom: 'none' }}>
                    <span style={styles.upcomingRowEmpty}>
                      No assignments have been posted for your courses yet.
                    </span>
                  </div>
                )}
              </div>

              <div style={{ ...styles.upcomingCard, marginTop: '20px' }}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">🗓️</span>
                    <h3 style={styles.overviewCardTitle}>Examinations</h3>
                  </div>
                </div>

                {allUpcomingExams.length > 0 ? (
                  allUpcomingExams.map((e) => (
                    <Link key={e.id} href="/academics/exams" style={styles.upcomingRow}>
                      <span style={styles.upcomingRowIcon}>🗓️</span>
                      <div style={styles.upcomingRowBody}>
                        <span style={styles.upcomingRowTitle}>
                          {e.course} — {e.examType}
                        </span>
                        <span style={styles.upcomingRowValue}>
                          {new Date(e.date).toLocaleDateString()}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </span>
                      </div>
                      <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                    </Link>
                  ))
                ) : (
                  <div style={{ ...styles.upcomingRow, borderBottom: 'none' }}>
                    <span style={styles.upcomingRowEmpty}>
                      No examinations are currently scheduled.
                    </span>
                  </div>
                )}
              </div>

              <div style={{ ...styles.upcomingCard, marginTop: '20px' }}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">📢</span>
                    <h3 style={styles.overviewCardTitle}>Latest Announcements</h3>
                  </div>
                </div>

                {allLatestAnnouncements.length > 0 ? (
                  allLatestAnnouncements.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setActiveStudentTab('announcements')}
                      style={{ ...styles.upcomingRow, ...styles.upcomingRowButtonReset }}
                    >
                      <span style={styles.upcomingRowIcon}>📢</span>
                      <div style={styles.upcomingRowBody}>
                        <span style={styles.upcomingRowTitle}>{a.title}</span>
                        <span style={styles.upcomingRowValue}>{a.date}</span>
                      </div>
                      <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                    </button>
                  ))
                ) : (
                  <div style={{ ...styles.upcomingRow, borderBottom: 'none' }}>
                    <span style={styles.upcomingRowEmpty}>
                      No announcements have been posted yet.
                    </span>
                  </div>
                )}
              </div>

              <div style={{ ...styles.upcomingCard, marginTop: '20px' }}>
                <div style={styles.upcomingCardHeader}>
                  <div style={styles.cardHeaderTitleRow}>
                    <span style={styles.cardHeaderIconBadge} aria-hidden="true">🔔</span>
                    <h3 style={styles.overviewCardTitle}>Important Alerts</h3>
                  </div>
                </div>

                {allImportantAlerts.length > 0 ? (
                  allImportantAlerts.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setActiveStudentTab('notifications')}
                      style={{ ...styles.upcomingRow, ...styles.upcomingRowButtonReset }}
                    >
                      <span style={styles.upcomingRowIcon}>🔔</span>
                      <div style={styles.upcomingRowBody}>
                        <span style={styles.upcomingRowTitle}>{n.title}</span>
                        <span style={styles.upcomingRowValue}>{n.message}</span>
                      </div>
                      <span style={styles.upcomingRowChevron} aria-hidden="true">›</span>
                    </button>
                  ))
                ) : (
                  <div style={{ ...styles.upcomingRow, borderBottom: 'none' }}>
                    <span style={styles.upcomingRowEmpty}>
                      You have no unread alerts right now.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              PROFILE
          ================================================== */}

          {activeStudentTab === 'profile' && (
            <div>
              <PageHeading
                title="My Profile"
                description="View and manage your student information."
              />

              <div style={styles.profileHeader}>
                <div style={styles.largeAvatar}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Student"
                      style={styles.largeAvatarImage}
                    />
                  ) : (
                    currentStudent.name
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <h2 style={styles.profileName}>
                    {currentStudent.name}
                  </h2>

                  <p style={styles.profileMeta}>
                    {currentStudent.studentId} ·{' '}
                    {currentStudent.enrolledProgramme}
                  </p>

                  <button
                    onClick={() =>
                      profilePictureRef.current?.click()
                    }
                    style={styles.secondaryButton}
                    disabled={uploadingProfilePicture}
                  >
                    {uploadingProfilePicture
                      ? `Uploading… ${profilePictureProgress}%`
                      : 'Change Profile Picture'}
                  </button>

                  {uploadingProfilePicture && (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 220,
                        height: 5,
                        borderRadius: 3,
                        background: 'var(--border)',
                        overflow: 'hidden',
                        marginTop: 6,
                      }}
                    >
                      <div
                        style={{
                          width: `${profilePictureProgress}%`,
                          height: '100%',
                          background: 'var(--brand-dark)',
                          borderRadius: 3,
                          transition: 'width .15s ease',
                        }}
                      />
                    </div>
                  )}

                  <input
                    ref={profilePictureRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicture}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <SectionCard title="Student Information">
                <div style={styles.infoGrid}>
                  <InfoItem
                    label="Full Name"
                    value={currentStudent.name}
                  />

                  <InfoItem
                    label="Student ID"
                    value={currentStudent.studentId}
                  />

                  <InfoItem
                    label="Email"
                    value={currentStudent.email}
                  />

                  <InfoItem
                    label="Phone Number"
                    value={currentStudent.phone}
                  />

                  <InfoItem
                    label="Programme"
                    value={
                      currentStudent.enrolledProgramme
                    }
                  />

                  <InfoItem
                    label="Type of Studies"
                    value={currentStudent.studyType}
                  />

                  <InfoItem
                    label="Academic Status"
                    value={academicStatus}
                  />

                  <InfoItem
                    label="Fee Status"
                    value={
                      currentStudent.feeStatus
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard title="Request Change of Name">
                <form
                  onSubmit={
                    handleNameChangeRequest
                  }
                  style={styles.inlineForm}
                >
                  <input
                    type="text"
                    value={nameChangeRequest}
                    onChange={(e) =>
                      setNameChangeRequest(
                        e.target.value
                      )
                    }
                    placeholder="Enter your requested full name"
                    style={styles.input}
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={nameChangeSubmitting}
                  >
                    {nameChangeSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>

                {nameChangeSubmitted && (
                  <p style={styles.successText}>
                    Request submitted for
                    administrative review. Track its status
                    under Requests &amp; Documents.
                  </p>
                )}
              </SectionCard>

              <SectionCard title="Request Change of Nationality">
                <form
                  onSubmit={
                    handleNationalityRequest
                  }
                  style={styles.inlineForm}
                >
                  <input
                    type="text"
                    value={nationalityRequest}
                    onChange={(e) =>
                      setNationalityRequest(
                        e.target.value
                      )
                    }
                    placeholder="Enter requested nationality"
                    style={styles.input}
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={nationalitySubmitting}
                  >
                    {nationalitySubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>

                {nationalitySubmitted && (
                  <p style={styles.successText}>
                    Nationality change request submitted
                    for review. Track its status under
                    Requests &amp; Documents.
                  </p>
                )}
              </SectionCard>

              <SectionCard title="Change Passcode">
                <form
                  onSubmit={handlePasscodeChange}
                  style={styles.formGrid}
                >
                  <input
                    type="password"
                    placeholder="Current passcode"
                    value={
                      passcodeForm.oldPasscode
                    }
                    onChange={(e) =>
                      setPasscodeForm({
                        ...passcodeForm,
                        oldPasscode:
                          e.target.value
                      })
                    }
                    style={styles.input}
                  />

                  <input
                    type="password"
                    placeholder="New passcode"
                    value={
                      passcodeForm.newPasscode
                    }
                    onChange={(e) =>
                      setPasscodeForm({
                        ...passcodeForm,
                        newPasscode:
                          e.target.value
                      })
                    }
                    style={styles.input}
                  />

                  <input
                    type="password"
                    placeholder="Confirm new passcode"
                    value={
                      passcodeForm.confirmPasscode
                    }
                    onChange={(e) =>
                      setPasscodeForm({
                        ...passcodeForm,
                        confirmPasscode:
                          e.target.value
                      })
                    }
                    style={styles.input}
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={changingPasscode}
                  >
                    {changingPasscode ? 'Changing...' : 'Change Passcode'}
                  </button>
                </form>
              </SectionCard>
            </div>
          )}


          {/* ==================================================
              LIVE CLASSES
          ================================================== */}

          {/* Live Classes used to render a duplicate table here --
              removed in favor of the dedicated /academics/live-classes
              page (same data.liveClasses source; the sidebar item above
              now links straight there). See menuItems' 'classes' entry
              and the ?tab=classes redirect in the effect above. */}

          {/* ==================================================
              QUIZZES & ASSIGNMENTS
          ================================================== */}

          {activeStudentTab === 'quiz' && quizAssignmentsView === 'menu' && (
            <div>
              <PageHeading
                title="Quizzes & Assignments"
                description="Choose Assignments or Quizzes to see what's due and get to work."
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 18,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuizAssignmentsView('assignments')}
                  style={styles.taskChoiceCard}
                >
                  <span style={{ fontSize: 30 }}>📝</span>
                  <strong style={{ fontSize: 18 }}>Assignments</strong>
                  <span style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
                    {assignments.length === 0
                      ? 'No assignments posted yet.'
                      : `${assignments.length} assignment${assignments.length === 1 ? '' : 's'} for your courses.`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizAssignmentsView('quizzes')}
                  style={styles.taskChoiceCard}
                >
                  <span style={{ fontSize: 30 }}>✅</span>
                  <strong style={{ fontSize: 18 }}>Quizzes</strong>
                  <span style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
                    {!quizzesLoaded
                      ? 'View available quizzes.'
                      : quizzes.length === 0
                      ? 'No quizzes available yet.'
                      : `${quizzes.length} quiz${quizzes.length === 1 ? '' : 'zes'} for your courses.`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeStudentTab === 'quiz' && quizAssignmentsView === 'assignments' && (
            <div>
              <button
                type="button"
                onClick={() => setQuizAssignmentsView('menu')}
                style={styles.backToMenuLink}
              >
                ← Back to Quizzes &amp; Assignments
              </button>

              <PageHeading
                title="Assignments"
                description="View assignment due dates, open instructor materials, and submit your work."
              />

              {assignments.length === 0 ? (
                <SectionCard title="Assignments">
                  <p style={styles.mutedText}>
                    No assignments have been posted for your courses yet.
                  </p>
                </SectionCard>
              ) : (
                assignments.map((assignment) => (
                  <SectionCard
                    key={assignment.id}
                    title={`${assignment.courseCode ? assignment.courseCode + ' — ' : ''}${assignment.course} — ${assignment.title}`}
                  >
                    <p style={styles.mutedText}>
                      {assignment.description || 'No description provided.'}
                    </p>

                    <p style={styles.mutedText}>
                      Instructor: {assignment.instructor || 'Not yet assigned'}
                    </p>

                    <p style={styles.mutedText}>
                      Due:{' '}
                      {new Date(assignment.dueDate).toLocaleDateString()}
                      {assignment.submission?.status === 'LATE' && (
                        <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                          {' '}
                          · Submitted late
                        </span>
                      )}
                    </p>

                    {assignment.attachmentUrl && (
                      <button
                        style={styles.linkButton}
                        onClick={() =>
                          handleViewAssignmentAttachment(assignment.id)
                        }
                      >
                        Open instructor's attached file
                      </button>
                    )}

                    {assignment.submission ? (
                      <div style={styles.filePreview}>
                        <strong>
                          Status: {assignment.submission.status}
                        </strong>

                        {assignment.submission.answerText && (
                          <div style={{ marginTop: 8 }}>
                            <span style={styles.mutedText}>Your answer:</span>
                            <div
                              style={{
                                marginTop: 4,
                                padding: '10px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                background: 'var(--paper)',
                                lineHeight: 1.6,
                              }}
                              dangerouslySetInnerHTML={{ __html: assignment.submission.answerText }}
                            />
                          </div>
                        )}

                        {assignment.submission.fileUrl && (
                          <button
                            style={styles.linkButton}
                            onClick={() =>
                              handleViewSubmission(assignment.submission.id)
                            }
                          >
                            View submitted file
                          </button>
                        )}

                        <span style={styles.mutedText}>
                          Submitted:{' '}
                          {assignment.submission.submittedAt
                            ? new Date(assignment.submission.submittedAt).toLocaleString()
                            : '-'}
                        </span>

                        {assignment.submission.score != null && (
                          <span>
                            Score: {assignment.submission.score} /{' '}
                            {assignment.maxScore}
                          </span>
                        )}

                        {assignment.submission.feedback && (
                          <p>Feedback: {assignment.submission.feedback}</p>
                        )}
                      </div>
                    ) : (
                      <div style={styles.uploadBox}>
                        <p style={styles.mutedText}>
                          Write an answer and/or attach a file (PDF or DOCX).
                        </p>

                        <RichTextEditor
                          value={answerDrafts[assignment.id] || ''}
                          onChange={(html) =>
                            setAnswerDrafts((prev) => ({ ...prev, [assignment.id]: html }))
                          }
                          placeholder="Write your answer here (optional if attaching a file)"
                          minHeight={220}
                        />

                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          style={{ ...styles.fileInput, marginTop: 12 }}
                          id={`submission-file-${assignment.id}`}
                        />

                        <button
                          style={styles.primaryButton}
                          disabled={submittingAssignmentId === assignment.id}
                          onClick={() => {
                            const input = document.getElementById(
                              `submission-file-${assignment.id}`
                            );
                            handleSubmitAssignment(
                              assignment.id,
                              input.files?.[0],
                              answerDrafts[assignment.id] || ''
                            );
                          }}
                        >
                          {submittingAssignmentId === assignment.id
                            ? 'Submitting...'
                            : 'Submit Assignment'}
                        </button>
                      </div>
                    )}
                  </SectionCard>
                ))
              )}
            </div>
          )}

          {activeStudentTab === 'quiz' && quizAssignmentsView === 'quizzes' && (
            <div>
              <button
                type="button"
                onClick={() => setQuizAssignmentsView('menu')}
                style={styles.backToMenuLink}
              >
                ← Back to Quizzes &amp; Assignments
              </button>

              <PageHeading
                title="Quizzes"
                description="Timed quizzes and assessments published by your instructors."
              />

              {!quizzesLoaded ? (
                <SectionCard title="Quizzes">
                  <p style={styles.mutedText}>Loading quizzes...</p>
                </SectionCard>
              ) : quizzes.length === 0 ? (
                <SectionCard title="Quizzes">
                  <p style={styles.mutedText}>
                    No quizzes are available yet. Your instructors will publish quizzes here once they're ready — check back closer to your exam dates.
                  </p>
                </SectionCard>
              ) : (
                quizzes.map((quiz) => (
                  <SectionCard
                    key={quiz.id}
                    title={`${quiz.courseCode ? quiz.courseCode + ' — ' : ''}${quiz.course} — ${quiz.title}`}
                  >
                    <p style={styles.mutedText}>{quiz.description || 'No description provided.'}</p>

                    <p style={styles.mutedText}>
                      Time limit: {quiz.timeLimitMinutes} min · Attempts: {quiz.attemptsUsed} / {quiz.maxAttempts}
                      {quiz.endAt && (
                        <> · Closes {new Date(quiz.endAt).toLocaleString()}</>
                      )}
                    </p>

                    {quiz.pendingReview && (
                      <p style={{ color: 'var(--warning, #b8860b)', fontWeight: 700 }}>
                        Submitted — awaiting instructor review.
                      </p>
                    )}

                    {quiz.bestScore != null && (
                      <p>
                        Score: {quiz.bestScore} / {quiz.maxScore}
                      </p>
                    )}

                    {quiz.notYetOpen && (
                      <p style={styles.mutedText}>This quiz is not open yet.</p>
                    )}

                    {quiz.closed && !quiz.attempted && (
                      <p style={styles.mutedText}>This quiz has closed.</p>
                    )}

                    {quiz.canStart && (
                      <a href={`/student-quiz/${quiz.id}`} style={styles.linkButton}>
                        {quiz.hasInProgressAttempt ? 'Continue Quiz →' : quiz.attempted ? 'Start Next Attempt →' : 'Start Quiz →'}
                      </a>
                    )}

                    {!quiz.canStart && quiz.attempted && !quiz.pendingReview && quiz.bestScore == null && (
                      <p style={styles.mutedText}>Submitted — results not yet released.</p>
                    )}
                  </SectionCard>
                ))
              )}
            </div>
          )}

          {/* ==================================================
              SECTION DISCUSSION
          ================================================== */}

          {activeStudentTab === 'discussion' && (
            <div>
              <PageHeading
                title="Section Discussion"
                description="Discuss coursework and complete exercises with the classmates and instructor of each course you're enrolled in."
              />

              <SectionDiscussion />
            </div>
          )}

          {/* ==================================================
              PRIVATE TUTORING
          ================================================== */}

          {activeStudentTab === 'private' && (
            <div>
              <PageHeading
                title="Private Tutoring"
                description="Request one-on-one academic support from an instructor."
              />

              <SectionCard title="Request Private Tutoring">
                <form
                  onSubmit={handlePrivateTutoring}
                  style={styles.formStack}
                >
                  <label style={styles.label}>
                    Select Instructor
                  </label>

                  <select
                    value={
                      privateTutoringForm.instructor
                    }
                    onChange={(e) =>
                      setPrivateTutoringForm({
                        ...privateTutoringForm,
                        instructor:
                          e.target.value,
                        course: ''
                      })
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Select Instructor --
                    </option>

                    {instructors.map(
                      (instructor) => (
                        <option
                          key={instructor.id}
                          value={instructor.name}
                        >
                          {instructor.name}
                        </option>
                      )
                    )}
                  </select>

                  <label style={styles.label}>
                    Select Course
                  </label>

                  <select
                    value={
                      privateTutoringForm.course
                    }
                    onChange={(e) =>
                      setPrivateTutoringForm({
                        ...privateTutoringForm,
                        course: e.target.value
                      })
                    }
                    style={styles.input}
                    disabled={
                      !privateTutoringForm.instructor
                    }
                    required
                  >
                    <option value="">
                      -- Select Course --
                    </option>

                    {availablePrivateCourses.map(
                      (course) => (
                        <option
                          key={course}
                          value={course}
                        >
                          {course}
                        </option>
                      )
                    )}
                  </select>

                  {selectedInstructor && (
                    <div style={styles.feeBox}>
                      <span>
                        Private Tutoring Fee
                      </span>

                      <strong>
                        To be set by administration after review
                      </strong>
                    </div>
                  )}

                  <textarea
                    value={
                      privateTutoringForm.notes
                    }
                    onChange={(e) =>
                      setPrivateTutoringForm({
                        ...privateTutoringForm,
                        notes: e.target.value
                      })
                    }
                    rows={4}
                    placeholder="Explain what you would like help with..."
                    style={styles.textarea}
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                  >
                    Submit Tutoring Request
                  </button>
                </form>
              </SectionCard>

              <SectionCard title="Private Tutoring Requests">
                {privateRequests.length === 0 ? (
                  <EmptyState
                    text="You have not submitted any private tutoring requests."
                  />
                ) : (
                  <div style={styles.requestList}>
                    {privateRequests.map(
                      (request) => (
                        <div
                          key={request.id}
                          style={styles.requestCard}
                        >
                          <div>
                            <strong>
                              {request.course}
                            </strong>

                            <p
                              style={
                                styles.mutedText
                              }
                            >
                              {request.instructor}
                            </p>

                            <small>
                              {request.fee ? `${request.fee} GHS · ` : ''}
                              {request.date}
                            </small>
                          </div>

                          <div
                            style={
                              styles.requestActions
                            }
                          >
                            <StatusBadge
                              status={
                                request.status
                              }
                            />

                            {request.status === 'Approved' && request.isPaid && (
                              <span style={styles.mutedText}>Paid</span>
                            )}

                            {request.status ===
                              'Approved' && !request.isPaid && (
                              <button
                                onClick={() =>
                                  handlePrivatePayment(
                                    request
                                  )
                                }
                                style={
                                  styles.primarySmallButton
                                }
                                disabled={payingRequestId === request.id}
                              >
                                {payingRequestId === request.id
                                  ? 'Starting Payment...'
                                  : 'Make Payment'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <p style={styles.infoNote}>
                  Payment and receipt generation become
                  available only after administration approves
                  the private tutoring request.
                </p>
              </SectionCard>

              {privatePayment && (
                <SectionCard title="Private Tutoring Receipt">
                  <div
                    id="private-receipt"
                    style={styles.receipt}
                  >
                    <div style={styles.receiptHeader}>
                      <div style={styles.logoCircle}>
                        UA
                      </div>

                      <div>
                        <h2
                          style={{
                            margin: 0,
                            color: 'var(--ink)'
                          }}
                        >
                          Ulul Azm
                        </h2>

                        <p
                          style={{
                            margin: '3px 0 0',
                            color: 'var(--ink-soft)'
                          }}
                        >
                          Private Tutoring Payment Receipt
                        </p>
                      </div>
                    </div>

                    <div style={styles.receiptGrid}>
                      <InfoItem
                        label="Student"
                        value={
                          privatePayment.studentName
                        }
                      />

                      <InfoItem
                        label="Course"
                        value={
                          privatePayment.course
                        }
                      />

                      <InfoItem
                        label="Instructor"
                        value={
                          privatePayment.instructor
                        }
                      />

                      <InfoItem
                        label="Fee"
                        value={`${privatePayment.fee} GHS`}
                      />

                      <InfoItem
                        label="Reference"
                        value={
                          privatePayment.paymentReference
                        }
                      />

                      <InfoItem
                        label="Payment Date"
                        value={
                          privatePayment.paidAt
                        }
                      />
                    </div>

                    <div style={styles.paidStamp}>
                      PAID
                    </div>
                  </div>

                  <button
                    onClick={printCurrentPage}
                    style={styles.primaryButton}
                  >
                    Print Receipt
                  </button>
                </SectionCard>
              )}
            </div>
          )}

          {/* ==================================================
              ACADEMIC CALENDAR
          ================================================== */}

          {activeStudentTab === 'calendar' && (
            <div>
              <PageHeading
                title="Academic Calendar"
                description="View academic activities in a complete Gregorian, Hijri or combined calendar."
              />

              <div style={styles.calendarToolbar}>
                <div>
                  <strong>Calendar Display</strong>
                  <p style={styles.mutedText}>
                    The current date updates automatically while you remain on the portal.
                  </p>
                </div>

                <select
                  value={calendarMode}
                  onChange={(e) => setCalendarMode(e.target.value)}
                  style={styles.calendarModeSelect}
                >
                  <option value="both">Gregorian + Hijri</option>
                  <option value="gregorian">Gregorian Only</option>
                  <option value="hijri">Hijri Only</option>
                </select>
              </div>

              <div style={styles.calendarToday}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>Today</strong>
                  <span>— {formatCalendarDate(today)}</span>
                </div>

                <button
                  onClick={goToCurrentMonth}
                  style={styles.calendarTodayButton}
                >
                  Today
                </button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <AcademicCalendarView />
              </div>

              <SectionCard title="Calendar">
                <div style={styles.calendarBox}>
                  <div style={styles.calendarHeader}>
                    <button
                      onClick={() => moveCalendarMonth(-1)}
                      style={styles.calendarNavButton}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>

                    <div style={styles.calendarMonthTitle}>
                      <strong>
                        {calendarMonth.toLocaleDateString(
                          undefined,
                          { month: 'long', year: 'numeric' }
                        )}
                      </strong>
                      {calendarMode !== 'gregorian' && (
                        <small>
                          {formatHijriDate(calendarMonth, {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </small>
                      )}
                    </div>

                    <button
                      onClick={() => moveCalendarMonth(1)}
                      style={styles.calendarNavButton}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>

                  <div style={styles.calendarWeekHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (day) => (
                        <div key={day}>{day}</div>
                      )
                    )}
                  </div>

                  <div style={styles.calendarGrid}>
                    {calendarDays.map((day) => {
                      const isCurrentMonth =
                        day.date.getMonth() ===
                        calendarMonth.getMonth();

                      return (
                        <div
                          key={day.date.toISOString()}
                          style={{
                            ...styles.calendarDay,
                            ...(isCurrentMonth
                              ? {}
                              : styles.calendarDayOutsideMonth),
                            ...(day.isToday
                              ? styles.calendarDayToday
                              : {})
                          }}
                        >
                          <strong>{day.date.getDate()}</strong>

                          {calendarMode !== 'gregorian' && (
                            <small>
                              {formatHijriDate(day.date, {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </small>
                          )}

                          {calendarMode === 'both' && (
                            <span>
                              {day.date.toLocaleDateString(
                                undefined,
                                { month: 'short' }
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              ABSENCE EXCUSES
          ================================================== */}

          {activeStudentTab === 'excuses' && (
            <div>
              <PageHeading
                title="Absence Excuses"
                description="Submit excuses for lectures, midterms or final examinations."
              />

              <SectionCard title="Submit Absence Excuse">
                <form
                  onSubmit={handleAbsenceSubmit}
                  style={styles.formStack}
                >
                  <label style={styles.label}>
                    Absence Type
                  </label>

                  <select
                    value={absenceForm.type}
                    onChange={(e) =>
                      setAbsenceForm({
                        ...absenceForm,
                        type: e.target.value
                      })
                    }
                    style={styles.input}
                  >
                    <option value="Lecture">
                      Lecture
                    </option>

                    <option value="Midterm">
                      Midterm Examination
                    </option>

                    <option value="Final">
                      Final Examination
                    </option>
                  </select>

                  <label style={styles.label}>
                    Course
                  </label>

                  <select
                    value={absenceForm.course}
                    onChange={(e) =>
                      setAbsenceForm({
                        ...absenceForm,
                        course: e.target.value
                      })
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Select Course --
                    </option>

                    {programmes
                      .flatMap(
                        (programme) =>
                          programme.curriculum
                      )
                      .map((course) => (
                        <option
                          key={course.id}
                          value={course.title}
                        >
                          {course.title}
                        </option>
                      ))}
                  </select>

                  <label style={styles.label}>
                    Date
                  </label>

                  <input
                    type="date"
                    value={absenceForm.date}
                    onChange={(e) =>
                      setAbsenceForm({
                        ...absenceForm,
                        date: e.target.value
                      })
                    }
                    style={styles.input}
                    required
                  />

                  <label style={styles.label}>
                    Reason
                  </label>

                  <textarea
                    value={absenceForm.reason}
                    onChange={(e) =>
                      setAbsenceForm({
                        ...absenceForm,
                        reason: e.target.value
                      })
                    }
                    rows={5}
                    placeholder="Explain the reason for your absence..."
                    style={styles.textarea}
                    required
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={submittingAbsenceExcuse}
                  >
                    {submittingAbsenceExcuse ? 'Submitting...' : 'Submit Excuse'}
                  </button>
                </form>
              </SectionCard>

              <SectionCard title="My Submitted Excuses">
                {absenceExcuses.length === 0 ? (
                  <EmptyState
                    text="No absence excuses submitted."
                  />
                ) : (
                  absenceExcuses.map((excuse) => (
                    <div
                      key={excuse.id}
                      style={styles.requestCard}
                    >
                      <div>
                        <strong>
                          {excuse.type}
                        </strong>

                        <p style={styles.mutedText}>
                          {excuse.course} ·{' '}
                          {excuse.date}
                        </p>
                      </div>

                      <StatusBadge
                        status={excuse.status}
                      />
                    </div>
                  ))
                )}
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              ACADEMIC SUPERVISOR
          ================================================== */}

          {activeStudentTab === 'supervisor' && (
            <div>
              <PageHeading
                title="Academic Supervisor"
                description="Communicate with your academic supervisor about your studies."
              />

              <SectionCard title="Possible Discussion Topics">
                <div style={styles.topicGrid}>
                  {supervisorTopics.map(
                    (topic) => (
                      <button
                        key={topic}
                        onClick={() =>
                          setSupervisorTopic(
                            topic
                          )
                        }
                        style={{
                          ...styles.topicButton,
                          ...(supervisorTopic === topic
                            ? styles.topicButtonActive
                            : {})
                        }}
                      >
                        {topic}
                      </button>
                    )
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Send Message">
                <form
                  onSubmit={
                    handleSupervisorMessage
                  }
                  style={styles.formStack}
                >
                  <select
                    value={supervisorTopic}
                    onChange={(e) =>
                      setSupervisorTopic(
                        e.target.value
                      )
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Select Topic --
                    </option>

                    {supervisorTopics.map(
                      (topic) => (
                        <option
                          key={topic}
                          value={topic}
                        >
                          {topic}
                        </option>
                      )
                    )}
                  </select>

                  <textarea
                    value={supervisorMessage}
                    onChange={(e) =>
                      setSupervisorMessage(
                        e.target.value
                      )
                    }
                    rows={6}
                    placeholder="Write your message to the academic supervisor..."
                    style={styles.textarea}
                    required
                  />

                  <button
                    type="submit"
                    style={styles.primaryButton}
                  >
                    Send to Academic Supervisor
                  </button>
                </form>
              </SectionCard>

              {supervisorMessages.length > 0 && (
                <SectionCard title="Previous Messages">
                  {supervisorMessages.map(
                    (message) => (
                      <div
                        key={message.id}
                        style={styles.messageCard}
                      >
                        <strong>
                          {message.topic}
                        </strong>

                        <p>
                          {message.message}
                        </p>

                        <small>
                          {message.date} ·{' '}
                          {message.status}
                        </small>
                      </div>
                    )
                  )}
                </SectionCard>
              )}
            </div>
          )}

          {/* ==================================================
              ANNOUNCEMENTS
          ================================================== */}

          {activeStudentTab === 'announcements' && (
            <div>
              <PageHeading
                title="Announcements"
                description="Faculty and instructor announcements."
              />

              {announcements.map(
                (announcement) => (
                  <div
                    key={announcement.id}
                    style={styles.announcementCard}
                  >
                    <div
                      style={
                        styles.announcementBadge
                      }
                    >
                      {announcement.type}
                    </div>

                    <h3
                      style={{
                        margin: '10px 0 6px',
                        color: 'var(--ink)'
                      }}
                    >
                      {announcement.title}
                    </h3>

                    <p
                      style={{
                        margin: '0 0 10px',
                        color: 'var(--ink-soft)'
                      }}
                    >
                      {announcement.message}
                    </p>

                    <small
                      style={{
                        color: 'var(--ink-soft)'
                      }}
                    >
                      {announcement.author} ·{' '}
                      {announcement.date}
                    </small>
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          {activeStudentTab === 'notifications' && (
            <div>
              <PageHeading
                title="Notification Center"
                description="Important academic reminders and alerts."
              />

              <div style={styles.notificationSummary}>
                <strong>
                  {unreadNotifications}
                </strong>

                <span>
                  unread notifications
                </span>

                <button
                  onClick={
                    markNotificationsRead
                  }
                  style={styles.secondaryButton}
                >
                  Mark All as Read
                </button>
              </div>

              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    style={{
                      ...styles.notificationCard,
                      opacity:
                        notification.unread
                          ? 1
                          : 0.7
                    }}
                  >
                    <div
                      style={
                        styles.notificationIcon
                      }
                    >
                      🔔
                    </div>

                    <div>
                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>
                    </div>

                    {notification.unread && (
                      <span
                        style={
                          styles.unreadDot
                        }
                      />
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================================================
              OFFICIAL DOCUMENTS
          ================================================== */}

          {activeStudentTab === 'documents' && (
            <div>
              <PageHeading
                title="Requests & Documents"
                description="Submit a formal request — transcripts, leave of absence, course add/drop, letters and more — and track it through to a decision."
              />

              <SectionCard title="Submit a Request">
                <form
                  onSubmit={handleSubmitRequest}
                  style={styles.formStack}
                >
                  <label style={styles.label}>
                    Request Type
                  </label>

                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Select Request Type --
                    </option>

                    {Object.entries(REQUEST_TYPE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>

                  <label style={styles.label}>
                    Details
                  </label>

                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    rows={5}
                    placeholder="Explain your request — dates, reasons, and any specifics the reviewing office will need..."
                    style={styles.textarea}
                    required
                  />

                  <label style={styles.label}>
                    Supporting Document (optional)
                  </label>

                  <div style={styles.uploadBox}>
                    <p style={styles.mutedText}>
                      Accepted formats: PDF, DOCX, JPG or PNG (max 15MB)
                    </p>

                    <input
                      type="file"
                      accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                      style={styles.fileInput}
                      id="request-attachment-file"
                    />
                  </div>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={submittingRequest}
                  >
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </SectionCard>

              <SectionCard title="My Requests">
                <p style={styles.mutedText}>
                  Complaints go through Communication & Complaints, and
                  graduate-support requests through the Graduate Assistance
                  page — this list covers your official document requests only.
                </p>

                {documentRequests.length === 0 ? (
                  <EmptyState
                    text="No requests submitted yet."
                  />
                ) : (
                  documentRequests.map((request) => {
                    const transcript = myTranscripts.find(
                      (t) => t.requestId === request.id
                    );

                    return (
                      <div
                        key={request.id}
                        style={styles.requestCard}
                      >
                        <div>
                          <strong>
                            {REQUEST_TYPE_LABELS[request.type] || request.type}
                          </strong>

                          <p style={styles.mutedText}>
                            {request.details}
                          </p>

                          <small>
                            Submitted{' '}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </small>

                          {request.responseNote && (
                            <p style={styles.mutedText}>
                              Response: {request.responseNote}
                            </p>
                          )}

                          {request.attachmentUrl && (
                            <button
                              style={styles.linkButton}
                              onClick={() =>
                                handleViewRequestAttachment(request.id)
                              }
                            >
                              View my attachment
                            </button>
                          )}

                          {transcript?.pdfUrl && (
                            <div>
                              <button
                                style={styles.linkButton}
                                onClick={() =>
                                  handleViewTranscript(transcript.id)
                                }
                              >
                                Download Transcript (CGPA {transcript.cumulative?.toFixed(2)})
                              </button>
                            </div>
                          )}
                        </div>

                        <StatusBadge
                          status={formatRequestStatus(request.status)}
                        />
                      </div>
                    );
                  })
                )}
              </SectionCard>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

// ============================================================
// PAGE HEADING
// ============================================================

function PageHeading({
  title,
  description
}) {
  return (
    <div style={styles.pageHeading}>
      <h2 style={styles.pageTitle}>
        {title}
      </h2>

      <p style={styles.pageDescription}>
        {description}
      </p>
    </div>
  );
}

// ============================================================
// SECTION CARD
// ============================================================

function SectionCard({
  title,
  children
}) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>
        {title}
      </h3>

      {children}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statLabel}>
        {title}
      </span>

      <strong style={styles.statValue}>
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value
}) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// SCORE ROW
// ============================================================

function ScoreRow({
  label,
  score
}) {
  return (
    <div style={styles.scoreRow}>
      <span>{label}</span>
      <strong>{score}</strong>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status
}) {
  let background = 'var(--border)';
  let color = 'var(--ink-soft)';

  if (
    status === 'Approved' ||
    status === 'Good Standing' ||
    status === 'Paid'
  ) {
    background = 'var(--success-tint)';
    color = 'var(--brand-light)';
  }

  if (
    status === 'Pending' ||
    status === 'Pending Review' ||
    status === 'Processing'
  ) {
    background = 'var(--warning-tint)';
    color = 'var(--warning)';
  }

  if (
    status === 'Repeat Course' ||
    status === 'Rejected' ||
    status === 'Suspended'
  ) {
    background = 'var(--danger-tint)';
    color = 'var(--danger)';
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        background,
        color
      }}
    >
      {status}
    </span>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  text
}) {
  return (
    <div style={styles.emptyState}>
      {text}
    </div>
  );
}

// ============================================================
// CALENDAR EVENT
// ============================================================

function CalendarEvent({
  date,
  title
}) {
  return (
    <div style={styles.calendarEvent}>
      <strong>{date}</strong>
      <span>{title}</span>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  loginPage: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, var(--brand-tint) 0%, var(--paper) 55%, var(--brand-tint) 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  loginBack: {
    width: '100%',
    maxWidth: '500px',
    marginBottom: '18px'
  },

  backLink: {
    color: 'var(--ink)',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '999px',
    transition: 'background .15s ease'
  },

  // Applied on top of backLink whenever an admin-uploaded banner image is
  // showing behind the page (loginBackgroundUrl set) -- the banner can be
  // any color/brightness, so the link needs a real backdrop + text-shadow
  // instead of a fixed text color, or it risks going invisible against
  // the wrong photo. A semi-opaque dark pill + light text + drop shadow
  // reads clearly against any uploaded image, light or dark.
  backLinkOnImage: {
    color: '#fff',
    background: 'rgba(5, 46, 22, 0.55)',
    textShadow: '0 1px 3px rgba(0,0,0,.45)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)'
  },

  loginCardOuter: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px'
  },

  loginCard: {
    background: 'var(--surface)',
    width: '100%',
    maxWidth: '500px',
    padding: '44px 42px',
    borderRadius: '22px',
    border: '1px solid var(--border)',
    boxShadow:
      '0 24px 60px rgba(22, 52, 58, 0.12)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)'
  },

  loginInput: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    color: 'var(--ink)',
    background: 'var(--surface)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color .18s ease, box-shadow .18s ease'
  },

  // Login-screen-only override layered on top of the shared
  // primaryButton (which is reused throughout the authenticated
  // portal dashboard elsewhere in this file and must stay untouched).
  loginSubmitButton: {
    borderRadius: '10px',
    padding: '14px 18px',
    fontSize: '15px',
    boxShadow: '0 8px 20px rgba(5,46,22,.16)',
    transition: 'background .15s ease, transform .1s ease, box-shadow .15s ease'
  },

  loginSuccessOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    // Opaque themed panel behind the check + message -- without this,
    // the transparent overlay sits in front of the fading login card
    // and then the page background (which can be an arbitrary admin-
    // uploaded banner photo, or, on some viewports/themes, a darker
    // ground) with no guaranteed contrast for the brand-green text.
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '28px 24px'
  },

  loginSuccessText: {
    color: 'var(--brand)',
    fontWeight: 700,
    fontSize: '15px',
    margin: 0
  },

  loginLogo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '18px'
  },

  logoCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '17px',
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
    letterSpacing: '1px',
    boxShadow: '0 8px 20px rgba(5,46,22,.20)'
  },

  loginHeading: {
    textAlign: 'center',
    marginBottom: '30px'
  },

  loginKicker: {
    color: 'var(--gold-dark)',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    margin: '0 0 8px'
  },

  loginTitle: {
    color: 'var(--brand)',
    margin: '0 0 8px',
    fontSize: '30px',
    fontFamily: 'var(--font-display), Georgia, serif',
    fontWeight: 600,
    letterSpacing: '-0.2px'
  },

  loginSubtitle: {
    color: 'var(--ink-soft)',
    fontSize: '15px',
    margin: 0,
    lineHeight: 1.5
  },

  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },

  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--ink-soft)',
    marginBottom: '7px'
  },

  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    color: 'var(--ink)',
    background: 'var(--surface)',
    boxSizing: 'border-box',
    outline: 'none'
  },

  textarea: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid var(--border)',
    fontSize: '15px',
    color: 'var(--ink)',
    background: 'var(--surface)',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },

  primaryButton: {
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    border: 'none',
    padding: '13px 18px',
    borderRadius: '9px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    minHeight: '46px'
  },

  primarySmallButton: {
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    border: 'none',
    padding: '9px 13px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer'
  },

  secondaryButton: {
    background: 'var(--border-soft)',
    color: 'var(--ink)',
    border: '1px solid var(--border)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer'
  },

  loginFooter: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '14px',
    color: 'var(--ink-soft)'
  },

  link: {
    color: 'var(--ink)',
    fontWeight: 800,
    textDecoration: 'none'
  },

  // ----------------------------------------------------------
  // PORTAL
  // ----------------------------------------------------------

  portal: {
    minHeight: '100vh',
    background: 'var(--paper)',
    display: 'flex',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: 'var(--ink-soft)'
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: '30px 34px 60px'
  },

  // Row above the welcome banner: mobile menu toggle + search field on
  // the left, bell + avatar + name/role + chevron cluster right-aligned,
  // matching the reference image's layout.
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '16px'
  },

  topBarLeftCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
    flex: 1
  },

  topBarSearchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px'
  },

  topBarSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 16px',
    borderRadius: '999px',
    background: 'var(--surface)',
    border: '1px solid var(--border)'
  },

  topBarSearchIcon: {
    fontSize: '14px',
    color: 'var(--ink-soft)',
    flexShrink: 0
  },

  topBarSearchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: '13.5px',
    color: 'var(--ink)',
    width: '100%',
    minWidth: 0
  },

  topBarSearchDropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 30,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-card)',
    padding: '6px',
    maxHeight: '340px',
    overflowY: 'auto'
  },

  topBarSearchNoMatches: {
    padding: '12px 10px',
    fontSize: '13px',
    color: 'var(--ink-soft)'
  },

  topBarSearchResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 10px',
    borderRadius: '9px',
    textDecoration: 'none',
    color: 'var(--ink)',
    fontSize: '13.5px',
    cursor: 'pointer'
  },

  topBarSearchResultButtonReset: {
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    textAlign: 'left'
  },

  topBarSearchResultText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },

  topBarSearchResultHint: {
    color: 'var(--ink-soft)',
    fontSize: '11px',
    fontWeight: 400
  },

  topBarProfileCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto'
  },

  topBarProfileMenuWrapper: {
    position: 'relative'
  },

  topBarProfileTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit'
  },

  topBarAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 800,
    flexShrink: 0,
    overflow: 'hidden'
  },

  topBarAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  topBarNameBlock: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    textAlign: 'left'
  },

  topBarName: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--ink)'
  },

  topBarRole: {
    fontSize: '12px',
    color: 'var(--ink-soft)'
  },

  topBarChevron: {
    color: 'var(--ink)',
    fontSize: '18px',
    fontWeight: 900,
    lineHeight: 1,
    transition: 'transform .15s ease'
  },

  topBarProfileDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    zIndex: 30,
    width: '280px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden'
  },

  topBarProfileDropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderBottom: '1px solid var(--border-soft)'
  },

  topBarProfileDropdownName: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--ink)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  topBarProfileDropdownMeta: {
    fontSize: '12px',
    color: 'var(--ink-soft)',
    marginTop: '2px'
  },

  topBarProfileDropdownBody: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderBottom: '1px solid var(--border-soft)'
  },

  topBarProfileDropdownRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },

  topBarProfileDropdownRowLabel: {
    fontSize: '10.5px',
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    fontWeight: 800,
    color: 'var(--ink-soft)'
  },

  topBarProfileDropdownRowValue: {
    fontSize: '13px',
    color: 'var(--ink)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  topBarProfileDropdownFooter: {
    display: 'flex',
    flexDirection: 'column',
    padding: '6px'
  },

  topBarProfileDropdownAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 10px',
    border: 'none',
    background: 'transparent',
    borderRadius: '9px',
    font: 'inherit',
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--ink)',
    cursor: 'pointer',
    textAlign: 'left'
  },

  topBarProfileDropdownActionDanger: {
    color: 'var(--danger)'
  },

  header: {
    marginBottom: '24px'
  },

  mobileMenuToggle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: '18px',
    cursor: 'pointer',
    flexShrink: 0
  },

  // Warm gold/cream welcome banner: a light background (var(--gold-tint))
  // with the institute photo faded in on the right (see the inline
  // backgroundImage set alongside this style, above) instead of the
  // heavy dark-green overlay this used to carry -- and the same cream
  // base with no photo at all when dashboardBannerUrl is unset, rather
  // than falling back to a dark treatment.
  welcomeBanner: {
    position: 'relative',
    borderRadius: '16px',
    padding: '20px 26px',
    background: 'var(--gold-tint)',
    border: '1px solid color-mix(in srgb, var(--gold) 28%, transparent)',
    transition: 'background-image .2s ease',
    overflow: 'hidden'
  },

  welcomeBannerAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'linear-gradient(180deg, var(--gold), var(--gold-dark))'
  },

  headerTitle: {
    margin: 0,
    color: 'var(--brand-dark)',
    fontSize: '28px',
    fontWeight: 900
  },

  headerDescription: {
    margin: '7px 0 0',
    color: 'var(--ink-soft)',
    fontSize: '15px',
    maxWidth: '520px'
  },

  welcomeBannerPillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '16px'
  },

  welcomeBannerPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '999px',
    background: 'var(--surface)',
    color: 'var(--brand-dark)',
    fontSize: '12.5px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },

  welcomeBannerPillDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0
  },

  // Decorative bottom footer band -- no data, purely motivational copy
  // matching the reference image's cream/gold closing strip: a soft
  // green circular logo mark on the left, centered bold dark-green
  // headline + lighter subline, and a thin gold curve bleeding in from
  // the right (mirroring the welcome banner's own left-edge gold line).
  dashboardFooterBand: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '16px',
    marginTop: '28px',
    padding: '22px 220px 22px 32px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, var(--gold-tint) 0%, #fbf8ef 60%, var(--gold-tint) 100%)',
    border: '1px solid color-mix(in srgb, var(--gold) 30%, transparent)',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden',
    textAlign: 'left'
  },

  // Dark-green diagonal wedge bleeding in from the right -- echoes the
  // welcome banner's own right-side treatment (photo + gold curve)
  // instead of the plain cream band this replaced, so the footer
  // reads as a matching bookend to the banner at the top.
  dashboardFooterWedge: {
    position: 'absolute',
    right: '-40px',
    top: '-40%',
    bottom: '-40%',
    width: '260px',
    background: 'var(--brand-deepest)',
    transform: 'skewX(-12deg)',
    pointerEvents: 'none'
  },

  // Thin gold curve riding the wedge's left edge, mirroring the
  // welcome banner's own gold accent line.
  dashboardFooterAccentLine: {
    position: 'absolute',
    right: '150px',
    top: '-40%',
    bottom: '-40%',
    width: '4px',
    background: 'linear-gradient(180deg, var(--gold), var(--gold-dark))',
    transform: 'skewX(-12deg)',
    pointerEvents: 'none'
  },

  dashboardFooterLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--brand-tint)',
    border: '1px solid var(--brand-light)',
    color: 'var(--brand-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 800,
    flexShrink: 0
  },

  dashboardFooterTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  dashboardFooterHeadline: {
    fontFamily: 'var(--font-display)',
    fontSize: '15.5px',
    fontWeight: 700,
    letterSpacing: '.01em',
    color: 'var(--brand-dark)'
  },

  dashboardFooterSubline: {
    fontSize: '12px',
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    color: 'var(--ink-soft)'
  },

  notificationButton: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    position: 'relative',
    cursor: 'pointer',
    fontSize: '19px',
    flexShrink: 0
  },

  notificationCount: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    width: '20px',
    height: '20px',
    background: 'var(--danger)',
    color: 'var(--on-accent)',
    borderRadius: '50%',
    fontSize: '10px',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  warningBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: 'var(--warning-tint)',
    border: '1px solid var(--warning-tint)',
    borderLeft: '5px solid var(--warning)',
    borderRadius: '12px',
    padding: '16px 18px',
    marginBottom: '20px',
    color: 'var(--warning)',
    fontSize: '14px'
  },

  warningIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--warning)',
    color: 'var(--on-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    flexShrink: 0
  },

  contentCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow:
      '0 8px 30px rgba(22, 52, 58, 0.05)'
  },

  pageHeading: {
    marginBottom: '24px'
  },

  pageTitle: {
    color: 'var(--ink)',
    fontSize: '23px',
    margin: 0,
    fontWeight: 900
  },

  pageDescription: {
    margin: '6px 0 0',
    color: 'var(--ink-soft)',
    fontSize: '15px'
  },

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------

  dashboardSectionTitle: {
    margin: 0,
    color: 'var(--ink)',
    fontSize: '17px',
    fontWeight: 850
  },

  dashboardSectionsHeading: {
    marginTop: '4px',
    marginBottom: '10px'
  },

  academicsNavHint: {
    margin: '4px 0 0',
    color: 'var(--ink-soft)',
    fontSize: '13px'
  },

  // Two-column desktop row: LEFT column (~2fr) stacks Academic
  // Overview directly above Academic Services; RIGHT column (~1fr) is
  // Upcoming Activities alone. alignItems: 'start' keeps the shorter
  // right column from being stretched to match the left column's
  // full height -- collapses to a single stacked column under 900px
  // (see the .ih-dashboard-two-col media query alongside
  // .ih-overview-tile-row's, further down this file).
  dashboardTwoColRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    alignItems: 'start',
    marginBottom: '4px'
  },

  // LEFT COLUMN wrapper -- Academic Overview + Academic Services
  // stacked with only a small gap between them, matching the
  // reference image's tight left-column spacing.
  dashboardLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    minWidth: 0
  },

  // ----------------------------------------------------------
  // ACADEMIC OVERVIEW -- one unified card: Semester GPA, CGPA,
  // Enrolled Courses, Attendance, Academic Progress as a single
  // horizontal row of 5 compact tiles.
  // ----------------------------------------------------------

  overviewCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px 22px',
    minWidth: 0
  },

  overviewCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },

  cardHeaderTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  cardHeaderIconBadge: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--brand-tint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0
  },

  overviewCardTitle: {
    margin: 0,
    color: 'var(--ink)',
    fontSize: '16px',
    fontWeight: 850
  },

  overviewCardLink: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--brand)',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  },

  overviewTileRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '14px'
  },

  // Deep-green institute tile per explicit product direction (a deliberate
  // deviation from the reference image's light-background tiles): dark
  // brand background with white text throughout, rather than the earlier
  // paper/ink treatment.
  overviewTile: {
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 16px',
    border: '1px solid var(--brand-dark)',
    borderRadius: '12px',
    background: 'var(--brand-deepest)',
    textDecoration: 'none',
    color: 'var(--on-accent)',
    minWidth: 0,
    transition: 'border-color .15s ease, box-shadow .15s ease'
  },

  // Icon-in-badge + label sit side by side on one row (image structure),
  // above the value -- replaces the old stacked icon-then-label layout.
  overviewTileTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  overviewTileIconBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0
  },

  overviewTileLabel: {
    display: 'block',
    fontSize: '10.5px',
    letterSpacing: '.05em',
    fontWeight: 800,
    color: 'var(--on-accent)',
    textTransform: 'uppercase',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  overviewTileValue: {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--on-accent)',
    marginTop: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  overviewTileHint: {
    display: 'block',
    marginTop: '4px',
    color: 'rgba(255,255,255,0.82)',
    fontSize: '11.5px'
  },

  metricValueEmptyLight: {
    color: 'var(--on-dark-soft)',
    fontWeight: 700
  },

  // ----------------------------------------------------------
  // UPCOMING ACTIVITIES -- narrow vertical list docked as a single
  // card (reuses overviewCardTitle/overviewCardLink-style header).
  // ----------------------------------------------------------

  upcomingCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px 22px',
    minWidth: 0
  },

  upcomingCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },

  overviewCardLinkButton: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--brand)',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  // Used on both <Link> (Next Live Class, Examinations) and <button>
  // (Assignment Deadlines, Latest Announcements, Important Alerts) --
  // every row now routes somewhere real, so the shared look needs to
  // work as an interactive element regardless of the underlying tag.
  upcomingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px dashed var(--border-soft)',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  },

  // Extra reset needed only on the <button>-based rows, spread on top
  // of upcomingRow (a <Link> already has none of these native styles).
  upcomingRowButtonReset: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    textAlign: 'left'
  },

  upcomingRowIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--brand-tint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '14px',
    color: 'var(--brand-dark)'
  },

  upcomingRowBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1
  },

  upcomingRowChevron: {
    flexShrink: 0,
    color: 'var(--ink-soft)',
    fontSize: '14px'
  },

  upcomingRowTitle: {
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--ink)'
  },

  upcomingRowValue: {
    fontSize: '13px',
    color: 'var(--ink)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  upcomingRowEmpty: {
    fontSize: '12.5px',
    color: 'var(--ink-soft)',
    lineHeight: 1.4
  },

  academicsGridToggle: {
    width: '38px',
    height: '38px',
    borderRadius: '9px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: '16px',
    cursor: 'pointer',
    flexShrink: 0
  },

  academicsNavGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
    marginBottom: '20px'
  },

  academicsNavCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'var(--surface)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color .15s ease, box-shadow .15s ease'
  },

  academicsNavIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'var(--brand-tint)',
    color: 'var(--brand-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '19px',
    flexShrink: 0
  },

  academicsNavText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0
  },

  academicsNavArrow: {
    color: 'var(--brand)',
    fontWeight: 800,
    fontSize: '16px',
    flexShrink: 0
  },

  menuWrapper: {
    position: 'relative'
  },

  dotsButton: {
    border: 'none',
    background: 'var(--border-soft)',
    color: 'var(--ink-soft)',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '22px',
    lineHeight: 1,
    fontWeight: 900
  },

  dashboardDropdown: {
    position: 'absolute',
    right: 0,
    top: '40px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '9px',
    boxShadow:
      '0 10px 30px rgba(15,23,42,0.12)',
    zIndex: 20,
    minWidth: '150px',
    padding: '5px'
  },

  dropdownItem: {
    width: '100%',
    border: 'none',
    background: 'var(--surface)',
    textAlign: 'left',
    padding: '9px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
    color: 'var(--ink-soft)'
  },

  dashboardSectionContent: {
    borderTop: '1px solid var(--border)',
    padding: '18px'
  },

  hiddenSectionHint: {
    color: 'var(--ink-soft)',
    fontSize: '13px',
    padding: '0 18px 15px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '13px'
  },

  statCard: {
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px'
  },

  statLabel: {
    display: 'block',
    color: 'var(--ink-soft)',
    fontSize: '13px',
    marginBottom: '6px'
  },

  statValue: {
    display: 'block',
    color: 'var(--ink)',
    fontSize: '16px',
    fontWeight: 850
  },

  planList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  planItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    background: 'var(--paper)',
    padding: '12px',
    borderRadius: '9px',
    fontSize: '14px'
  },

  planOverviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '22px',
    marginBottom: '10px',
    color: 'var(--ink)',
    fontSize: '15px'
  },

  courseOverviewList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginTop: '8px'
  },

  courseOverviewCard: {
    minHeight: '175px',
    aspectRatio: '1 / 1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
    gap: '12px',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    boxSizing: 'border-box',
    fontSize: '14px'
  },

  courseOverviewCurrent: {
    background: 'var(--brand-tint)',
    borderColor: 'var(--success-tint)'
  },

  courseOverviewCompleted: {
    background: 'var(--info-tint)',
    borderColor: 'var(--info)'
  },

  courseOverviewRemaining: {
    background: 'var(--danger-tint)',
    borderColor: 'var(--danger-tint)'
  },

  courseOverviewContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },

  courseOverviewTitle: {
    display: 'block',
    color: 'var(--ink)',
    fontSize: '15px',
    lineHeight: 1.45,
    marginBottom: '8px'
  },

  courseOverviewMeta: {
    display: 'block',
    color: 'var(--ink-soft)',
    fontSize: '12px'
  },

  courseOverviewLevel: {
    display: 'block',
    color: 'var(--ink-soft)',
    fontSize: '11px',
    fontWeight: 800,
    marginBottom: '8px'
  },

  courseOverviewLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '16px',
    padding: '12px 14px',
    borderRadius: '10px',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    color: 'var(--ink-soft)',
    fontSize: '13px',
    fontWeight: 600
  },

  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px'
  },

  legendDot: {
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0
  },

  legendCurrent: {
    background: 'var(--success)'
  },

  legendCompleted: {
    background: 'var(--info)'
  },

  legendRemaining: {
    background: 'var(--danger)'
  },



  planNumber: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'var(--brand-tint-2)',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    flexShrink: 0
  },

  semesterBlock: {
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginBottom: '12px',
    overflow: 'hidden'
  },

  semesterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    background: 'var(--border-soft)',
    padding: '12px 14px',
    fontSize: '14px',
    color: 'var(--ink-soft)'
  },

  recordRow: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(150px, 1fr) 100px 80px',
    gap: '10px',
    padding: '12px 14px',
    borderTop: '1px solid var(--border)',
    fontSize: '14px',
    alignItems: 'center'
  },

  gradeBadge: {
    display: 'inline-flex',
    justifyContent: 'center',
    background: 'var(--info-tint)',
    color: 'var(--info)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 900
  },

  courseGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },

  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '14px'
  },

  courseCode: {
    color: 'var(--brand)',
    fontWeight: 900,
    fontSize: '12px'
  },

  activeDot: {
    color: 'var(--success)',
    fontSize: '11px'
  },

  gradingGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px'
  },

  gradingItem: {
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    padding: '13px',
    borderRadius: '9px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  // ----------------------------------------------------------
  // GENERAL SECTIONS
  // ----------------------------------------------------------

  sectionCard: {
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    background: 'var(--surface)'
  },

  sectionTitle: {
    color: 'var(--ink)',
    fontSize: '17px',
    margin: '0 0 16px',
    fontWeight: 850
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },

  infoItem: {
    background: 'var(--paper)',
    borderRadius: '9px',
    padding: '13px',
    border: '1px solid var(--border)'
  },

  infoLabel: {
    display: 'block',
    color: 'var(--ink-soft)',
    fontSize: '12px',
    marginBottom: '5px'
  },

  infoValue: {
    display: 'block',
    color: 'var(--ink-soft)',
    fontSize: '14px'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },

  formStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '700px'
  },

  inlineForm: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },

  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: 'var(--paper)',
    borderRadius: '12px',
    marginBottom: '18px'
  },

  largeAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'var(--brand-tint-2)',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '38px',
    fontWeight: 900,
    overflow: 'hidden',
    flexShrink: 0
  },

  largeAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  profileName: {
    color: 'var(--ink)',
    margin: '0 0 5px',
    fontSize: '22px'
  },

  profileMeta: {
    color: 'var(--ink-soft)',
    margin: '0 0 12px',
    fontSize: '14px'
  },

  successText: {
    color: 'var(--brand)',
    fontWeight: 700,
    fontSize: '14px',
    marginTop: '12px'
  },

  mutedText: {
    color: 'var(--ink-soft)',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // ACADEMIC SYSTEM
  // ----------------------------------------------------------

  academicHero: {
    background: 'var(--brand-tint)',
    border: '1px solid var(--success-tint)',
    borderRadius: '14px',
    padding: '22px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '18px'
  },

  academicStatus: {
    display: 'block',
    fontSize: '28px',
    marginTop: '5px'
  },

  welcomeMessage: {
    maxWidth: '650px',
    lineHeight: 1.6,
    color: 'var(--ink-soft)',
    marginBottom: 0
  },

  academicNumbers: {
    display: 'flex',
    gap: '35px',
    alignItems: 'center'
  },

  academicNumbersDiv: {},

  academicNumbersSmall: {},

  statusGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },

  statusOption: {
    padding: '18px',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    textAlign: 'center'
  },

  statusOptionActive: {
    background: 'var(--success-tint)',
    borderColor: 'var(--success-tint)',
    color: 'var(--brand-light)'
  },

  gpaCards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px'
  },

  bigMetric: {
    background: 'var(--paper)',
    padding: '22px',
    borderRadius: '12px',
    border: '1px solid var(--border)'
  },

  // ----------------------------------------------------------
  // TABLE
  // ----------------------------------------------------------

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginBottom: '16px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px'
  },

  th: {
    background: 'var(--border-soft)',
    color: 'var(--ink-soft)',
    padding: '13px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 850
  },

  td: {
    padding: '13px',
    borderTop: '1px solid var(--border)',
    color: 'var(--ink-soft)',
    fontSize: '14px'
  },

  tableLink: {
    color: 'var(--brand-light)',
    textDecoration: 'none',
    fontWeight: 800
  },

  // ----------------------------------------------------------
  // ASSESSMENTS
  // ----------------------------------------------------------

  assessmentInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    flexWrap: 'wrap',
    background: 'var(--brand-tint)',
    border: '1px solid var(--success-tint)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px'
  },

  scoreList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'var(--paper)',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // UPLOAD
  // ----------------------------------------------------------

  uploadBox: {
    border: '2px dashed var(--border)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    background: 'var(--paper)'
  },

  uploadIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto',
    borderRadius: '12px',
    background: 'var(--brand-tint-2)',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 900
  },

  fileInput: {
    display: 'block',
    margin: '20px auto',
    fontSize: '14px'
  },

  linkButton: {
    background: 'none',
    border: 'none',
    color: 'var(--brand)',
    fontWeight: 700,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    fontSize: '14px'
  },

  taskChoiceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
    textAlign: 'left',
    padding: '24px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    cursor: 'pointer',
    transition: 'box-shadow .15s ease, transform .15s ease',
    boxShadow: '0 2px 10px rgba(27,36,31,.05)',
  },

  backToMenuLink: {
    background: 'none',
    border: 'none',
    color: 'var(--brand)',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
    fontSize: '13.5px',
    display: 'inline-block',
  },

  filePreview: {
    maxWidth: '500px',
    margin: '0 auto 15px',
    padding: '12px',
    borderRadius: '8px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '13px'
  },

  // ----------------------------------------------------------
  // PRIVATE TUTORING
  // ----------------------------------------------------------

  feeBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--brand-tint)',
    border: '1px solid var(--success-tint)',
    padding: '14px',
    borderRadius: '9px',
    color: 'var(--brand-light)'
  },

  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '15px'
  },

  requestActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
    whiteSpace: 'nowrap'
  },

  infoNote: {
    color: 'var(--ink-soft)',
    background: 'var(--paper)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    marginTop: '15px'
  },

  receipt: {
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '15px',
    position: 'relative',
    background: 'var(--surface)'
  },

  receiptHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '18px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '18px'
  },

  receiptGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },

  paidStamp: {
    display: 'inline-block',
    marginTop: '18px',
    padding: '7px 14px',
    border: '2px solid var(--success)',
    color: 'var(--success)',
    fontWeight: 900,
    transform: 'rotate(-5deg)',
    borderRadius: '5px'
  },

  // ----------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------

  attendanceRule: {
    background: 'var(--warning-tint)',
    border: '1px solid var(--warning-tint)',
    borderLeft: '5px solid var(--warning)',
    padding: '15px 18px',
    borderRadius: '10px',
    marginBottom: '18px',
    color: 'var(--warning)',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // CALENDAR
  // ----------------------------------------------------------

  calendarToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '15px 18px',
    marginBottom: '14px'
  },

  calendarModeSelect: {
    minWidth: '190px',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink-soft)',
    fontSize: '14px'
  },

  calendarToday: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    padding: '16px 18px',
    borderRadius: '10px',
    marginBottom: '16px'
  },

  calendarTodayButton: {
    background: 'var(--surface)',
    color: 'var(--ink)',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 13px',
    fontWeight: 800,
    cursor: 'pointer'
  },

  horizontalEvents: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '5px'
  },

  calendarEvent: {
    minWidth: '170px',
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  calendarBox: {
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'var(--surface)',
    overflow: 'hidden',
    maxWidth: '480px',
    margin: '0 auto'
  },

  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--paper)',
    borderBottom: '1px solid var(--border)'
  },

  calendarMonthTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: 'var(--ink)',
    fontSize: '16px'
  },

  calendarMonthTitleSmall: {
    color: 'var(--ink-soft)',
    fontSize: '12px'
  },

  calendarNavButton: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    cursor: 'pointer',
    fontSize: '19px',
    lineHeight: 1
  },

  calendarWeekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    background: 'var(--border-soft)',
    borderBottom: '1px solid var(--border)'
  },

  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)'
  },

  calendarDay: {
    minHeight: '52px',
    padding: '6px 5px',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '2px',
    fontSize: '11.5px',
    color: 'var(--ink-soft)'
  },

  calendarDayOutsideMonth: {
    background: 'var(--paper)',
    color: 'var(--ink-soft)'
  },

  calendarDayToday: {
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    boxShadow: 'inset 0 0 0 2px var(--success-tint)'
  },

  // ----------------------------------------------------------
  // SUPERVISOR
  // ----------------------------------------------------------

  topicGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '9px'
  },

  topicButton: {
    border: '1px solid var(--border)',
    background: 'var(--paper)',
    color: 'var(--ink-soft)',
    padding: '11px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 650,
    fontSize: '13px'
  },

  topicButtonActive: {
    background: 'var(--brand-dark)',
    color: 'var(--on-accent)',
    borderColor: 'var(--brand-dark)'
  },

  messageCard: {
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    padding: '15px',
    borderRadius: '9px',
    marginBottom: '9px'
  },

  // ----------------------------------------------------------
  // ANNOUNCEMENTS
  // ----------------------------------------------------------

  announcementCard: {
    border: '1px solid var(--border)',
    borderLeft: '5px solid var(--brand-dark)',
    borderRadius: '10px',
    padding: '17px',
    marginBottom: '12px',
    background: 'var(--surface)'
  },

  announcementBadge: {
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '999px',
    background: 'var(--info-tint)',
    color: 'var(--info)',
    fontSize: '11px',
    fontWeight: 900
  },

  // ----------------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------------

  notificationSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '15px',
    background: 'var(--paper)',
    borderRadius: '10px',
    marginBottom: '15px'
  },

  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    position: 'relative',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '10px',
    background: 'var(--surface)'
  },

  notificationIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '9px',
    background: 'var(--brand-tint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  unreadDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: 'var(--danger)',
    position: 'absolute',
    right: '14px',
    top: '14px'
  },

  // ----------------------------------------------------------
  // EMPTY
  // ----------------------------------------------------------

  emptyState: {
    padding: '30px',
    textAlign: 'center',
    background: 'var(--paper)',
    color: 'var(--ink-soft)',
    borderRadius: '10px',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // PRINT
  // ----------------------------------------------------------

  receiptHeaderDiv: {}
};

// ============================================================
// PRINT STYLES
// ============================================================

if (typeof document !== 'undefined') {
  const existingStyle =
    document.getElementById(
      'ulul-azm-student-print-style'
    );

  if (!existingStyle) {
    const styleElement =
      document.createElement('style');

    styleElement.id =
      'ulul-azm-student-print-style';

    styleElement.innerHTML = `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }

      @media print {
        body {
          background: white !important;
        }

        body.ilm-print-mode * {
          visibility: hidden !important;
        }

        body.ilm-print-mode .ilm-print-target,
        body.ilm-print-mode .ilm-print-target * {
          visibility: visible !important;
        }

        body.ilm-print-mode .ilm-print-target {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
        }

        body.ilm-print-mode #private-receipt,
        body.ilm-print-mode #exam-timetable {
          display: block !important;
          box-shadow: none !important;
          border: none !important;
        }
      }

      /* The student portal sidebar (.ih-student-sidebar / .ih-sb-*) is
         now a shared component (components/StudentSidebar.jsx) styled
         entirely from app/globals.css, so both this page and every
         /academics/* page render an identical sidebar -- its always-
         expanded desktop layout, its <=700px tap-toggle overlay drawer,
         and the .ih-sidebar-scrim backdrop are all defined there, not
         duplicated per page. */

      @media (max-width: 900px) {
        main {
          padding: 20px !important;
        }

        .ih-overview-tile-row {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        .ih-dashboard-two-col {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 700px) {
        body {
          overflow-x: hidden;
        }

        main {
          width: 100% !important;
          padding: 15px !important;
        }

        .student-mobile {
          display: block;
        }

        .ih-overview-tile-row {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }
    `;

    document.head.appendChild(styleElement);
  }
}