// Curated institute knowledge base for the rule-based assistant.
// Keep answers short, factual, and department-scoped — the assistant should
// route people to the right place rather than invent policy.
//
// `zones` marks which assistant "zone" (page context) this topic is most
// relevant to: 'student' | 'employee' | 'bookstore' | 'media' | 'library' | 'general'.
// 'employee' covers staff/instructor-facing topics (their own teaching
// dashboard, roster, attendance-taking, assessments, tasks) as distinct
// from the 'student' topics above, which are about a learner's own
// record. An optional `href` on an entry is a real, existing route the
// widget can offer as a direct "Go to" link -- never a fabricated page.
// Every topic still stays reachable everywhere (this is a knowledge
// lookup, not a permission gate) — zones only shape which topics appear
// in the small suggestion menu for that area of the site, so a student
// on their academics pages isn't handed a menu of bookstore admin or
// media/library management options, and vice versa. 'general' always
// sees everything.
//
// Media and Library are two separate, independently-run sections:
// Media (video/audio — Scholarly Talks, Video Lessons, Audio Recordings,
// Khutbah, Poems, Mutoon, Lectures) requires an active subscription for
// protected items; Library (written/reference content — Articles,
// Fatwas, Research Papers, Historical Materials, Manuscripts,
// Educational Resources, Classical Texts) is always free to read, with
// no subscription of any kind — never suggest a Library subscription.

export const KNOWLEDGE = [
  {
    id: 'admissions',
    label: 'Admissions',
    group: 'admissions-finance',
    zones: ['student', 'general'],
    keywords: ['admission', 'admissions', 'apply', 'application', 'enroll', 'enrol', 'register', 'registration', 'join'],
    department: 'Admissions Office',
    answer:
      "Admissions are handled by the Admissions Office. You can start an application from the Admission page on the homepage. Once submitted, an Admissions Officer reviews it and you'll be contacted with next steps.",
  },
  {
    id: 'fees',
    label: 'Fees & Tuition',
    group: 'admissions-finance',
    zones: ['student', 'general'],
    keywords: ['fee', 'fees', 'tuition', 'payment', 'pay', 'invoice', 'cost', 'price of program', 'financial'],
    department: 'Finance Office',
    answer:
      'Tuition and admission fees are managed by the Finance Office. Fee schedules are set per programme — check with Admissions when applying, or Finance directly for an existing student account.',
  },
  {
    id: 'transcript',
    label: 'Transcript',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: ['transcript', 'academic record', 'certificate of study'],
    department: 'Academic Records / Registrar',
    answer:
      'Transcript requests are handled by Academic Records (the Registrar). A transcript request is logged as a formal Request and includes a computed cumulative GPA once issued.',
  },
  {
    id: 'grade-appeal',
    label: 'Grade Appeal',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: ['grade appeal', 'appeal my grade', 'wrong grade', 'regrade', 're-grade', 'dispute grade'],
    department: 'Examinations Office',
    answer:
      'Grade appeals are routed to the Examinations Office. If you believe a grade was recorded incorrectly, this is the department that reviews it.',
  },
  {
    id: 'leave-defer',
    label: 'Leave of Absence',
    group: 'student-services',
    zones: ['student', 'general'],
    keywords: ['leave of absence', 'defer', 'deferment', 'letter of confirmation', 'confirmation letter'],
    department: 'Student Affairs',
    answer:
      'Leave of absence, deferment, and letter-of-confirmation requests go through Student Affairs — submit them from Requests & Documents on your Dashboard.',
  },
  {
    id: 'course-registration',
    label: 'Course Registration',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'course registration', 'register for a course', 'register for courses', 'register for classes',
      'add a course', 'drop a course', 'course add', 'course drop', 'add/drop', 'course add/drop',
      'auto assign', 'auto-assign', 'automatic registration', 'automatically registered',
    ],
    department: 'Academic Records / Registrar',
    answer:
      "You don't register for courses yourself — the system automatically assigns each semester's courses based on your approved study plan, completed courses, prerequisites, and academic level. If you need a course added or dropped, submit a Request to Add or Request to Drop from Study Plan & Curriculum under Academic System, and Academic Records will review it.",
  },
  {
    id: 'schedule',
    label: 'Academic Calendar',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'class schedule', 'academic schedule', 'timetable', 'term dates', 'semester dates', 'academic calendar',
      'when does the term start', 'when does the semester start', 'download the calendar', 'hijri calendar',
    ],
    department: 'Academic Records / Registrar',
    answer:
      "The official Academic Calendar (Gregorian and Hijri dates, procedures per semester) has its own section in your Student Portal — separate from Academic System — and is downloadable as a PDF. It is published by Academic Records and is the same calendar every portal shows.",
  },
  {
    id: 'student-services',
    label: 'Student Services',
    group: 'student-services',
    zones: ['student', 'general'],
    keywords: ['student services', 'student id card', 'id card', 'enrollment letter', 'proof of enrollment'],
    department: 'Student Affairs',
    answer:
      'Student services such as ID cards and enrollment letters are handled by Student Affairs — submit a request from your Student Portal.',
  },
  {
    id: 'library',
    label: 'Library',
    group: 'library',
    zones: ['student', 'general'],
    keywords: ['library', 'book borrow', 'borrow a book', 'return a book', 'library hours', 'reading room'],
    department: 'Library',
    answer:
      'Library services (borrowing, returns, reading resources) are managed by the Librarian. For digital books and purchases specifically, see the Bookstore instead.',
  },
  {
    id: 'bookstore',
    label: 'Bookstore',
    group: 'bookstore',
    zones: ['bookstore', 'general'],
    keywords: ['bookstore', 'buy a book', 'purchase book', 'my order', 'my orders', 'download my book', 'ebook'],
    department: 'Bookstore',
    answer:
      'The Bookstore handles book purchases and downloads. If you\'re signed in, ask me "what are my orders" or "what books do I have" and I can look that up for you.',
  },
  {
    id: 'bookstore-authors',
    label: 'About Authors',
    group: 'bookstore',
    zones: ['bookstore', 'general'],
    keywords: ['author', 'authors', 'who wrote', 'about the author', 'become an author', 'submit a manuscript', 'submit a book'],
    department: 'Bookstore',
    answer:
      'Each book\'s listing includes author information. If you are an author yourself and want to publish through the institute, the Author Portal handles manuscript submissions and quotes.',
  },
  {
    id: 'bookstore-search',
    label: 'Find a Book',
    group: 'bookstore',
    zones: ['bookstore', 'general'],
    keywords: ['find a book', 'search for a book', 'book categories', 'book category', 'is this book available', 'in stock'],
    department: 'Bookstore',
    answer:
      'You can browse and search the Bookstore by title, author, or category. Availability is shown on each book\'s page.',
  },
  {
    id: 'bookstore-shipping',
    label: 'Order & Shipping Status',
    group: 'bookstore',
    zones: ['bookstore', 'general'],
    keywords: ['shipping', 'delivery', 'when will my order arrive', 'order status', 'track my order', 'refund my order'],
    department: 'Bookstore',
    answer:
      'Order and shipping status can be checked from your account — ask me "what are my orders" if you\'re signed in, or contact the Bookstore directly for delivery or refund questions.',
  },
  {
    id: 'exams',
    label: 'Examinations',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: ['exam', 'exams', 'examination', 'exam schedule', 'exam timetable', 'sit an exam'],
    department: 'Examinations Office',
    answer:
      "Examination scheduling, results processing, and grade appeals are all handled by the Examinations Office. Your own Final Exam Timetable is available under Academic System in your Student Portal.",
  },
  {
    id: 'attendance',
    label: 'Attendance Record',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: ['attendance', 'my attendance', 'absence', 'absences', 'absence percentage', 'attendance record', 'attendance rule'],
    department: 'Academic Affairs',
    answer:
      "Your lecture attendance and absence percentage, per course, are shown in Attendance Record under Academic System. Reaching 25% absence in a course means you fail it and must repeat it, per academic regulations.",
  },
  {
    id: 'ict',
    label: 'Technical Support',
    group: 'support',
    zones: ['student', 'general'],
    keywords: ['login not working', "can't log in", 'password reset', 'technical issue', 'website error', 'account locked', 'ict', 'it support'],
    department: 'ICT Office',
    answer:
      "Technical issues (login problems, password resets, site errors) are handled by the ICT Office. If it's about a specific class or grade instead, that goes through your Instructor or the Examinations Office.",
  },
  {
    id: 'student-vs-staff-login',
    label: 'Student vs. Staff Login',
    group: 'support',
    zones: ['student', 'employee', 'general'],
    keywords: [
      'student login', 'log in as a student', 'which login do i use', 'where do i log in',
      'staff login', 'admin login', 'staff portal', 'student portal login', 'wrong login', 'wrong portal',
    ],
    department: 'ICT Office',
    href: '/login',
    answer:
      "If you're a student, use the login link near the search bar on the homepage — it takes you to the student sign-in page. Staff and admin have a separate Staff & Admin Portal, linked from the site footer. Using the wrong one will land you on the wrong sign-in page, so pick the one that matches your account type.",
  },
  {
    id: 'quality',
    label: 'Feedback & Complaints',
    group: 'support',
    zones: ['student', 'general'],
    keywords: ['complaint', 'complain', 'feedback', 'quality', 'concern about a course', 'concern about a lecturer'],
    department: 'Quality Assurance Office',
    answer:
      'General feedback, complaints, and quality concerns about programmes or teaching are reviewed by the Quality Assurance Office.',
  },
  {
    id: 'advising',
    label: 'Academic Advisor',
    group: 'student-services',
    zones: ['student', 'general'],
    keywords: ['advisor', 'advising', 'which courses should i take', 'academic advice'],
    department: 'Academic Advisor',
    answer:
      'Your Academic Advisor can help with course selection and study planning. Advisors have view-only access to student records to guide you.',
  },
  {
    id: 'academic-system',
    label: 'Academic System',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'academic system', 'my academics', 'academic dashboard', 'study plan', 'curriculum',
      'academic overview', 'my programme', 'my program',
    ],
    department: 'Academic Records / Registrar',
    answer:
      "Academic System is the central hub for everything about your studies — Study Plan & Curriculum, Grades & Academic History, Courses & Academic Progress, Grading Policy, Communication & Complaints, Graduation Procedures, Graduation Documents, Final Exam Timetable, and Attendance Record. Open it from your Student Portal dashboard.",
  },
  {
    id: 'grades-gpa',
    label: 'Grades & GPA',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'my grades', 'my grade', 'course grades', 'grade history', 'gpa', 'semester gpa', 'cumulative gpa',
      'cgpa', 'how is my gpa calculated', 'academic history',
    ],
    department: 'Academic Records / Registrar',
    answer:
      'Your course grades, semester GPA, and cumulative CGPA are calculated automatically from your recorded final grades — never entered by hand — and shown in Grades & Academic History under Academic System.',
  },
  {
    id: 'courses-progress',
    label: 'Academic Progress',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'remaining courses', 'completed courses', 'courses left', 'academic progress',
      'curriculum progress', 'what courses do i have left', 'course progress', 'my academic level',
    ],
    department: 'Academic Records / Registrar',
    answer:
      'Courses & Academic Progress (under Academic System) shows your completed, current, and remaining curriculum courses, and your academic level, computed live from your real record.',
  },
  {
    id: 'graduation',
    label: 'Graduation',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'graduation', 'graduate', 'apply for graduation', 'graduation application',
      'graduation eligibility', 'graduation clearance', 'when can i graduate',
    ],
    department: 'Academic Records / Registrar',
    answer:
      'Graduation Procedures (under Academic System) tracks your eligibility, application, clearance across every office, and final approval — all in one place.',
  },
  {
    id: 'graduation-documents',
    label: 'Graduation Documents',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'graduation certificate', 'graduation documents', 'statement of completion',
      'official certificate', 'proof of graduation',
    ],
    department: 'Academic Records / Registrar',
    answer:
      'Once your graduation is completed, your Graduation Certificate, Statement of Completion, and Academic Transcript are ready to download from Graduation Documents under Academic System.',
  },
  {
    id: 'graduate-support',
    label: 'Graduate Support',
    group: 'academic-records',
    zones: ['student', 'general'],
    keywords: [
      'graduate assistant', 'graduate support', 'issue with my certificate', 'issue with my transcript',
      'replace my certificate', 'reissue my certificate', 'certificate problem', 'certificate error',
    ],
    department: 'Registrar',
    answer:
      "Once you've graduated, Graduate Assistant (in your Student Portal) lets you report an issue with your certificate, statement of completion, or transcript, or request a replacement — routed directly to the Registrar.",
  },
  {
    id: 'section-discussion',
    label: 'Section Discussion',
    group: 'academic-life',
    zones: ['student', 'general'],
    keywords: [
      'section discussion', 'class discussion', 'course discussion', 'discussion forum', 'classmates',
      'post an exercise', 'submit an exercise', 'group discussion', 'my classmates submission',
      'see other students submissions', 'peer submissions',
    ],
    department: null,
    answer:
      'Section Discussion (inside each of your enrolled courses) is where you and your classmates in that section discuss topics, ask questions, and respond to exercises your instructor posts — including a deadline and, when relevant, a supporting file. You can see your section classmates\' submissions too, so it works like a shared class discussion rather than a private one-on-one submission.',
  },
  {
    id: 'communication-complaints',
    label: 'Communication & Complaints',
    group: 'support',
    zones: ['student', 'general'],
    keywords: [
      'communication and complaints', 'message a department', 'contact a department',
      'submit a complaint', 'track my complaint', 'message an office',
    ],
    department: null,
    answer:
      'Communication & Complaints (under Academic System) lets you message any office or department directly — pick a topic, send your message, and track responses in one place.',
  },
  {
    id: 'programs',
    label: 'Programmes & Faculties',
    group: 'academy',
    zones: ['student', 'general'],
    keywords: ['programme', 'program', 'department', 'faculty', 'course of study', 'what can i study', 'islamic studies', "qur'anic", 'quranic', 'hadith', 'fiqh', 'aqidah', 'tajwid', 'arabic language'],
    department: 'Academic Affairs',
    answer:
      "Ulul Azm's academic programmes are organized under Faculties (led by a Dean) and Departments (led by a Head of Department), covering areas such as Qur'anic Sciences, Arabic Language, Hadith Studies, Fiqh & Usul, Aqidah, and Tajwid. See the Academics section on the homepage for the full list.",
  },
  {
    id: 'events-news',
    label: 'Events & News',
    group: 'academy',
    zones: ['general'],
    keywords: ['event', 'events', 'upcoming event', 'seminar', 'workshop', 'conference', 'gathering', 'programme schedule', 'institute calendar', 'news', 'announcement', 'announcements', 'institute news', 'latest news', 'what\'s new'],
    href: '/updates',
    department: null,
    answer:
      'Upcoming events, seminars, and gatherings, along with the latest institutional news and announcements from Ulul Azm Institute, are all listed together on the Events & News page.',
  },
  {
    id: 'media-browse',
    label: 'Browse Media',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['khutbah', 'khutbahs', 'lecture', 'lectures', 'recorded lecture', 'video lesson', 'video lessons', 'audio recording', 'scholarly talk', 'scholarly talks', 'watch a lecture', 'listen to', 'educational programme', 'educational programmes'],
    department: 'Media',
    answer:
      'Media hosts khutbahs, scholarly talks, video lessons, audio recordings, and lectures, organized into categories for browsing and search.',
  },
  {
    id: 'media-mutoon',
    label: 'Mutoon & Poems',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['mutoon', 'matn', 'scientific text', 'scientific texts', 'poem', 'poems', 'poetry', 'nazm', 'mandhumat'],
    department: 'Media',
    answer:
      'Scientific texts (Mutoon) and poems (Mandhumat) are available in Media, often alongside recorded explanations by the presenting scholar.',
  },
  {
    id: 'media-search',
    label: 'Search Media',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['media categories', 'search media', 'find a lecture', 'browse media', 'media category'],
    department: 'Media',
    answer:
      'You can browse Media by category or search directly by title or speaker to find what you\'re looking for.',
  },
  {
    id: 'media-subscription',
    label: 'Subscription Plans',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['subscription', 'subscribe', 'subscription plan', 'subscription plans', 'membership', 'renew my subscription'],
    department: 'Media',
    answer:
      'Access to subscriber-only Media requires an active Media subscription. Subscription plans and pricing are listed on the Media page — once subscribed and approved, protected content unlocks automatically. This subscription applies only to Media; the Library is always free, no subscription needed there.',
  },
  {
    id: 'media-access',
    label: 'Watch & Download',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['watch offline', 'download a lecture', 'download media', 'stream', 'video not playing', 'audio not playing', 'access to media'],
    department: 'Media',
    answer:
      'Watch and download access depends on the item — some are free previews, others require an active subscription. If something you should have access to isn\'t opening, ask me "what is my subscription status" and I can check.',
  },
  {
    id: 'media-payments',
    label: 'Subscription Payments',
    group: 'media',
    zones: ['media', 'general'],
    keywords: ['media payment', 'pay for subscription', 'subscription payment', 'subscription invoice', 'subscription receipt'],
    department: 'Media',
    answer:
      'Media subscription payments are processed at checkout when you choose a plan; your subscription activates once payment is confirmed.',
  },
  {
    id: 'library-browse',
    label: 'Articles & Fatwas',
    group: 'library',
    zones: ['library', 'general'],
    keywords: ['article', 'articles', 'fatwa', 'fatwas', 'reference material', 'reference materials', 'research paper', 'research papers', 'read an article', 'library'],
    department: 'Library',
    answer:
      'The Library hosts articles, fatwas and reference materials, and research papers — organized into categories for browsing and search, and open to everyone.',
  },
  {
    id: 'library-classical-texts',
    label: 'Classical Texts',
    group: 'library',
    zones: ['library', 'general'],
    keywords: ['classical text', 'classical texts', 'manuscript', 'manuscripts', 'historical material', 'historical materials', 'educational resource', 'educational resources'],
    department: 'Library',
    answer:
      'Classical texts, manuscripts, historical materials and educational resources are all available in the Library.',
  },
  {
    id: 'library-access',
    label: 'Is the Library Free?',
    group: 'library',
    zones: ['library', 'general'],
    keywords: ['is the library free', 'library subscription', 'do i need to subscribe to the library', 'library access', 'library cost'],
    department: 'Library',
    answer:
      'The Library is always free to read — there is no subscription for Library content. (Only Media, the video/audio section, has a subscription for some items.)',
  },
  {
    id: 'contact',
    label: 'Contact the Institute',
    group: 'support',
    zones: ['general'],
    keywords: ['contact', 'phone number', 'email address', 'reach the institute', 'talk to someone', 'human'],
    department: 'Front Office',
    answer:
      "You can reach the institute through the Contact option in the site footer. For a specific matter, tell me what it's about and I'll point you to the right department directly.",
  },

  // -------------------------------------------------------------------
  // Employee / staff topics. These point into the real staff dashboards
  // (components/DashboardShell.jsx routes) that already exist and are
  // already gated server-side by lib/permissions.ts -- the assistant
  // only navigates people there, it never re-implements what those
  // pages already do, and selecting these never grants any access the
  // signed-in user's own PositionPermission rows don't already give them.
  // -------------------------------------------------------------------
  {
    id: 'community',
    label: 'Ulul Azm Community',
    group: 'academic-life',
    zones: ['student', 'general'],
    keywords: ['community', 'student community', 'discussion board', 'connect with other students', 'ulul azm community'],
    department: null,
    href: '/academics/community',
    answer:
      'Ulul Azm Community (under Academic System, in your Student Portal) is a shared space for the whole student body -- not tied to any single course -- to discuss academic life, share events, and see announcements. It sits alongside Section Discussion, which stays the place for course-specific exercises and questions.',
  },
  {
    id: 'employee-assigned-courses',
    label: 'Assigned Courses',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['assigned courses', 'courses i teach', 'my teaching courses', 'which courses am i teaching', 'my course sections'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/courses',
    answer:
      'Your assigned courses and sections are listed under Courses in your Instructor Dashboard, each with its own roster, materials and assessments.',
  },
  {
    id: 'employee-students',
    label: 'My Students',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['my students', 'student roster', 'class roster', 'list of my students', 'roster for my course'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/students',
    answer:
      'Your students, across every section you teach, are listed under Students in your Instructor Dashboard.',
  },
  {
    id: 'employee-attendance',
    label: 'Mark Attendance',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['mark attendance', 'take attendance', 'record attendance', 'attendance sheet', 'attendance for my class'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/attendance',
    answer:
      'Attendance for your sections is recorded under Attendance in your Instructor Dashboard, per lecture, per course.',
  },
  {
    id: 'employee-assessments',
    label: 'Assessments',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['set an exam', 'schedule an assessment', 'upload exam questions', 'my exams to grade', 'assessment schedule for my course', 'quizzes for my course'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/exams',
    answer:
      'Exams and quizzes for your courses -- scheduling, questions and results -- are managed under Exams and Quizzes in your Instructor Dashboard.',
  },
  {
    id: 'employee-academic-tasks',
    label: 'Academic Tasks',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['academic tasks', 'assignments to grade', 'pending grading', 'grade assignments', 'my grading queue'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/assignments',
    answer:
      'Assignments you\'ve posted and what\'s still waiting on your grading are under Assignments in your Instructor Dashboard.',
  },
  {
    id: 'employee-messages',
    label: 'Messages',
    group: 'employee-teaching',
    zones: ['employee'],
    keywords: ['staff messages', 'internal messages', 'message my students', 'staff communication', 'department announcements'],
    department: null,
    href: '/instructor-dashboard/discussions',
    answer:
      'Course-level discussion with your students is under Discussions in your Instructor Dashboard. If your position also has Announcements (Dean, Head of Department, and similar roles), you\'ll find that in your own dashboard\'s sidebar too.',
  },
  {
    id: 'employee-reports',
    label: 'Reports',
    group: 'employee-admin',
    zones: ['employee'],
    keywords: ['staff reports', 'academic reports', 'department reports', 'programme reports'],
    department: null,
    answer:
      'Institute-wide reports and analytics are available to staff with Administration access, under the Staff & Admin Portal. If you don\'t see Reports there, it isn\'t enabled for your position -- your supervisor can confirm what your role has access to.',
  },
  {
    id: 'visitor-academy-programs',
    label: 'Academy Programmes',
    group: 'academy',
    zones: ['general', 'student', 'visitor'],
    keywords: [
      'what programs', 'which programs', 'what programmes', 'programs do you offer',
      'programmes do you offer', 'programs available', 'what courses do you offer',
      'what can i study', 'what do you teach', 'academic programs', 'academic programmes',
    ],
    department: 'Academy',
    href: '/programs',
    answer:
      "The Academy's real, currently-offered programmes -- Foundation Studies, Intermediate Islamic Studies, Advanced Islamic Studies, and the Diploma in Islamic Studies -- are listed with their departments, courses and entry requirements on the Programmes page.",
  },
  {
    id: 'visitor-academy-departments-faculty',
    label: 'Departments & Faculty',
    group: 'academy',
    zones: ['general', 'student', 'visitor'],
    keywords: [
      'departments', 'academic departments', 'what departments', 'faculty members',
      'who teaches', 'instructors', 'teaching staff', 'meet the faculty',
    ],
    department: 'Academy',
    href: '/departments',
    answer:
      "The Academy's academic departments -- Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education & Tarbiyah, and Islamic Civilization & Society -- are listed on the Departments page, and the teaching staff on the Faculty page.",
  },
  {
    id: 'employee-academic-resources',
    label: 'Academic Resources',
    group: 'employee-admin',
    zones: ['employee'],
    keywords: ['teaching resources', 'curriculum documents for staff', 'course specifications', 'academic resources for staff'],
    department: 'Academy',
    href: '/academy',
    answer:
      'Curriculum, course specifications, and every academic governance document are in the Academy hub -- the same official documents used across every programme.',
  },
];

// ---------------------------------------------------------------------------
// Matching: exact/substring keyword scoring, with light typo tolerance.
// No external NLP dependency — this stays intentionally small and fast.
// ---------------------------------------------------------------------------

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

// A word-level fuzzy match: exact match, or a small edit-distance match for
// longer words only (short words like "a"/"is" are too easy to false-match).
function wordsFuzzyMatch(a, b) {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  const maxDistance = a.length >= 8 || b.length >= 8 ? 2 : 1;
  return levenshtein(a, b) <= maxDistance;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Score a single keyword phrase against the message: an exact substring hit
// scores fully; otherwise, if every word in the phrase has a fuzzy match
// somewhere in the message's own words, it counts as a (slightly discounted)
// typo-tolerant hit.
function scoreKeyword(text, messageWords, keyword) {
  if (text.includes(keyword)) {
    return keyword.split(' ').length;
  }

  const kwWords = keyword.split(' ');
  const allFuzzyMatched = kwWords.every((kw) =>
    messageWords.some((w) => wordsFuzzyMatch(w, kw))
  );

  return allFuzzyMatched ? kwWords.length * 0.75 : 0;
}

export function matchKnowledge(message, zone) {
  const text = message.toLowerCase();
  const messageWords = tokenize(text);

  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      score += scoreKeyword(text, messageWords, kw);
    }
    // A small, non-decisive nudge toward topics native to the current zone
    // when scores are otherwise close — this is a tie-breaker, not a filter,
    // so an explicit question always still gets answered regardless of zone.
    if (zone && entry.zones && entry.zones.includes(zone)) {
      score += 0.1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 0.75 ? best : null;
}

// ---------------------------------------------------------------------------
// Zone-scoped suggestion menus — a short, curated list of things people in
// this part of the site are likely to ask, shown instead of a wall of text.
// Each `value` is plain natural language, fed back through the same
// pipeline as if the person had typed it themselves.
// ---------------------------------------------------------------------------

export const MENUS = {
  // This list intentionally matches the identity-card "Student" quick
  // options: My Courses, My Schedule, Assignments, Assessments, Grades,
  // Attendance, Academic Progress, Program & Study Plan, Academic
  // Advisor, Student Services, Library, Help -- each pointed at the
  // real existing KNOWLEDGE entry/page for it, not a new one.
  student: [
    { label: 'My Courses', value: 'what courses do i have left' },
    { label: 'My Schedule', value: 'my class schedule' },
    { label: 'Assignments', value: 'submit an exercise' },
    { label: 'Assessments', value: 'exam schedule' },
    { label: 'Grades', value: 'my grades' },
    { label: 'Attendance', value: 'attendance record' },
    { label: 'Academic Progress', value: 'academic progress' },
    { label: 'Program & Study Plan', value: 'study plan' },
    { label: 'Academic Advisor', value: 'my academic advisor' },
    { label: 'Student Services', value: 'student services' },
    { label: 'Library', value: 'library' },
    { label: 'Help', value: 'how do I contact the institute' },
  ],
  // Matches the identity-card "Employee" quick options: My Dashboard,
  // Assigned Courses, Students, Attendance, Assessments, Academic
  // Tasks, Messages, Reports, Academic Resources, Help. "My Dashboard"
  // is handled as its own server-side intent (see app/api/assistant/
  // route.js) because the real destination depends on the signed-in
  // staff member's actual position/permissions, not a fixed page.
  employee: [
    { label: 'My Dashboard', value: 'my staff dashboard' },
    { label: 'Assigned Courses', value: 'assigned courses' },
    { label: 'Students', value: 'my students' },
    { label: 'Attendance', value: 'mark attendance' },
    { label: 'Assessments', value: 'schedule an assessment' },
    { label: 'Academic Tasks', value: 'academic tasks' },
    { label: 'Messages', value: 'staff messages' },
    { label: 'Reports', value: 'staff reports' },
    { label: 'Academic Resources', value: 'teaching resources' },
    { label: 'Help', value: 'how do I contact the institute' },
  ],
  bookstore: [
    { label: 'My orders', value: 'what are my orders' },
    { label: 'My purchased books', value: 'what books do I have' },
    { label: 'Browse & search books', value: 'how do I find a book' },
    { label: 'Shipping & order status', value: 'where is my order' },
    { label: 'About authors', value: 'tell me about the authors' },
  ],
  media: [
    { label: 'Browse khutbahs & lectures', value: 'browse khutbahs and lectures' },
    { label: 'My subscription status', value: 'what is my subscription status' },
    { label: 'Subscription plans', value: 'what subscription plans are available' },
    { label: 'Mutoon & poems', value: 'tell me about mutoon and poems' },
    { label: 'Watch or download access', value: 'how do I watch or download media' },
  ],
  library: [
    { label: 'Browse articles & fatwas', value: 'browse articles and fatwas' },
    { label: 'Research papers', value: 'tell me about research papers' },
    { label: 'Classical texts & manuscripts', value: 'tell me about classical texts and manuscripts' },
    { label: 'Is the Library free?', value: 'is the library free' },
  ],
  general: [
    { label: 'Admissions', value: 'how do I apply for admission' },
    { label: 'Programmes & faculties', value: 'what programmes are offered' },
    { label: 'Bookstore', value: 'tell me about the bookstore' },
    { label: 'Media', value: 'tell me about media' },
    { label: 'Library', value: 'tell me about the library' },
    { label: 'Events', value: 'what events are coming up' },
    { label: 'News', value: 'any institute news' },
    { label: 'Fees', value: 'what are the fees' },
    { label: 'Contact the institute', value: 'how do I contact the institute' },
  ],
};

export function menuFor(zone) {
  if (zone === 'student') {
    return dedupeByLabel([...MENUS.student, ...MENUS.general]);
  }
  if (zone === 'employee') {
    return dedupeByLabel([...MENUS.employee, ...MENUS.general]);
  }
  return MENUS[zone] || MENUS.general;
}

function dedupeByLabel(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    out.push(item);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Contextual follow-ups: after a specific topic is answered (a matched
// KNOWLEDGE entry, or a personalIntent lookup in app/api/assistant/route.js),
// the widget should offer 2-3 genuinely related next steps -- not the
// entire zone menu stacked underneath every single reply. `group` on each
// KNOWLEDGE entry (added above) is the topical cluster a "related" pick
// draws from; a reply for an entry with no useful siblings (or a
// personalIntent id, which isn't in KNOWLEDGE at all) falls back to a
// couple of the zone's normal menu items instead of nothing.
//
// A trailing "More options" entry (value === MORE_OPTIONS_VALUE) is always
// appended -- selecting it is how a visitor deliberately asks to see the
// full zone menu again, replacing the old behavior of it reappearing
// automatically after every reply.
// ---------------------------------------------------------------------------

export const MORE_OPTIONS_VALUE = '__show_full_menu__';
const MORE_OPTIONS_ITEM = { label: 'More options', value: MORE_OPTIONS_VALUE };

const KNOWLEDGE_BY_ID = new Map(KNOWLEDGE.map((entry) => [entry.id, entry]));

// A few KNOWLEDGE ids that aren't reachable through the normal keyword
// matcher (personalIntent handles them first in app/api/assistant/route.js)
// still deserve a real related-topics group, so their follow-up menu isn't
// just a generic fallback.
const PERSONAL_INTENT_GROUPS = {
  orders: 'bookstore',
  books: 'bookstore',
  requests: 'student-services',
  profile: 'support',
  'staff-dashboard': 'employee-admin',
  'admission-status': 'admissions-finance',
  'subscription-status': 'media',
};

export function relatedFor(id, zone, { limit = 3 } = {}) {
  const group = KNOWLEDGE_BY_ID.get(id)?.group || PERSONAL_INTENT_GROUPS[id] || null;

  let picks = [];

  if (group) {
    picks = KNOWLEDGE
      .filter((entry) => entry.group === group && entry.id !== id)
      .slice(0, limit)
      .map((entry) => ({ label: entry.label, value: entry.keywords[0] }));
  }

  if (picks.length < limit) {
    // Top up with the zone's own curated menu (still excluding whatever
    // was just answered by label, so nothing repeats itself).
    const fillers = menuFor(zone).filter(
      (item) => !picks.some((p) => p.label === item.label)
    );
    picks = picks.concat(fillers.slice(0, limit - picks.length));
  }

  return [...picks, MORE_OPTIONS_ITEM];
}
