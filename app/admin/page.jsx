// Note: Updated with enhanced payment receiving account/card input fields for Mobile Money, Direct Bank, and Debit/Mastercard options!

'use client';

// ==========================================
// ACADEMIC & CURRICULUM MANAGEMENT SYSTEM
// (Multi-Portal Login, Staff & Instructor Management, LMS, Finance & Governance)
// ==========================================

import React, { useState, useMemo } from 'react';

// ==========================================
// 1. MOCK DATA & DEFAULT STRUCTURES
// ==========================================

const DEFAULT_ACADEMIC_SETTINGS = {
  monthsPerSemester: 3,
  semestersPerAcademicYear: 3,
  vacationDurationMonths: 1,
  currentAcademicYear: '2026/2027',
  registrationLocked: false,
};

const INITIAL_PROGRAMMES = [
  {
    id: 'prog-1',
    name: 'Junior Learners Programme',
    description: 'Foundational Islamic studies and basic literacy for young learners.',
    level: 'Elementary',
    duration: '1 Year',
    semesters: 3,
    status: 'Active',
    coordinator: 'Shaykh Ahmad Abdullah Dawud',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-10', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      {
        id: 'c-1',
        title: 'Suratu Al-A\'lā to An-Nās',
        code: 'JLP-101',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Memorization and recitation of short surahs',
        objectives: 'Correct makharij and memorization',
        materials: 'Mushaf, Audio aids',
        status: 'Approved'
      },
      {
        id: 'c-2',
        title: 'Spellings & Arabic Writing',
        code: 'JLP-102',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Basic Arabic orthography and spelling',
        objectives: 'Write Arabic letters independently',
        materials: 'Workbook',
        status: 'Approved'
      },
      {
        id: 'c-3',
        title: 'Adhkār & Daily Supplications',
        code: 'JLP-103',
        semester: 2,
        type: 'Required',
        duration: '3 Months',
        description: 'Essential daily adhkar',
        objectives: 'Memorize morning and evening prayers',
        materials: 'Hisn al-Muslim excerpt',
        status: 'Approved'
      },
      {
        id: 'c-4',
        title: 'Thirty Short Hadith',
        code: 'JLP-104',
        semester: 3,
        type: 'Required',
        duration: '3 Months',
        description: 'Nawawi short selections for kids',
        objectives: 'Understand core prophetic manners',
        materials: 'Hadith booklet',
        status: 'Approved'
      }
    ]
  },
  {
    id: 'prog-2',
    name: 'Foundation Programme',
    description: 'Core introductory Islamic jurisprudence, texts, and Qur\'anic portions.',
    level: 'Foundation',
    duration: '1 Year',
    semesters: 3,
    status: 'Active',
    coordinator: 'Shaykh Ibrahim',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-12', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      {
        id: 'c-201',
        title: 'Quarter of 40 Hadith',
        code: 'FND-201',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'First 10 hadiths of Imam Nawawi',
        objectives: 'Memorization and basic explanation',
        materials: 'Nawawi text',
        status: 'Approved'
      },
      {
        id: 'c-202',
        title: 'Quarter of Al-Akhdari',
        code: 'FND-202',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Maliki fiqh foundations part 1',
        objectives: 'Understand ritual purification and prayer rules',
        materials: 'Al-Akhdari text',
        status: 'Approved'
      },
      {
        id: 'c-203',
        title: 'Juz\'u Naba\'',
        code: 'FND-203',
        semester: 2,
        type: 'Required',
        duration: '3 Months',
        description: 'Tajwid and memorization of Juz 30',
        objectives: 'Fluent recitation with tajwid rules',
        materials: 'Tajweed Mushaf',
        status: 'Approved'
      },
      {
        id: 'c-204',
        title: 'Khulasatu Nur Al-Yaqeen (Part 1)',
        code: 'FND-204',
        semester: 3,
        type: 'Required',
        duration: '3 Months',
        description: 'Seerah of the Prophet (PBUH)',
        objectives: 'Trace early prophetic timeline',
        materials: 'Nur Al-Yaqeen book',
        status: 'Approved'
      }
    ]
  },
  {
    id: 'prog-3',
    name: 'Intermediate Programme',
    description: 'Intermediate studies expanding on Quranic sections, Maliki/General Fiqh, and creed.',
    level: 'Intermediate',
    duration: '1 Year',
    semesters: 3,
    status: 'Active',
    coordinator: 'Shaykh Albani Bupei',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-15', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      {
        id: 'c-301',
        title: 'Juz\'u Mulk',
        code: 'INT-301',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Memorization and study of Surah Al-Mulk to Al-Mursalat',
        objectives: 'Precise memorization and reflection',
        materials: 'Mushaf',
        status: 'Approved'
      },
      {
        id: 'c-302',
        title: 'Applied Tajwid',
        code: 'INT-302',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Advanced rules of recitation',
        objectives: 'Practical application of rules in daily recitation',
        materials: 'Textbook of Tajwid',
        status: 'Approved'
      },
      {
        id: 'c-303',
        title: 'Half of 40 Hadith & Al-Akhdari',
        code: 'FND-303',
        semester: 2,
        type: 'Required',
        duration: '3 Months',
        description: 'Continuation of core texts',
        objectives: 'Deepen legal and ethical understanding',
        materials: 'Source texts',
        status: 'Approved'
      },
      {
        id: 'c-304',
        title: 'Aqidah Essentials',
        code: 'FND-304',
        semester: 3,
        type: 'Required',
        duration: '3 Months',
        description: 'Core Islamic beliefs',
        objectives: 'Understand articles of faith securely',
        materials: 'Aqidah tracts',
        status: 'Approved'
      }
    ]
  },
  {
    id: 'prog-4',
    name: 'Certificate Programme (Specialised Studies)',
    description: 'Specialised certificate studies where students select up to six elective/required core courses.',
    level: 'Specialised Certificate',
    duration: '1 Year',
    semesters: 3,
    status: 'Active',
    coordinator: 'Shaykh Farid Abdul Samed',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-20', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      {
        id: 'c-401',
        title: 'Hifdh of Juz\'u Naba\'',
        code: 'CRT-401',
        semester: 1,
        type: 'Elective/Required',
        duration: '3 Months',
        description: 'Quranic memorization',
        objectives: 'Hifdh fluency',
        materials: 'Mushaf',
        status: 'Approved'
      },
      {
        id: 'c-402',
        title: 'Full 40 Hadith',
        code: 'CRT-402',
        semester: 1,
        type: 'Elective/Required',
        duration: '3 Months',
        description: 'Complete Nawawi collection',
        objectives: 'Mastery of prophetic foundations',
        materials: 'Hadith text',
        status: 'Approved'
      },
      {
        id: 'c-403',
        title: 'Full Al-Akhdari',
        code: 'CRT-403',
        semester: 2,
        type: 'Elective/Required',
        duration: '3 Months',
        description: 'Complete Maliki jurisprudence text',
        objectives: 'Comprehensive ritual and transactional jurisprudence',
        materials: 'Al-Akhdari',
        status: 'Approved'
      },
      {
        id: 'c-404',
        title: 'Matn Al-Ajrumiyyah',
        code: 'CRT-404',
        semester: 3,
        type: 'Elective/Required',
        duration: '3 Months',
        description: 'Classical Arabic grammar',
        objectives: 'Syntactical analysis proficiency',
        materials: 'Ajrumiyyah text',
        status: 'Approved'
      }
    ]
  },
  {
    id: 'prog-5',
    name: 'Diploma in Islamic Sciences',
    description: 'Comprehensive multi-year diploma covering Tafsir, Qur\'an, Fiqh, Arabic Language, Hadith, and Aqidah.',
    level: 'Diploma',
    duration: '2 Years',
    semesters: 6,
    status: 'Active',
    coordinator: 'Shaykh Armiya Tahir Abdul Mumin',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-25', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      {
        id: 'c-501',
        title: 'Tafsir Studies',
        code: 'DIP-501',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Exegesis of selected Quranic chapters',
        objectives: 'Understand contextual revelation and linguistic meanings',
        materials: 'Tafsir Ibn Kathir / Jalalayn',
        status: 'Approved'
      },
      {
        id: 'c-502',
        title: 'Fiqh (Jurisprudence)',
        code: 'DIP-502',
        semester: 1,
        type: 'Required',
        duration: '3 Months',
        description: 'Advanced comparative jurisprudence',
        objectives: 'Derive legal rulings from proofs',
        materials: 'Textbooks of fiqh',
        status: 'Approved'
      },
      {
        id: 'c-503',
        title: 'Arabic Language Mastery',
        code: 'DIP-503',
        semester: 2,
        type: 'Required',
        duration: '3 Months',
        description: 'Advanced rhetoric, morphology, and grammar',
        objectives: 'Absolute fluency in classical Arabic text processing',
        materials: 'Advanced Arabic manuals',
        status: 'Approved'
      },
      {
        id: 'c-504',
        title: 'Hadith Sciences & Terminology',
        code: 'DIP-504',
        semester: 3,
        type: 'Required',
        duration: '3 Months',
        description: 'Mustalah al-Hadith and prophetic reports',
        objectives: 'Critique and grade chains of narration',
        materials: 'Bayquniyyah & Sunnah texts',
        status: 'Approved'
      }
    ]
  }
];

const INITIAL_PROPOSALS = [
  {
    id: 'prop-01',
    programmeId: 'prog-1',
    programmeName: 'Junior Learners Programme',
    submittedBy: 'Imam Muhammad Jalaal Deen Umar (Programme Coordinator)',
    date: '2026-08-01',
    status: 'Pending',
    changes: 'Added a new introductory module for Arabic letters spacing.',
    adminComments: ''
  }
];

const INITIAL_INSTRUCTORS = [
  {
    id: 'inst-1',
    name: 'Ahmad Ibrahim',
    position: 'Head of Department',
    department: 'Islamic Sciences',
    staffId: 'STF-1001',
    email: 'ahmad.ibrahim@ilmhub.edu',
    phone: '+233 20 123 4567',
    qualification: 'M.A. Islamic Studies',
    specialisation: 'Hadith & Sunnah',
    experienceYears: 8,
    status: 'Active',
    assignedProgrammes: ['Foundation Programme'],
    assignedCourses: ['Hadith Studies', 'Fiqh'],
    paymentMethod: {
      type: 'Direct Bank Account',
      provider: 'GCB Bank',
      number: '1029384859'
    },
    earnings: {
      total: 4500,
      pending: 1500,
      approved: 3000
    },
    paymentHistory: [
      { date: '2026-07-01', amount: 1500, status: 'Approved' }
    ]
  },
  {
    id: 'inst-2',
    name: 'Bilal Al-Hassan',
    position: 'Instructor',
    department: 'Qur\'an & Tajwid',
    staffId: 'STF-1002',
    email: 'bilal.hassan@ilmhub.edu',
    phone: '+233 24 987 6543',
    qualification: 'B.A. Quranic Sciences',
    specialisation: 'Tajwid & Qira\'at',
    experienceYears: 5,
    status: 'Active',
    assignedProgrammes: ['Junior Learners Programme'],
    assignedCourses: ['Suratu Al-A\'lā to An-Nās'],
    paymentMethod: {
      type: 'Mobile Money',
      provider: 'MTN',
      number: '+233 24 987 6543'
    },
    earnings: {
      total: 3200,
      pending: 1200,
      approved: 2000
    },
    paymentHistory: [
      { date: '2026-07-01', amount: 1000, status: 'Approved' }
    ]
  }
];

const INITIAL_POSITIONS = [
  'Instructor',
  'Senior Instructor',
  'Head of Department',
  'Dean of Students Affairs',
  'Programme Coordinator',
  'Course Manager',
  'Academic Adviser',
  'Examination Officer'
];

const INITIAL_SESSIONS = [
  {
    id: 'sess-1',
    course: 'Hadith Studies',
    topic: 'Introduction to Forty Hadith',
    date: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    platform: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij',
    instructor: 'Ahmad Ibrahim'
  }
];

const INITIAL_GRADE_SUBMISSIONS = [
  {
    id: 'grade-1',
    course: 'Hadith Studies',
    title: 'Midterm Examination',
    instructor: 'Ahmad Ibrahim',
    submissionDate: '2026-08-02',
    status: 'Pending Review',
    comments: '',
    data: 'Class average: 82%'
  }
];

const INITIAL_SUPPORT_TICKETS = [
  {
    id: 't-1',
    instructor: 'Bilal Al-Hassan',
    issueType: 'Technical',
    subject: 'Projector connectivity in Hall 2',
    status: 'Open',
    date: '2026-08-02'
  }
];

const INITIAL_PRIVATE_REQUESTS = [
  {
    id: 'pr-1',
    studentName: 'Zainab Umar',
    course: 'Advanced Quran Hifdh',
    status: 'Pending Assignment',
    instructor: 'Unassigned',
    date: '2026-08-03'
  }
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    target: 'All students',
    title: 'Semester Registration Reminder',
    message: 'All course registrations must be finalized by Friday.',
    date: '2026-08-01',
    instructor: 'Ahmad Ibrahim'
  }
];

// ------------------------------------------
// Additional existing-system structures
// ------------------------------------------

const INITIAL_STUDENT_REGISTRATIONS = [];

const INITIAL_FEE_RECORDS = [];

const INITIAL_CALENDAR_EVENTS = [];


// Helper to simulate printing / generating a PDF Report
// via browser print window or formatted blob
const generatePDFReport = (title, items) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to generate and download the PDF report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Helvetica, Arial, sans-serif;
            color: #333;
            padding: 30px;
          }

          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #2980b9;
            padding-bottom: 10px;
          }

          .meta {
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 0.9em;
          }

          th {
            background-color: #2c3e50;
            color: white;
          }

          tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          .footer {
            margin-top: 40px;
            font-size: 0.8em;
            text-align: center;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>

      <body>
        <h1>Ilm Hub Institute - Official Report</h1>

        <div class="meta">
          <strong>Report Title:</strong> ${title}<br/>
          <strong>Generated On:</strong> ${new Date().toLocaleString()}<br/>
          <strong>Status:</strong> Official Certified Document
        </div>

        ${items}

        <div class="footer">
          &copy; ${new Date().getFullYear()}
          Ilm Hub Institute Academic & Curriculum Management System.
          All rights reserved.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};


// ==========================================
// 2. MAIN COMPONENT (PORTAL HUB WITH AUTH)
// ==========================================
import Link from 'next/link';

export default function PortalHub() {
  const [activePortal, setActivePortal] = useState('select');
  const [currentUser, setCurrentUser] = useState(null);

  const [programmes, setProgrammes] = useState(INITIAL_PROGRAMMES);
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [instructors, setInstructors] = useState(INITIAL_INSTRUCTORS);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);

  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  const [gradeSubmissions, setGradeSubmissions] = useState(
    INITIAL_GRADE_SUBMISSIONS
  );

  const [supportTickets, setSupportTickets] = useState(
    INITIAL_SUPPORT_TICKETS
  );

  const [privateRequests, setPrivateRequests] = useState(
    INITIAL_PRIVATE_REQUESTS
  );

  const [announcements, setAnnouncements] = useState(
    INITIAL_ANNOUNCEMENTS
  );

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [studentRegistrations, setStudentRegistrations] = useState(
    INITIAL_STUDENT_REGISTRATIONS
  );

  const [feeRecords, setFeeRecords] = useState(
    INITIAL_FEE_RECORDS
  );

  const [calendarEvents, setCalendarEvents] = useState(
    INITIAL_CALENDAR_EVENTS
  );

  const [archivedCourses, setArchivedCourses] = useState([]);

  const [globalSettings, setGlobalSettings] = useState(
    DEFAULT_ACADEMIC_SETTINGS
  );

  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: '2026-08-01 10:00',
      user: 'Super Admin',
      action: 'System Initialized with Academic Structures'
    }
  ]);

  const logAction = (user, action) => {
    setAuditLogs(prev => [
      {
        timestamp: new Date()
          .toISOString()
          .replace('T', ' ')
          .substring(0, 16),
        user,
        action
      },
      ...prev
    ]);
  };

  const handleSignOut = () => {
    logAction(
      currentUser?.name || 'User',
      'Signed out from portal'
    );

    setCurrentUser(null);
    setActivePortal('select');
  };

  return (
    <div style={styles.container}>

      <header style={styles.header}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h1>Academic & Curriculum Management Hub</h1>

          {currentUser && (
            <button
              style={styles.signOutBtn}
              onClick={handleSignOut}
            >
              Sign Out ({currentUser.name})
            </button>
          )}
        </div>

        {!currentUser && (
          <div style={styles.navBar}>
            <button
              style={{
                ...styles.navButton,
                backgroundColor:
                  activePortal === 'select'
                    ? '#2c3e50'
                    : '#7f8c8d'
              }}
              onClick={() => setActivePortal('select')}
            >
              <div style={{ width: '100%', maxWidth: '500px', marginBottom: '16px' }}>
  <Link
    href="/"
    style={{
      color: '#e7eced',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '16px'
    }}
  >
    ← Back to Home
  </Link>
</div>
            </button>
          </div>
        )}
      </header>



      <main style={styles.mainContent}>

        {!currentUser ? (
          <PortalSelector
            activePortal={activePortal}
            setActivePortal={setActivePortal}
            setCurrentUser={setCurrentUser}
            logAction={logAction}
          />
        ) : (

          <>

            {currentUser.role === 'admin' && (
              <AdminPortal
                programmes={programmes}
                setProgrammes={setProgrammes}

                proposals={proposals}
                setProposals={setProposals}

                instructors={instructors}
                setInstructors={setInstructors}

                positions={positions}
                setPositions={setPositions}

                gradeSubmissions={gradeSubmissions}
                setGradeSubmissions={setGradeSubmissions}

                studentRegistrations={studentRegistrations}
                setStudentRegistrations={setStudentRegistrations}

                feeRecords={feeRecords}
                setFeeRecords={setFeeRecords}

                privateRequests={privateRequests}
                setPrivateRequests={setPrivateRequests}

                calendarEvents={calendarEvents}
                setCalendarEvents={setCalendarEvents}

                attendanceRecords={attendanceRecords}

                globalSettings={globalSettings}
                setGlobalSettings={setGlobalSettings}

                archivedCourses={archivedCourses}
                setArchivedCourses={setArchivedCourses}

                auditLogs={auditLogs}
                logAction={logAction}
              />
            )}


            {currentUser.role === 'coordinator' && (
              <CoordinatorPortal
                programmes={programmes}
                setProgrammes={setProgrammes}

                proposals={proposals}
                setProposals={setProposals}

                logAction={logAction}
              />
            )}


            {currentUser.role === 'instructor' && (
              <InstructorPortal
                currentUser={currentUser}

                programmes={programmes}

                instructors={instructors}
                setInstructors={setInstructors}

                sessions={sessions}
                setSessions={setSessions}

                gradeSubmissions={gradeSubmissions}
                setGradeSubmissions={setGradeSubmissions}

                supportTickets={supportTickets}
                setSupportTickets={setSupportTickets}

                announcements={announcements}
                setAnnouncements={setAnnouncements}

                attendanceRecords={attendanceRecords}
                setAttendanceRecords={setAttendanceRecords}

                logAction={logAction}
              />
            )}

          </>
        )}

      </main>
    </div>
  );
}


// ==========================================
// 3. PORTAL SELECTOR & DEDICATED LOGIN FORMS
// ==========================================

function PortalSelector({
  activePortal,
  setActivePortal,
  setCurrentUser,
  logAction
}) {
  const [loginRole, setLoginRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    let roleName = '';

    if (loginRole === 'admin') {
      roleName = 'Super Administrator';
    } else if (loginRole === 'coordinator') {
      roleName = username;
    } else if (loginRole === 'instructor') {
      roleName = username;
    }

    setCurrentUser({
      role: loginRole,
      name: roleName
    });

    logAction(
      roleName,
      `Successfully logged into ${loginRole.toUpperCase()} portal`
    );

    setUsername('');
    setPassword('');
  };

  return (
    <div style={styles.cardContainer}>
      

      <h2>Select Your Academic Portal & Login</h2>

      <p>
        Choose your portal role below and log in with your
        credentials to access secured curriculum
      </p>

      <div style={styles.roleSelectorTabs}>

        <button
          style={{
            ...styles.roleTabBtn,
            background:
              loginRole === 'admin'
                ? '#27ae60'
                : '#bdc3c7'
          }}
          onClick={() => setLoginRole('admin')}
        >
          
          Super Administrator
        </button>

        <button
          style={{
            ...styles.roleTabBtn,
            background:
              loginRole === 'coordinator'
                ? '#2980b9'
                : '#bdc3c7'
          }}
          onClick={() => setLoginRole('coordinator')}
        >
          Programme Coordinator
        </button>

        <button
          style={{
            ...styles.roleTabBtn,
            background:
              loginRole === 'instructor'
                ? '#8e44ad'
                : '#bdc3c7'
          }}
          onClick={() => setLoginRole('instructor')}
        >
          Instructor
        </button>

      </div>


      <div style={styles.loginFormCard}>

        <h3>
          {loginRole === 'admin'
            ? 'Super Admin Secure Login'
            : loginRole === 'coordinator'
              ? 'Programme Coordinator Login'
              : 'Instructor Login'}
        </h3>

        <form onSubmit={handleLoginSubmit}>

          <div style={styles.inputGroup}>
            <label>Username / Staff ID:</label>

            <input
              style={styles.input}
              type="text"
              placeholder={
                loginRole === 'admin'
                  ? 'e.g. admin'
                  : loginRole === 'coordinator'
                    ? 'e.g. Ustadh Ahmad'
                    : 'e.g. Ahmad Ibrahim'
              }
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>


          <div style={styles.inputGroup}>
            <label>Password:</label>

            <input
              style={styles.input}
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>


          <button
            style={{
              ...styles.primaryBtn,
              backgroundColor:
                loginRole === 'admin'
                  ? '#27ae60'
                  : loginRole === 'coordinator'
                    ? '#2980b9'
                    : '#8e44ad'
            }}
            type="submit"
          >
            Login to {loginRole.toUpperCase()} Portal
          </button>

        </form>
      </div>
<div style={{ textAlign: 'right', marginTop: '6px' }}>
  <button
    type="button"
    onClick={() => {
      const email = window.prompt(
        'Enter your administrator email address:'
      );

      if (email) {
        alert(
          `If an administrator account exists for ${email}, password reset instructions will be sent.`
        );
      }
    }}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      color: '#16343a',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none'
    }}
  >
    Forgot Password?
  </button>
</div>
    </div>
  );
}


// ==========================================
// 4. ADMIN / SUPER ADMIN PORTAL
// ==========================================

function AdminPortal({
  programmes,
  setProgrammes,

  proposals,
  setProposals,

  instructors,
  setInstructors,

  positions,
  setPositions,

  gradeSubmissions,
  setGradeSubmissions,

  studentRegistrations,
  setStudentRegistrations,

  feeRecords,
  setFeeRecords,

  privateRequests,
  setPrivateRequests,

  calendarEvents,
  setCalendarEvents,

  attendanceRecords,

  globalSettings,
  setGlobalSettings,

  archivedCourses,
  setArchivedCourses,

  auditLogs,
  logAction
}) {

  // ==========================================
  // STATE
  // ==========================================

  const [activeTab, setActiveTab] = useState('dashboard');

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProgId, setSelectedProgId] = useState(
    programmes?.[0]?.id || ''
  );

  const [isEditingProg, setIsEditingProg] = useState(false);
  const [editProgId, setEditProgId] = useState(null);

  const [progForm, setProgForm] = useState({
    name: '',
    description: '',
    level: 'Foundation',
    duration: '1 Year',
    semesters: 3,
    status: 'Active',
    coordinator: 'Unassigned'
  });

  const [newInst, setNewInst] = useState({
    name: '',
    position: 'Instructor',
    department: 'Islamic Sciences',
    staffId: '',
    email: '',
    phone: '',
    qualification: '',
    specialisation: '',
    experienceYears: 1
  });

  const [newPositionName, setNewPositionName] = useState('');

  const [staffSearch, setStaffSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [feeSearch, setFeeSearch] = useState('');

  const [feeFilter, setFeeFilter] = useState('All');

  // ==========================================
  // FINANCE & PAYROLL STATE
  // ==========================================

  const [salaryStructures, setSalaryStructures] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_salary_structures');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  });

  const [payrollRecords, setPayrollRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_payroll_records');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [payrollMonth, setPayrollMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [payrollSearch, setPayrollSearch] = useState('');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('All');
  const [salaryEditId, setSalaryEditId] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basic: '',
    housing: '',
    transport: '',
    otherAllowance: '',
    deduction: '',
    effectiveDate: new Date().toISOString().slice(0, 10)
  });


  const currentProg =
    programmes?.find(p => p.id === selectedProgId) ||
    programmes?.[0];

  // ==========================================
  // ADMIN THEME
  // ==========================================

  const adminTheme = {
    green: '#087443',
    darkGreen: '#075C35',
    deepGreen: '#043D25',
    lightGreen: '#EAF7F0',
    paleGreen: '#449860',
    white: '#FFFFFF',
    border: '#D8E8DE',
    text: '#173B2A',
    muted: '#7b857f',
    gold: '#C89B3C',
    red: '#C0392B',
    orange: '#D9822B',
    blue: '#2878A8'
  };

  const adminStyles = {
    wrapper: {
      minHeight: '100vh',
      background: '#F3F8F5',
      color: adminTheme.text,
      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },

    header: {
      background:
        'linear-gradient(135deg, #043D25 0%, #075C35 55%, #087443 100%)',
      color: '#ffffff',
      padding: '31px 35px',
      borderBottom: '16px solid #C89B3C'
    },

    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '26px',
      flexWrap: 'wrap'
    },

    headerTitle: {
      margin: 0,
      fontSize: '28px',
      fontWeight: 800,
      letterSpacing: '-0.4px'
    },

    headerSubtitle: {
      margin: '10px 0 0',
      color: '#D7EFE2',
      fontSize: '16px'
    },

    securityBadge: {
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: '32px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: 700
    },

    layout: {
      display: 'flex',
      minHeight: 'calc(100vh - 120px)'
    },

    sidebar: {
      width: '245px',
      background: '#FFFFFF',
      borderRight: `10px solid ${adminTheme.border}`,
      padding: '21px 16px',
      flexShrink: 0
    },

    sidebarLabel: {
      fontSize: '15px',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      color: adminTheme.muted,
      fontWeight: 800,
      padding: '13px 13px 8px'
    },

    navButton: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      color: '#496156',
      textAlign: 'left',
      padding: '12px 14px',
      marginBottom: '5px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600
    },

    activeNavButton: {
      width: '100%',
      border: 'none',
      background: adminTheme.lightGreen,
      color: adminTheme.green,
      textAlign: 'left',
      padding: '12px 14px',
      marginBottom: '3px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 800,
      borderLeft: `5px solid ${adminTheme.green}`
    },

    content: {
      flex: 1,
      padding: '29px',
      minWidth: 0
    },

    pageHeading: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '21px',
      marginBottom: '26px',
      flexWrap: 'wrap'
    },

    pageTitle: {
      margin: 0,
      fontSize: '23px',
      color: adminTheme.deepGreen
    },

    pageDescription: {
      margin: '6px 0 0',
      color: adminTheme.muted,
      fontSize: '15px'
    },

    cards: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '14px',
      marginBottom: '24px'
    },

    metricCard: {
      background: '#fff',
      border: `1px solid ${adminTheme.border}`,
      borderRadius: '13px',
      padding: '19px',
      boxShadow: '0 3px 9px rgba(4,61,37,0.04)'
    },

    metricTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '11px'
    },

    metricLabel: {
      color: adminTheme.muted,
      fontSize: '13px',
      fontWeight: 700
    },

    metricIcon: {
      width: '33px',
      height: '33px',
      borderRadius: '9px',
      background: adminTheme.lightGreen,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: adminTheme.green,
      fontWeight: 800
    },

    metricValue: {
      fontSize: '27px',
      lineHeight: 1,
      fontWeight: 850,
      color: adminTheme.deepGreen,
      margin: 0
    },

    section: {
      background: '#fff',
      border: `1px solid ${adminTheme.border}`,
      borderRadius: '14px',
      padding: '23px',
      marginBottom: '21px',
      boxShadow: '0 3px 11px rgba(4,61,37,0.035)'
    },

    sectionTitle: {
      margin: '0 0 5px',
      color: adminTheme.deepGreen,
      fontSize: '18px'
    },

    sectionSubtitle: {
      margin: '0 0 19px',
      color: adminTheme.muted,
      fontSize: '13px'
    },

    split: {
      display: 'grid',
      gridTemplateColumns:
        'minmax(0, 1.35fr) minmax(300px, 0.65fr)',
      gap: '21px',
      alignItems: 'start'
    },

    panel: {
      background: adminTheme.paleGreen,
      border: `2px solid ${adminTheme.border}`,
      borderRadius: '11px',
      padding: '18px'
    },

    inputGroup: {
      marginBottom: '14px'
    },

    label: {
      display: 'block',
      marginBottom: '7px',
      color: adminTheme.text,
      fontSize: '13px',
      fontWeight: 750
    },

    input: {
      width: '100%',
      boxSizing: 'border-box',
      border: '2px solid #C9DBD1',
      background: '#fff',
      borderRadius: '7px',
      padding: '11px 12px',
      fontSize: '14px',
      color: adminTheme.text,
      outline: 'none'
    },

    textarea: {
      width: '100%',
      minHeight: '90px',
      boxSizing: 'border-box',
      border: '1px solid #C9DBD1',
      background: '#fff',
      borderRadius: '8px',
      padding: '11px 12px',
      fontSize: '14px',
      color: adminTheme.text,
      resize: 'vertical'
    },

    primaryButton: {
      border: 'none',
      background: adminTheme.green,
      color: '#fff',
      borderRadius: '7px',
      padding: '11px 16px',
      fontSize: '13px',
      fontWeight: 750,
      cursor: 'pointer'
    },

    secondaryButton: {
      border: `1px solid ${adminTheme.border}`,
      background: '#fff',
      color: adminTheme.green,
      borderRadius: '7px',
      padding: '10px 14px',
      fontSize: '13px',
      fontWeight: 750,
      cursor: 'pointer'
    },

    smallButton: {
      border: 'none',
      background: adminTheme.green,
      color: '#fff',
      borderRadius: '6px',
      padding: '7px 10px',
      margin: '3px',
      fontSize: '12px',
      fontWeight: 700,
      cursor: 'pointer'
    },

    dangerButton: {
      border: 'none',
      background: '#C0392B',
      color: '#fff',
      borderRadius: '5px',
      padding: '7px 10px',
      margin: '3px',
      fontSize: '12px',
      fontWeight: 700,
      cursor: 'pointer'
    },

    tableWrapper: {
      overflowX: 'auto',
      border: `1px solid ${adminTheme.border}`,
      borderRadius: '10px'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '700px',
      background: '#fff'
    },

    th: {
      background: '#EDF7F1',
      color: adminTheme.deepGreen,
      textAlign: 'left',
      padding: '12px 11px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      borderBottom: `1px solid ${adminTheme.border}`
    },

    td: {
      padding: '12px 11px',
      fontSize: '13px',
      color: '#385246',
      borderBottom: '1px solid #EEF3F0',
      verticalAlign: 'top'
    },

    searchBox: {
      border: `1px solid ${adminTheme.border}`,
      background: '#fff',
      borderRadius: '9px',
      padding: '11px 14px',
      width: '240px',
      maxWidth: '100%',
      boxSizing: 'border-box',
      fontSize: '14px'
    },

    status: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '21px',
      padding: '6px 10px',
      fontSize: '12px',
      fontWeight: 800,
      whiteSpace: 'nowrap'
    },

    empty: {
      textAlign: 'center',
      padding: '36px 17px',
      color: adminTheme.muted,
      fontSize: '16px'
    },

    quickActions: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '14px'
    },

    quickAction: {
      border: `3px solid ${adminTheme.border}`,
      background: '#fff',
      borderRadius: '11px',
      padding: '17px',
      cursor: 'pointer',
      textAlign: 'left'
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const safeArray = value =>
    Array.isArray(value) ? value : [];

  const programmesList = safeArray(programmes);
  const instructorsList = safeArray(instructors);
  const proposalsList = safeArray(proposals);
  const gradesList = safeArray(gradeSubmissions);
  const studentsList = safeArray(studentRegistrations);
  const feesList = safeArray(feeRecords);
  const privateList = safeArray(privateRequests);
  const eventsList = safeArray(calendarEvents);
  const archivedList = safeArray(archivedCourses);
  const logsList = safeArray(auditLogs);


  const getSalaryStructure = staffId =>
    salaryStructures[staffId] || {
      basic: 0,
      housing: 0,
      transport: 0,
      otherAllowance: 0,
      deduction: 0,
      effectiveDate: ''
    };

  const calculateSalary = staffId => {
    const structure = getSalaryStructure(staffId);
    const basic = Number(structure.basic) || 0;
    const housing = Number(structure.housing) || 0;
    const transport = Number(structure.transport) || 0;
    const otherAllowance = Number(structure.otherAllowance) || 0;
    const deduction = Number(structure.deduction) || 0;
    const gross = basic + housing + transport + otherAllowance;
    return {
      basic,
      housing,
      transport,
      otherAllowance,
      deduction,
      gross,
      net: Math.max(0, gross - deduction)
    };
  };

  const filteredPayrollRecords = payrollRecords.filter(record => {
    const matchesSearch =
      !payrollSearch ||
      `${record.staffName || ''} ${record.staffId || ''} ${record.month || ''}`
        .toLowerCase()
        .includes(payrollSearch.toLowerCase());

    const matchesStatus =
      payrollStatusFilter === 'All' ||
      record.status === payrollStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const payrollForSelectedMonth = payrollRecords.filter(
    record => record.month === payrollMonth
  );

  const payrollTotals = payrollForSelectedMonth.reduce(
    (totals, record) => ({
      gross: totals.gross + Number(record.gross || 0),
      deductions: totals.deductions + Number(record.deduction || 0),
      net: totals.net + Number(record.net || 0)
    }),
    { gross: 0, deductions: 0, net: 0 }
  );

  const openSalaryEditor = staff => {
    const structure = getSalaryStructure(staff.id);
    setSalaryEditId(staff.id);
    setSalaryForm({
      basic: structure.basic || '',
      housing: structure.housing || '',
      transport: structure.transport || '',
      otherAllowance: structure.otherAllowance || '',
      deduction: structure.deduction || '',
      effectiveDate:
        structure.effectiveDate ||
        new Date().toISOString().slice(0, 10)
    });
  };

  const handleSaveSalaryStructure = e => {
    e.preventDefault();
    if (!salaryEditId) return;

    const updatedSalaryStructures = {
      ...salaryStructures,
      [salaryEditId]: {
        basic: Number(salaryForm.basic) || 0,
        housing: Number(salaryForm.housing) || 0,
        transport: Number(salaryForm.transport) || 0,
        otherAllowance: Number(salaryForm.otherAllowance) || 0,
        deduction: Number(salaryForm.deduction) || 0,
        effectiveDate: salaryForm.effectiveDate
      }
    };

    setSalaryStructures(updatedSalaryStructures);
    try {
      localStorage.setItem(
        'admin_salary_structures',
        JSON.stringify(updatedSalaryStructures)
      );
    } catch (error) {}

    const staff = instructorsList.find(inst => inst.id === salaryEditId);
    logAction(
      'Administrator',
      `Updated salary structure for ${staff?.name || salaryEditId}`
    );

    setSalaryEditId(null);
    alert('Salary structure saved successfully.');
  };

  const handlePreparePayroll = () => {
    const eligibleStaff = instructorsList.filter(
      staff => staff.status !== 'Inactive' && staff.status !== 'Archived'
    );

    if (eligibleStaff.length === 0) {
      alert('There are no active staff members available for payroll.');
      return;
    }

    const existingIds = new Set(
      payrollRecords
        .filter(record => record.month === payrollMonth)
        .map(record => record.staffId)
    );

    const newRecords = eligibleStaff
      .filter(staff => !existingIds.has(staff.id))
      .map(staff => {
        const salary = calculateSalary(staff.id);
        return {
          id: `pay-${Date.now()}-${staff.id}`,
          month: payrollMonth,
          staffId: staff.id,
          staffName: staff.name || 'Unnamed Staff',
          position: staff.position || 'Staff',
          department: staff.department || '—',
          basic: salary.basic,
          housing: salary.housing,
          transport: salary.transport,
          otherAllowance: salary.otherAllowance,
          gross: salary.gross,
          deduction: salary.deduction,
          net: salary.net,
          paymentMethod: staff.paymentMethod?.type || 'Direct Bank Account',
          paymentProvider: staff.paymentMethod?.provider || '—',
          status: 'Payroll Prepared',
          preparedAt: new Date().toISOString(),
          reviewedAt: null,
          financeApprovedAt: null,
          administratorApprovedAt: null,
          processingAt: null,
          paidAt: null,
          paymentReference: '',
          payslipGeneratedAt: null
        };
      });

    if (newRecords.length === 0) {
      alert(`Payroll for ${payrollMonth} has already been prepared.`);
      return;
    }

    const updatedPayrollRecords = [...newRecords, ...payrollRecords];
    setPayrollRecords(updatedPayrollRecords);
    try {
      localStorage.setItem(
        'admin_payroll_records',
        JSON.stringify(updatedPayrollRecords)
      );
    } catch (error) {}
    logAction(
      'Administrator',
      `Prepared ${payrollMonth} payroll for ${newRecords.length} staff member(s)`
    );
    alert(`Payroll prepared for ${newRecords.length} staff member(s).`);
  };

  const updatePayrollStatus = (id, nextStatus) => {
    const record = payrollRecords.find(item => item.id === id);
    if (!record) return;

    const timestamp = new Date().toISOString();
    const updates = { status: nextStatus };

    if (nextStatus === 'Submitted for Review') updates.reviewedAt = timestamp;
    if (nextStatus === 'Finance Approved') updates.financeApprovedAt = timestamp;
    if (nextStatus === 'Administrator Approved') updates.administratorApprovedAt = timestamp;
    if (nextStatus === 'Payment Processing') updates.processingAt = timestamp;
    if (nextStatus === 'Paid') updates.paidAt = timestamp;
    if (nextStatus === 'Payslip Generated') updates.payslipGeneratedAt = timestamp;

    const updatedPayrollRecords = payrollRecords.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setPayrollRecords(updatedPayrollRecords);
    try {
      localStorage.setItem(
        'admin_payroll_records',
        JSON.stringify(updatedPayrollRecords)
      );
    } catch (error) {}

    logAction(
      'Administrator',
      `${nextStatus}: ${record.staffName} - ${record.month}`
    );

    if (nextStatus === 'Paid') {
      setInstructors(current =>
        safeArray(current).map(staff => {
          if (staff.id !== record.staffId) return staff;

          const previousHistory = safeArray(staff.paymentHistory);
          const previousEarnings = staff.earnings || {};

          return {
            ...staff,
            earnings: {
              ...previousEarnings,
              total: Number(previousEarnings.total || 0) + Number(record.net || 0),
              approved: Number(previousEarnings.approved || 0) + Number(record.net || 0),
              pending: Math.max(
                0,
                Number(previousEarnings.pending || 0) - Number(record.net || 0)
              )
            },
            paymentHistory: [
              ...previousHistory,
              {
                id: `payment-${record.id}`,
                payrollId: record.id,
                month: record.month,
                amount: record.net,
                status: 'Paid',
                paymentDate: timestamp,
                paymentReference: record.paymentReference || 'Recorded by Administrator'
              }
            ]
          };
        })
      );
    }
  };

  const handlePaymentReference = (id, reference) => {
    const updatedPayrollRecords = payrollRecords.map(record =>
      record.id === id
        ? { ...record, paymentReference: reference }
        : record
    );
    setPayrollRecords(updatedPayrollRecords);
    try {
      localStorage.setItem(
        'admin_payroll_records',
        JSON.stringify(updatedPayrollRecords)
      );
    } catch (error) {}
  };

  const handleGeneratePayslip = record => {
    const generatedAt = new Date().toISOString();

    const updatedPayrollRecords = payrollRecords.map(item =>
      item.id === record.id
        ? {
            ...item,
            status:
              item.status === 'Paid'
                ? 'Payslip Generated'
                : item.status,
            payslipGeneratedAt: generatedAt
          }
        : item
    );
    setPayrollRecords(updatedPayrollRecords);
    try {
      localStorage.setItem(
        'admin_payroll_records',
        JSON.stringify(updatedPayrollRecords)
      );
    } catch (error) {}

    logAction(
      'Administrator',
      `Generated payslip for ${record.staffName} - ${record.month}`
    );

    const html = `
      <html>
        <head>
          <title>Payslip - ${record.staffName} - ${record.month}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 35px; color: #222; }
            h1 { margin-bottom: 4px; }
            .muted { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
            .total { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Staff Salary Payslip</h1>
          <div class="muted">Payroll Month: ${record.month}</div>
          <p><strong>Staff:</strong> ${record.staffName}</p>
          <p><strong>Staff ID:</strong> ${record.staffId}</p>
          <p><strong>Position:</strong> ${record.position}</p>
          <p><strong>Department:</strong> ${record.department}</p>
          <table>
            <tr><th>Earnings</th><th>Amount</th></tr>
            <tr><td>Basic Salary</td><td>₵ ${Number(record.basic || 0).toLocaleString()}</td></tr>
            <tr><td>Housing Allowance</td><td>₵ ${Number(record.housing || 0).toLocaleString()}</td></tr>
            <tr><td>Transport Allowance</td><td>₵ ${Number(record.transport || 0).toLocaleString()}</td></tr>
            <tr><td>Other Allowances</td><td>₵ ${Number(record.otherAllowance || 0).toLocaleString()}</td></tr>
            <tr><td><strong>Gross Salary</strong></td><td><strong>₵ ${Number(record.gross || 0).toLocaleString()}</strong></td></tr>
            <tr><td>Deductions</td><td>₵ ${Number(record.deduction || 0).toLocaleString()}</td></tr>
            <tr class="total"><td>Net Salary</td><td>₵ ${Number(record.net || 0).toLocaleString()}</td></tr>
          </table>
          <p><strong>Payment Status:</strong> ${record.status}</p>
          <p><strong>Payment Reference:</strong> ${record.paymentReference || '—'}</p>
          <p class="muted">Generated: ${new Date(generatedAt).toLocaleString()}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const pendingProposals = proposalsList.filter(
    p => p.status === 'Pending'
  ).length;

  const pendingGrades = gradesList.filter(
    g => g.status === 'Pending Review'
  ).length;

  const pendingApprovals =
    pendingProposals + pendingGrades;

  const activeInstructors = instructorsList.filter(
    i => i.status === 'Active'
  ).length;

  const totalCourses = programmesList.reduce(
    (total, programme) =>
      total + (programme.curriculum?.length || 0),
    0
  );

  const activeStudents = studentsList.filter(
    student =>
      student.status === 'Active' ||
      student.status === 'Registered' ||
      !student.status
  ).length;

  const totalFees = feesList.reduce(
    (total, record) =>
      total +
      Number(
        record.amount ||
        record.total ||
        record.fee ||
        0
      ),
    0
  );

  const filteredInstructors = instructorsList.filter(inst =>
    `${inst.name || ''} ${inst.staffId || ''} ${
      inst.department || ''
    } ${inst.position || ''}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase())
  );

  const filteredStudents = studentsList.filter(student =>
    JSON.stringify(student)
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  const filteredFees = feesList.filter(record => {
    const matchesSearch = JSON.stringify(record)
      .toLowerCase()
      .includes(feeSearch.toLowerCase());

    const status =
      record.status ||
      record.paymentStatus ||
      'Unknown';

    const matchesStatus =
      feeFilter === 'All' ||
      status === feeFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = status => {
    const value = String(status || '').toLowerCase();

    if (
      value.includes('active') ||
      value.includes('approved') ||
      value.includes('paid') ||
      value.includes('published') ||
      value.includes('registered')
    ) {
      return {
        ...adminStyles.status,
        background: '#E7F6ED',
        color: '#087443'
      };
    }

    if (
      value.includes('pending') ||
      value.includes('review') ||
      value.includes('assigned')
    ) {
      return {
        ...adminStyles.status,
        background: '#FFF5D9',
        color: '#8A6516'
      };
    }

    if (
      value.includes('reject') ||
      value.includes('inactive') ||
      value.includes('overdue') ||
      value.includes('archive')
    ) {
      return {
        ...adminStyles.status,
        background: '#FCEBE9',
        color: '#A93226'
      };
    }

    return {
      ...adminStyles.status,
      background: '#EEF2F0',
      color: '#60746A'
    };
  };

  const renderStatus = status => (
    <span style={getStatusStyle(status)}>
      {status || 'Not Set'}
    </span>
  );

  const resetProgrammeForm = () => {
    setIsEditingProg(false);
    setEditProgId(null);

    setProgForm({
      name: '',
      description: '',
      level: 'Foundation',
      duration: '1 Year',
      semesters: 3,
      status: 'Active',
      coordinator: 'Unassigned'
    });
  };

  // ==========================================
  // PROGRAMME MANAGEMENT
  // ==========================================

  const handleSaveProgramme = e => {
    e.preventDefault();

    if (isEditingProg) {
      setProgrammes(
        programmesList.map(p =>
          p.id === editProgId
            ? {
                ...p,
                ...progForm,
                updatedAt: new Date().toISOString()
              }
            : p
        )
      );

      logAction(
        'Administrator',
        `Updated programme details for: ${progForm.name}`
      );
    } else {
      const newProgramme = {
        id: `prog-${Date.now()}`,
        ...progForm,

        academicDuration: {
          ...globalSettings
        },

        history: [
          {
            date: new Date()
              .toISOString()
              .substring(0, 10),
            action: 'Created Programme',
            user: 'Administrator'
          }
        ],

        curriculum: []
      };

      setProgrammes([
        ...programmesList,
        newProgramme
      ]);

      logAction(
        'Administrator',
        `Created new programme: ${progForm.name}`
      );

      setSelectedProgId(newProgramme.id);
    }

    resetProgrammeForm();
  };

  const handleToggleProgrammeStatus = id => {
    setProgrammes(
      programmesList.map(programme => {
        if (programme.id !== id) return programme;

        const newStatus =
          programme.status === 'Active'
            ? 'Inactive'
            : 'Active';

        logAction(
          'Administrator',
          `Changed status of ${programme.name} to ${newStatus}`
        );

        return {
          ...programme,
          status: newStatus
        };
      })
    );
  };

  const handleArchiveProgramme = id => {
    const programme = programmesList.find(
      p => p.id === id
    );

    if (!programme) return;

    setProgrammes(
      programmesList.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'Archived',
              archivedAt: new Date().toISOString()
            }
          : p
      )
    );

    logAction(
      'Administrator',
      `Archived programme: ${programme.name}`
    );
  };

  const handleRestoreProgramme = id => {
    const programme = programmesList.find(
      p => p.id === id
    );

    if (!programme) return;

    setProgrammes(
      programmesList.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'Active',
              archivedAt: null
            }
          : p
      )
    );

    logAction(
      'Administrator',
      `Restored programme: ${programme.name}`
    );
  };

  // ==========================================
  // STAFF / HR
  // ==========================================

  const handleCreateInstructor = e => {
    e.preventDefault();

    const created = {
      id: `inst-${Date.now()}`,
      ...newInst,
      status: 'Active',
      assignedProgrammes: [],
      assignedCourses: [],

      paymentMethod: {
        type: 'Direct Bank Account',
        provider: 'Standard Bank',
        number: ''
      },

      earnings: {
        total: 0,
        pending: 0,
        approved: 0
      },

      paymentHistory: [],

      createdAt: new Date().toISOString()
    };

    setInstructors([
      ...instructorsList,
      created
    ]);

    logAction(
      'Administrator',
      `Created instructor/staff account for ${newInst.name}`
    );

    setNewInst({
      name: '',
      position: 'Instructor',
      department: 'Islamic Sciences',
      staffId: '',
      email: '',
      phone: '',
      qualification: '',
      specialisation: '',
      experienceYears: 1
    });
  };

  const handleToggleInstructorStatus = id => {
    setInstructors(
      instructorsList.map(inst => {
        if (inst.id !== id) return inst;

        const newStatus =
          inst.status === 'Active'
            ? 'Inactive'
            : 'Active';

        logAction(
          'Administrator',
          `Changed staff status for ${inst.name} to ${newStatus}`
        );

        return {
          ...inst,
          status: newStatus
        };
      })
    );
  };

  const handleAddPosition = e => {
    e.preventDefault();

    const cleanName = newPositionName.trim();

    if (
      cleanName &&
      !positions.includes(cleanName)
    ) {
      setPositions([
        ...positions,
        cleanName
      ]);

      logAction(
        'Administrator',
        `Created new staff position: ${cleanName}`
      );

      setNewPositionName('');
    }
  };

  // ==========================================
  // APPROVALS
  // ==========================================

  const handleReviewProposal = (
    proposalId,
    decision
  ) => {
    setProposals(
      proposalsList.map(proposal => {
        if (proposal.id !== proposalId) {
          return proposal;
        }

        logAction(
          'Administrator',
          `${decision} proposal ID ${proposalId}`
        );

        return {
          ...proposal,
          status: decision,
          reviewedBy: 'Administrator',
          reviewedAt: new Date().toISOString()
        };
      })
    );
  };

  const handleReviewGrade = (
    gradeId,
    decision
  ) => {
    setGradeSubmissions(
      gradesList.map(grade => {
        if (grade.id !== gradeId) {
          return grade;
        }

        logAction(
          'Administrator',
          `${decision} grade submission for ${grade.course} - ${grade.title}`
        );

        return {
          ...grade,
          status:
            decision === 'Approved'
              ? 'Approved & Published'
              : 'Rejected',
          reviewedBy: 'Administrator',
          reviewedAt: new Date().toISOString()
        };
      })
    );
  };

  // ==========================================
  // PRIVATE COURSES
  // ==========================================

  const handleAssignPrivateInstructor = (
    requestId,
    instructorName
  ) => {
    if (!instructorName) return;

    setPrivateRequests(
      privateList.map(request => {
        if (request.id !== requestId) {
          return request;
        }

        logAction(
          'Administrator',
          `Assigned instructor ${instructorName} to private course request for ${request.studentName}`
        );

        return {
          ...request,
          instructor: instructorName,
          status: 'Assigned & Active'
        };
      })
    );
  };

  // ==========================================
  // SETTINGS
  // ==========================================

  const handleSaveSettings = e => {
    e.preventDefault();

    logAction(
      'Administrator',
      'Updated global academic and institutional settings'
    );

    alert(
      'Global academic settings saved successfully.'
    );
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigationGroups = [
    {
      label: 'Overview',
      items: [
        ['dashboard', 'Dashboard'],
        ['students', 'Student Management'],
        ['finance', 'Fees & Finance'],
        ['payroll', 'Finance & Payroll']
      ]
    },

    {
      label: 'Academic Administration',
      items: [
        ['programmes', 'Programmes & Courses'],
        ['approvals', 'Approvals & Grade Review'],
        ['private', 'Private Courses'],
        ['calendar', 'Academic Calendar'],
        ['attendance', 'Attendance Monitoring'],
        ['archive', 'Course Archive']
      ]
    },

    {
      label: 'Human Resources',
      items: [
        ['instructors', 'Staff & HR Management']
      ]
    },

    {
      label: 'Institutional Control',
      items: [
        ['settings', 'Academic Settings'],
        ['reports', 'Reports & Audit Logs']
      ]
    }
  ];

  const pageMeta = {
    dashboard: {
      title: 'Administrator Dashboard',
      description:
        'Institution-wide academic, operational and administrative control centre.'
    },

    students: {
      title: 'Student Management',
      description:
        'Monitor registrations, student records and enrolment activity.'
    },

    finance: {
      title: 'Fees & Finance',
      description:
        'Monitor institutional fee records, payment status and financial activity.'
    },

    payroll: {
      title: 'Finance & Payroll',
      description:
        'Manage staff salary structures, monthly payroll, approvals, payments, payslips and payroll audit history.'
    },

    programmes: {
      title: 'Programmes & Courses',
      description:
        'Create, maintain, activate, deactivate and archive academic programmes.'
    },

    instructors: {
      title: 'Staff & HR Management',
      description:
        'Manage instructors, staff roles, departments and employment status.'
    },

    approvals: {
      title: 'Approvals & Grade Review',
      description:
        'Review curriculum proposals and instructor grade submissions.'
    },

    private: {
      title: 'Private Courses',
      description:
        'Manage specialised one-to-one and private tutoring requests.'
    },

    calendar: {
      title: 'Academic Calendar',
      description:
        'Institutional events, academic dates and scheduled activities.'
    },

    attendance: {
      title: 'Attendance Monitoring',
      description:
        'Review attendance records submitted throughout the institution.'
    },

    archive: {
      title: 'Course Archive',
      description:
        'Review archived academic courses and historical records.'
    },

    settings: {
      title: 'Academic Settings',
      description:
        'Control academic year, semester structure and institutional duration settings.'
    },

    reports: {
      title: 'Reports & Audit Logs',
      description:
        'Generate institutional reports and review the system audit trail.'
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={adminStyles.wrapper}>

      {/* ========================================
          HEADER
      ======================================== */}

      <header style={adminStyles.header}>

        <div style={adminStyles.headerTop}>

          <div>
            <h1 style={adminStyles.headerTitle}>
              Administrator & Super Admin Control Centre
            </h1>

            <p style={adminStyles.headerSubtitle}>
              Central institutional administration, academic
              governance, finance, HR and system oversight.
            </p>
          </div>

          <div style={adminStyles.securityBadge}>
            ● SUPER ADMIN ACCESS
          </div>

        </div>

      </header>


      <div style={adminStyles.layout}>

        {/* ======================================
            SIDEBAR
        ====================================== */}

        <aside style={adminStyles.sidebar}>

          {navigationGroups.map(group => (

            <div key={group.label}>

              <div style={adminStyles.sidebarLabel}>
                {group.label}
              </div>

              {group.items.map(([id, label]) => (

                <button
                  key={id}
                  type="button"
                  style={
                    activeTab === id
                      ? adminStyles.activeNavButton
                      : adminStyles.navButton
                  }
                  onClick={() =>
                    setActiveTab(id)
                  }
                >

                  {label}

                  {id === 'approvals' &&
                    pendingApprovals > 0 && (
                      <span
                        style={{
                          float: 'right',
                          background: adminTheme.gold,
                          color: '#fff',
                          borderRadius: '20px',
                          padding: '2px 7px',
                          fontSize: '9px'
                        }}
                      >
                        {pendingApprovals}
                      </span>
                    )}

                </button>

              ))}

            </div>

          ))}

        </aside>


        {/* ======================================
            MAIN CONTENT
        ====================================== */}

        <main style={adminStyles.content}>

          <div style={adminStyles.pageHeading}>

            <div>
              <h2 style={adminStyles.pageTitle}>
                {pageMeta[activeTab].title}
              </h2>

              <p style={adminStyles.pageDescription}>
                {pageMeta[activeTab].description}
              </p>
            </div>

            {activeTab !== 'settings' &&
              activeTab !== 'reports' && (
                <input
                  style={adminStyles.searchBox}
                  value={searchTerm}
                  onChange={e =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search current area..."
                />
              )}

          </div>


          {/* ====================================
              DASHBOARD
          ==================================== */}

          {activeTab === 'dashboard' && (

            <>

              <div style={adminStyles.cards}>

                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Total Programmes
                    </span>
                    <span style={adminStyles.metricIcon}>
                      P
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {programmesList.length}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Total Courses
                    </span>
                    <span style={adminStyles.metricIcon}>
                      C
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {totalCourses}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Active Students
                    </span>
                    <span style={adminStyles.metricIcon}>
                      S
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {activeStudents}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Active Staff
                    </span>
                    <span style={adminStyles.metricIcon}>
                      H
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {activeInstructors}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Pending Approvals
                    </span>
                    <span style={adminStyles.metricIcon}>
                      !
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {pendingApprovals}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <div style={adminStyles.metricTop}>
                    <span style={adminStyles.metricLabel}>
                      Fee Records
                    </span>
                    <span style={adminStyles.metricIcon}>
                      ₵
                    </span>
                  </div>

                  <p style={adminStyles.metricValue}>
                    {feesList.length}
                  </p>
                </div>

              </div>


              <div style={adminStyles.section}>

                <h3 style={adminStyles.sectionTitle}>
                  Administrative Quick Actions
                </h3>

                <p style={adminStyles.sectionSubtitle}>
                  Frequently used institutional controls.
                </p>

                <div style={adminStyles.quickActions}>

                  <button
                    style={adminStyles.quickAction}
                    onClick={() =>
                      setActiveTab('students')
                    }
                  >
                    <strong>
                      Student Management
                    </strong>

                    <div
                      style={{
                        marginTop: '5px',
                        color: adminTheme.muted,
                        fontSize: '11px'
                      }}
                    >
                      Review registrations and student records.
                    </div>
                  </button>


                  <button
                    style={adminStyles.quickAction}
                    onClick={() =>
                      setActiveTab('programmes')
                    }
                  >
                    <strong>
                      Programme Administration
                    </strong>

                    <div
                      style={{
                        marginTop: '5px',
                        color: adminTheme.muted,
                        fontSize: '11px'
                      }}
                    >
                      Create or maintain academic programmes.
                    </div>
                  </button>


                  <button
                    style={adminStyles.quickAction}
                    onClick={() =>
                      setActiveTab('approvals')
                    }
                  >
                    <strong>
                      Review Approvals
                    </strong>

                    <div
                      style={{
                        marginTop: '5px',
                        color: adminTheme.muted,
                        fontSize: '11px'
                      }}
                    >
                      {pendingApprovals} item(s) require attention.
                    </div>
                  </button>


                  <button
                    style={adminStyles.quickAction}
                    onClick={() =>
                      setActiveTab('finance')
                    }
                  >
                    <strong>
                      Finance Overview
                    </strong>

                    <div
                      style={{
                        marginTop: '5px',
                        color: adminTheme.muted,
                        fontSize: '11px'
                      }}
                    >
                      Review institutional fee activity.
                    </div>
                  </button>

                </div>

              </div>


              <div style={adminStyles.split}>

                <div style={adminStyles.section}>

                  <h3 style={adminStyles.sectionTitle}>
                    Programme Status Overview
                  </h3>

                  <div style={adminStyles.tableWrapper}>

                    <table style={adminStyles.table}>

                      <thead>
                        <tr>
                          <th style={adminStyles.th}>
                            Programme
                          </th>
                          <th style={adminStyles.th}>
                            Level
                          </th>
                          <th style={adminStyles.th}>
                            Coordinator
                          </th>
                          <th style={adminStyles.th}>
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {programmesList
                          .slice(0, 8)
                          .map(programme => (

                            <tr key={programme.id}>

                              <td style={adminStyles.td}>
                                <strong>
                                  {programme.name}
                                </strong>
                              </td>

                              <td style={adminStyles.td}>
                                {programme.level}
                              </td>

                              <td style={adminStyles.td}>
                                {programme.coordinator}
                              </td>

                              <td style={adminStyles.td}>
                                {renderStatus(
                                  programme.status
                                )}
                              </td>

                            </tr>

                          ))}

                      </tbody>

                    </table>

                  </div>

                </div>


                <div style={adminStyles.section}>

                  <h3 style={adminStyles.sectionTitle}>
                    Approval Queue
                  </h3>

                  <p style={adminStyles.sectionSubtitle}>
                    Items requiring administrator attention.
                  </p>

                  <div
                    style={{
                      padding: '16px',
                      background: adminTheme.lightGreen,
                      borderRadius: '9px',
                      marginBottom: '10px'
                    }}
                  >
                    <strong>
                      {pendingProposals}
                    </strong>

                    <div
                      style={{
                        fontSize: '11px',
                        color: adminTheme.muted,
                        marginTop: '4px'
                      }}
                    >
                      Curriculum proposals
                    </div>
                  </div>


                  <div
                    style={{
                      padding: '16px',
                      background: '#FFF8E7',
                      borderRadius: '9px'
                    }}
                  >
                    <strong>
                      {pendingGrades}
                    </strong>

                    <div
                      style={{
                        fontSize: '11px',
                        color: adminTheme.muted,
                        marginTop: '4px'
                      }}
                    >
                      Grade submissions
                    </div>
                  </div>

                </div>

              </div>

            </>

          )}


          {/* ====================================
              STUDENTS
          ==================================== */}

          {activeTab === 'students' && (

            <div style={adminStyles.section}>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}
              >

                <div>
                  <h3 style={adminStyles.sectionTitle}>
                    Student Registration Directory
                  </h3>

                  <p style={adminStyles.sectionSubtitle}>
                    Central administrative view of registered students.
                  </p>
                </div>

                <input
                  style={adminStyles.searchBox}
                  value={studentSearch}
                  onChange={e =>
                    setStudentSearch(e.target.value)
                  }
                  placeholder="Search students..."
                />

              </div>


              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Student
                      </th>
                      <th style={adminStyles.th}>
                        Programme
                      </th>
                      <th style={adminStyles.th}>
                        Registration
                      </th>
                      <th style={adminStyles.th}>
                        Contact
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredStudents
                      .filter(student =>
                        !searchTerm ||
                        JSON.stringify(student)
                          .toLowerCase()
                          .includes(
                            searchTerm.toLowerCase()
                          )
                      )
                      .map((student, index) => (

                        <tr
                          key={
                            student.id ||
                            student.studentId ||
                            index
                          }
                        >

                          <td style={adminStyles.td}>
                            <strong>
                              {student.name ||
                                student.studentName ||
                                'Unnamed Student'}
                            </strong>

                            {(student.studentId ||
                              student.id) && (
                              <div
                                style={{
                                  fontSize: '10px',
                                  color: adminTheme.muted
                                }}
                              >
                                {student.studentId ||
                                  student.id}
                              </div>
                            )}
                          </td>

                          <td style={adminStyles.td}>
                            {student.programmeName ||
                              student.programme ||
                              student.program ||
                              '—'}
                          </td>

                          <td style={adminStyles.td}>
                            {student.registrationDate ||
                              student.date ||
                              student.registeredAt ||
                              '—'}
                          </td>

                          <td style={adminStyles.td}>
                            {student.email || '—'}

                            <br />

                            {student.phone || ''}
                          </td>

                          <td style={adminStyles.td}>
                            {renderStatus(
                              student.status ||
                              'Registered'
                            )}
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>


              {filteredStudents.length === 0 && (
                <div style={adminStyles.empty}>
                  No student registration records found.
                </div>
              )}

            </div>

          )}


          {/* ====================================
              FINANCE
          ==================================== */}

          {activeTab === 'finance' && (

            <>

              <div style={adminStyles.cards}>

                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>
                    Total Fee Records
                  </span>

                  <p
                    style={{
                      ...adminStyles.metricValue,
                      marginTop: '10px'
                    }}
                  >
                    {feesList.length}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>
                    Recorded Financial Value
                  </span>

                  <p
                    style={{
                      ...adminStyles.metricValue,
                      marginTop: '10px',
                      fontSize: '21px'
                    }}
                  >
                    ₵ {totalFees.toLocaleString()}
                  </p>
                </div>


                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>
                    Paid Records
                  </span>

                  <p
                    style={{
                      ...adminStyles.metricValue,
                      marginTop: '10px'
                    }}
                  >
                    {
                      feesList.filter(
                        record =>
                          String(
                            record.status ||
                            record.paymentStatus ||
                            ''
                          ).toLowerCase() === 'paid'
                      ).length
                    }
                  </p>
                </div>

              </div>


              <div style={adminStyles.section}>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '15px'
                  }}
                >

                  <h3 style={adminStyles.sectionTitle}>
                    Fee & Payment Records
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >

                    <input
                      style={adminStyles.searchBox}
                      value={feeSearch}
                      onChange={e =>
                        setFeeSearch(e.target.value)
                      }
                      placeholder="Search fee records..."
                    />

                    <select
                      style={{
                        ...adminStyles.input,
                        width: '150px'
                      }}
                      value={feeFilter}
                      onChange={e =>
                        setFeeFilter(e.target.value)
                      }
                    >
                      <option value="All">
                        All Statuses
                      </option>
                      <option value="Paid">
                        Paid
                      </option>
                      <option value="Pending">
                        Pending
                      </option>
                      <option value="Overdue">
                        Overdue
                      </option>
                    </select>

                  </div>

                </div>


                <div style={adminStyles.tableWrapper}>

                  <table style={adminStyles.table}>

                    <thead>
                      <tr>
                        <th style={adminStyles.th}>
                          Student
                        </th>
                        <th style={adminStyles.th}>
                          Description
                        </th>
                        <th style={adminStyles.th}>
                          Amount
                        </th>
                        <th style={adminStyles.th}>
                          Date
                        </th>
                        <th style={adminStyles.th}>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredFees
                        .filter(record =>
                          !searchTerm ||
                          JSON.stringify(record)
                            .toLowerCase()
                            .includes(
                              searchTerm.toLowerCase()
                            )
                        )
                        .map((record, index) => (

                          <tr
                            key={
                              record.id ||
                              record.reference ||
                              index
                            }
                          >

                            <td style={adminStyles.td}>
                              <strong>
                                {record.studentName ||
                                  record.student ||
                                  '—'}
                              </strong>
                            </td>

                            <td style={adminStyles.td}>
                              {record.description ||
                                record.feeType ||
                                record.type ||
                                '—'}
                            </td>

                            <td style={adminStyles.td}>
                              {record.amount !== undefined
                                ? `₵ ${Number(
                                    record.amount
                                  ).toLocaleString()}`
                                : record.total !== undefined
                                ? `₵ ${Number(
                                    record.total
                                  ).toLocaleString()}`
                                : '—'}
                            </td>

                            <td style={adminStyles.td}>
                              {record.date ||
                                record.paymentDate ||
                                '—'}
                            </td>

                            <td style={adminStyles.td}>
                              {renderStatus(
                                record.status ||
                                record.paymentStatus
                              )}
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )}


          {/* ====================================
              FINANCE & PAYROLL
          ==================================== */}

          {activeTab === 'payroll' && (
            <>
              <div style={adminStyles.cards}>
                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>Payroll Staff</span>
                  <p style={{ ...adminStyles.metricValue, marginTop: '10px' }}>
                    {payrollForSelectedMonth.length}
                  </p>
                </div>

                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>Gross Payroll</span>
                  <p style={{ ...adminStyles.metricValue, marginTop: '10px', fontSize: '20px' }}>
                    ₵ {payrollTotals.gross.toLocaleString()}
                  </p>
                </div>

                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>Deductions</span>
                  <p style={{ ...adminStyles.metricValue, marginTop: '10px', fontSize: '20px' }}>
                    ₵ {payrollTotals.deductions.toLocaleString()}
                  </p>
                </div>

                <div style={adminStyles.metricCard}>
                  <span style={adminStyles.metricLabel}>Net Payroll</span>
                  <p style={{ ...adminStyles.metricValue, marginTop: '10px', fontSize: '20px' }}>
                    ₵ {payrollTotals.net.toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={adminStyles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <h3 style={adminStyles.sectionTitle}>Monthly Payroll Control</h3>
                    <p style={adminStyles.sectionSubtitle}>
                      Prepare, review, approve, process and record staff salary payments.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="month"
                      style={adminStyles.input}
                      value={payrollMonth}
                      onChange={e => setPayrollMonth(e.target.value)}
                    />
                    <button
                      type="button"
                      style={adminStyles.primaryButton}
                      onClick={handlePreparePayroll}
                    >
                      Prepare Payroll
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '18px 0' }}>
                  <input
                    style={adminStyles.searchBox}
                    value={payrollSearch}
                    onChange={e => setPayrollSearch(e.target.value)}
                    placeholder="Search staff or payroll..."
                  />
                  <select
                    style={{ ...adminStyles.input, width: '190px' }}
                    value={payrollStatusFilter}
                    onChange={e => setPayrollStatusFilter(e.target.value)}
                  >
                    <option value="All">All Payroll Statuses</option>
                    <option value="Payroll Prepared">Payroll Prepared</option>
                    <option value="Submitted for Review">Submitted for Review</option>
                    <option value="Finance Approved">Finance Approved</option>
                    <option value="Administrator Approved">Administrator Approved</option>
                    <option value="Payment Processing">Payment Processing</option>
                    <option value="Paid">Paid</option>
                    <option value="Payslip Generated">Payslip Generated</option>
                  </select>
                </div>

                <div style={adminStyles.tableWrapper}>
                  <table style={adminStyles.table}>
                    <thead>
                      <tr>
                        <th style={adminStyles.th}>Staff</th>
                        <th style={adminStyles.th}>Gross</th>
                        <th style={adminStyles.th}>Deduction</th>
                        <th style={adminStyles.th}>Net</th>
                        <th style={adminStyles.th}>Status</th>
                        <th style={adminStyles.th}>Payment Reference</th>
                        <th style={adminStyles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayrollRecords.map(record => (
                        <tr key={record.id}>
                          <td style={adminStyles.td}>
                            <strong>{record.staffName}</strong>
                            <div style={{ fontSize: '10px', color: adminTheme.muted }}>{record.staffId}</div>
                            <div style={{ fontSize: '11px', color: adminTheme.muted }}>{record.month}</div>
                          </td>
                          <td style={adminStyles.td}>₵ {Number(record.gross || 0).toLocaleString()}</td>
                          <td style={adminStyles.td}>₵ {Number(record.deduction || 0).toLocaleString()}</td>
                          <td style={adminStyles.td}><strong>₵ {Number(record.net || 0).toLocaleString()}</strong></td>
                          <td style={adminStyles.td}>{renderStatus(record.status)}</td>
                          <td style={adminStyles.td}>
                            <input
                              style={{ ...adminStyles.input, minWidth: '150px' }}
                              value={record.paymentReference || ''}
                              onChange={e => handlePaymentReference(record.id, e.target.value)}
                              placeholder="Reference"
                              disabled={record.status === 'Paid' || record.status === 'Payslip Generated'}
                            />
                          </td>
                          <td style={adminStyles.td}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {record.status === 'Payroll Prepared' && (
                                <button type="button" style={adminStyles.smallButton} onClick={() => updatePayrollStatus(record.id, 'Submitted for Review')}>
                                  Submit
                                </button>
                              )}
                              {record.status === 'Submitted for Review' && (
                                <button type="button" style={adminStyles.smallButton} onClick={() => updatePayrollStatus(record.id, 'Finance Approved')}>
                                  Finance Approve
                                </button>
                              )}
                              {record.status === 'Finance Approved' && (
                                <button type="button" style={adminStyles.smallButton} onClick={() => updatePayrollStatus(record.id, 'Administrator Approved')}>
                                  Admin Approve
                                </button>
                              )}
                              {record.status === 'Administrator Approved' && (
                                <button type="button" style={adminStyles.smallButton} onClick={() => updatePayrollStatus(record.id, 'Payment Processing')}>
                                  Process Payment
                                </button>
                              )}
                              {record.status === 'Payment Processing' && (
                                <button type="button" style={{ ...adminStyles.smallButton, background: adminTheme.green, color: '#fff' }} onClick={() => updatePayrollStatus(record.id, 'Paid')}>
                                  Mark Paid
                                </button>
                              )}
                              {(record.status === 'Paid' || record.status === 'Payslip Generated') && (
                                <button type="button" style={{ ...adminStyles.smallButton, background: adminTheme.gold, color: '#fff' }} onClick={() => handleGeneratePayslip(record)}>
                                  Payslip
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPayrollRecords.length === 0 && (
                  <div style={adminStyles.empty}>
                    No payroll records match the current filters. Select a month and click Prepare Payroll to create the payroll.
                  </div>
                )}
              </div>

              <div style={adminStyles.section}>
                <h3 style={adminStyles.sectionTitle}>Salary Structures</h3>
                <p style={adminStyles.sectionSubtitle}>
                  Set or approve the salary structure used when monthly payroll is prepared.
                </p>

                <div style={adminStyles.tableWrapper}>
                  <table style={adminStyles.table}>
                    <thead>
                      <tr>
                        <th style={adminStyles.th}>Staff</th>
                        <th style={adminStyles.th}>Basic</th>
                        <th style={adminStyles.th}>Allowances</th>
                        <th style={adminStyles.th}>Deduction</th>
                        <th style={adminStyles.th}>Net</th>
                        <th style={adminStyles.th}>Effective Date</th>
                        <th style={adminStyles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorsList.map(staff => {
                        const salary = calculateSalary(staff.id);
                        const structure = getSalaryStructure(staff.id);
                        return (
                          <tr key={staff.id}>
                            <td style={adminStyles.td}>
                              <strong>{staff.name || 'Unnamed Staff'}</strong>
                              <div style={{ fontSize: '10px', color: adminTheme.muted }}>{staff.staffId || staff.id}</div>
                            </td>
                            <td style={adminStyles.td}>₵ {salary.basic.toLocaleString()}</td>
                            <td style={adminStyles.td}>₵ {(salary.housing + salary.transport + salary.otherAllowance).toLocaleString()}</td>
                            <td style={adminStyles.td}>₵ {salary.deduction.toLocaleString()}</td>
                            <td style={adminStyles.td}><strong>₵ {salary.net.toLocaleString()}</strong></td>
                            <td style={adminStyles.td}>{structure.effectiveDate || 'Not set'}</td>
                            <td style={adminStyles.td}>
                              <button type="button" style={adminStyles.smallButton} onClick={() => openSalaryEditor(staff)}>
                                Edit Salary
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {instructorsList.length === 0 && (
                  <div style={adminStyles.empty}>No staff records are currently available.</div>
                )}
              </div>

              {salaryEditId && (
                <div style={adminStyles.section}>
                  <h3 style={adminStyles.sectionTitle}>Edit Salary Structure</h3>
                  <p style={adminStyles.sectionSubtitle}>
                    {instructorsList.find(staff => staff.id === salaryEditId)?.name || 'Staff member'}
                  </p>

                  <form onSubmit={handleSaveSalaryStructure}>
                    <div style={adminStyles.formGrid}>
                      {[
                        ['basic', 'Basic Salary'],
                        ['housing', 'Housing Allowance'],
                        ['transport', 'Transport Allowance'],
                        ['otherAllowance', 'Other Allowances'],
                        ['deduction', 'Standard Deductions']
                      ].map(([field, label]) => (
                        <div style={adminStyles.inputGroup} key={field}>
                          <label style={adminStyles.label}>{label}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            style={adminStyles.input}
                            value={salaryForm[field]}
                            onChange={e => setSalaryForm(current => ({ ...current, [field]: e.target.value }))}
                            required={field === 'basic'}
                          />
                        </div>
                      ))}

                      <div style={adminStyles.inputGroup}>
                        <label style={adminStyles.label}>Effective Date</label>
                        <input
                          type="date"
                          style={adminStyles.input}
                          value={salaryForm.effectiveDate}
                          onChange={e => setSalaryForm(current => ({ ...current, effectiveDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                      <button type="submit" style={adminStyles.primaryButton}>Save Salary Structure</button>
                      <button type="button" style={adminStyles.secondaryButton} onClick={() => setSalaryEditId(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div style={adminStyles.section}>
                <h3 style={adminStyles.sectionTitle}>Payroll Workflow</h3>
                <p style={adminStyles.sectionSubtitle}>
                  Draft → Payroll Prepared → Submitted for Review → Finance Approved → Administrator Approved → Payment Processing → Paid → Payslip Generated
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    'Payroll Prepared',
                    'Submitted for Review',
                    'Finance Approved',
                    'Administrator Approved',
                    'Payment Processing',
                    'Paid',
                    'Payslip Generated'
                  ].map((step, index) => (
                    <div key={step} style={{ ...adminStyles.panel, padding: '12px', minWidth: '140px', flex: '1 1 140px' }}>
                      <strong style={{ fontSize: '12px' }}>{index + 1}. {step}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ====================================
              PROGRAMMES
          ==================================== */}

          {activeTab === 'programmes' && (

            <div style={adminStyles.section}>

              <div style={adminStyles.split}>

                <div>

                  <h3 style={adminStyles.sectionTitle}>
                    Existing Programmes
                  </h3>

                  <p style={adminStyles.sectionSubtitle}>
                    Select a programme to inspect or edit its
                    administrative structure.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gap: '8px'
                    }}
                  >

                    {programmesList
                      .filter(programme =>
                        !searchTerm ||
                        JSON.stringify(programme)
                          .toLowerCase()
                          .includes(
                            searchTerm.toLowerCase()
                          )
                      )
                      .map(programme => (

                        <div
                          key={programme.id}
                          style={{
                            border:
                              selectedProgId === programme.id
                                ? `1px solid ${adminTheme.green}`
                                : `1px solid ${adminTheme.border}`,
                            background:
                              selectedProgId === programme.id
                                ? adminTheme.lightGreen
                                : '#fff',
                            borderRadius: '9px',
                            padding: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}
                        >

                          <div
                            style={{
                              cursor: 'pointer',
                              flex: 1
                            }}
                            onClick={() =>
                              setSelectedProgId(
                                programme.id
                              )
                            }
                          >

                            <strong>
                              {programme.name}
                            </strong>

                            <div
                              style={{
                                fontSize: '11px',
                                color: adminTheme.muted,
                                marginTop: '3px'
                              }}
                            >
                              {programme.level} •{' '}
                              {programme.duration} •{' '}
                              {programme.semesters} semesters
                            </div>

                            <div
                              style={{
                                marginTop: '6px'
                              }}
                            >
                              {renderStatus(
                                programme.status
                              )}
                            </div>

                          </div>


                          <div>

                            <button
                              style={adminStyles.smallButton}
                              onClick={() => {

                                setIsEditingProg(true);
                                setEditProgId(
                                  programme.id
                                );

                                setProgForm({
                                  name:
                                    programme.name || '',
                                  description:
                                    programme.description ||
                                    '',
                                  level:
                                    programme.level ||
                                    'Foundation',
                                  duration:
                                    programme.duration ||
                                    '1 Year',
                                  semesters:
                                    programme.semesters ||
                                    1,
                                  status:
                                    programme.status ||
                                    'Active',
                                  coordinator:
                                    programme.coordinator ||
                                    'Unassigned'
                                });

                              }}
                            >
                              Edit
                            </button>


                            {programme.status ===
                            'Archived' ? (

                              <button
                                style={{
                                  ...adminStyles.smallButton,
                                  background:
                                    adminTheme.green
                                }}
                                onClick={() =>
                                  handleRestoreProgramme(
                                    programme.id
                                  )
                                }
                              >
                                Restore
                              </button>

                            ) : (

                              <>
                                <button
                                  style={{
                                    ...adminStyles.smallButton,
                                    background:
                                      adminTheme.orange
                                  }}
                                  onClick={() =>
                                    handleToggleProgrammeStatus(
                                      programme.id
                                    )
                                  }
                                >
                                  {programme.status ===
                                  'Active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>

                                <button
                                  style={
                                    adminStyles.dangerButton
                                  }
                                  onClick={() =>
                                    handleArchiveProgramme(
                                      programme.id
                                    )
                                  }
                                >
                                  Archive
                                </button>
                              </>

                            )}

                          </div>

                        </div>

                      ))}

                  </div>

                </div>


                <div style={adminStyles.panel}>

                  <h3 style={adminStyles.sectionTitle}>
                    {isEditingProg
                      ? 'Edit Programme'
                      : 'Create Programme'}
                  </h3>

                  <p style={adminStyles.sectionSubtitle}>
                    Maintain the official programme master record.
                  </p>

                  <form onSubmit={handleSaveProgramme}>

                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Programme Name
                      </label>

                      <input
                        style={adminStyles.input}
                        value={progForm.name}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            name: e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Description
                      </label>

                      <textarea
                        style={adminStyles.textarea}
                        value={progForm.description}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            description:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Academic Level
                      </label>

                      <select
                        style={adminStyles.input}
                        value={progForm.level}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            level: e.target.value
                          })
                        }
                      >
                        <option>
                          Elementary
                        </option>
                        <option>
                          Foundation
                        </option>
                        <option>
                          Intermediate
                        </option>
                        <option>
                          Specialised Certificate
                        </option>
                        <option>
                          Diploma
                        </option>
                      </select>
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Duration
                      </label>

                      <input
                        style={adminStyles.input}
                        value={progForm.duration}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            duration: e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Number of Semesters
                      </label>

                      <input
                        style={adminStyles.input}
                        type="number"
                        min="1"
                        value={progForm.semesters}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            semesters:
                              parseInt(
                                e.target.value
                              ) || 1
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Coordinator
                      </label>

                      <input
                        style={adminStyles.input}
                        value={progForm.coordinator}
                        onChange={e =>
                          setProgForm({
                            ...progForm,
                            coordinator:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div
                      style={{
                        display: 'flex',
                        gap: '8px'
                      }}
                    >

                      <button
                        style={adminStyles.primaryButton}
                        type="submit"
                      >
                        {isEditingProg
                          ? 'Update Programme'
                          : 'Create Programme'}
                      </button>


                      {isEditingProg && (

                        <button
                          style={
                            adminStyles.secondaryButton
                          }
                          type="button"
                          onClick={
                            resetProgrammeForm
                          }
                        >
                          Cancel
                        </button>

                      )}

                    </div>

                  </form>

                </div>

              </div>


              {currentProg && (

                <div
                  style={{
                    marginTop: '22px',
                    padding: '17px',
                    background: adminTheme.lightGreen,
                    borderRadius: '10px',
                    border: `1px solid ${adminTheme.border}`
                  }}
                >

                  <strong>
                    Selected Programme:
                  </strong>{' '}

                  {currentProg.name}

                  <div
                    style={{
                      marginTop: '7px',
                      fontSize: '12px',
                      color: adminTheme.muted
                    }}
                  >
                    {currentProg.description ||
                      'No programme description available.'}
                  </div>

                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '11px'
                    }}
                  >
                    Curriculum Courses:{' '}
                    <strong>
                      {currentProg.curriculum?.length || 0}
                    </strong>
                  </div>

                </div>

              )}

            </div>

          )}


          {/* ====================================
              INSTRUCTORS / HR
          ==================================== */}

          {activeTab === 'instructors' && (

            <div style={adminStyles.section}>

              <div style={adminStyles.split}>

                <div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginBottom: '15px'
                    }}
                  >

                    <div>
                      <h3 style={adminStyles.sectionTitle}>
                        Staff Directory
                      </h3>
                    </div>

                    <input
                      style={adminStyles.searchBox}
                      value={staffSearch}
                      onChange={e =>
                        setStaffSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search staff..."
                    />

                  </div>


                  <div style={adminStyles.tableWrapper}>

                    <table style={adminStyles.table}>

                      <thead>
                        <tr>
                          <th style={adminStyles.th}>
                            Staff
                          </th>
                          <th style={adminStyles.th}>
                            Role
                          </th>
                          <th style={adminStyles.th}>
                            Department
                          </th>
                          <th style={adminStyles.th}>
                            Contact
                          </th>
                          <th style={adminStyles.th}>
                            Payment
                          </th>
                          <th style={adminStyles.th}>
                            Status
                          </th>
                          <th style={adminStyles.th}>
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {filteredInstructors.map(
                          instructor => (

                            <tr key={instructor.id}>

                              <td style={adminStyles.td}>
                                <strong>
                                  {instructor.name}
                                </strong>

                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: adminTheme.muted
                                  }}
                                >
                                  {instructor.staffId}
                                </div>
                              </td>

                              <td style={adminStyles.td}>
                                {instructor.position}
                              </td>

                              <td style={adminStyles.td}>
                                {instructor.department}
                              </td>

                              <td style={adminStyles.td}>
                                {instructor.email}
                                <br />
                                {instructor.phone}
                              </td>

                              <td style={adminStyles.td}>
                                {instructor.paymentMethod
                                  ?.type ||
                                  'Not Configured'}

                                <br />

                                <small>
                                  {instructor.paymentMethod
                                    ?.provider || ''}
                                </small>
                              </td>

                              <td style={adminStyles.td}>
                                {renderStatus(
                                  instructor.status
                                )}
                              </td>

                              <td style={adminStyles.td}>
                                <button
                                  style={{
                                    ...adminStyles.smallButton,
                                    background:
                                      instructor.status ===
                                      'Active'
                                        ? adminTheme.orange
                                        : adminTheme.green
                                  }}
                                  onClick={() =>
                                    handleToggleInstructorStatus(
                                      instructor.id
                                    )
                                  }
                                >
                                  {instructor.status ===
                                  'Active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                <div style={adminStyles.panel}>

                  <h3 style={adminStyles.sectionTitle}>
                    Create Staff Account
                  </h3>

                  <form onSubmit={handleCreateInstructor}>

                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Full Name
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.name}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            name: e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Staff ID / Username
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.staffId}
                        placeholder="e.g. STF-1005"
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            staffId:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Position / Role
                      </label>

                      <select
                        style={adminStyles.input}
                        value={newInst.position}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            position:
                              e.target.value
                          })
                        }
                      >
                        {positions.map(
                          (position, index) => (
                            <option
                              key={index}
                              value={position}
                            >
                              {position}
                            </option>
                          )
                        )}
                      </select>
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Department
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.department}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            department:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Email
                      </label>

                      <input
                        style={adminStyles.input}
                        type="email"
                        value={newInst.email}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            email:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Phone
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.phone}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            phone:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Qualification
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.qualification}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            qualification:
                              e.target.value
                          })
                        }
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Specialisation
                      </label>

                      <input
                        style={adminStyles.input}
                        value={newInst.specialisation}
                        onChange={e =>
                          setNewInst({
                            ...newInst,
                            specialisation:
                              e.target.value
                          })
                        }
                      />
                    </div>


                    <button
                      style={adminStyles.primaryButton}
                      type="submit"
                    >
                      Create Staff Account
                    </button>

                  </form>


                  <hr
                    style={{
                      margin: '20px 0',
                      border: 0,
                      borderTop:
                        `1px solid ${adminTheme.border}`
                    }}
                  />


                  <h3 style={adminStyles.sectionTitle}>
                    Staff Position Titles
                  </h3>

                  <form onSubmit={handleAddPosition}>

                    <div style={adminStyles.inputGroup}>

                      <input
                        style={adminStyles.input}
                        value={newPositionName}
                        onChange={e =>
                          setNewPositionName(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Assistant Dean"
                        required
                      />

                    </div>

                    <button
                      style={{
                        ...adminStyles.primaryButton,
                        background:
                          adminTheme.blue
                      }}
                      type="submit"
                    >
                      Add Position
                    </button>

                  </form>

                </div>

              </div>

            </div>

          )}


          {/* ====================================
              APPROVALS
          ==================================== */}

          {activeTab === 'approvals' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Curriculum Proposals
              </h3>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Programme
                      </th>
                      <th style={adminStyles.th}>
                        Submitted By
                      </th>
                      <th style={adminStyles.th}>
                        Date
                      </th>
                      <th style={adminStyles.th}>
                        Proposed Changes
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                      <th style={adminStyles.th}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {proposalsList.map(proposal => (

                      <tr key={proposal.id}>

                        <td style={adminStyles.td}>
                          {proposal.programmeName}
                        </td>

                        <td style={adminStyles.td}>
                          {proposal.submittedBy}
                        </td>

                        <td style={adminStyles.td}>
                          {proposal.date}
                        </td>

                        <td style={adminStyles.td}>
                          {proposal.changes}
                        </td>

                        <td style={adminStyles.td}>
                          {renderStatus(
                            proposal.status
                          )}
                        </td>

                        <td style={adminStyles.td}>

                          {proposal.status ===
                            'Pending' && (
                            <>
                              <button
                                style={
                                  adminStyles.smallButton
                                }
                                onClick={() =>
                                  handleReviewProposal(
                                    proposal.id,
                                    'Approved'
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                style={
                                  adminStyles.dangerButton
                                }
                                onClick={() =>
                                  handleReviewProposal(
                                    proposal.id,
                                    'Rejected'
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              <h3
                style={{
                  ...adminStyles.sectionTitle,
                  marginTop: '28px'
                }}
              >
                Instructor Grade Submissions
              </h3>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Course
                      </th>
                      <th style={adminStyles.th}>
                        Assessment
                      </th>
                      <th style={adminStyles.th}>
                        Instructor
                      </th>
                      <th style={adminStyles.th}>
                        Date
                      </th>
                      <th style={adminStyles.th}>
                        Summary
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                      <th style={adminStyles.th}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {gradesList.map(grade => (

                      <tr key={grade.id}>

                        <td style={adminStyles.td}>
                          {grade.course}
                        </td>

                        <td style={adminStyles.td}>
                          {grade.title}
                        </td>

                        <td style={adminStyles.td}>
                          {grade.instructor}
                        </td>

                        <td style={adminStyles.td}>
                          {grade.submissionDate}
                        </td>

                        <td style={adminStyles.td}>
                          {grade.data}
                        </td>

                        <td style={adminStyles.td}>
                          {renderStatus(
                            grade.status
                          )}
                        </td>

                        <td style={adminStyles.td}>

                          {grade.status ===
                            'Pending Review' && (
                            <>
                              <button
                                style={
                                  adminStyles.smallButton
                                }
                                onClick={() =>
                                  handleReviewGrade(
                                    grade.id,
                                    'Approved'
                                  )
                                }
                              >
                                Publish
                              </button>

                              <button
                                style={
                                  adminStyles.dangerButton
                                }
                                onClick={() =>
                                  handleReviewGrade(
                                    grade.id,
                                    'Rejected'
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* ====================================
              PRIVATE COURSES
          ==================================== */}

          {activeTab === 'private' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Private Course Requests
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Assign instructors and manage specialised
                one-to-one learning requests.
              </p>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Student
                      </th>
                      <th style={adminStyles.th}>
                        Course
                      </th>
                      <th style={adminStyles.th}>
                        Submitted
                      </th>
                      <th style={adminStyles.th}>
                        Instructor
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                      <th style={adminStyles.th}>
                        Assignment
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {privateList.map(request => (

                      <tr key={request.id}>

                        <td style={adminStyles.td}>
                          <strong>
                            {request.studentName}
                          </strong>
                        </td>

                        <td style={adminStyles.td}>
                          {request.course}
                        </td>

                        <td style={adminStyles.td}>
                          {request.date}
                        </td>

                        <td style={adminStyles.td}>
                          {request.instructor ||
                            'Unassigned'}
                        </td>

                        <td style={adminStyles.td}>
                          {renderStatus(
                            request.status
                          )}
                        </td>

                        <td style={adminStyles.td}>

                          <select
                            style={{
                              ...adminStyles.input,
                              width: '180px'
                            }}
                            defaultValue=""
                            onChange={e =>
                              handleAssignPrivateInstructor(
                                request.id,
                                e.target.value
                              )
                            }
                          >

                            <option
                              value=""
                              disabled
                            >
                              Select Instructor
                            </option>

                            {instructorsList
                              .filter(
                                instructor =>
                                  instructor.status ===
                                  'Active'
                              )
                              .map(instructor => (

                                <option
                                  key={instructor.id}
                                  value={instructor.name}
                                >
                                  {instructor.name}
                                </option>

                              ))}

                          </select>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* ====================================
              CALENDAR
          ==================================== */}

          {activeTab === 'calendar' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Institutional Academic Calendar
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Central administrative view of academic dates,
                events and institutional activities.
              </p>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Event
                      </th>
                      <th style={adminStyles.th}>
                        Date
                      </th>
                      <th style={adminStyles.th}>
                        Time
                      </th>
                      <th style={adminStyles.th}>
                        Category
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {eventsList.map((event, index) => (

                      <tr
                        key={
                          event.id ||
                          event.eventId ||
                          index
                        }
                      >

                        <td style={adminStyles.td}>
                          <strong>
                            {event.title ||
                              event.name ||
                              event.eventName ||
                              'Academic Event'}
                          </strong>

                          {event.description && (
                            <div
                              style={{
                                marginTop: '3px',
                                fontSize: '10px',
                                color:
                                  adminTheme.muted
                              }}
                            >
                              {event.description}
                            </div>
                          )}
                        </td>

                        <td style={adminStyles.td}>
                          {event.date ||
                            event.startDate ||
                            '—'}
                        </td>

                        <td style={adminStyles.td}>
                          {event.time ||
                            event.startTime ||
                            '—'}
                        </td>

                        <td style={adminStyles.td}>
                          {event.category ||
                            event.type ||
                            'Academic'}
                        </td>

                        <td style={adminStyles.td}>
                          {renderStatus(
                            event.status ||
                            'Scheduled'
                          )}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {eventsList.length === 0 && (
                <div style={adminStyles.empty}>
                  No calendar events have been recorded.
                </div>
              )}

            </div>

          )}


          {/* ====================================
              ATTENDANCE
          ==================================== */}

          {activeTab === 'attendance' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Attendance Monitoring
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Administrative monitoring of attendance records
                submitted by instructors.
              </p>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Student
                      </th>
                      <th style={adminStyles.th}>
                        Course
                      </th>
                      <th style={adminStyles.th}>
                        Date
                      </th>
                      <th style={adminStyles.th}>
                        Attendance
                      </th>
                      <th style={adminStyles.th}>
                        Instructor
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {safeArray(attendanceRecords).map(
                      (record, index) => {

                        const attendanceStatus =
                          record.status ||
                          record.attendance ||
                          record.presentStatus ||
                          record.mark ||
                          'Recorded';

                        return (
                          <tr
                            key={
                              record.id ||
                              index
                            }
                          >

                            <td style={adminStyles.td}>
                              <strong>
                                {record.studentName ||
                                  record.student ||
                                  '—'}
                              </strong>
                            </td>

                            <td style={adminStyles.td}>
                              {record.courseName ||
                                record.course ||
                                '—'}
                            </td>

                            <td style={adminStyles.td}>
                              {record.date ||
                                record.attendanceDate ||
                                '—'}
                            </td>

                            <td style={adminStyles.td}>
                              {renderStatus(
                                attendanceStatus
                              )}
                            </td>

                            <td style={adminStyles.td}>
                              {record.instructor ||
                                record.instructorName ||
                                '—'}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {safeArray(attendanceRecords).length ===
                0 && (
                <div style={adminStyles.empty}>
                  No attendance records are currently available.
                </div>
              )}

            </div>

          )}


          {/* ====================================
              ARCHIVE
          ==================================== */}

          {activeTab === 'archive' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Course & Academic Archive
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Historical courses and academic records retained
                for institutional reference.
              </p>

              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Course
                      </th>
                      <th style={adminStyles.th}>
                        Programme
                      </th>
                      <th style={adminStyles.th}>
                        Code
                      </th>
                      <th style={adminStyles.th}>
                        Archived Date
                      </th>
                      <th style={adminStyles.th}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {archivedList.map(
                      (course, index) => (

                        <tr
                          key={
                            course.id ||
                            course.courseId ||
                            index
                          }
                        >

                          <td style={adminStyles.td}>
                            <strong>
                              {course.name ||
                                course.courseName ||
                                course.title ||
                                'Archived Course'}
                            </strong>
                          </td>

                          <td style={adminStyles.td}>
                            {course.programmeName ||
                              course.programme ||
                              '—'}
                          </td>

                          <td style={adminStyles.td}>
                            {course.code ||
                              course.courseCode ||
                              '—'}
                          </td>

                          <td style={adminStyles.td}>
                            {course.archivedAt ||
                              course.archivedDate ||
                              course.date ||
                              '—'}
                          </td>

                          <td style={adminStyles.td}>
                            {renderStatus(
                              course.status ||
                              'Archived'
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {archivedList.length === 0 && (
                <div style={adminStyles.empty}>
                  No archived course records are currently available.
                </div>
              )}

            </div>

          )}


          {/* ====================================
              SETTINGS
          ==================================== */}

          {activeTab === 'settings' && (

            <div style={adminStyles.section}>

              <div style={adminStyles.split}>

                <div style={adminStyles.panel}>

                  <h3 style={adminStyles.sectionTitle}>
                    Academic Structure
                  </h3>

                  <form onSubmit={handleSaveSettings}>

                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Current Academic Year
                      </label>

                      <input
                        style={adminStyles.input}
                        value={
                          globalSettings.currentAcademicYear
                        }
                        onChange={e =>
                          setGlobalSettings({
                            ...globalSettings,
                            currentAcademicYear:
                              e.target.value
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Months Per Semester
                      </label>

                      <input
                        style={adminStyles.input}
                        type="number"
                        min="1"
                        value={
                          globalSettings.monthsPerSemester
                        }
                        onChange={e =>
                          setGlobalSettings({
                            ...globalSettings,
                            monthsPerSemester:
                              parseInt(
                                e.target.value
                              ) || 1
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Semesters Per Academic Year
                      </label>

                      <input
                        style={adminStyles.input}
                        type="number"
                        min="1"
                        value={
                          globalSettings.semestersPerAcademicYear
                        }
                        onChange={e =>
                          setGlobalSettings({
                            ...globalSettings,
                            semestersPerAcademicYear:
                              parseInt(
                                e.target.value
                              ) || 1
                          })
                        }
                        required
                      />
                    </div>


                    <div style={adminStyles.inputGroup}>
                      <label style={adminStyles.label}>
                        Vacation Duration Between Semesters
                      </label>

                      <input
                        style={adminStyles.input}
                        type="number"
                        min="0"
                        value={
                          globalSettings.vacationDurationMonths
                        }
                        onChange={e =>
                          setGlobalSettings({
                            ...globalSettings,
                            vacationDurationMonths:
                              parseInt(
                                e.target.value
                              ) || 0
                          })
                        }
                        required
                      />
                    </div>


                    <button
                      style={adminStyles.primaryButton}
                      type="submit"
                    >
                      Save Academic Settings
                    </button>

                  </form>

                </div>


                <div>

                  <div
                    style={{
                      ...adminStyles.panel,
                      marginBottom: '15px'
                    }}
                  >

                    <h3 style={adminStyles.sectionTitle}>
                      Current Academic Configuration
                    </h3>

                    <div
                      style={{
                        display: 'grid',
                        gap: '9px',
                        marginTop: '15px'
                      }}
                    >

                      <div>
                        <small>
                          Academic Year
                        </small>

                        <strong
                          style={{
                            display: 'block',
                            marginTop: '3px'
                          }}
                        >
                          {
                            globalSettings.currentAcademicYear
                          }
                        </strong>
                      </div>


                      <div>
                        <small>
                          Semester Duration
                        </small>

                        <strong
                          style={{
                            display: 'block',
                            marginTop: '3px'
                          }}
                        >
                          {
                            globalSettings.monthsPerSemester
                          }{' '}
                          month(s)
                        </strong>
                      </div>


                      <div>
                        <small>
                          Semesters Per Year
                        </small>

                        <strong
                          style={{
                            display: 'block',
                            marginTop: '3px'
                          }}
                        >
                          {
                            globalSettings.semestersPerAcademicYear
                          }
                        </strong>
                      </div>


                      <div>
                        <small>
                          Vacation Period
                        </small>

                        <strong
                          style={{
                            display: 'block',
                            marginTop: '3px'
                          }}
                        >
                          {
                            globalSettings.vacationDurationMonths
                          }{' '}
                          month(s)
                        </strong>
                      </div>

                    </div>

                  </div>


                  <div style={adminStyles.panel}>

                    <h3 style={adminStyles.sectionTitle}>
                      Administrative Controls
                    </h3>

                    <p style={adminStyles.sectionSubtitle}>
                      Important system-level administrative
                      functions.
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gap: '8px'
                      }}
                    >

                      <button
                        style={{
                          ...adminStyles.secondaryButton,
                          textAlign: 'left'
                        }}
                        onClick={() =>
                          setActiveTab('reports')
                        }
                      >
                        Review Security & Audit Logs
                      </button>

                      <button
                        style={{
                          ...adminStyles.secondaryButton,
                          textAlign: 'left'
                        }}
                        onClick={() =>
                          setActiveTab('archive')
                        }
                      >
                        Review Archived Courses
                      </button>

                      <button
                        style={{
                          ...adminStyles.secondaryButton,
                          textAlign: 'left'
                        }}
                        onClick={() =>
                          setActiveTab('calendar')
                        }
                      >
                        Review Academic Calendar
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* ====================================
              REPORTS & AUDIT
          ==================================== */}

          {activeTab === 'reports' && (

            <div style={adminStyles.section}>

              <h3 style={adminStyles.sectionTitle}>
                Institutional Reports
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Generate official administrative reports for
                institutional records.
              </p>


              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '28px'
                }}
              >

                <button
                  style={adminStyles.primaryButton}
                  onClick={() => {

                    const html = `
                      <table>
                        <thead>
                          <tr>
                            <th>Programme</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Coordinator</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${programmesList
                            .map(
                              programme => `
                                <tr>
                                  <td>${programme.name}</td>
                                  <td>${programme.level}</td>
                                  <td>${programme.status}</td>
                                  <td>${programme.coordinator}</td>
                                </tr>
                              `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    `;

                    generatePDFReport(
                      'Programmes Master Report',
                      html
                    );

                    logAction(
                      'Administrator',
                      'Generated Programmes Master Report'
                    );

                  }}
                >
                  Download Programmes Report
                </button>


                <button
                  style={{
                    ...adminStyles.primaryButton,
                    background: adminTheme.blue
                  }}
                  onClick={() => {

                    const html = `
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Staff ID</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${instructorsList
                            .map(
                              instructor => `
                                <tr>
                                  <td>${instructor.name}</td>
                                  <td>${instructor.position}</td>
                                  <td>${instructor.department}</td>
                                  <td>${instructor.staffId}</td>
                                  <td>${instructor.status}</td>
                                </tr>
                              `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    `;

                    generatePDFReport(
                      'Instructors Master Directory',
                      html
                    );

                    logAction(
                      'Administrator',
                      'Generated Instructors Master Directory'
                    );

                  }}
                >
                  Download Staff Directory
                </button>


                <button
                  style={{
                    ...adminStyles.primaryButton,
                    background: adminTheme.gold
                  }}
                  onClick={() => {

                    const html = `
                      <table>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${feesList
                            .map(
                              record => `
                                <tr>
                                  <td>${record.studentName || record.student || ''}</td>
                                  <td>${record.description || record.feeType || record.type || ''}</td>
                                  <td>${record.amount || record.total || 0}</td>
                                  <td>${record.date || record.paymentDate || ''}</td>
                                  <td>${record.status || record.paymentStatus || ''}</td>
                                </tr>
                              `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    `;

                    generatePDFReport(
                      'Fees & Finance Master Report',
                      html
                    );

                    logAction(
                      'Administrator',
                      'Generated Fees & Finance Master Report'
                    );

                  }}
                >
                  Download Finance Report
                </button>

              </div>


              <h3 style={adminStyles.sectionTitle}>
                System Audit Trail & Security Logs
              </h3>

              <p style={adminStyles.sectionSubtitle}>
                Every significant administrative action should
                be recorded here for institutional accountability.
              </p>


              <div style={adminStyles.tableWrapper}>

                <table style={adminStyles.table}>

                  <thead>
                    <tr>
                      <th style={adminStyles.th}>
                        Timestamp
                      </th>
                      <th style={adminStyles.th}>
                        User / Role
                      </th>
                      <th style={adminStyles.th}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {logsList.map(
                      (log, index) => (

                        <tr key={index}>

                          <td style={adminStyles.td}>
                            {log.timestamp}
                          </td>

                          <td style={adminStyles.td}>
                            <strong>
                              {log.user}
                            </strong>
                          </td>

                          <td style={adminStyles.td}>
                            {log.action}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {logsList.length === 0 && (
                <div style={adminStyles.empty}>
                  No audit events have been recorded.
                </div>
              )}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}


// ==========================================
// 5. PROGRAMME COORDINATOR PORTAL
// ==========================================

function CoordinatorPortal({
  programmes,
  setProgrammes,
  proposals,
  setProposals,
  logAction
}) {
  const [selectedProgId, setSelectedProgId] = useState(
    programmes[0]?.id || ''
  );

  const [proposalText, setProposalText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // ------------------------------------------
  // Coordinator Local State
  // ------------------------------------------

  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');

  const [issues, setIssues] = useState([]);
  const [issueText, setIssueText] = useState('');
  const [issuePriority, setIssuePriority] = useState('Medium');

  const [meetings, setMeetings] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [qualityChecks, setQualityChecks] = useState({});

  // ------------------------------------------
  // Modern Coordinator UI Styles
  // ------------------------------------------

  const coordinatorUI = {
    page: {
      backgroundColor: '#f5f7fb',
      minHeight: '100%',
      color: '#172033'
    },

    header: {
      background:
        'linear-gradient(135deg, #0f2747 0%, #173f6d 55%, #2167a3 100%)',
      color: '#fff',
      padding: '28px',
      borderRadius: '18px',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(15,39,71,0.18)'
    },

    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    },

    headerTitle: {
      margin: 0,
      fontSize: '28px',
      fontWeight: 800,
      letterSpacing: '-0.5px'
    },

    headerSubtitle: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.78)',
      fontSize: '14px',
      lineHeight: 1.6
    },

    roleBadge: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.22)',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: 700,
      whiteSpace: 'nowrap'
    },

    selectorCard: {
      backgroundColor: '#fff',
      border: '1px solid #e5eaf1',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(20,35,55,0.05)'
    },

    selectorGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(260px, 1fr) minmax(220px, 1fr)',
      gap: '16px',
      alignItems: 'end'
    },

    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 700,
      color: '#526071',
      marginBottom: '7px'
    },

    input: {
      width: '100%',
      padding: '12px 14px',
      border: '1px solid #d9e0e8',
      borderRadius: '10px',
      backgroundColor: '#fff',
      color: '#172033',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },

    programmeBanner: {
      background:
        'linear-gradient(135deg, #eef6ff 0%, #f6faff 100%)',
      border: '1px solid #d7e9fb',
      padding: '15px 18px',
      borderRadius: '12px',
      color: '#174d7a'
    },

    navWrapper: {
      backgroundColor: '#fff',
      border: '1px solid #e5eaf1',
      borderRadius: '14px',
      padding: '7px',
      marginBottom: '24px',
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
      boxShadow: '0 3px 12px rgba(20,35,55,0.04)'
    },

    navButton: active => ({
      border: 'none',
      padding: '10px 14px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: active ? 700 : 600,
      backgroundColor: active ? '#173f6d' : 'transparent',
      color: active ? '#fff' : '#596678',
      transition: 'all 0.2s ease'
    }),

    sectionCard: {
      backgroundColor: '#fff',
      border: '1px solid #e5eaf1',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(20,35,55,0.045)'
    },

    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '15px',
      flexWrap: 'wrap',
      marginBottom: '20px'
    },

    sectionTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 800,
      color: '#172033'
    },

    sectionSubtitle: {
      margin: '6px 0 0',
      color: '#728096',
      fontSize: '13px',
      lineHeight: 1.6
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    },

    statCard: (accent, soft) => ({
      backgroundColor: '#fff',
      border: '1px solid #e5eaf1',
      borderRadius: '16px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(20,35,55,0.045)'
    }),

    statAccent: accent => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      backgroundColor: accent
    }),

    statLabel: {
      color: '#728096',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },

    statValue: {
      fontSize: '28px',
      fontWeight: 800,
      color: '#172033',
      margin: 0
    },

    statFooter: {
      marginTop: '8px',
      color: '#8a96a7',
      fontSize: '12px'
    },

    twoColumn: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },

    actionGrid: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '14px'
    },

    actionCard: {
      border: '1px solid #e4eaf2',
      borderRadius: '14px',
      padding: '18px',
      backgroundColor: '#fff',
      transition: 'all 0.2s ease'
    },

    actionTitle: {
      margin: '0 0 7px',
      fontSize: '15px',
      fontWeight: 800,
      color: '#172033'
    },

    actionText: {
      margin: '0 0 15px',
      fontSize: '13px',
      lineHeight: 1.55,
      color: '#718096'
    },

    primaryButton: {
      backgroundColor: '#2167a3',
      color: '#fff',
      border: 'none',
      padding: '11px 16px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px'
    },

    successButton: {
      backgroundColor: '#159447',
      color: '#fff',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px'
    },

    dangerButton: {
      backgroundColor: '#c0392b',
      color: '#fff',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px'
    },

    secondaryButton: {
      backgroundColor: '#eef2f7',
      color: '#344054',
      border: '1px solid #dce3ec',
      padding: '10px 15px',
      borderRadius: '9px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: '13px'
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '15px'
    },

    formGroup: {
      marginBottom: '16px'
    },

    tableWrapper: {
      overflowX: 'auto',
      border: '1px solid #e5eaf1',
      borderRadius: '12px'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '720px'
    },

    th: {
      textAlign: 'left',
      padding: '13px 15px',
      backgroundColor: '#f7f9fc',
      color: '#596678',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid #e5eaf1',
      whiteSpace: 'nowrap'
    },

    td: {
      padding: '14px 15px',
      color: '#344054',
      fontSize: '13px',
      borderBottom: '1px solid #edf0f4',
      verticalAlign: 'top'
    },

    badge: (background, color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 9px',
      borderRadius: '999px',
      backgroundColor: background,
      color,
      fontSize: '11px',
      fontWeight: 800
    }),

    listCard: {
      padding: '16px',
      border: '1px solid #e5eaf1',
      borderRadius: '12px',
      marginBottom: '10px',
      backgroundColor: '#fff'
    },

    empty: {
      padding: '35px 20px',
      textAlign: 'center',
      color: '#8490a1',
      backgroundColor: '#f8fafc',
      border: '1px dashed #d8e0ea',
      borderRadius: '12px'
    },

    infoBox: {
      backgroundColor: '#eef6ff',
      border: '1px solid #d8eafb',
      color: '#24557d',
      borderRadius: '11px',
      padding: '14px 16px'
    },

    warningBox: {
      backgroundColor: '#fff8e8',
      border: '1px solid #f4dfae',
      color: '#795b15',
      borderRadius: '11px',
      padding: '14px 16px'
    },

    dangerBox: {
      backgroundColor: '#fff0ef',
      border: '1px solid #f2cdca',
      color: '#8e3027',
      borderRadius: '11px',
      padding: '14px 16px'
    }
  };

  // ------------------------------------------
  // Current Programme
  // ------------------------------------------

  const currentProg =
    programmes.find(p => p.id === selectedProgId) ||
    programmes[0];

  if (!currentProg) {
    return (
      <div style={coordinatorUI.page}>
        <div style={coordinatorUI.sectionCard}>
          <h2 style={coordinatorUI.sectionTitle}>
            Programme Coordinator Portal
          </h2>

          <div style={coordinatorUI.empty}>
            <h3 style={{ marginTop: 0 }}>
              No Programme Assigned
            </h3>

            <p>
              There is currently no programme assigned to this
              Programme Coordinator. Please contact the
              Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // Safe Programme Data
  // ------------------------------------------

  const curriculum = Array.isArray(currentProg.curriculum)
    ? currentProg.curriculum
    : [];

  const programmeProposals = proposals.filter(
    p => p.programmeId === currentProg.id
  );

  const programmeIssues = issues.filter(
    i => i.programmeId === currentProg.id
  );

  const programmeMeetings = meetings.filter(
    m => m.programmeId === currentProg.id
  );

  const programmeAnnouncements = announcements.filter(
    a => a.programmeId === currentProg.id
  );

  const programmeTasks = tasks.filter(
    t => t.programmeId === currentProg.id
  );

  const courses = curriculum.length;

  const semesters = currentProg.semesters || 0;

  const totalCredits = curriculum.reduce(
    (total, course) =>
      total +
      Number(course.credits || course.creditHours || 0),
    0
  );

  const courseTypes = curriculum.reduce((acc, course) => {
    const type = course.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pendingProposals = programmeProposals.filter(
    p => p.status === 'Pending'
  ).length;

  const openIssues = programmeIssues.filter(
    i => i.status !== 'Resolved'
  ).length;

  const pendingTasks = programmeTasks.filter(
    t => t.status !== 'Completed'
  ).length;

  const upcomingMeetings = programmeMeetings
    .filter(m => {
      if (!m.date) return false;
      return new Date(m.date).getTime() >= Date.now();
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .slice(0, 4);

  const recentAnnouncements =
    programmeAnnouncements.slice(0, 4);

  const recentTasks = programmeTasks
    .filter(t => t.status !== 'Completed')
    .slice(0, 5);

  // ------------------------------------------
  // Search Curriculum
  // ------------------------------------------

  const filteredCurriculum = curriculum.filter(course => {
    const search = searchTerm.toLowerCase().trim();

    return (
      String(course.code || '')
        .toLowerCase()
        .includes(search) ||
      String(course.title || '')
        .toLowerCase()
        .includes(search) ||
      String(course.type || '')
        .toLowerCase()
        .includes(search) ||
      String(course.semester || '')
        .toLowerCase()
        .includes(search)
    );
  });

  // ------------------------------------------
  // Navigation
  // ------------------------------------------

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'academic', label: 'Academic Monitoring' },
    { id: 'assessment', label: 'Assessment & Exams' },
    { id: 'staff', label: 'Staff & Courses' },
    { id: 'quality', label: 'Quality Assurance' },
    { id: 'proposals', label: 'Curriculum Proposals' },
    { id: 'issues', label: 'Issues & Complaints' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'reports', label: 'Reports' }
  ];

  // ------------------------------------------
  // Helpers
  // ------------------------------------------

  const goTo = tab => {
    setActiveTab(tab);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const formatDate = value => {
    if (!value) return 'Not specified';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = value => {
    if (!value) return 'Not specified';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = status => {
    switch (String(status || '').toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'resolved':
      case 'scheduled':
        return coordinatorUI.badge('#e8f7ee', '#157a3d');

      case 'pending':
      case 'medium':
        return coordinatorUI.badge('#fff5dc', '#8a6500');

      case 'high':
        return coordinatorUI.badge('#fff0df', '#a24b00');

      case 'critical':
      case 'rejected':
      case 'open':
        return coordinatorUI.badge('#ffeded', '#a62d25');

      default:
        return coordinatorUI.badge('#eef2f6', '#526071');
    }
  };

  // ------------------------------------------
  // Submit Curriculum Proposal
  // ------------------------------------------

  const handleSendProposal = e => {
    e.preventDefault();

    if (!proposalText.trim()) return;

    const newProp = {
      id: `prop-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      submittedBy: 'Programme Coordinator',
      date: new Date()
        .toISOString()
        .substring(0, 10),
      status: 'Pending',
      changes: proposalText.trim(),
      adminComments: ''
    };

    setProposals([newProp, ...proposals]);

    logAction(
      'Coordinator',
      `Submitted curriculum proposal for ${currentProg.name}`
    );

    setProposalText('');

    alert(
      'Curriculum proposal submitted successfully to the Administrator for review.'
    );
  };

  // ------------------------------------------
  // Create Announcement
  // ------------------------------------------

  const handleAnnouncement = e => {
    e.preventDefault();

    if (!announcementText.trim()) return;

    const newAnnouncement = {
      id: `announcement-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      text: announcementText.trim(),
      date: new Date()
        .toISOString()
        .substring(0, 10),
      postedBy: 'Programme Coordinator'
    };

    setAnnouncements([
      newAnnouncement,
      ...announcements
    ]);

    logAction(
      'Coordinator',
      `Posted announcement for ${currentProg.name}`
    );

    setAnnouncementText('');

    alert('Announcement posted successfully.');
  };

  // ------------------------------------------
  // Report Academic / Programme Issue
  // ------------------------------------------

  const handleIssue = e => {
    e.preventDefault();

    if (!issueText.trim()) return;

    const newIssue = {
      id: `issue-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      description: issueText.trim(),
      priority: issuePriority,
      status: 'Open',
      date: new Date()
        .toISOString()
        .substring(0, 10),
      reportedBy: 'Programme Coordinator'
    };

    setIssues([newIssue, ...issues]);

    logAction(
      'Coordinator',
      `Reported ${issuePriority} priority issue for ${currentProg.name}`
    );

    setIssueText('');
    setIssuePriority('Medium');

    alert('Issue reported to the Administrator.');
  };

  // ------------------------------------------
  // Schedule Programme Meeting
  // ------------------------------------------

  const handleMeeting = e => {
    e.preventDefault();

    if (!meetingTitle.trim() || !meetingDate) return;

    const newMeeting = {
      id: `meeting-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      title: meetingTitle.trim(),
      date: meetingDate,
      notes: meetingNotes.trim(),
      status: 'Scheduled',
      organizedBy: 'Programme Coordinator'
    };

    setMeetings([newMeeting, ...meetings]);

    logAction(
      'Coordinator',
      `Scheduled programme meeting for ${currentProg.name}`
    );

    setMeetingTitle('');
    setMeetingDate('');
    setMeetingNotes('');

    alert('Programme meeting scheduled successfully.');
  };

  // ------------------------------------------
  // Create Coordinator Task
  // ------------------------------------------

  const handleTask = e => {
    e.preventDefault();

    if (!taskText.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      task: taskText.trim(),
      dueDate: taskDueDate,
      status: 'Pending',
      createdDate: new Date()
        .toISOString()
        .substring(0, 10)
    };

    setTasks([newTask, ...tasks]);

    logAction(
      'Coordinator',
      `Created programme coordination task for ${currentProg.name}`
    );

    setTaskText('');
    setTaskDueDate('');
  };

  // ------------------------------------------
  // Complete Task
  // ------------------------------------------

  const completeTask = taskId => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'Completed'
            }
          : task
      )
    );

    logAction(
      'Coordinator',
      `Completed programme coordination task for ${currentProg.name}`
    );
  };

  // ------------------------------------------
  // Resolve Issue
  // ------------------------------------------

  const resolveIssue = issueId => {
    setIssues(
      issues.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              status: 'Resolved',
              resolvedDate: new Date()
                .toISOString()
                .substring(0, 10)
            }
          : issue
      )
    );

    logAction(
      'Coordinator',
      `Resolved programme issue for ${currentProg.name}`
    );
  };

  // ------------------------------------------
  // Quality Assurance
  // ------------------------------------------

  const qualityItems = [
    'Course outlines reviewed and updated',
    'Learning outcomes aligned with programme outcomes',
    'Assessment methods aligned with learning outcomes',
    'Lecturer and course allocations reviewed',
    'Student feedback collected',
    'Student feedback reviewed and actioned',
    'Programme performance reviewed',
    'Graduate and employer feedback considered',
    'Curriculum reviewed periodically',
    'Quality improvement actions documented'
  ];

  const completedQualityItems =
    Object.values(qualityChecks).filter(Boolean).length;

  const toggleQualityCheck = index => {
    setQualityChecks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // ------------------------------------------
  // Shared Form Components
  // ------------------------------------------

  const FormLabel = ({ children }) => (
    <label style={coordinatorUI.label}>
      {children}
    </label>
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={coordinatorUI.page}>

      {/* ======================================
          HEADER
      ====================================== */}

      <div style={coordinatorUI.header}>

        <div style={coordinatorUI.headerTop}>

          <div>
            <h1 style={coordinatorUI.headerTitle}>
              Programme Coordinator Portal
            </h1>

            <p style={coordinatorUI.headerSubtitle}>
              Manage academic delivery, curriculum,
              programme quality, staff coordination,
              assessments and programme activities
              from one central workspace.
            </p>
          </div>

          <div style={coordinatorUI.roleBadge}>
            Programme Coordinator
          </div>

        </div>

      </div>


      {/* ======================================
          PROGRAMME SELECTOR
      ====================================== */}

      <div style={coordinatorUI.selectorCard}>

        <div style={coordinatorUI.selectorGrid}>

          <div>
            <FormLabel>
              Assigned Programme
            </FormLabel>

            <select
              style={coordinatorUI.input}
              value={selectedProgId}
              onChange={e =>
                setSelectedProgId(e.target.value)
              }
            >
              {programmes.map(programme => (
                <option
                  key={programme.id}
                  value={programme.id}
                >
                  {programme.name}
                  {programme.level
                    ? ` — ${programme.level}`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={coordinatorUI.programmeBanner}>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 800,
                opacity: 0.7
              }}
            >
              Currently Managing
            </div>

            <div
              style={{
                marginTop: '4px',
                fontSize: '15px',
                fontWeight: 800
              }}
            >
              {currentProg.name}
            </div>
          </div>

        </div>

      </div>


      {/* ======================================
          NAVIGATION
      ====================================== */}

      <div style={coordinatorUI.navWrapper}>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => goTo(tab.id)}
            style={coordinatorUI.navButton(
              activeTab === tab.id
            )}
          >
            {tab.label}
          </button>
        ))}

      </div>


      {/* ======================================
          OVERVIEW
      ====================================== */}

      {activeTab === 'overview' && (
        <div>

          {/* KPI CARDS */}

          <div style={coordinatorUI.statsGrid}>

            <div
              style={coordinatorUI.statCard(
                '#2167a3',
                '#eef6ff'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#2167a3')}
              />

              <div style={coordinatorUI.statLabel}>
                Courses
              </div>

              <p style={coordinatorUI.statValue}>
                {courses}
              </p>

              <div style={coordinatorUI.statFooter}>
                Courses in curriculum
              </div>
            </div>


            <div
              style={coordinatorUI.statCard(
                '#7c4dff',
                '#f2edff'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#7c4dff')}
              />

              <div style={coordinatorUI.statLabel}>
                Semesters
              </div>

              <p style={coordinatorUI.statValue}>
                {semesters}
              </p>

              <div style={coordinatorUI.statFooter}>
                Programme structure
              </div>
            </div>


            <div
              style={coordinatorUI.statCard(
                '#159447',
                '#e8f7ee'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#159447')}
              />

              <div style={coordinatorUI.statLabel}>
                Total Credits
              </div>

              <p style={coordinatorUI.statValue}>
                {totalCredits}
              </p>

              <div style={coordinatorUI.statFooter}>
                Curriculum credit load
              </div>
            </div>


            <div
              style={coordinatorUI.statCard(
                '#d89b00',
                '#fff6df'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#d89b00')}
              />

              <div style={coordinatorUI.statLabel}>
                Pending Proposals
              </div>

              <p style={coordinatorUI.statValue}>
                {pendingProposals}
              </p>

              <div style={coordinatorUI.statFooter}>
                Awaiting administrator review
              </div>
            </div>


            <div
              style={coordinatorUI.statCard(
                '#c0392b',
                '#ffeded'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#c0392b')}
              />

              <div style={coordinatorUI.statLabel}>
                Open Issues
              </div>

              <p style={coordinatorUI.statValue}>
                {openIssues}
              </p>

              <div style={coordinatorUI.statFooter}>
                Issues requiring attention
              </div>
            </div>


            <div
              style={coordinatorUI.statCard(
                '#8e44ad',
                '#f5eafd'
              )}
            >
              <div
                style={coordinatorUI.statAccent('#8e44ad')}
              />

              <div style={coordinatorUI.statLabel}>
                Pending Tasks
              </div>

              <p style={coordinatorUI.statValue}>
                {pendingTasks}
              </p>

              <div style={coordinatorUI.statFooter}>
                Coordination tasks
              </div>
            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Quick Actions
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Access the most frequently used programme
                  coordination functions.
                </p>
              </div>

            </div>

            <div style={coordinatorUI.actionGrid}>

              <div style={coordinatorUI.actionCard}>
                <h4 style={coordinatorUI.actionTitle}>
                  Curriculum
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review courses, credits, semesters and
                  curriculum structure.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    goTo('curriculum')
                  }
                >
                  Open Curriculum
                </button>
              </div>


              <div style={coordinatorUI.actionCard}>
                <h4 style={coordinatorUI.actionTitle}>
                  Assessments
                </h4>

                <p style={coordinatorUI.actionText}>
                  Coordinate assessments, examinations,
                  moderation and results.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    goTo('assessment')
                  }
                >
                  Manage Assessments
                </button>
              </div>


              <div style={coordinatorUI.actionCard}>
                <h4 style={coordinatorUI.actionTitle}>
                  Programme Issue
                </h4>

                <p style={coordinatorUI.actionText}>
                  Report academic, staffing, student or
                  programme concerns.
                </p>

                <button
                  style={coordinatorUI.dangerButton}
                  onClick={() =>
                    goTo('issues')
                  }
                >
                  Report Issue
                </button>
              </div>


              <div style={coordinatorUI.actionCard}>
                <h4 style={coordinatorUI.actionTitle}>
                  Schedule Meeting
                </h4>

                <p style={coordinatorUI.actionText}>
                  Organize programme meetings and academic
                  coordination activities.
                </p>

                <button
                  style={coordinatorUI.secondaryButton}
                  onClick={() =>
                    goTo('meetings')
                  }
                >
                  Schedule Meeting
                </button>
              </div>

            </div>

          </div>


          {/* PROGRAMME DETAILS + RESPONSIBILITIES */}

          <div style={coordinatorUI.twoColumn}>

            <div style={coordinatorUI.sectionCard}>

              <div style={coordinatorUI.sectionHeader}>
                <div>
                  <h2 style={coordinatorUI.sectionTitle}>
                    Programme Details
                  </h2>

                  <p style={coordinatorUI.sectionSubtitle}>
                    Key information about the programme
                    currently under your coordination.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '13px'
                }}
              >

                <div>
                  <strong>Programme</strong>
                  <div style={{ color: '#718096', marginTop: '3px' }}>
                    {currentProg.name}
                  </div>
                </div>

                <div>
                  <strong>Level</strong>
                  <div style={{ color: '#718096', marginTop: '3px' }}>
                    {currentProg.level || 'Not specified'}
                  </div>
                </div>

                <div>
                  <strong>Duration</strong>
                  <div style={{ color: '#718096', marginTop: '3px' }}>
                    {currentProg.duration || 'Not specified'}
                  </div>
                </div>

                <div>
                  <strong>Semesters</strong>
                  <div style={{ color: '#718096', marginTop: '3px' }}>
                    {currentProg.semesters || 'Not specified'}
                  </div>
                </div>

                <div>
                  <strong>Description</strong>
                  <div
                    style={{
                      color: '#718096',
                      marginTop: '3px',
                      lineHeight: 1.6
                    }}
                  >
                    {currentProg.description ||
                      'No description available.'}
                  </div>
                </div>

              </div>

            </div>


            <div style={coordinatorUI.sectionCard}>

              <div style={coordinatorUI.sectionHeader}>
                <div>
                  <h2 style={coordinatorUI.sectionTitle}>
                    Coordinator Responsibilities
                  </h2>

                  <p style={coordinatorUI.sectionSubtitle}>
                    Core responsibilities associated with
                    programme coordination.
                  </p>
                </div>
              </div>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#596678',
                  lineHeight: 1.9,
                  fontSize: '13px'
                }}
              >
                <li>
                  Monitor programme curriculum and course delivery.
                </li>

                <li>
                  Coordinate academic staff assigned to the programme.
                </li>

                <li>
                  Monitor student academic progression and performance.
                </li>

                <li>
                  Coordinate assessments and examinations.
                </li>

                <li>
                  Identify programme quality and academic issues.
                </li>

                <li>
                  Coordinate programme meetings and academic activities.
                </li>

                <li>
                  Submit curriculum changes for administrative approval.
                </li>

                <li>
                  Maintain programme quality assurance records.
                </li>

                <li>
                  Prepare programme reports for management.
                </li>

                <li>
                  Communicate important programme information to staff
                  and students.
                </li>
              </ul>

            </div>

          </div>


          {/* UPCOMING MEETINGS + TASKS */}

          <div style={coordinatorUI.twoColumn}>

            <div style={coordinatorUI.sectionCard}>

              <div style={coordinatorUI.sectionHeader}>

                <div>
                  <h2 style={coordinatorUI.sectionTitle}>
                    Upcoming Meetings
                  </h2>

                  <p style={coordinatorUI.sectionSubtitle}>
                    Programme meetings requiring your attention.
                  </p>
                </div>

                <button
                  style={coordinatorUI.secondaryButton}
                  onClick={() => goTo('meetings')}
                >
                  View All
                </button>

              </div>

              {upcomingMeetings.length === 0 ? (
                <div style={coordinatorUI.empty}>
                  No upcoming meetings scheduled.
                </div>
              ) : (
                upcomingMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    style={coordinatorUI.listCard}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <strong>
                        {meeting.title}
                      </strong>

                      {getStatusStyle(meeting.status) && (
                        <span
                          style={getStatusStyle(
                            meeting.status
                          )}
                        >
                          {meeting.status}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        color: '#718096',
                        fontSize: '12px',
                        marginTop: '7px'
                      }}
                    >
                      {formatDateTime(meeting.date)}
                    </div>
                  </div>
                ))
              )}

            </div>


            <div style={coordinatorUI.sectionCard}>

              <div style={coordinatorUI.sectionHeader}>

                <div>
                  <h2 style={coordinatorUI.sectionTitle}>
                    Pending Tasks
                  </h2>

                  <p style={coordinatorUI.sectionSubtitle}>
                    Outstanding coordination activities.
                  </p>
                </div>

                <button
                  style={coordinatorUI.secondaryButton}
                  onClick={() => goTo('tasks')}
                >
                  View All
                </button>

              </div>

              {recentTasks.length === 0 ? (
                <div style={coordinatorUI.empty}>
                  No pending coordination tasks.
                </div>
              ) : (
                recentTasks.map(task => (
                  <div
                    key={task.id}
                    style={coordinatorUI.listCard}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <strong>
                        {task.task}
                      </strong>

                      <span
                        style={getStatusStyle(task.status)}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div
                      style={{
                        color: '#718096',
                        fontSize: '12px',
                        marginTop: '7px'
                      }}
                    >
                      Due:{' '}
                      {task.dueDate
                        ? formatDate(task.dueDate)
                        : 'No due date'}
                    </div>
                  </div>
                ))
              )}

            </div>

          </div>


          {/* RECENT ANNOUNCEMENTS */}

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Recent Programme Announcements
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Latest information communicated within
                  the programme.
                </p>
              </div>

              <button
                style={coordinatorUI.secondaryButton}
                onClick={() =>
                  goTo('announcements')
                }
              >
                Manage Announcements
              </button>

            </div>

            {recentAnnouncements.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No programme announcements have been posted yet.
              </div>
            ) : (
              recentAnnouncements.map(announcement => (
                <div
                  key={announcement.id}
                  style={{
                    ...coordinatorUI.listCard,
                    backgroundColor: '#f8fbff'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '15px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <strong>
                      Programme Announcement
                    </strong>

                    <span
                      style={{
                        color: '#728096',
                        fontSize: '12px'
                      }}
                    >
                      {formatDate(announcement.date)}
                    </span>
                  </div>

                  <p
                    style={{
                      marginBottom: 0,
                      color: '#596678',
                      lineHeight: 1.6
                    }}
                  >
                    {announcement.text}
                  </p>
                </div>
              ))
            )}

          </div>

        </div>
      )}


      {/* ======================================
          CURRICULUM
      ====================================== */}

      {activeTab === 'curriculum' && (
        <div style={coordinatorUI.sectionCard}>

          <div style={coordinatorUI.sectionHeader}>

            <div>
              <h2 style={coordinatorUI.sectionTitle}>
                Curriculum & Courses
              </h2>

              <p style={coordinatorUI.sectionSubtitle}>
                Review the current curriculum structure,
                course allocation, semester placement and
                credit requirements.
              </p>
            </div>

            <span
              style={coordinatorUI.badge(
                '#eef6ff',
                '#2167a3'
              )}
            >
              {courses} Courses
            </span>

          </div>


          <div style={coordinatorUI.formGroup}>

            <FormLabel>
              Search Curriculum
            </FormLabel>

            <input
              style={coordinatorUI.input}
              type="text"
              value={searchTerm}
              onChange={e =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by course code, title, type or semester..."
            />

          </div>


          <div style={coordinatorUI.tableWrapper}>

            <table style={coordinatorUI.table}>

              <thead>
                <tr>
                  <th style={coordinatorUI.th}>
                    Code
                  </th>

                  <th style={coordinatorUI.th}>
                    Course Title
                  </th>

                  <th style={coordinatorUI.th}>
                    Semester
                  </th>

                  <th style={coordinatorUI.th}>
                    Type
                  </th>

                  <th style={coordinatorUI.th}>
                    Credits
                  </th>

                  <th style={coordinatorUI.th}>
                    Objectives
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredCurriculum.map(course => (
                  <tr key={course.id}>

                    <td style={coordinatorUI.td}>
                      <strong>
                        {course.code || 'N/A'}
                      </strong>
                    </td>

                    <td style={coordinatorUI.td}>
                      {course.title || 'Untitled Course'}
                    </td>

                    <td style={coordinatorUI.td}>
                      {course.semester
                        ? `Semester ${course.semester}`
                        : 'N/A'}
                    </td>

                    <td style={coordinatorUI.td}>
                      <span
                        style={coordinatorUI.badge(
                          '#eef2f6',
                          '#526071'
                        )}
                      >
                        {course.type || 'Other'}
                      </span>
                    </td>

                    <td style={coordinatorUI.td}>
                      <strong>
                        {course.credits ||
                          course.creditHours ||
                          'N/A'}
                      </strong>
                    </td>

                    <td style={coordinatorUI.td}>
                      {course.objectives || 'N/A'}
                    </td>

                  </tr>
                ))}

                {filteredCurriculum.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        ...coordinatorUI.td,
                        textAlign: 'center',
                        padding: '35px'
                      }}
                    >
                      No courses match your search.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>


          <div style={{ marginTop: '20px' }}>

            <h3
              style={{
                margin: '0 0 12px',
                fontSize: '15px'
              }}
            >
              Course Type Summary
            </h3>

            <div style={coordinatorUI.actionGrid}>

              {Object.entries(courseTypes).map(
                ([type, count]) => (
                  <div
                    key={type}
                    style={{
                      padding: '14px 16px',
                      border: '1px solid #e5eaf1',
                      borderRadius: '11px',
                      backgroundColor: '#f9fbfd'
                    }}
                  >
                    <div
                      style={{
                        color: '#718096',
                        fontSize: '12px'
                      }}
                    >
                      {type}
                    </div>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: '20px',
                        marginTop: '4px'
                      }}
                    >
                      {count}
                    </strong>
                  </div>
                )
              )}

            </div>

          </div>

        </div>
      )}


      {/* ======================================
          ACADEMIC MONITORING
      ====================================== */}

      {activeTab === 'academic' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Academic Performance Monitoring
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Monitor student progression, course
                  performance, attendance and academic risks.
                </p>
              </div>

            </div>


            <div style={coordinatorUI.actionGrid}>

              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Student Progress
                </h4>

                <p style={coordinatorUI.actionText}>
                  Monitor progression from semester to
                  semester, outstanding courses and students
                  requiring intervention.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    alert(
                      'Student progression module can be connected here.'
                    )
                  }
                >
                  View Progression
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Attendance
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review attendance trends and identify
                  students requiring intervention.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    alert(
                      'Attendance monitoring module can be connected here.'
                    )
                  }
                >
                  View Attendance
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  At-Risk Students
                </h4>

                <p style={coordinatorUI.actionText}>
                  Identify students with poor performance,
                  attendance or repeated course failures.
                </p>

                <button
                  style={coordinatorUI.dangerButton}
                  onClick={() =>
                    alert(
                      'Academic risk module can be connected here.'
                    )
                  }
                >
                  Review At-Risk Students
                </button>

              </div>

            </div>

          </div>


          <div style={coordinatorUI.warningBox}>
            <strong>Coordinator Attention</strong>

            <p
              style={{
                marginBottom: 0,
                marginTop: '5px',
                lineHeight: 1.6
              }}
            >
              Academic monitoring should be reviewed regularly
              so that students with performance, attendance or
              progression concerns can be identified early.
            </p>
          </div>

        </div>
      )}


      {/* ======================================
          ASSESSMENT & EXAMS
      ====================================== */}

      {activeTab === 'assessment' && (
        <div style={coordinatorUI.sectionCard}>

          <div style={coordinatorUI.sectionHeader}>

            <div>
              <h2 style={coordinatorUI.sectionTitle}>
                Assessment & Examination Coordination
              </h2>

              <p style={coordinatorUI.sectionSubtitle}>
                Coordinate continuous assessment,
                examinations, marking, moderation and
                publication of results.
              </p>
            </div>

          </div>


          <div style={coordinatorUI.actionGrid}>

            <div style={coordinatorUI.actionCard}>

              <h4 style={coordinatorUI.actionTitle}>
                Assessment Schedule
              </h4>

              <p style={coordinatorUI.actionText}>
                Coordinate tests, assignments,
                presentations and examinations.
              </p>

              <button
                style={coordinatorUI.primaryButton}
                onClick={() =>
                  alert(
                    'Assessment scheduling module can be connected here.'
                  )
                }
              >
                Manage Schedule
              </button>

            </div>


            <div style={coordinatorUI.actionCard}>

              <h4 style={coordinatorUI.actionTitle}>
                Results Monitoring
              </h4>

              <p style={coordinatorUI.actionText}>
                Monitor submission of marks and identify
                missing or delayed results.
              </p>

              <button
                style={coordinatorUI.primaryButton}
                onClick={() =>
                  alert(
                    'Results monitoring module can be connected here.'
                  )
                }
              >
                Review Results
              </button>

            </div>


            <div style={coordinatorUI.actionCard}>

              <h4 style={coordinatorUI.actionTitle}>
                Moderation
              </h4>

              <p style={coordinatorUI.actionText}>
                Track moderation and approval of assessments
                before results are finalized.
              </p>

              <button
                style={coordinatorUI.primaryButton}
                onClick={() =>
                  alert(
                    'Assessment moderation module can be connected here.'
                  )
                }
              >
                Manage Moderation
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ======================================
          STAFF & COURSES
      ====================================== */}

      {activeTab === 'staff' && (
        <div style={coordinatorUI.sectionCard}>

          <div style={coordinatorUI.sectionHeader}>

            <div>
              <h2 style={coordinatorUI.sectionTitle}>
                Staff & Course Coordination
              </h2>

              <p style={coordinatorUI.sectionSubtitle}>
                Coordinate course allocation, teaching
                responsibilities, workload and staff availability.
              </p>
            </div>

          </div>


          <div style={coordinatorUI.actionGrid}>

            <div style={coordinatorUI.actionCard}>
              <h4 style={coordinatorUI.actionTitle}>
                Course Allocation
              </h4>

              <p style={coordinatorUI.actionText}>
                Assign lecturers to courses and monitor
                teaching responsibilities.
              </p>

              <button
                style={coordinatorUI.primaryButton}
                onClick={() =>
                  alert(
                    'Staff and course allocation module can be connected here.'
                  )
                }
              >
                Manage Allocation
              </button>
            </div>


            <div style={coordinatorUI.actionCard}>
              <h4 style={coordinatorUI.actionTitle}>
                Workload Monitoring
              </h4>

              <p style={coordinatorUI.actionText}>
                Review staff workload and identify possible
                teaching allocation issues.
              </p>

              <button
                style={coordinatorUI.secondaryButton}
                onClick={() =>
                  alert(
                    'Staff workload module can be connected here.'
                  )
                }
              >
                Review Workload
              </button>
            </div>


            <div style={coordinatorUI.actionCard}>
              <h4 style={coordinatorUI.actionTitle}>
                Course Documentation
              </h4>

              <p style={coordinatorUI.actionText}>
                Ensure active courses have current course
                outlines and appropriate teaching resources.
              </p>

              <button
                style={coordinatorUI.secondaryButton}
                onClick={() =>
                  alert(
                    'Course documentation module can be connected here.'
                  )
                }
              >
                Review Documents
              </button>
            </div>

          </div>


          <div
            style={{
              ...coordinatorUI.warningBox,
              marginTop: '20px'
            }}
          >
            <strong>Coordinator Check</strong>

            <p
              style={{
                marginBottom: 0,
                marginTop: '5px'
              }}
            >
              Ensure every active course has an assigned
              lecturer, appropriate teaching resources and a
              current course outline.
            </p>
          </div>

        </div>
      )}


      {/* ======================================
          QUALITY ASSURANCE
      ====================================== */}

      {activeTab === 'quality' && (
        <div style={coordinatorUI.sectionCard}>

          <div style={coordinatorUI.sectionHeader}>

            <div>
              <h2 style={coordinatorUI.sectionTitle}>
                Programme Quality Assurance
              </h2>

              <p style={coordinatorUI.sectionSubtitle}>
                Monitor programme quality, academic standards,
                documentation and continuous improvement.
              </p>
            </div>

            <span
              style={coordinatorUI.badge(
                completedQualityItems ===
                  qualityItems.length
                  ? '#e8f7ee'
                  : '#fff5dc',
                completedQualityItems ===
                  qualityItems.length
                  ? '#157a3d'
                  : '#8a6500'
              )}
            >
              {completedQualityItems}/
              {qualityItems.length} Completed
            </span>

          </div>


          <div
            style={{
              height: '8px',
              backgroundColor: '#e9edf2',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${
                  qualityItems.length
                    ? (completedQualityItems /
                        qualityItems.length) *
                      100
                    : 0
                }%`,
                background:
                  'linear-gradient(90deg, #2167a3, #159447)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>


          <div
            style={{
              display: 'grid',
              gap: '10px'
            }}
          >

            {qualityItems.map((item, index) => {

              const checked =
                !!qualityChecks[index];

              return (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '15px',
                    backgroundColor: checked
                      ? '#f0faf4'
                      : '#f8fafc',
                    border:
                      checked
                        ? '1px solid #cdebd8'
                        : '1px solid #e5eaf1',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    color: checked
                      ? '#246b3c'
                      : '#596678',
                    fontWeight: checked
                      ? 700
                      : 500
                  }}
                >

                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleQualityCheck(index)
                    }
                    style={{
                      width: '17px',
                      height: '17px'
                    }}
                  />

                  <span>{item}</span>

                </label>
              );
            })}

          </div>


          {completedQualityItems ===
            qualityItems.length && (
            <div
              style={{
                ...coordinatorUI.successButton,
                marginTop: '18px',
                textAlign: 'center',
                cursor: 'default'
              }}
            >
              Quality Assurance Checklist Complete
            </div>
          )}

        </div>
      )}


      {/* ======================================
          CURRICULUM PROPOSALS
      ====================================== */}

      {activeTab === 'proposals' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Curriculum Change Request
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Submit proposed curriculum changes,
                  additions or removals to the Administrator
                  for review.
                </p>
              </div>

            </div>


            <form onSubmit={handleSendProposal}>

              <div style={coordinatorUI.formGroup}>

                <FormLabel>
                  Proposed Curriculum Changes / Additions
                </FormLabel>

                <textarea
                  style={{
                    ...coordinatorUI.input,
                    minHeight: '140px',
                    resize: 'vertical'
                  }}
                  rows="6"
                  value={proposalText}
                  onChange={e =>
                    setProposalText(e.target.value)
                  }
                  placeholder="Describe proposed changes, new courses, course removals, changes in credit hours, prerequisites, learning outcomes, semester placement, etc..."
                  required
                />

              </div>


              <button
                style={coordinatorUI.primaryButton}
                type="submit"
              >
                Submit Proposal to Administrator
              </button>

            </form>

          </div>


          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Proposal History
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Track curriculum proposals submitted for
                  this programme.
                </p>
              </div>

              <span
                style={coordinatorUI.badge(
                  '#eef6ff',
                  '#2167a3'
                )}
              >
                {programmeProposals.length} Total
              </span>

            </div>


            {programmeProposals.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No curriculum proposals submitted yet.
              </div>
            ) : (
              <div style={coordinatorUI.tableWrapper}>

                <table style={coordinatorUI.table}>

                  <thead>
                    <tr>
                      <th style={coordinatorUI.th}>
                        Date
                      </th>

                      <th style={coordinatorUI.th}>
                        Changes
                      </th>

                      <th style={coordinatorUI.th}>
                        Status
                      </th>

                      <th style={coordinatorUI.th}>
                        Administrator Comments
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {programmeProposals.map(proposal => (
                      <tr key={proposal.id}>

                        <td style={coordinatorUI.td}>
                          {formatDate(proposal.date)}
                        </td>

                        <td style={coordinatorUI.td}>
                          {proposal.changes}
                        </td>

                        <td style={coordinatorUI.td}>
                          <span
                            style={getStatusStyle(
                              proposal.status
                            )}
                          >
                            {proposal.status}
                          </span>
                        </td>

                        <td style={coordinatorUI.td}>
                          {proposal.adminComments ||
                            'No comments yet.'}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      )}


      {/* ======================================
          ISSUES & COMPLAINTS
      ====================================== */}

      {activeTab === 'issues' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Report Academic / Programme Issue
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Report academic, staffing, student,
                  timetable, facility or programme concerns.
                </p>
              </div>

            </div>


            <form onSubmit={handleIssue}>

              <div style={coordinatorUI.formGroup}>

                <FormLabel>
                  Issue / Complaint
                </FormLabel>

                <textarea
                  style={{
                    ...coordinatorUI.input,
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  rows="5"
                  value={issueText}
                  onChange={e =>
                    setIssueText(e.target.value)
                  }
                  placeholder="Describe the academic, staffing, student, timetable, facilities or programme issue..."
                  required
                />

              </div>


              <div style={coordinatorUI.formGroup}>

                <FormLabel>
                  Priority
                </FormLabel>

                <select
                  style={coordinatorUI.input}
                  value={issuePriority}
                  onChange={e =>
                    setIssuePriority(e.target.value)
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>

              </div>


              <button
                type="submit"
                style={coordinatorUI.dangerButton}
              >
                Report Issue
              </button>

            </form>

          </div>


          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Programme Issues
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Monitor reported issues and their
                  resolution status.
                </p>
              </div>

              <span
                style={coordinatorUI.badge(
                  openIssues > 0
                    ? '#ffeded'
                    : '#e8f7ee',
                  openIssues > 0
                    ? '#a62d25'
                    : '#157a3d'
                )}
              >
                {openIssues} Open
              </span>

            </div>


            {programmeIssues.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No issues reported for this programme.
              </div>
            ) : (
              programmeIssues.map(issue => (
                <div
                  key={issue.id}
                  style={{
                    ...coordinatorUI.listCard,
                    borderLeft:
                      issue.priority === 'Critical'
                        ? '5px solid #c0392b'
                        : issue.priority === 'High'
                        ? '5px solid #e67e22'
                        : issue.priority === 'Medium'
                        ? '5px solid #d89b00'
                        : '5px solid #3498db'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}
                    >
                      <span
                        style={getStatusStyle(
                          issue.priority
                        )}
                      >
                        {issue.priority}
                      </span>

                      <span
                        style={getStatusStyle(
                          issue.status
                        )}
                      >
                        {issue.status}
                      </span>
                    </div>

                    <small
                      style={{
                        color: '#8490a1'
                      }}
                    >
                      {formatDate(issue.date)}
                    </small>

                  </div>


                  <p
                    style={{
                      color: '#596678',
                      lineHeight: 1.6,
                      margin: '12px 0'
                    }}
                  >
                    {issue.description}
                  </p>


                  {issue.status !== 'Resolved' && (
                    <button
                      style={coordinatorUI.successButton}
                      onClick={() =>
                        resolveIssue(issue.id)
                      }
                    >
                      Mark Resolved
                    </button>
                  )}

                </div>
              ))
            )}

          </div>

        </div>
      )}


      {/* ======================================
          MEETINGS
      ====================================== */}

      {activeTab === 'meetings' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Schedule Programme Meeting
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Organize programme board meetings,
                  academic meetings and coordination sessions.
                </p>
              </div>

            </div>


            <form onSubmit={handleMeeting}>

              <div style={coordinatorUI.formGrid}>

                <div style={coordinatorUI.formGroup}>

                  <FormLabel>
                    Meeting Title
                  </FormLabel>

                  <input
                    style={coordinatorUI.input}
                    value={meetingTitle}
                    onChange={e =>
                      setMeetingTitle(e.target.value)
                    }
                    placeholder="e.g. Programme Board Meeting"
                    required
                  />

                </div>


                <div style={coordinatorUI.formGroup}>

                  <FormLabel>
                    Date & Time
                  </FormLabel>

                  <input
                    style={coordinatorUI.input}
                    type="datetime-local"
                    value={meetingDate}
                    onChange={e =>
                      setMeetingDate(e.target.value)
                    }
                    required
                  />

                </div>

              </div>


              <div style={coordinatorUI.formGroup}>

                <FormLabel>
                  Agenda / Notes
                </FormLabel>

                <textarea
                  style={{
                    ...coordinatorUI.input,
                    minHeight: '110px',
                    resize: 'vertical'
                  }}
                  rows="4"
                  value={meetingNotes}
                  onChange={e =>
                    setMeetingNotes(e.target.value)
                  }
                  placeholder="Enter agenda items or meeting notes..."
                />

              </div>


              <button
                style={coordinatorUI.primaryButton}
                type="submit"
              >
                Schedule Meeting
              </button>

            </form>

          </div>


          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Scheduled Meetings
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Programme meetings currently recorded in
                  the coordinator workspace.
                </p>
              </div>

              <span
                style={coordinatorUI.badge(
                  '#eef6ff',
                  '#2167a3'
                )}
              >
                {programmeMeetings.length} Meetings
              </span>

            </div>


            {programmeMeetings.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No programme meetings scheduled.
              </div>
            ) : (
              programmeMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  style={coordinatorUI.listCard}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >

                    <strong
                      style={{
                        fontSize: '16px'
                      }}
                    >
                      {meeting.title}
                    </strong>

                    <span
                      style={getStatusStyle(
                        meeting.status
                      )}
                    >
                      {meeting.status}
                    </span>

                  </div>


                  <p
                    style={{
                      margin: '10px 0 5px',
                      color: '#596678'
                    }}
                  >
                    <strong>Date:</strong>{' '}
                    {formatDateTime(meeting.date)}
                  </p>


                  <p
                    style={{
                      margin: 0,
                      color: '#718096',
                      lineHeight: 1.6
                    }}
                  >
                    {meeting.notes ||
                      'No agenda provided.'}
                  </p>

                </div>
              ))
            )}

          </div>

        </div>
      )}


      {/* ======================================
          ANNOUNCEMENTS
      ====================================== */}

      {activeTab === 'announcements' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Publish Programme Announcement
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Share important academic and programme
                  information.
                </p>
              </div>

            </div>


            <form onSubmit={handleAnnouncement}>

              <div style={coordinatorUI.formGroup}>

                <FormLabel>
                  Announcement
                </FormLabel>

                <textarea
                  style={{
                    ...coordinatorUI.input,
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  rows="5"
                  value={announcementText}
                  onChange={e =>
                    setAnnouncementText(e.target.value)
                  }
                  placeholder="Write an important programme announcement..."
                  required
                />

              </div>


              <button
                style={coordinatorUI.primaryButton}
                type="submit"
              >
                Post Announcement
              </button>

            </form>

          </div>


          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Recent Announcements
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Previously posted programme announcements.
                </p>
              </div>

              <span
                style={coordinatorUI.badge(
                  '#eef6ff',
                  '#2167a3'
                )}
              >
                {programmeAnnouncements.length} Posted
              </span>

            </div>


            {programmeAnnouncements.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No programme announcements have been posted.
              </div>
            ) : (
              programmeAnnouncements.map(
                announcement => (
                  <div
                    key={announcement.id}
                    style={{
                      ...coordinatorUI.listCard,
                      backgroundColor: '#f8fbff'
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '15px',
                        flexWrap: 'wrap'
                      }}
                    >

                      <strong>
                        Programme Announcement
                      </strong>

                      <span
                        style={{
                          color: '#728096',
                          fontSize: '12px'
                        }}
                      >
                        {formatDate(
                          announcement.date
                        )}
                      </span>

                    </div>


                    <p
                      style={{
                        color: '#596678',
                        lineHeight: 1.65,
                        marginBottom: '8px'
                      }}
                    >
                      {announcement.text}
                    </p>


                    <small
                      style={{
                        color: '#8a96a7'
                      }}
                    >
                      Posted by Programme Coordinator
                    </small>

                  </div>
                )
              )
            )}

          </div>

        </div>
      )}


      {/* ======================================
          TASKS
      ====================================== */}

      {activeTab === 'tasks' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Create Coordination Task
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Track programme activities and important
                  responsibilities.
                </p>
              </div>

            </div>


            <form onSubmit={handleTask}>

              <div style={coordinatorUI.formGrid}>

                <div style={coordinatorUI.formGroup}>

                  <FormLabel>
                    Task
                  </FormLabel>

                  <input
                    style={coordinatorUI.input}
                    value={taskText}
                    onChange={e =>
                      setTaskText(e.target.value)
                    }
                    placeholder="e.g. Review Semester 2 course outlines"
                    required
                  />

                </div>


                <div style={coordinatorUI.formGroup}>

                  <FormLabel>
                    Due Date
                  </FormLabel>

                  <input
                    style={coordinatorUI.input}
                    type="date"
                    value={taskDueDate}
                    onChange={e =>
                      setTaskDueDate(e.target.value)
                    }
                  />

                </div>

              </div>


              <button
                style={coordinatorUI.primaryButton}
                type="submit"
              >
                Add Task
              </button>

            </form>

          </div>


          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Task List
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Monitor pending and completed programme
                  coordination activities.
                </p>
              </div>

              <span
                style={coordinatorUI.badge(
                  pendingTasks > 0
                    ? '#fff5dc'
                    : '#e8f7ee',
                  pendingTasks > 0
                    ? '#8a6500'
                    : '#157a3d'
                )}
              >
                {pendingTasks} Pending
              </span>

            </div>


            {programmeTasks.length === 0 ? (
              <div style={coordinatorUI.empty}>
                No coordination tasks have been created.
              </div>
            ) : (
              programmeTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    ...coordinatorUI.listCard,
                    backgroundColor:
                      task.status === 'Completed'
                        ? '#f1faf5'
                        : '#fff'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >

                    <strong>
                      {task.task}
                    </strong>

                    <span
                      style={getStatusStyle(
                        task.status
                      )}
                    >
                      {task.status}
                    </span>

                  </div>


                  <div
                    style={{
                      color: '#718096',
                      fontSize: '12px',
                      marginTop: '8px'
                    }}
                  >
                    Due:{' '}
                    {task.dueDate
                      ? formatDate(task.dueDate)
                      : 'No due date'}
                  </div>


                  {task.status !== 'Completed' && (
                    <button
                      style={{
                        ...coordinatorUI.successButton,
                        marginTop: '12px'
                      }}
                      onClick={() =>
                        completeTask(task.id)
                      }
                    >
                      Mark Completed
                    </button>
                  )}

                </div>
              ))
            )}

          </div>

        </div>
      )}


      {/* ======================================
          REPORTS
      ====================================== */}

      {activeTab === 'reports' && (
        <div>

          <div style={coordinatorUI.sectionCard}>

            <div style={coordinatorUI.sectionHeader}>

              <div>
                <h2 style={coordinatorUI.sectionTitle}>
                  Programme Reports
                </h2>

                <p style={coordinatorUI.sectionSubtitle}>
                  Review programme-level information required
                  for academic management and quality assurance.
                </p>
              </div>

            </div>


            <div style={coordinatorUI.actionGrid}>

              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Programme Summary
                </h4>

                <p style={coordinatorUI.actionText}>
                  View the overall structure and academic
                  profile of this programme.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    alert(
                      `Programme: ${currentProg.name}\nCourses: ${courses}\nSemesters: ${semesters}\nCredits: ${totalCredits}`
                    )
                  }
                >
                  View Summary
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Curriculum Report
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review the programme curriculum and course
                  structure.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    alert(
                      `Curriculum contains ${courses} courses across ${semesters} semesters.`
                    )
                  }
                >
                  View Curriculum Report
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Proposal Report
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review curriculum proposals awaiting
                  administrative action.
                </p>

                <button
                  style={coordinatorUI.primaryButton}
                  onClick={() =>
                    alert(
                      `Pending curriculum proposals: ${pendingProposals}`
                    )
                  }
                >
                  View Proposal Report
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Issues Report
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review programme issues requiring
                  attention or resolution.
                </p>

                <button
                  style={coordinatorUI.dangerButton}
                  onClick={() =>
                    alert(
                      `Open programme issues: ${openIssues}`
                    )
                  }
                >
                  View Issues Report
                </button>

              </div>


              <div style={coordinatorUI.actionCard}>

                <h4 style={coordinatorUI.actionTitle}>
                  Task Report
                </h4>

                <p style={coordinatorUI.actionText}>
                  Review outstanding programme coordination
                  activities.
                </p>

                <button
                  style={coordinatorUI.secondaryButton}
                  onClick={() =>
                    alert(
                      `Pending coordination tasks: ${pendingTasks}`
                    )
                  }
                >
                  View Task Report
                </button>

              </div>

            </div>

          </div>


          <div
            style={{
              ...coordinatorUI.infoBox,
              marginTop: '20px'
            }}
          >
            <strong>Reporting Note</strong>

            <p
              style={{
                marginBottom: 0,
                marginTop: '5px',
                lineHeight: 1.6
              }}
            >
              These report actions currently display the
              programme information available in the portal.
              They can later be connected to PDF generation,
              Excel export, printable reports or a centralized
              institutional reporting system.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

// ==========================================
// 6. INSTRUCTOR PORTAL - ENHANCED VERSION
// ==========================================

function InstructorPortal({
  currentUser,
  programmes,
  instructors,
  setInstructors,
  sessions,
  setSessions,
  gradeSubmissions,
  setGradeSubmissions,
  supportTickets,
  setSupportTickets,
  announcements,
  setAnnouncements,
  attendanceRecords,
  setAttendanceRecords,
  logAction
}) {

  // ==========================================
  // BASIC STATE
  // ==========================================

  const [activeInstTab, setActiveInstTab] =
    useState('dashboard');

  const [courseSearch, setCourseSearch] =
    useState('');

  const [selectedCourse, setSelectedCourse] =
    useState('');

  const [selectedSession, setSelectedSession] =
    useState('');

  const [selectedAssessmentCourse, setSelectedAssessmentCourse] =
    useState('');

  const [selectedAssessment, setSelectedAssessment] =
    useState('Quiz');

  const [attendanceDate, setAttendanceDate] =
    useState(
      new Date().toISOString().substring(0, 10)
    );


  // ==========================================
  // FIND CURRENT INSTRUCTOR
  // ==========================================

  const myProfile =
    instructors?.find(
      i =>
        i.name &&
        currentUser?.name &&
        i.name.toLowerCase() ===
          currentUser.name.toLowerCase()
    ) || instructors?.[0];


  // ==========================================
  // EXISTING PAYMENT FORM
  // ==========================================

  const [paymentForm, setPaymentForm] =
    useState({
      type:
        myProfile?.paymentMethod?.type ||
        'Mobile Money',

      provider:
        myProfile?.paymentMethod?.provider ||
        '',

      number:
        myProfile?.paymentMethod?.number ||
        ''
    });


  // ==========================================
  // SESSION CREATION FORM
  // ==========================================

  const [sessionForm, setSessionForm] =
    useState({
      course: '',
      topic: '',
      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      startTime: '',
      endTime: '',

      platform: 'Google Meet',

      link: '',

      instructions: ''
    });


  // ==========================================
  // ASSESSMENT / GRADE FORM
  // ==========================================

  const [assessmentForm, setAssessmentForm] =
    useState({
      course: '',
      title: '',
      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      notes: ''
    });


  // ==========================================
  // GRADE FORM
  // ==========================================

  const [gradeForm, setGradeForm] =
    useState({
      course: '',
      title: '',
      data: ''
    });


  // ==========================================
  // SUPPORT FORM
  // ==========================================

  const [ticketForm, setTicketForm] =
    useState({
      issueType: 'Technical',
      subject: ''
    });


  // ==========================================
  // ANNOUNCEMENT FORM
  // ==========================================

  const [announcementForm, setAnnouncementForm] =
    useState({
      target: 'All students',
      title: '',
      message: ''
    });


  // ==========================================
  // ACADEMIC CONCERN
  // ==========================================

  const [academicConcernForm, setAcademicConcernForm] =
    useState({
      student: '',
      course: '',
      concern: '',
      priority: 'Medium'
    });


  const [academicConcerns, setAcademicConcerns] =
    useState([]);


  // ==========================================
  // OFFICE HOURS
  // ==========================================

  const [officeHoursForm, setOfficeHoursForm] =
    useState({
      day: 'Monday',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    });


  const [officeHours, setOfficeHours] =
    useState([]);


  // ==========================================
  // COURSE PREPARATION
  // ==========================================

  const [courseChecklist, setCourseChecklist] =
    useState({
      courseOutline: false,
      learningObjectives: false,
      teachingMaterials: false,
      assessmentPlan: false,
      attendanceSetup: false,
      studentResources: false
    });


  // ==========================================
  // NEW ASSESSMENT SCORE STATE
  // ==========================================

  const [assessmentScores, setAssessmentScores] =
    useState({});


  // ==========================================
  // HELPER:
  // SAFE DATE
  // ==========================================

  const formatDate = value => {

    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  // ==========================================
  // HELPER:
  // SAFE TIME
  // ==========================================

  const formatTime = value => {

    if (!value) {
      return '—';
    }

    return value;
  };


  // ==========================================
  // HELPER:
  // GET STUDENTS FROM PROGRAMMES
  //
  // Handles several common data structures.
  // ==========================================

  const getAllStudents = () => {

    const students = [];

    (programmes || []).forEach(programme => {

      const possibleStudents =
        programme.students ||
        programme.learners ||
        programme.enrolledStudents ||
        [];

      if (Array.isArray(possibleStudents)) {

        possibleStudents.forEach(student => {

          if (
            typeof student === 'string'
          ) {

            students.push({
              id: student,
              name: student,
              country: ''
            });

          } else {

            students.push({
              id:
                student.id ||
                student.studentId ||
                student.email ||
                student.name,

              name:
                student.name ||
                student.fullName ||
                student.studentName ||
                'Unnamed Student',

              country:
                student.country ||
                student.nationality ||
                ''
            });

          }

        });

      }

    });


    // Remove duplicates

    return students.filter(
      (student, index, array) =>
        index ===
        array.findIndex(
          s =>
            String(s.id) ===
            String(student.id)
        )
    );
  };


  const students = getAllStudents();


  // ==========================================
  // COURSE LIST
  // ==========================================

  const courseList = useMemo(() => {

    const courses = [];

    // Courses from sessions

    (sessions || []).forEach(session => {

      if (session.course) {
        courses.push(session.course);
      }

    });


    // Courses from programmes

    (programmes || []).forEach(programme => {

      const possibleCourses =
        programme.courses ||
        programme.subjects ||
        programme.courseList ||
        [];

      if (Array.isArray(possibleCourses)) {

        possibleCourses.forEach(course => {

          if (typeof course === 'string') {
            courses.push(course);
          } else if (course?.name) {
            courses.push(course.name);
          } else if (course?.title) {
            courses.push(course.title);
          }

        });

      }

    });


    // Existing grade submissions

    (gradeSubmissions || []).forEach(item => {

      if (item.course) {
        courses.push(item.course);
      }

    });


    // Fallback

    if (courses.length === 0) {

      courses.push(
        'Hadith Studies',
        'Quran Studies',
        'Islamic Jurisprudence',
        'Arabic Language'
      );

    }


    return [
      ...new Set(
        courses.filter(Boolean)
      )
    ];

  }, [
    programmes,
    sessions,
    gradeSubmissions
  ]);


  // ==========================================
  // SET DEFAULT COURSE
  // ==========================================

  const effectiveCourse =
    selectedCourse ||
    courseList[0] ||
    '';


  // ==========================================
  // MY RECORDS
  // ==========================================

  const myGradeSubmissions =
    (gradeSubmissions || []).filter(
      submission =>
        submission.instructor ===
        myProfile?.name
    );


  const mySupportTickets =
    (supportTickets || []).filter(
      ticket =>
        ticket.instructor ===
        myProfile?.name
    );


  const myAnnouncements =
    (announcements || []).filter(
      announcement =>
        announcement.instructor ===
        myProfile?.name
    );


  const mySessions =
    (sessions || []).filter(
      session =>
        !session.instructor ||
        session.instructor ===
          myProfile?.name
    );


  // ==========================================
  // STATISTICS
  // ==========================================

  const openAcademicConcerns =
    academicConcerns.filter(
      item =>
        item.status === 'Open'
    ).length;


  const pendingGradeReviews =
    myGradeSubmissions.filter(
      item =>
        item.status ===
        'Pending Review'
    ).length;


  const openSupportTickets =
    mySupportTickets.filter(
      item =>
        item.status === 'Open'
    ).length;


  const completedChecklistItems =
    Object.values(courseChecklist)
      .filter(Boolean)
      .length;


  const totalChecklistItems =
    Object.keys(courseChecklist).length;


  const checklistPercentage =
    totalChecklistItems > 0
      ? Math.round(
          (
            completedChecklistItems /
            totalChecklistItems
          ) * 100
        )
      : 0;


  // ==========================================
  // ATTENDANCE FOR SELECTED SESSION
  // ==========================================

  const selectedSessionObject =
    mySessions.find(
      session =>
        String(session.id) ===
        String(selectedSession)
    );


  const selectedAttendanceCourse =
    selectedSessionObject?.course ||
    effectiveCourse;


  const attendanceStudents =
    students.length > 0
      ? students
      : (attendanceRecords || [])
          .filter(
            record =>
              !selectedAttendanceCourse ||
              record.course ===
                selectedAttendanceCourse
          )
          .map(record => ({
            id:
              record.studentId ||
              record.studentName,

            name:
              record.studentName ||
              record.student ||
              record.name ||
              'Student',

            country:
              record.country ||
              record.nationality ||
              ''
          }));


  // ==========================================
  // ATTENDANCE STATUS HELPER
  // ==========================================

  const getAttendanceStatus = (
    student,
    course,
    date
  ) => {

    const record =
      (attendanceRecords || []).find(
        item =>
          String(
            item.studentId ||
            item.studentName ||
            item.student
          ) ===
            String(
              student.id ||
              student.name
            ) &&
          item.course === course &&
          item.date === date
      );


    return (
      record?.status ||
      record?.attendance ||
      ''
    );
  };


  // ==========================================
  // SAVE ATTENDANCE
  // ==========================================

  const markAttendance = (
    student,
    status
  ) => {

    const studentId =
      student.id ||
      student.name;

    const existingIndex =
      (attendanceRecords || []).findIndex(
        item =>
          String(
            item.studentId ||
            item.studentName ||
            item.student
          ) ===
            String(studentId) &&
          item.course ===
            selectedAttendanceCourse &&
          item.date ===
            attendanceDate
      );


    const newRecord = {
      id:
        existingIndex >= 0
          ? attendanceRecords[
              existingIndex
            ].id
          : `attendance-${Date.now()}-${studentId}`,

      studentId,

      studentName:
        student.name,

      country:
        student.country || '',

      course:
        selectedAttendanceCourse,

      date:
        attendanceDate,

      status,

      instructor:
        myProfile?.name,

      sessionId:
        selectedSessionObject?.id || ''
    };


    if (existingIndex >= 0) {

      const updated = [
        ...(attendanceRecords || [])
      ];

      updated[existingIndex] =
        newRecord;

      setAttendanceRecords(updated);

    } else {

      setAttendanceRecords([
        newRecord,
        ...(attendanceRecords || [])
      ]);

    }
  };


  // ==========================================
  // SAVE ENTIRE ATTENDANCE SHEET
  // ==========================================

  const saveAttendanceSheet = () => {

    logAction(
      myProfile.name,
      `Updated attendance for ${selectedAttendanceCourse} on ${attendanceDate}`
    );

    alert(
      'Attendance saved successfully.'
    );
  };


  // ==========================================
  // UPDATE PAYMENT
  // ==========================================

  const handleUpdatePayment = e => {

    e.preventDefault();

    setInstructors(
      instructors.map(inst => {

        if (
          inst.id ===
          myProfile.id
        ) {

          return {
            ...inst,

            paymentMethod: {
              ...paymentForm
            }
          };

        }

        return inst;

      })
    );


    logAction(
      myProfile.name,
      'Updated receiving payment account/card details'
    );


    alert(
      'Payment receiving account details updated successfully!'
    );
  };


  // ==========================================
  // CREATE LIVE SESSION
  // ==========================================

  const handleCreateSession = e => {

    e.preventDefault();


    if (
      !sessionForm.course ||
      !sessionForm.topic ||
      !sessionForm.date ||
      !sessionForm.startTime ||
      !sessionForm.endTime
    ) {

      alert(
        'Please complete the course, topic, date and time.'
      );

      return;
    }


    const newSession = {

      id:
        `session-${Date.now()}`,

      course:
        sessionForm.course,

      topic:
        sessionForm.topic,

      date:
        sessionForm.date,

      startTime:
        sessionForm.startTime,

      endTime:
        sessionForm.endTime,

      platform:
        sessionForm.platform,

      link:
        sessionForm.link,

      instructions:
        sessionForm.instructions,

      instructor:
        myProfile.name,

      instructorId:
        myProfile.id,

      status:
        'Scheduled',

      createdAt:
        new Date().toISOString()
    };


    setSessions([
      newSession,
      ...(sessions || [])
    ]);


    logAction(
      myProfile.name,
      `Created teaching session for ${sessionForm.course}`
    );


    alert(
      'Teaching session created successfully. Students can now see and join the session.'
    );


    setSessionForm({
      course:
        sessionForm.course,

      topic: '',

      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      startTime: '',
      endTime: '',

      platform:
        'Google Meet',

      link: '',

      instructions: ''
    });
  };


  // ==========================================
  // DELETE / CANCEL SESSION
  // ==========================================

  const cancelSession = id => {

    setSessions(
      (sessions || []).map(
        session =>
          session.id === id
            ? {
                ...session,
                status: 'Cancelled'
              }
            : session
      )
    );


    logAction(
      myProfile.name,
      'Cancelled teaching session'
    );
  };


  // ==========================================
  // SUBMIT ASSESSMENT RESULTS
  // ==========================================

  const handleSubmitAssessment = e => {

    e.preventDefault();


    const scoreEntries =
      Object.entries(
        assessmentScores
      );


    if (
      !assessmentForm.course ||
      !assessmentForm.title
    ) {

      alert(
        'Please select a course and enter an assessment title.'
      );

      return;
    }


    const newSubmission = {

      id:
        `grade-${Date.now()}`,

      instructor:
        myProfile.name,

      course:
        assessmentForm.course,

      title:
        assessmentForm.title,

      assessmentDate:
        assessmentForm.date,

      scores:
        assessmentScores,

      data:
        JSON.stringify(
          assessmentScores
        ),

      notes:
        assessmentForm.notes,

      submissionDate:
        new Date()
          .toISOString()
          .substring(0, 10),

      status:
        'Pending Review',

      comments:
        '',

      totalStudents:
        scoreEntries.length
    };


    setGradeSubmissions([
      newSubmission,
      ...(gradeSubmissions || [])
    ]);


    logAction(
      myProfile.name,
      `Submitted assessment results for ${assessmentForm.course}`
    );


    alert(
      'Assessment results submitted successfully for administrative review.'
    );


    setAssessmentForm({
      course: '',
      title: '',
      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      notes: ''
    });


    setAssessmentScores({});
  };


  // ==========================================
  // UPDATE INDIVIDUAL SCORE
  // ==========================================

  const updateAssessmentScore = (
    studentId,
    score
  ) => {

    setAssessmentScores(
      previous => ({
        ...previous,
        [studentId]:
          score
      })
    );
  };


  // ==========================================
  // OLD GRADE SUBMISSION SUPPORT
  // ==========================================

  const handleSubmitGrades = e => {

    e.preventDefault();


    const newSub = {

      id:
        `grade-${Date.now()}`,

      course:
        gradeForm.course,

      title:
        gradeForm.title,

      data:
        gradeForm.data,

      instructor:
        myProfile.name,

      assessmentDate:
        new Date()
          .toISOString()
          .substring(0, 10),

      submissionDate:
        new Date()
          .toISOString()
          .substring(0, 10),

      status:
        'Pending Review',

      comments:
        ''
    };


    setGradeSubmissions([
      newSub,
      ...(gradeSubmissions || [])
    ]);


    logAction(
      myProfile.name,
      `Submitted grades for ${gradeForm.course} - ${gradeForm.title}`
    );


    alert(
      'Grades submitted successfully to administration for approval!'
    );


    setGradeForm({
      course:
        courseList[0] || '',

      title: '',

      data: ''
    });
  };


  // ==========================================
  // SUPPORT TICKET
  // ==========================================

  const handleCreateTicket = e => {

    e.preventDefault();


    const newT = {

      id:
        `t-${Date.now()}`,

      instructor:
        myProfile.name,

      ...ticketForm,

      status:
        'Open',

      date:
        new Date()
          .toISOString()
          .substring(0, 10)
    };


    setSupportTickets([
      newT,
      ...(supportTickets || [])
    ]);


    logAction(
      myProfile.name,
      'Submitted support ticket'
    );


    alert(
      'Support ticket submitted to administration!'
    );


    setTicketForm({
      issueType:
        'Technical',

      subject: ''
    });
  };


  // ==========================================
  // ANNOUNCEMENT
  // ==========================================

  const handlePostAnnouncement = e => {

    e.preventDefault();


    const newAnn = {

      id:
        `ann-${Date.now()}`,

      ...announcementForm,

      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      instructor:
        myProfile.name
    };


    setAnnouncements([
      newAnn,
      ...(announcements || [])
    ]);


    logAction(
      myProfile.name,
      'Posted student announcement'
    );


    alert(
      'Announcement posted successfully!'
    );


    setAnnouncementForm({
      target:
        'All students',

      title: '',

      message: ''
    });
  };


  // ==========================================
  // ACADEMIC CONCERN
  // ==========================================

  const handleAcademicConcern = e => {

    e.preventDefault();


    if (
      !academicConcernForm.student.trim() ||
      !academicConcernForm.course.trim() ||
      !academicConcernForm.concern.trim()
    ) {

      return;
    }


    const newConcern = {

      id:
        `concern-${Date.now()}`,

      instructor:
        myProfile.name,

      student:
        academicConcernForm.student.trim(),

      course:
        academicConcernForm.course.trim(),

      concern:
        academicConcernForm.concern.trim(),

      priority:
        academicConcernForm.priority,

      status:
        'Open',

      date:
        new Date()
          .toISOString()
          .substring(0, 10)
    };


    setAcademicConcerns([
      newConcern,
      ...academicConcerns
    ]);


    logAction(
      myProfile.name,
      `Reported academic concern for student ${academicConcernForm.student}`
    );


    alert(
      'Academic concern submitted successfully.'
    );


    setAcademicConcernForm({
      student: '',
      course: '',
      concern: '',
      priority: 'Medium'
    });
  };


  // ==========================================
  // OFFICE HOURS
  // ==========================================

  const handleAddOfficeHours = e => {

    e.preventDefault();


    const newOfficeHour = {

      id:
        `office-${Date.now()}`,

      instructor:
        myProfile.name,

      ...officeHoursForm
    };


    setOfficeHours([
      newOfficeHour,
      ...officeHours
    ]);


    logAction(
      myProfile.name,
      `Added office hours for ${officeHoursForm.day}`
    );


    alert(
      'Office / consultation hours added successfully.'
    );


    setOfficeHoursForm({
      day: 'Monday',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    });
  };


  const removeOfficeHours = id => {

    setOfficeHours(
      officeHours.filter(
        item =>
          item.id !== id
      )
    );


    logAction(
      myProfile.name,
      'Removed office / consultation hours'
    );
  };


  // ==========================================
  // CHECKLIST
  // ==========================================

  const toggleCourseChecklist = item => {

    setCourseChecklist(
      previous => ({
        ...previous,
        [item]:
          !previous[item]
      })
    );


    logAction(
      myProfile.name,
      `Updated course preparation checklist: ${item}`
    );
  };


  // ==========================================
  // FILTER CLASSES
  // ==========================================

  const filteredSessions =
    mySessions.filter(session => {

      const search =
        courseSearch.toLowerCase();

      return (

        String(
          session.course || ''
        )
          .toLowerCase()
          .includes(search)

        ||

        String(
          session.topic || ''
        )
          .toLowerCase()
          .includes(search)

        ||

        String(
          session.platform || ''
        )
          .toLowerCase()
          .includes(search)

      );

    });


  // ==========================================
  // SAFETY CHECK
  // ==========================================

  if (!myProfile) {

    return (

      <div
        style={{
          padding: '40px',
          background: '#f8fafc',
          minHeight: '100vh'
        }}
      >

        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            background: '#fff',
            padding: '35px',
            borderRadius: '18px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,.08)'
          }}
        >

          <h2>
            Instructor Portal
          </h2>

          <p>
            Your instructor profile could not
            be found in the system.
          </p>

          <p>
            Please contact the Administrator
            to have your instructor account
            assigned correctly.
          </p>

        </div>

      </div>

    );
  }


  // ==========================================
  // UI HELPERS
  // ==========================================

  const pageStyle = {

    minHeight: '100vh',

    background:
      'linear-gradient(135deg,#f8fafc 0%,#eef4f8 100%)',

    padding: '25px',

    color: '#1f2937'
  };


  const cardStyle = {

    background: '#ffffff',

    borderRadius: '16px',

    padding: '22px',

    border:
      '1px solid #e5e7eb',

    boxShadow:
      '0 8px 25px rgba(15,23,42,.06)'
  };


  const buttonStyle = {

    border: 'none',

    borderRadius: '9px',

    padding:
      '10px 16px',

    cursor: 'pointer',

    fontWeight: '700'
  };


  const inputStyle = {

    width: '100%',

    boxSizing: 'border-box',

    padding:
      '11px 13px',

    border:
      '1px solid #d1d5db',

    borderRadius: '9px',

    background: '#fff',

    fontSize: '14px'
  };


  const labelStyle = {

    display: 'block',

    fontWeight: '700',

    marginBottom: '7px',

    color: '#374151'
  };


  const sectionTitle = {

    fontSize: '21px',

    margin:
      '0 0 6px 0',

    color: '#111827'
  };


  const muted = {

    color: '#6b7280',

    fontSize: '14px'
  };


  const statusBadge = status => {

    const colors = {

      Present:
        ['#dcfce7', '#166534'],

      Late:
        ['#fef3c7', '#92400e'],

      Absent:
        ['#fee2e2', '#991b1b'],

      Scheduled:
        ['#dbeafe', '#1d4ed8'],

      Cancelled:
        ['#fee2e2', '#991b1b'],

      'Pending Review':
        ['#fef3c7', '#92400e'],

      Approved:
        ['#dcfce7', '#166534'],

      Open:
        ['#fee2e2', '#991b1b']
    };


    const pair =
      colors[status] ||
      ['#f3f4f6', '#374151'];


    return {

      display: 'inline-block',

      padding:
        '5px 10px',

      borderRadius:
        '999px',

      background:
        pair[0],

      color:
        pair[1],

      fontSize:
        '12px',

      fontWeight:
        '800'
    };
  };


  // ==========================================
  // PORTAL
  // ==========================================

  return (

    <div style={pageStyle}>

      {/* ======================================
          HERO HEADER
      ====================================== */}

      <div
        style={{
          ...cardStyle,

          background:
            'linear-gradient(135deg,#172554,#1e3a8a)',

          color: '#fff',

          marginBottom: '20px',

          padding: '28px'
        }}
      >

        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            gap: '20px',

            flexWrap:
              'wrap'
          }}
        >

          <div>

            <div
              style={{
                fontSize: '13px',
                opacity: .8,
                marginBottom: '7px',
                letterSpacing: '.5px'
              }}
            >
              INSTRUCTOR WORKSPACE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '30px'
              }}
            >
              Welcome, {myProfile.name}
            </h1>

            <p
              style={{
                margin:
                  '8px 0 0',
                opacity: .85
              }}
            >
              Manage courses, live classes,
              attendance, assessments, students
              and academic responsibilities.
            </p>

          </div>


          <div
            style={{
              background:
                'rgba(255,255,255,.12)',

              padding:
                '15px 20px',

              borderRadius:
                '12px',

              border:
                '1px solid rgba(255,255,255,.18)'
            }}
          >

            <div
              style={{
                fontSize: '12px',
                opacity: .75
              }}
            >
              ROLE
            </div>

            <strong>
              Instructor
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================
          DASHBOARD METRICS
      ====================================== */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(190px,1fr))',

          gap: '15px',

          marginBottom: '20px'
        }}
      >

        {[
          [
            'My Classes',
            mySessions.length,
            '#2563eb'
          ],

          [
            'Pending Grades',
            pendingGradeReviews,
            '#d97706'
          ],

          [
            'Support Tickets',
            openSupportTickets,
            '#dc2626'
          ],

          [
            'Academic Concerns',
            openAcademicConcerns,
            '#7c3aed'
          ]
        ].map(
          ([label, value, color]) => (

            <div
              key={label}
              style={{
                ...cardStyle,
                borderTop:
                  `4px solid ${color}`
              }}
            >

              <div
                style={{
                  ...muted,
                  marginBottom: '8px'
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: '29px',
                  fontWeight: '800',
                  color
                }}
              >
                {value}
              </div>

            </div>

          )
        )}

      </div>


      {/* ======================================
          NAVIGATION
      ====================================== */}

      <div
        style={{
          ...cardStyle,

          padding: '10px',

          marginBottom: '20px',

          display: 'flex',

          gap: '7px',

          overflowX: 'auto'
        }}
      >

        {[
          ['dashboard', 'Dashboard'],
          ['classes', 'My Classes'],
          ['sessions', 'Live Sessions'],
          ['attendance', 'Attendance'],
          ['assessments', 'Assessments & Grades'],
          ['finance', 'Finance'],
          ['announcements', 'Communication'],
          ['academic', 'Student Support'],
          ['preparation', 'Course Preparation'],
          ['officeHours', 'Office Hours'],
          ['records', 'My Records'],
          ['profile', 'My Profile']
        ].map(
          ([key, label]) => (

            <button
              key={key}
              onClick={() =>
                setActiveInstTab(key)
              }
              style={{
                border: 'none',

                background:
                  activeInstTab === key
                    ? '#1e3a8a'
                    : '#f3f4f6',

                color:
                  activeInstTab === key
                    ? '#fff'
                    : '#374151',

                padding:
                  '10px 14px',

                borderRadius:
                  '9px',

                cursor:
                  'pointer',

                fontWeight:
                  activeInstTab === key
                    ? '800'
                    : '600',

                whiteSpace:
                  'nowrap'
              }}
            >
              {label}
            </button>

          )
        )}

      </div>


      {/* ======================================
          DASHBOARD
      ====================================== */}

      {activeInstTab === 'dashboard' && (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(320px,1fr))',
            gap: '20px'
          }}
        >

          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Today's Teaching Overview
            </h3>

            <p style={muted}>
              Quick access to your upcoming
              classes and teaching activities.
            </p>


            {mySessions
              .slice(0, 5)
              .map(session => (

                <div
                  key={session.id}
                  style={{
                    padding: '14px 0',
                    borderBottom:
                      '1px solid #eef0f2'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '10px'
                    }}
                  >

                    <strong>
                      {session.course}
                    </strong>

                    <span
                      style={statusBadge(
                        session.status ||
                          'Scheduled'
                      )}
                    >
                      {session.status ||
                        'Scheduled'}
                    </span>

                  </div>

                  <div
                    style={{
                      marginTop: '5px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}
                  >
                    {session.topic}
                  </div>

                  <div
                    style={{
                      marginTop: '5px',
                      fontSize: '13px'
                    }}
                  >
                    {formatDate(session.date)}
                    {' • '}
                    {formatTime(
                      session.startTime
                    )}
                    {' - '}
                    {formatTime(
                      session.endTime
                    )}
                  </div>

                </div>

              ))}


            {mySessions.length === 0 && (

              <p style={muted}>
                No teaching sessions have been
                assigned yet.
              </p>

            )}

          </div>


          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Instructor Action Centre
            </h3>

            <p style={muted}>
              Common actions you may need during
              the teaching week.
            </p>


            {[
              [
                'Create Live Session',
                'Schedule a class students can join.',
                'sessions'
              ],

              [
                'Take Attendance',
                'Mark students Present, Late or Absent.',
                'attendance'
              ],

              [
                'Enter Assessment Marks',
                'Record Quiz, Assignment, Midterm and Final scores.',
                'assessments'
              ],

              [
                'Post Announcement',
                'Send an academic message to students.',
                'announcements'
              ]
            ].map(
              ([title, description, tab]) => (

                <button
                  key={tab}
                  onClick={() =>
                    setActiveInstTab(tab)
                  }
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: '#f8fafc',
                    border:
                      '1px solid #e5e7eb',
                    padding: '14px',
                    borderRadius: '10px',
                    marginBottom: '9px',
                    cursor: 'pointer'
                  }}
                >

                  <strong>
                    {title}
                  </strong>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}
                  >
                    {description}
                  </div>

                </button>

              )
            )}

          </div>

        </div>

      )}


      {/* ======================================
          MY CLASSES
      ====================================== */}

      {activeInstTab === 'classes' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            My Courses & Teaching Schedule
          </h3>

          <p style={muted}>
            Select a course to work with its
            attendance, assessments and sessions.
          </p>


          {/* COURSE SELECTOR */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(250px,1fr))',
              gap: '15px',
              margin:
                '20px 0'
            }}
          >

            <div>

              <label style={labelStyle}>
                Select Course
              </label>

              <select
                style={inputStyle}
                value={effectiveCourse}
                onChange={e =>
                  setSelectedCourse(
                    e.target.value
                  )
                }
              >

                {courseList.map(course => (

                  <option
                    key={course}
                    value={course}
                  >
                    {course}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label style={labelStyle}>
                Search Schedule
              </label>

              <input
                style={inputStyle}
                value={courseSearch}
                onChange={e =>
                  setCourseSearch(
                    e.target.value
                  )
                }
                placeholder="Search course, topic or platform..."
              />

            </div>

          </div>


          <div
            style={{
              overflowX: 'auto'
            }}
          >

            <table
              style={{
                ...styles.table,
                width: '100%',
                minWidth: '850px'
              }}
            >

              <thead>

                <tr>

                  <th>
                    Course
                  </th>

                  <th>
                    Topic
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    Platform
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredSessions.map(
                  session => (

                    <tr key={session.id}>

                      <td>
                        <strong>
                          {session.course ||
                            '—'}
                        </strong>
                      </td>

                      <td>
                        {session.topic ||
                          '—'}
                      </td>

                      <td>
                        {formatDate(
                          session.date
                        )}
                      </td>

                      <td>
                        {formatTime(
                          session.startTime
                        )}
                        {' - '}
                        {formatTime(
                          session.endTime
                        )}
                      </td>

                      <td>
                        {session.platform ||
                          '—'}
                      </td>

                      <td>

                        <span
                          style={statusBadge(
                            session.status ||
                              'Scheduled'
                          )}
                        >
                          {session.status ||
                            'Scheduled'}
                        </span>

                      </td>

                      <td>

                        {session.link ? (

                          <a
                            href={
                              session.link
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color:
                                '#2563eb',
                              fontWeight:
                                '800'
                            }}
                          >
                            Launch
                          </a>

                        ) : (

                          <span style={muted}>
                            No link
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}


                {filteredSessions.length === 0 && (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '30px'
                      }}
                    >
                      No classes found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ======================================
          CREATE LIVE SESSIONS
      ====================================== */}

      {activeInstTab === 'sessions' && (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(320px,400px) 1fr',
            gap: '20px'
          }}
        >

          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Create Teaching Session
            </h3>

            <p style={muted}>
              Create a live or virtual class that
              students can see and join.
            </p>


            <form
              onSubmit={
                handleCreateSession
              }
            >

              <div style={{ marginBottom: '14px' }}>

                <label style={labelStyle}>
                  Course
                </label>

                <select
                  style={inputStyle}
                  value={
                    sessionForm.course
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      course:
                        e.target.value
                    })
                  }
                  required
                >

                  <option value="">
                    Select course
                  </option>

                  {courseList.map(
                    course => (

                      <option
                        key={course}
                        value={course}
                      >
                        {course}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div style={{ marginBottom: '14px' }}>

                <label style={labelStyle}>
                  Session Topic
                </label>

                <input
                  style={inputStyle}
                  value={
                    sessionForm.topic
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      topic:
                        e.target.value
                    })
                  }
                  placeholder="e.g. Introduction to Hadith Classification"
                  required
                />

              </div>


              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '10px'
                }}
              >

                <div>

                  <label style={labelStyle}>
                    Date
                  </label>

                  <input
                    style={inputStyle}
                    type="date"
                    value={
                      sessionForm.date
                    }
                    onChange={e =>
                      setSessionForm({
                        ...sessionForm,
                        date:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div>

                  <label style={labelStyle}>
                    Start Time
                  </label>

                  <input
                    style={inputStyle}
                    type="time"
                    value={
                      sessionForm.startTime
                    }
                    onChange={e =>
                      setSessionForm({
                        ...sessionForm,
                        startTime:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>


              <div
                style={{
                  marginTop: '14px'
                }}
              >

                <label style={labelStyle}>
                  End Time
                </label>

                <input
                  style={inputStyle}
                  type="time"
                  value={
                    sessionForm.endTime
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      endTime:
                        e.target.value
                    })
                  }
                  required
                />

              </div>


              <div
                style={{
                  marginTop: '14px'
                }}
              >

                <label style={labelStyle}>
                  Platform
                </label>

                <select
                  style={inputStyle}
                  value={
                    sessionForm.platform
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      platform:
                        e.target.value
                    })
                  }
                >

                  <option>
                    Google Meet
                  </option>

                  <option>
                    Zoom
                  </option>

                  <option>
                    Microsoft Teams
                  </option>

                  <option>
                    Other
                  </option>

                </select>

              </div>


              <div
                style={{
                  marginTop: '14px'
                }}
              >

                <label style={labelStyle}>
                  Student Join Link
                </label>

                <input
                  style={inputStyle}
                  type="url"
                  value={
                    sessionForm.link
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      link:
                        e.target.value
                    })
                  }
                  placeholder="https://meet.google.com/..."
                />

              </div>


              <div
                style={{
                  marginTop: '14px'
                }}
              >

                <label style={labelStyle}>
                  Instructions for Students
                </label>

                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: '90px',
                    resize: 'vertical'
                  }}
                  value={
                    sessionForm.instructions
                  }
                  onChange={e =>
                    setSessionForm({
                      ...sessionForm,
                      instructions:
                        e.target.value
                    })
                  }
                  placeholder="Tell students what they should prepare before joining..."
                />

              </div>


              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  width: '100%',
                  marginTop: '16px',
                  background:
                    '#1e3a8a',
                  color: '#fff'
                }}
              >
                + Create Student Session
              </button>

            </form>

          </div>


          <div style={cardStyle}>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom:
                  '15px'
              }}
            >

              <div>

                <h3 style={sectionTitle}>
                  Scheduled Sessions
                </h3>

                <p style={muted}>
                  Students will be able to see
                  these sessions and use the
                  join link.
                </p>

              </div>

            </div>


            {mySessions.map(session => (

              <div
                key={session.id}
                style={{
                  padding: '17px',
                  border:
                    '1px solid #e5e7eb',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  background:
                    '#fafafa'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: '15px',
                    flexWrap:
                      'wrap'
                  }}
                >

                  <div>

                    <strong
                      style={{
                        fontSize:
                          '17px'
                      }}
                    >
                      {session.course}
                    </strong>

                    <div
                      style={{
                        marginTop:
                          '4px'
                      }}
                    >
                      {session.topic}
                    </div>

                  </div>


                  <span
                    style={statusBadge(
                      session.status ||
                        'Scheduled'
                    )}
                  >
                    {session.status ||
                      'Scheduled'}
                  </span>

                </div>


                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(150px,1fr))',
                    gap: '10px',
                    marginTop:
                      '15px',
                    fontSize:
                      '13px'
                  }}
                >

                  <div>

                    <strong>
                      Date
                    </strong>

                    <br />

                    {formatDate(
                      session.date
                    )}

                  </div>


                  <div>

                    <strong>
                      Time
                    </strong>

                    <br />

                    {session.startTime}
                    {' - '}
                    {session.endTime}

                  </div>


                  <div>

                    <strong>
                      Platform
                    </strong>

                    <br />

                    {session.platform ||
                      '—'}

                  </div>

                </div>


                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '15px',
                    flexWrap: 'wrap'
                  }}
                >

                  {session.link && (

                    <a
                      href={
                        session.link
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        ...buttonStyle,
                        background:
                          '#2563eb',
                        color: '#fff',
                        textDecoration:
                          'none'
                      }}
                    >
                      Launch / Test Class
                    </a>

                  )}


                  {session.status !==
                    'Cancelled' && (

                    <button
                      type="button"
                      onClick={() =>
                        cancelSession(
                          session.id
                        )
                      }
                      style={{
                        ...buttonStyle,
                        background:
                          '#fee2e2',
                        color:
                          '#991b1b'
                      }}
                    >
                      Cancel Session
                    </button>

                  )}

                </div>

              </div>

            ))}


            {mySessions.length === 0 && (

              <div
                style={{
                  padding: '35px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}
              >
                No sessions have been created yet.
              </div>

            )}

          </div>

        </div>

      )}


      {/* ======================================
          ATTENDANCE
      ====================================== */}

      {activeInstTab === 'attendance' && (

        <div style={cardStyle}>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              gap: '15px',
              flexWrap:
                'wrap'
            }}
          >

            <div>

              <h3 style={sectionTitle}>
                Attendance Register
              </h3>

              <p style={muted}>
                Mark each student as Present,
                Late or Absent.
              </p>

            </div>


            <button
              type="button"
              onClick={
                saveAttendanceSheet
              }
              style={{
                ...buttonStyle,
                background:
                  '#16a34a',
                color: '#fff'
              }}
            >
              Save Attendance
            </button>

          </div>


          {/* ATTENDANCE CONTROLS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(220px,1fr))',
              gap: '15px',
              margin:
                '20px 0'
            }}
          >

            <div>

              <label style={labelStyle}>
                Course / Class
              </label>

              <select
                style={inputStyle}
                value={
                  selectedSession
                }
                onChange={e =>
                  setSelectedSession(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select session
                </option>

                {mySessions.map(
                  session => (

                    <option
                      key={session.id}
                      value={session.id}
                    >
                      {session.course}
                      {' — '}
                      {formatDate(
                        session.date
                      )}
                      {' '}
                      {session.startTime}
                    </option>

                  )
                )}

              </select>

            </div>


            <div>

              <label style={labelStyle}>
                Attendance Date
              </label>

              <input
                style={inputStyle}
                type="date"
                value={
                  attendanceDate
                }
                onChange={e =>
                  setAttendanceDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          <div
            style={{
              overflowX: 'auto'
            }}
          >

            <table
              style={{
                ...styles.table,
                width: '100%',
                minWidth: '850px'
              }}
            >

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Student Name
                  </th>

                  <th>
                    Country
                  </th>

                  <th>
                    Present
                  </th>

                  <th>
                    Late
                  </th>

                  <th>
                    Absent
                  </th>

                  <th>
                    Current Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {attendanceStudents.map(
                  (student, index) => {

                    const currentStatus =
                      getAttendanceStatus(
                        student,
                        selectedAttendanceCourse,
                        attendanceDate
                      );


                    return (

                      <tr
                        key={
                          student.id ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {student.name}
                          </strong>
                        </td>

                        <td>
                          {student.country ||
                            '—'}
                        </td>


                        <td
                          style={{
                            textAlign:
                              'center'
                          }}
                        >

                          <input
                            type="radio"
                            name={
                              `attendance-${student.id}`
                            }
                            checked={
                              currentStatus ===
                              'Present'
                            }
                            onChange={() =>
                              markAttendance(
                                student,
                                'Present'
                              )
                            }
                          />

                        </td>


                        <td
                          style={{
                            textAlign:
                              'center'
                          }}
                        >

                          <input
                            type="radio"
                            name={
                              `attendance-${student.id}`
                            }
                            checked={
                              currentStatus ===
                              'Late'
                            }
                            onChange={() =>
                              markAttendance(
                                student,
                                'Late'
                              )
                            }
                          />

                        </td>


                        <td
                          style={{
                            textAlign:
                              'center'
                          }}
                        >

                          <input
                            type="radio"
                            name={
                              `attendance-${student.id}`
                            }
                            checked={
                              currentStatus ===
                              'Absent'
                            }
                            onChange={() =>
                              markAttendance(
                                student,
                                'Absent'
                              )
                            }
                          />

                        </td>


                        <td>

                          {currentStatus ? (

                            <span
                              style={statusBadge(
                                currentStatus
                              )}
                            >
                              {currentStatus}
                            </span>

                          ) : (

                            <span
                              style={{
                                color:
                                  '#9ca3af'
                              }}
                            >
                              Not marked
                            </span>

                          )}

                        </td>

                      </tr>

                    );

                  }
                )}


                {attendanceStudents.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign:
                          'center',
                        padding:
                          '35px'
                      }}
                    >
                      No student records are
                      available for attendance.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              background:
                '#eff6ff',
              borderLeft:
                '4px solid #2563eb',
              borderRadius:
                '7px'
            }}
          >

            <strong>
              Attendance Note
            </strong>

            <p
              style={{
                marginBottom: 0
              }}
            >
              Attendance should be recorded immediately
              after each class. Use <strong>Present</strong>
              for students who attended normally,
              <strong> Late</strong> for students who
              arrived after the agreed start time, and
              <strong> Absent</strong> for students who
              did not attend.
            </p>

          </div>

        </div>

      )}


      {/* ======================================
          ASSESSMENTS & GRADES
      ====================================== */}

      {activeInstTab === 'assessments' && (

        <div>

          {/* ASSESSMENT HEADER */}

          <div
            style={{
              ...cardStyle,
              marginBottom: '20px'
            }}
          >

            <h3 style={sectionTitle}>
              Assessments & Grades
            </h3>

            <p style={muted}>
              Enter student marks using the approved
              assessment structure:
              Quiz (15), Assignment (15),
              Midterm (20), Final (50).
            </p>


            {/* ASSESSMENT STRUCTURE */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4,1fr)',
                gap: '10px',
                marginTop: '18px'
              }}
            >

              {[
                ['Quiz', 15],
                ['Assignment', 15],
                ['Midterm', 20],
                ['Final', 50]
              ].map(
                ([name, mark]) => (

                  <div
                    key={name}
                    style={{
                      padding: '15px',
                      borderRadius:
                        '10px',
                      background:
                        '#f8fafc',
                      border:
                        '1px solid #e5e7eb',
                      textAlign:
                        'center'
                    }}
                  >

                    <strong>
                      {name}
                    </strong>

                    <div
                      style={{
                        fontSize:
                          '12px',
                        color:
                          '#6b7280',
                        marginTop:
                          '4px'
                      }}
                    >
                      Maximum: {mark}
                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* ENTER SCORES */}

          <div style={cardStyle}>

            <h4
              style={{
                marginTop: 0,
                fontSize:
                  '18px'
              }}
            >
              Enter Student Scores
            </h4>


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(220px,1fr))',
                gap: '15px',
                marginBottom:
                  '20px'
              }}
            >

              <div>

                <label style={labelStyle}>
                  Course
                </label>

                <select
                  style={inputStyle}
                  value={
                    assessmentForm.course
                  }
                  onChange={e =>
                    setAssessmentForm({
                      ...assessmentForm,
                      course:
                        e.target.value
                    })
                  }
                >

                  <option value="">
                    Select course
                  </option>

                  {courseList.map(
                    course => (

                      <option
                        key={course}
                        value={course}
                      >
                        {course}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Assessment
                </label>

                <select
                  style={inputStyle}
                  value={
                    assessmentForm.title
                  }
                  onChange={e =>
                    setAssessmentForm({
                      ...assessmentForm,
                      title:
                        e.target.value
                    })
                  }
                >

                  <option value="">
                    Select assessment
                  </option>

                  <option value="Quiz">
                    Quiz (15)
                  </option>

                  <option value="Assignment">
                    Assignment (15)
                  </option>

                  <option value="Midterm">
                    Midterm (20)
                  </option>

                  <option value="Final">
                    Final (50)
                  </option>

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Assessment Date
                </label>

                <input
                  style={inputStyle}
                  type="date"
                  value={
                    assessmentForm.date
                  }
                  onChange={e =>
                    setAssessmentForm({
                      ...assessmentForm,
                      date:
                        e.target.value
                    })
                  }
                />

              </div>

            </div>


            {/* SCORE TABLE */}

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  ...styles.table,
                  width: '100%',
                  minWidth:
                    '850px'
                }}
              >

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Student Name
                    </th>

                    <th>
                      Country
                    </th>

                    <th>
                      Quiz
                      <br />
                      <small>
                        /15
                      </small>
                    </th>

                    <th>
                      Assignment
                      <br />
                      <small>
                        /15
                      </small>
                    </th>

                    <th>
                      Midterm
                      <br />
                      <small>
                        /20
                      </small>
                    </th>

                    <th>
                      Final
                      <br />
                      <small>
                        /50
                      </small>
                    </th>

                    <th>
                      Total
                      <br />
                      <small>
                        /100
                      </small>
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {students.map(
                    (student, index) => {

                      const values =
                        assessmentScores[
                          student.id
                        ] || {};

                      const quiz =
                        Number(
                          values.quiz || 0
                        );

                      const assignment =
                        Number(
                          values.assignment ||
                            0
                        );

                      const midterm =
                        Number(
                          values.midterm ||
                            0
                        );

                      const final =
                        Number(
                          values.final ||
                            0
                        );

                      const total =
                        quiz +
                        assignment +
                        midterm +
                        final;


                      return (

                        <tr
                          key={
                            student.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {student.name}
                            </strong>
                          </td>

                          <td>
                            {student.country ||
                              '—'}
                          </td>


                          <td>

                            <input
                              style={{
                                ...inputStyle,
                                width:
                                  '75px',
                                textAlign:
                                  'center'
                              }}
                              type="number"
                              min="0"
                              max="15"
                              value={
                                values.quiz ??
                                ''
                              }
                              onChange={e =>
                                updateAssessmentScore(
                                  student.id,
                                  {
                                    ...values,
                                    quiz:
                                      e.target.value
                                  }
                                )
                              }
                            />

                          </td>


                          <td>

                            <input
                              style={{
                                ...inputStyle,
                                width:
                                  '75px',
                                textAlign:
                                  'center'
                              }}
                              type="number"
                              min="0"
                              max="15"
                              value={
                                values.assignment ??
                                ''
                              }
                              onChange={e =>
                                updateAssessmentScore(
                                  student.id,
                                  {
                                    ...values,
                                    assignment:
                                      e.target.value
                                  }
                                )
                              }
                            />

                          </td>


                          <td>

                            <input
                              style={{
                                ...inputStyle,
                                width:
                                  '75px',
                                textAlign:
                                  'center'
                              }}
                              type="number"
                              min="0"
                              max="20"
                              value={
                                values.midterm ??
                                ''
                              }
                              onChange={e =>
                                updateAssessmentScore(
                                  student.id,
                                  {
                                    ...values,
                                    midterm:
                                      e.target.value
                                  }
                                )
                              }
                            />

                          </td>


                          <td>

                            <input
                              style={{
                                ...inputStyle,
                                width:
                                  '75px',
                                textAlign:
                                  'center'
                              }}
                              type="number"
                              min="0"
                              max="50"
                              value={
                                values.final ??
                                ''
                              }
                              onChange={e =>
                                updateAssessmentScore(
                                  student.id,
                                  {
                                    ...values,
                                    final:
                                      e.target.value
                                  }
                                )
                              }
                            />

                          </td>


                          <td>

                            <strong
                              style={{
                                color:
                                  total >= 50
                                    ? '#16a34a'
                                    : '#dc2626'
                              }}
                            >
                              {total}
                            </strong>

                            {' / 100'}

                          </td>

                        </tr>

                      );

                    }
                  )}


                  {students.length === 0 && (

                    <tr>

                      <td
                        colSpan="8"
                        style={{
                          textAlign:
                            'center',
                          padding:
                            '30px'
                        }}
                      >
                        No students are available.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            <div
              style={{
                marginTop: '20px'
              }}
            >

              <label style={labelStyle}>
                Instructor Notes
              </label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight:
                    '80px'
                }}
                value={
                  assessmentForm.notes
                }
                onChange={e =>
                  setAssessmentForm({
                    ...assessmentForm,
                    notes:
                      e.target.value
                  })
                }
                placeholder="Optional notes about this assessment..."
              />

            </div>


            <button
              type="button"
              onClick={
                handleSubmitAssessment
              }
              style={{
                ...buttonStyle,
                marginTop:
                  '15px',
                background:
                  '#7c3aed',
                color: '#fff'
              }}
            >
              Submit Assessment Results for Review
            </button>

          </div>


          {/* ======================================
              GRADE SUBMISSION HISTORY
          ====================================== */}

          <div
            style={{
              ...cardStyle,
              marginTop: '20px'
            }}
          >

            <h4
              style={{
                marginTop: 0,
                fontSize:
                  '18px'
              }}
            >
              My Grade Submission History
            </h4>

            <p style={muted}>
              Every column below matches the information
              displayed in the corresponding row.
            </p>


            {myGradeSubmissions.length ===
            0 ? (

              <div
                style={{
                  padding:
                    '30px',
                  textAlign:
                    'center',
                  background:
                    '#f8fafc',
                  borderRadius:
                    '10px'
                }}
              >
                No grade submissions found.
              </div>

            ) : (

              <div
                style={{
                  overflowX:
                    'auto'
                }}
              >

                <table
                  style={{
                    ...styles.table,
                    width:
                      '100%',
                    minWidth:
                      '1000px'
                  }}
                >

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Course
                      </th>

                      <th>
                        Assessment
                      </th>

                      <th>
                        Assessment Date
                      </th>

                      <th>
                        Submission Date
                      </th>

                      <th>
                        Students
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Notes / Comments
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {myGradeSubmissions.map(
                      (submission, index) => (

                        <tr
                          key={
                            submission.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {submission.course ||
                                '—'}
                            </strong>
                          </td>

                          <td>
                            {submission.title ||
                              '—'}
                          </td>

                          <td>
                            {formatDate(
                              submission.assessmentDate ||
                              submission.date
                            )}
                          </td>

                          <td>
                            {formatDate(
                              submission.submissionDate
                            )}
                          </td>

                          <td>
                            {submission.totalStudents ??
                              '—'}
                          </td>

                          <td>

                            <span
                              style={statusBadge(
                                submission.status
                              )}
                            >
                              {submission.status ||
                                '—'}
                            </span>

                          </td>

                          <td>
                            {submission.comments ||
                              submission.notes ||
                              'No comments'}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ======================================
          FINANCE
      ====================================== */}

      {activeInstTab === 'finance' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            Earnings & Payment Account
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(190px,1fr))',
              gap: '15px',
              margin:
                '20px 0'
            }}
          >

            {[
              [
                'Total Earnings',
                `$${myProfile.earnings?.total || 0}`
              ],

              [
                'Approved Payouts',
                `$${myProfile.earnings?.approved || 0}`
              ],

              [
                'Pending Payouts',
                `$${myProfile.earnings?.pending || 0}`
              ]
            ].map(
              ([label, value]) => (

                <div
                  key={label}
                  style={{
                    padding: '20px',
                    background:
                      '#f8fafc',
                    borderRadius:
                      '12px'
                  }}
                >

                  <div style={muted}>
                    {label}
                  </div>

                  <strong
                    style={{
                      display:
                        'block',
                      marginTop:
                        '7px',
                      fontSize:
                        '25px',
                      color:
                        '#166534'
                    }}
                  >
                    {value}
                  </strong>

                </div>

              )
            )}

          </div>


          <h4>
            Receiving Account
          </h4>


          <form
            onSubmit={
              handleUpdatePayment
            }
          >

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(220px,1fr))',
                gap: '15px'
              }}
            >

              <div>

                <label style={labelStyle}>
                  Payment Method
                </label>

                <select
                  style={inputStyle}
                  value={
                    paymentForm.type
                  }
                  onChange={e =>
                    setPaymentForm({
                      ...paymentForm,
                      type:
                        e.target.value
                    })
                  }
                >

                  <option>
                    Mobile Money
                  </option>

                  <option>
                    Direct Bank Account
                  </option>

                  <option>
                    Debit / Mastercard
                  </option>

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Provider / Bank
                </label>

                <input
                  style={inputStyle}
                  value={
                    paymentForm.provider
                  }
                  onChange={e =>
                    setPaymentForm({
                      ...paymentForm,
                      provider:
                        e.target.value
                    })
                  }
                  placeholder="MTN, GCB Bank, Visa..."
                  required
                />

              </div>


              <div>

                <label style={labelStyle}>
                  Account / Phone / Card Number
                </label>

                <input
                  style={inputStyle}
                  value={
                    paymentForm.number
                  }
                  onChange={e =>
                    setPaymentForm({
                      ...paymentForm,
                      number:
                        e.target.value
                    })
                  }
                  required
                />

              </div>

            </div>


            <button
              type="submit"
              style={{
                ...buttonStyle,
                marginTop:
                  '16px',
                background:
                  '#16a34a',
                color:
                  '#fff'
              }}
            >
              Save Payment Details
            </button>

          </form>


          <h4
            style={{
              marginTop:
                '30px'
            }}
          >
            Payout History
          </h4>


          <div
            style={{
              overflowX:
                'auto'
            }}
          >

            <table
              style={{
                ...styles.table,
                width:
                  '100%'
              }}
            >

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {(myProfile.paymentHistory ||
                  []).map(
                  (payment, index) => (

                    <tr
                      key={index}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {formatDate(
                          payment.date
                        )}
                      </td>

                      <td>
                        <strong>
                          $
                          {payment.amount ||
                            0}
                        </strong>
                      </td>

                      <td>

                        <span
                          style={statusBadge(
                            payment.status
                          )}
                        >
                          {payment.status ||
                            '—'}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ======================================
          COMMUNICATION
      ====================================== */}

      {activeInstTab === 'announcements' && (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(320px,1fr))',
            gap: '20px'
          }}
        >

          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Student Announcement
            </h3>

            <p style={muted}>
              Communicate important academic information
              to your students.
            </p>


            <form
              onSubmit={
                handlePostAnnouncement
              }
            >

              <div
                style={{
                  marginBottom:
                    '14px'
                }}
              >

                <label style={labelStyle}>
                  Target Audience
                </label>

                <select
                  style={inputStyle}
                  value={
                    announcementForm.target
                  }
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      target:
                        e.target.value
                    })
                  }
                >

                  <option>
                    All students
                  </option>

                  <option>
                    Foundation Programme
                  </option>

                  <option>
                    Junior Learners Programme
                  </option>

                </select>

              </div>


              <div
                style={{
                  marginBottom:
                    '14px'
                }}
              >

                <label style={labelStyle}>
                  Announcement Title
                </label>

                <input
                  style={inputStyle}
                  value={
                    announcementForm.title
                  }
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      title:
                        e.target.value
                    })
                  }
                  required
                />

              </div>


              <div>

                <label style={labelStyle}>
                  Message
                </label>

                <textarea
                  style={{
                    ...inputStyle,
                    minHeight:
                      '120px'
                  }}
                  value={
                    announcementForm.message
                  }
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      message:
                        e.target.value
                    })
                  }
                  required
                />

              </div>


              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  marginTop:
                    '15px',
                  background:
                    '#7c3aed',
                  color:
                    '#fff'
                }}
              >
                Publish Announcement
              </button>

            </form>

          </div>


          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Helpdesk
            </h3>

            <form
              onSubmit={
                handleCreateTicket
              }
            >

              <div
                style={{
                  marginBottom:
                    '14px'
                }}
              >

                <label style={labelStyle}>
                  Issue Type
                </label>

                <select
                  style={inputStyle}
                  value={
                    ticketForm.issueType
                  }
                  onChange={e =>
                    setTicketForm({
                      ...ticketForm,
                      issueType:
                        e.target.value
                    })
                  }
                >

                  <option>
                    Technical
                  </option>

                  <option>
                    Administrative
                  </option>

                  <option>
                    Financial
                  </option>

                  <option>
                    Academic
                  </option>

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Subject / Description
                </label>

                <textarea
                  style={{
                    ...inputStyle,
                    minHeight:
                      '120px'
                  }}
                  value={
                    ticketForm.subject
                  }
                  onChange={e =>
                    setTicketForm({
                      ...ticketForm,
                      subject:
                        e.target.value
                    })
                  }
                  required
                />

              </div>


              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  marginTop:
                    '15px',
                  background:
                    '#dc2626',
                  color:
                    '#fff'
                }}
              >
                Submit Support Ticket
              </button>

            </form>

          </div>

        </div>

      )}


      {/* ======================================
          STUDENT SUPPORT
      ====================================== */}

      {activeInstTab === 'academic' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            Student Academic Support
          </h3>

          <p style={muted}>
            Record academic concerns and recommended
            interventions for students who require
            additional support.
          </p>


          <form
            onSubmit={
              handleAcademicConcern
            }
          >

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(220px,1fr))',
                gap: '15px'
              }}
            >

              <div>

                <label style={labelStyle}>
                  Student
                </label>

                <select
                  style={inputStyle}
                  value={
                    academicConcernForm.student
                  }
                  onChange={e =>
                    setAcademicConcernForm({
                      ...academicConcernForm,
                      student:
                        e.target.value
                    })
                  }
                  required
                >

                  <option value="">
                    Select student
                  </option>

                  {students.map(
                    student => (

                      <option
                        key={student.id}
                        value={
                          student.name
                        }
                      >
                        {student.name}
                        {student.country
                          ? ` — ${student.country}`
                          : ''}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Course
                </label>

                <select
                  style={inputStyle}
                  value={
                    academicConcernForm.course
                  }
                  onChange={e =>
                    setAcademicConcernForm({
                      ...academicConcernForm,
                      course:
                        e.target.value
                    })
                  }
                  required
                >

                  <option value="">
                    Select course
                  </option>

                  {courseList.map(
                    course => (

                      <option
                        key={course}
                        value={course}
                      >
                        {course}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div>

                <label style={labelStyle}>
                  Priority
                </label>

                <select
                  style={inputStyle}
                  value={
                    academicConcernForm.priority
                  }
                  onChange={e =>
                    setAcademicConcernForm({
                      ...academicConcernForm,
                      priority:
                        e.target.value
                    })
                  }
                >

                  <option>
                    Low
                  </option>

                  <option>
                    Medium
                  </option>

                  <option>
                    High
                  </option>

                  <option>
                    Critical
                  </option>

                </select>

              </div>

            </div>


            <div
              style={{
                marginTop:
                  '15px'
              }}
            >

              <label style={labelStyle}>
                Concern / Recommended Action
              </label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight:
                    '120px'
                }}
                value={
                  academicConcernForm.concern
                }
                onChange={e =>
                  setAcademicConcernForm({
                    ...academicConcernForm,
                    concern:
                      e.target.value
                  })
                }
                required
              />

            </div>


            <button
              type="submit"
              style={{
                ...buttonStyle,
                marginTop:
                  '15px',
                background:
                  '#dc2626',
                color:
                  '#fff'
              }}
            >
              Submit Academic Concern
            </button>

          </form>


          <h4
            style={{
              marginTop:
                '30px'
            }}
          >
            Reported Concerns
          </h4>


          {academicConcerns.map(
            concern => (

              <div
                key={concern.id}
                style={{
                  padding:
                    '16px',
                  marginBottom:
                    '10px',
                  background:
                    '#f8fafc',
                  borderLeft:
                    `5px solid ${
                      concern.priority ===
                      'Critical'
                        ? '#dc2626'
                        : concern.priority ===
                          'High'
                        ? '#ea580c'
                        : '#2563eb'
                    }`,
                  borderRadius:
                    '8px'
                }}
              >

                <strong>
                  {concern.student}
                </strong>

                <div
                  style={{
                    marginTop:
                      '5px'
                  }}
                >
                  {concern.course}
                </div>

                <p>
                  {concern.concern}
                </p>

                <small>
                  Priority: {concern.priority}
                  {' • '}
                  Status: {concern.status}
                  {' • '}
                  Date: {formatDate(
                    concern.date
                  )}
                </small>

              </div>

            )
          )}

        </div>

      )}


      {/* ======================================
          COURSE PREPARATION
      ====================================== */}

      {activeInstTab === 'preparation' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            Course Preparation & Teaching Readiness
          </h3>

          <p style={muted}>
            Complete these items before beginning
            a teaching period.
          </p>


          <div
            style={{
              margin:
                '20px 0',
              padding:
                '18px',
              background:
                '#f8fafc',
              borderRadius:
                '12px'
            }}
          >

            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between'
              }}
            >

              <strong>
                Preparation Progress
              </strong>

              <strong>
                {checklistPercentage}%
              </strong>

            </div>


            <div
              style={{
                height:
                  '10px',
                background:
                  '#e5e7eb',
                borderRadius:
                  '999px',
                overflow:
                  'hidden',
                marginTop:
                  '10px'
              }}
            >

              <div
                style={{
                  width:
                    `${checklistPercentage}%`,
                  height:
                    '100%',
                  background:
                    checklistPercentage ===
                    100
                      ? '#16a34a'
                      : '#2563eb'
                }}
              />

            </div>

          </div>


          {[
            [
              'courseOutline',
              'Course outline prepared and reviewed'
            ],

            [
              'learningObjectives',
              'Learning outcomes / objectives prepared'
            ],

            [
              'teachingMaterials',
              'Teaching materials prepared'
            ],

            [
              'assessmentPlan',
              'Assessment plan prepared'
            ],

            [
              'attendanceSetup',
              'Attendance arrangements prepared'
            ],

            [
              'studentResources',
              'Student learning resources prepared'
            ]
          ].map(
            ([key, label]) => (

              <label
                key={key}
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  padding:
                    '15px',
                  marginBottom:
                    '9px',
                  background:
                    courseChecklist[key]
                      ? '#ecfdf5'
                      : '#f8fafc',
                  border:
                    '1px solid #e5e7eb',
                  borderRadius:
                    '9px',
                  cursor:
                    'pointer'
                }}
              >

                <input
                  type="checkbox"
                  checked={
                    courseChecklist[key]
                  }
                  onChange={() =>
                    toggleCourseChecklist(
                      key
                    )
                  }
                  style={{
                    marginRight:
                      '12px'
                  }}
                />

                <span>
                  {label}
                </span>

              </label>

            )
          )}

        </div>

      )}


      {/* ======================================
          OFFICE HOURS
      ====================================== */}

      {activeInstTab === 'officeHours' && (

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'minmax(300px,400px) 1fr',
            gap:
              '20px'
          }}
        >

          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Office Hours
            </h3>

            <p style={muted}>
              Publish times when students can
              meet you for consultation.
            </p>


            <form
              onSubmit={
                handleAddOfficeHours
              }
            >

              <div
                style={{
                  marginBottom:
                    '14px'
                }}
              >

                <label style={labelStyle}>
                  Day
                </label>

                <select
                  style={inputStyle}
                  value={
                    officeHoursForm.day
                  }
                  onChange={e =>
                    setOfficeHoursForm({
                      ...officeHoursForm,
                      day:
                        e.target.value
                    })
                  }
                >

                  {[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                  ].map(day => (

                    <option
                      key={day}
                    >
                      {day}
                    </option>

                  ))}

                </select>

              </div>


              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap:
                    '10px'
                }}
              >

                <div>

                  <label style={labelStyle}>
                    Start
                  </label>

                  <input
                    style={inputStyle}
                    type="time"
                    value={
                      officeHoursForm.startTime
                    }
                    onChange={e =>
                      setOfficeHoursForm({
                        ...officeHoursForm,
                        startTime:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div>

                  <label style={labelStyle}>
                    End
                  </label>

                  <input
                    style={inputStyle}
                    type="time"
                    value={
                      officeHoursForm.endTime
                    }
                    onChange={e =>
                      setOfficeHoursForm({
                        ...officeHoursForm,
                        endTime:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>


              <div
                style={{
                  marginTop:
                    '14px'
                }}
              >

                <label style={labelStyle}>
                  Location / Meeting Method
                </label>

                <input
                  style={inputStyle}
                  value={
                    officeHoursForm.location
                  }
                  onChange={e =>
                    setOfficeHoursForm({
                      ...officeHoursForm,
                      location:
                        e.target.value
                    })
                  }
                  placeholder="Office, classroom, Zoom..."
                />

              </div>


              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  width:
                    '100%',
                  marginTop:
                    '15px',
                  background:
                    '#16a34a',
                  color:
                    '#fff'
                }}
              >
                Add Office Hours
              </button>

            </form>

          </div>


          <div style={cardStyle}>

            <h3 style={sectionTitle}>
              Published Consultation Hours
            </h3>


            {officeHours.map(
              hour => (

                <div
                  key={hour.id}
                  style={{
                    padding:
                      '17px',
                    background:
                      '#f8fafc',
                    border:
                      '1px solid #e5e7eb',
                    borderRadius:
                      '10px',
                    marginBottom:
                      '10px'
                  }}
                >

                  <strong>
                    {hour.day}
                    {' • '}
                    {hour.startTime}
                    {' - '}
                    {hour.endTime}
                  </strong>

                  <p>
                    <strong>
                      Location:
                    </strong>
                    {' '}
                    {hour.location ||
                      'Not specified'}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeOfficeHours(
                        hour.id
                      )
                    }
                    style={{
                      ...buttonStyle,
                      background:
                        '#fee2e2',
                      color:
                        '#991b1b'
                    }}
                  >
                    Remove
                  </button>

                </div>

              )
            )}


            {officeHours.length ===
              0 && (

              <p style={muted}>
                No office hours have been
                published.
              </p>

            )}

          </div>

        </div>

      )}


      {/* ======================================
          MY RECORDS
      ====================================== */}

      {activeInstTab === 'records' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            My Teaching & Administrative Records
          </h3>


          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(180px,1fr))',
              gap:
                '12px',
              margin:
                '20px 0'
            }}
          >

            {[
              [
                'Teaching Sessions',
                mySessions.length
              ],

              [
                'Grade Submissions',
                myGradeSubmissions.length
              ],

              [
                'Pending Reviews',
                pendingGradeReviews
              ],

              [
                'Support Tickets',
                mySupportTickets.length
              ],

              [
                'Announcements',
                myAnnouncements.length
              ]
            ].map(
              ([label, value]) => (

                <div
                  key={label}
                  style={{
                    padding:
                      '18px',
                    background:
                      '#f8fafc',
                    borderRadius:
                      '10px'
                  }}
                >

                  <div style={muted}>
                    {label}
                  </div>

                  <strong
                    style={{
                      fontSize:
                        '25px'
                    }}
                  >
                    {value}
                  </strong>

                </div>

              )
            )}

          </div>


          <h4>
            Recent Grade Submissions
          </h4>


          <div
            style={{
              overflowX:
                'auto'
            }}
          >

            <table
              style={{
                ...styles.table,
                width:
                  '100%'
              }}
            >

              <thead>

                <tr>

                  <th>
                    Course
                  </th>

                  <th>
                    Assessment
                  </th>

                  <th>
                    Assessment Date
                  </th>

                  <th>
                    Submission Date
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {myGradeSubmissions.map(
                  item => (

                    <tr
                      key={item.id}
                    >

                      <td>
                        {item.course}
                      </td>

                      <td>
                        {item.title}
                      </td>

                      <td>
                        {formatDate(
                          item.assessmentDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          item.submissionDate
                        )}
                      </td>

                      <td>

                        <span
                          style={statusBadge(
                            item.status
                          )}
                        >
                          {item.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          <h4
            style={{
              marginTop:
                '30px'
            }}
          >
            Recent Support Tickets
          </h4>


          <div
            style={{
              overflowX:
                'auto'
            }}
          >

            <table
              style={{
                ...styles.table,
                width:
                  '100%'
              }}
            >

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Issue Type
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {mySupportTickets.map(
                  ticket => (

                    <tr
                      key={ticket.id}
                    >

                      <td>
                        {formatDate(
                          ticket.date
                        )}
                      </td>

                      <td>
                        {ticket.issueType}
                      </td>

                      <td>
                        {ticket.subject}
                      </td>

                      <td>

                        <span
                          style={statusBadge(
                            ticket.status
                          )}
                        >
                          {ticket.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ======================================
          PROFILE
      ====================================== */}

      {activeInstTab === 'profile' && (

        <div style={cardStyle}>

          <h3 style={sectionTitle}>
            My Instructor Profile
          </h3>


          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(280px,1fr))',
              gap:
                '20px'
            }}
          >

            <div
              style={{
                padding:
                  '20px',
                background:
                  '#f8fafc',
                borderRadius:
                  '12px'
              }}
            >

              <h4>
                Personal Information
              </h4>

              <p>
                <strong>
                  Name:
                </strong>
                {' '}
                {myProfile.name}
              </p>

              <p>
                <strong>
                  Instructor ID:
                </strong>
                {' '}
                {myProfile.id ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Email:
                </strong>
                {' '}
                {myProfile.email ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Phone:
                </strong>
                {' '}
                {myProfile.phone ||
                  'Not specified'}
              </p>

            </div>


            <div
              style={{
                padding:
                  '20px',
                background:
                  '#f8fafc',
                borderRadius:
                  '12px'
              }}
            >

              <h4>
                Academic Information
              </h4>

              <p>
                <strong>
                  Department:
                </strong>
                {' '}
                {myProfile.department ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Specialization:
                </strong>
                {' '}
                {myProfile.specialization ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Qualification:
                </strong>
                {' '}
                {myProfile.qualification ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Status:
                </strong>
                {' '}
                {myProfile.status ||
                  'Active'}
              </p>

            </div>

          </div>


          <div
            style={{
              marginTop:
                '20px',
              padding:
                '20px',
              background:
                '#eff6ff',
              borderLeft:
                '4px solid #2563eb',
              borderRadius:
                '8px'
            }}
          >

            <strong>
              Important Instructor Responsibilities
            </strong>

            <ul>

              <li>
                Deliver assigned courses according
                to the approved curriculum.
              </li>

              <li>
                Maintain accurate attendance records
                after every class.
              </li>

              <li>
                Create and manage teaching sessions
                for students.
              </li>

              <li>
                Prepare learning materials and
                assessments before teaching.
              </li>

              <li>
                Enter assessment marks accurately
                using the approved grading structure.
              </li>

              <li>
                Submit grades within the required
                academic deadlines.
              </li>

              <li>
                Report students who require
                academic intervention.
              </li>

              <li>
                Communicate important information
                to students in a timely manner.
              </li>

              <li>
                Report technical, administrative and
                academic issues promptly.
              </li>

              <li>
                Maintain professional and academic
                standards at all times.
              </li>

            </ul>

          </div>


          <div
            style={{
              marginTop:
                '15px',
              padding:
                '18px',
              background:
                '#fffbeb',
              borderLeft:
                '4px solid #d97706',
              borderRadius:
                '8px'
            }}
          >

            <strong>
              Important Note
            </strong>

            <p
              style={{
                marginBottom:
                  0
              }}
            >
              Assessment marks, attendance records,
              student information and academic reports
              should be checked carefully before submission.
              Once submitted, records may be subject to
              administrative review or approval.
            </p>

          </div>

        </div>

      )}

    </div>

  );
}

// ==========================================
// 7. ELEGANT STYLES DEFINITION OBJECT
// ==========================================

const styles = {

  // ==========================================
  // GLOBAL APPLICATION
  // ==========================================

  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background:
      'linear-gradient(135deg, #f5f7fb 0%, #eef2f7 100%)',
    minHeight: '100vh',
    color: '#1f2937',
    margin: 0,
    padding: 0,
    lineHeight: 1.6
  },


  // ==========================================
  // MAIN HEADER
  // ==========================================

  header: {
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%)',
    color: '#fff',
    padding: '22px 40px',
    boxShadow:
      '0 8px 25px rgba(15, 23, 42, 0.18)',
    position: 'relative',
    zIndex: 10
  },


  signOutBtn: {
    background:
      'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow:
      '0 4px 10px rgba(220, 38, 38, 0.20)',
    transition: 'all 0.2s ease'
  },


  // ==========================================
  // MAIN NAVIGATION
  // ==========================================

  navBar: {
    marginTop: '18px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },


  navButton: {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '9px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },


  // ==========================================
  // MAIN CONTENT
  // ==========================================

  mainContent: {
    padding: '32px 40px',
    maxWidth: '1500px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },


  // ==========================================
  // GENERAL CARD
  // ==========================================

  cardContainer: {
    background:
      'rgba(255,255,255,0.96)',
    padding: '36px',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow:
      '0 10px 30px rgba(15, 23, 42, 0.07)',
    maxWidth: '650px',
    margin: '40px auto'
  },


  // ==========================================
  // ROLE SELECTOR
  // ==========================================

  roleSelectorTabs: {
    display: 'flex',
    gap: '10px',
    margin: '22px 0',
    flexWrap: 'wrap'
  },


  roleTabBtn: {
    flex: 1,
    minWidth: '130px',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow:
      '0 4px 10px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.2s ease'
  },


  loginFormCard: {
    marginTop: '20px'
  },


  // ==========================================
  // FORM ELEMENTS
  // ==========================================

  inputGroup: {
    marginBottom: '18px'
  },


  input: {
    width: '100%',
    padding: '12px 14px',
    marginTop: '7px',
    borderRadius: '9px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#1f2937',
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow:
      '0 1px 2px rgba(0,0,0,0.03)'
  },


  textarea: {
    width: '100%',
    padding: '12px 14px',
    marginTop: '7px',
    borderRadius: '9px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#1f2937',
    boxSizing: 'border-box',
    fontSize: '14px',
    minHeight: '110px',
    resize: 'vertical',
    outline: 'none',
    fontFamily:
      'inherit'
  },


  label: {
    display: 'block',
    fontWeight: '700',
    color: '#374151',
    fontSize: '14px',
    marginBottom: '4px'
  },


  // ==========================================
  // PRIMARY BUTTON
  // ==========================================

  primaryBtn: {
    background:
      'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    width: '100%',
    marginTop: '10px',
    boxShadow:
      '0 5px 14px rgba(37, 99, 235, 0.20)',
    transition: 'all 0.2s ease'
  },


  secondaryBtn: {
    background:
      'linear-gradient(135deg, #64748b, #475569)',
    color: '#fff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow:
      '0 4px 10px rgba(71, 85, 105, 0.16)',
    transition: 'all 0.2s ease'
  },


  // ==========================================
  // PORTAL WRAPPER
  // ==========================================

  portalWrapper: {
    background:
      'rgba(255,255,255,0.98)',
    padding: '30px',
    borderRadius: '18px',
    border: '1px solid #e5e7eb',
    boxShadow:
      '0 12px 35px rgba(15, 23, 42, 0.07)',
    marginBottom: '30px'
  },


  // ==========================================
  // PORTAL HEADER
  // ==========================================

  portalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '24px',
    borderRadius: '14px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #2563eb 100%)',
    boxShadow:
      '0 10px 25px rgba(15, 23, 42, 0.16)',
    marginBottom: '25px'
  },


  portalHeaderTitle: {
    margin: 0,
    fontSize: '25px',
    fontWeight: '800',
    letterSpacing: '-0.3px'
  },


  portalHeaderSubtitle: {
    margin: '5px 0 0 0',
    color: 'rgba(255,255,255,0.78)',
    fontSize: '14px'
  },


  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.18)',
    padding: '9px 15px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },


  // ==========================================
  // SUB NAVIGATION
  // ==========================================

  subNavBar: {
    display: 'flex',
    gap: '8px',
    margin: '25px 0',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '12px'
  },


  subTab: {
    backgroundColor: '#fff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s ease'
  },


  activeSubTab: {
    background:
      'linear-gradient(135deg, #1e3a5f, #2563eb)',
    color: '#fff',
    border: '1px solid #2563eb',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow:
      '0 4px 10px rgba(37, 99, 235, 0.18)',
    transition: 'all 0.2s ease'
  },


  // ==========================================
  // SECTION
  // ==========================================

  section: {
    marginTop: '20px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '26px',
    boxShadow:
      '0 5px 18px rgba(15, 23, 42, 0.04)'
  },


  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eef2f7'
  },


  sectionTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '19px',
    fontWeight: '800'
  },


  sectionSubtitle: {
    margin: '5px 0 0 0',
    color: '#64748b',
    fontSize: '13px'
  },


  // ==========================================
  // DASHBOARD METRIC CARDS
  // ==========================================

  gridCards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '18px',
    marginTop: '20px'
  },


  metricCard: {
    background:
      'linear-gradient(145deg, #ffffff, #f8fafc)',
    padding: '20px',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    boxShadow:
      '0 6px 18px rgba(15, 23, 42, 0.05)',
    position: 'relative',
    overflow: 'hidden'
  },


  metricCardSuccess: {
    background:
      'linear-gradient(145deg, #ffffff, #f0fdf4)',
    borderTop: '4px solid #16a34a'
  },


  metricCardWarning: {
    background:
      'linear-gradient(145deg, #ffffff, #fffbeb)',
    borderTop: '4px solid #f59e0b'
  },


  metricCardDanger: {
    background:
      'linear-gradient(145deg, #ffffff, #fef2f2)',
    borderTop: '4px solid #dc2626'
  },


  metricCardInfo: {
    background:
      'linear-gradient(145deg, #ffffff, #eff6ff)',
    borderTop: '4px solid #2563eb'
  },


  metricValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '8px 0 0 0',
    letterSpacing: '-0.5px'
  },


  metricLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },


  // ==========================================
  // SPLIT LAYOUT
  // ==========================================

  splitRow: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    alignItems: 'start'
  },


  // ==========================================
  // LISTS
  // ==========================================

  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },


  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    padding: '14px 16px',
    border: '1px solid #edf0f4',
    borderRadius: '10px',
    marginBottom: '8px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease'
  },


  // ==========================================
  // SMALL BUTTON
  // ==========================================

  smallBtn: {
    background:
      'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    marginLeft: '5px',
    boxShadow:
      '0 3px 7px rgba(37, 99, 235, 0.15)'
  },


  // ==========================================
  // TABLE
  // ==========================================

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border:
      '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#fff',
    marginTop: '15px'
  },


  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: '15px',
    backgroundColor: '#fff',
    fontSize: '13px'
  },


  tableHeader: {
    background:
      'linear-gradient(135deg, #0f172a, #1e3a5f)',
    color: '#fff',
    padding: '13px 14px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '2px solid #1e40af'
  },


  tableCell: {
    padding: '13px 14px',
    borderBottom: '1px solid #eef2f7',
    color: '#374151',
    verticalAlign: 'middle'
  },


  tableRow: {
    transition: 'background-color 0.2s ease'
  },


  // ==========================================
  // STATUS BADGES
  // ==========================================

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },


  statusSuccess: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },


  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a'
  },


  statusDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },


  statusInfo: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #bfdbfe'
  },


  statusNeutral: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  },


  // ==========================================
  // INFORMATION / ALERT BOXES
  // ==========================================

  infoBox: {
    background:
      'linear-gradient(135deg, #eff6ff, #f8fbff)',
    borderLeft: '4px solid #2563eb',
    padding: '15px 17px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#1e3a5f',
    boxShadow:
      '0 3px 10px rgba(37, 99, 235, 0.05)'
  },


  successBox: {
    background:
      'linear-gradient(135deg, #f0fdf4, #f7fff9)',
    borderLeft: '4px solid #16a34a',
    padding: '15px 17px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#166534'
  },


  warningBox: {
    background:
      'linear-gradient(135deg, #fffbeb, #fffdf5)',
    borderLeft: '4px solid #f59e0b',
    padding: '15px 17px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#92400e'
  },


  dangerBox: {
    background:
      'linear-gradient(135deg, #fef2f2, #fff8f8)',
    borderLeft: '4px solid #dc2626',
    padding: '15px 17px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: '#991b1b'
  },


  // ==========================================
  // EMPTY STATE
  // ==========================================

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    border:
      '1px dashed #cbd5e1',
    borderRadius: '12px',
    marginTop: '15px'
  },


  emptyStateTitle: {
    margin: '0 0 6px 0',
    color: '#334155',
    fontWeight: '800',
    fontSize: '16px'
  },


  // ==========================================
  // SEARCH BAR
  // ==========================================

  searchBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '12px',
    backgroundColor: '#f8fafc',
    border:
      '1px solid #e5e7eb',
    borderRadius: '10px',
    marginBottom: '18px'
  },


  searchInput: {
    flex: 1,
    minWidth: '220px',
    padding: '11px 14px',
    border:
      '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#fff',
    outline: 'none',
    fontSize: '13px'
  },


  // ==========================================
  // COURSE CARD
  // ==========================================

  courseCard: {
    background:
      'linear-gradient(145deg, #ffffff, #f8fafc)',
    border:
      '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '20px',
    boxShadow:
      '0 6px 18px rgba(15, 23, 42, 0.05)',
    transition: 'all 0.2s ease'
  },


  courseCardTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '17px',
    fontWeight: '800'
  },


  courseCardMeta: {
    color: '#64748b',
    fontSize: '13px',
    marginTop: '5px'
  },


  // ==========================================
  // SESSION / LIVE CLASS CARD
  // ==========================================

  sessionCard: {
    background:
      'linear-gradient(135deg, #eff6ff, #ffffff)',
    border:
      '1px solid #bfdbfe',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '14px',
    boxShadow:
      '0 6px 18px rgba(37, 99, 235, 0.07)'
  },


  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800'
  },


  launchBtn: {
    background:
      'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow:
      '0 4px 10px rgba(22, 163, 74, 0.18)'
  },


  // ==========================================
  // ATTENDANCE STATUS BUTTONS
  // ==========================================

  attendancePresent: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    padding: '7px 12px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '700'
  },


  attendanceLate: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fcd34d',
    padding: '7px 12px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '700'
  },


  attendanceAbsent: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '7px 12px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '700'
  },


  // ==========================================
  // SCORE INPUTS
  // ==========================================

  scoreInput: {
    width: '75px',
    padding: '8px 9px',
    border:
      '1px solid #cbd5e1',
    borderRadius: '7px',
    textAlign: 'center',
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none'
  },


  scoreHeader: {
    textAlign: 'center',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '10px 8px',
    fontSize: '12px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },


  totalScore: {
    fontWeight: '800',
    color: '#1d4ed8',
    fontSize: '14px',
    textAlign: 'center'
  },


  // ==========================================
  // PROFILE CARDS
  // ==========================================

  profileCard: {
    padding: '22px',
    background:
      'linear-gradient(145deg, #ffffff, #f8fafc)',
    border:
      '1px solid #e5e7eb',
    borderRadius: '14px',
    boxShadow:
      '0 5px 15px rgba(15, 23, 42, 0.04)'
  },


  profileAvatar: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, #1e3a5f, #2563eb)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '20px',
    marginBottom: '12px'
  },


  // ==========================================
  // DIVIDERS
  // ==========================================

  divider: {
    border: 0,
    borderTop:
      '1px solid #e5e7eb',
    margin: '28px 0'
  },


  // ==========================================
  // FOOTER
  // ==========================================

  footer: {
    marginTop: '40px',
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    borderTop:
      '1px solid #e5e7eb'
  },


  // ==========================================
  // RESPONSIVE CARD
  // ==========================================

  responsiveCard: {
    backgroundColor: '#fff',
    border:
      '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '20px',
    boxShadow:
      '0 5px 18px rgba(15, 23, 42, 0.05)'
  },


  // ==========================================
  // ICON CIRCLE
  // ==========================================

  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '18px'
  },


  // ==========================================
  // ACTION BAR
  // ==========================================

  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '18px'
  },


  actionGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },


  // ==========================================
  // SECONDARY OUTLINE BUTTON
  // ==========================================

  outlineBtn: {
    backgroundColor: '#fff',
    color: '#2563eb',
    border:
      '1px solid #2563eb',
    padding: '9px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px'
  },


  // ==========================================
  // DANGER BUTTON
  // ==========================================

  dangerBtn: {
    background:
      'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    padding: '9px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow:
      '0 4px 10px rgba(220, 38, 38, 0.15)'
  },


  // ==========================================
  // SUCCESS BUTTON
  // ==========================================

  successBtn: {
    background:
      'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    border: 'none',
    padding: '9px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow:
      '0 4px 10px rgba(22, 163, 74, 0.15)'
  },


  // ==========================================
  // WARNING BUTTON
  // ==========================================

  warningBtn: {
    background:
      'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    border: 'none',
    padding: '9px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px'
  },


  // ==========================================
  // PAGINATION
  // ==========================================

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },


  paginationBtn: {
    backgroundColor: '#fff',
    color: '#475569',
    border:
      '1px solid #dbe2ea',
    padding: '7px 11px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  },


  paginationActive: {
    background:
      'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    border:
      '1px solid #2563eb',
    padding: '7px 11px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '700'
  }

};


// ==========================================
// OPTIONAL HELPER FUNCTIONS
// ==========================================

// Use these helpers wherever you display statuses.
// They allow the entire portal to maintain one
// consistent visual language.

const getStatusStyle = (status) => {

  const value =
    String(status || '')
      .toLowerCase()
      .trim();

  if (
    value.includes('approved') ||
    value.includes('present') ||
    value.includes('completed') ||
    value.includes('paid') ||
    value.includes('active') ||
    value.includes('resolved') ||
    value.includes('success')
  ) {
    return {
      ...styles.statusBadge,
      ...styles.statusSuccess
    };
  }

  if (
    value.includes('pending') ||
    value.includes('late') ||
    value.includes('review') ||
    value.includes('warning')
  ) {
    return {
      ...styles.statusBadge,
      ...styles.statusWarning
    };
  }

  if (
    value.includes('rejected') ||
    value.includes('absent') ||
    value.includes('failed') ||
    value.includes('critical') ||
    value.includes('closed')
  ) {
    return {
      ...styles.statusBadge,
      ...styles.statusDanger
    };
  }

  if (
    value.includes('open') ||
    value.includes('scheduled') ||
    value.includes('upcoming') ||
    value.includes('info')
  ) {
    return {
      ...styles.statusBadge,
      ...styles.statusInfo
    };
  }

  return {
    ...styles.statusBadge,
    ...styles.statusNeutral
  };
};


// ==========================================
// SCORE FORMATTER
// ==========================================

const formatScore = (score, maximum) => {

  if (
    score === null ||
    score === undefined ||
    score === ''
  ) {
    return `— / ${maximum}`;
  }

  return `${score} / ${maximum}`;
};


// ==========================================
// DATE FORMATTER
// ==========================================

// This helps prevent dates such as:
//
// 2026-07-01
//
// from appearing inconsistently throughout
// the Instructor Portal.

const formatDate = (dateValue) => {

  if (!dateValue) {
    return '—';
  }

  try {

    const date =
      new Date(dateValue);

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  } catch (error) {

    return dateValue;

  }
};


// ==========================================
// CURRENCY FORMATTER
// ==========================================

const formatCurrency = (
  amount,
  currency = 'USD'
) => {

  const numericAmount =
    Number(amount || 0);

  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }
  ).format(numericAmount);
};


// ==========================================
// INITIALS HELPER
// ==========================================

const getInitials = (name) => {

  if (!name) {
    return 'IN';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(
      part =>
        part.charAt(0).toUpperCase()
    )
    .join('');
};


// ==========================================
// Ensure the main component / application
// function is properly closed here.
// ==========================================
