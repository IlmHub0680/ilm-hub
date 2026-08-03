// Note: Updated with enhanced payment receiving account/card input fields for Mobile Money, Direct Bank, and Debit/Mastercard options!

'use client';

// ==========================================
// ACADEMIC & CURRICULUM MANAGEMENT SYSTEM
// (Multi-Portal Login, Staff & Instructor Management, LMS, Finance & Governance)
// ==========================================

import React, { useState } from 'react';

// ==========================================
// 1. MOCK DATA & DEFAULT STRUCTURES
// ==========================================

const DEFAULT_ACADEMIC_SETTINGS = {
  monthsPerSemester: 3,
  semestersPerAcademicYear: 3,
  vacationDurationMonths: 1,
  currentAcademicYear: '2026/2027',
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
    coordinator: 'Ustadh Ahmad',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-10', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      { id: 'c-1', title: 'Suratu Al-A\'lā to An-Nās', code: 'JLP-101', semester: 1, type: 'Required', duration: '3 Months', description: 'Memorization and recitation of short surahs', objectives: 'Correct makharij and memorization', materials: 'Mushaf, Audio aids', status: 'Approved' },
      { id: 'c-2', title: 'Spellings & Arabic Writing', code: 'JLP-102', semester: 1, type: 'Required', duration: '3 Months', description: 'Basic Arabic orthography and spelling', objectives: 'Write Arabic letters independently', materials: 'Workbook', status: 'Approved' },
      { id: 'c-3', title: 'Adhkār & Daily Supplications', code: 'JLP-103', semester: 2, type: 'Required', duration: '3 Months', description: 'Essential daily adhkar', objectives: 'Memorize morning and evening prayers', materials: 'Hisn al-Muslim excerpt', status: 'Approved' },
      { id: 'c-4', title: 'Thirty Short Hadith', code: 'JLP-104', semester: 3, type: 'Required', duration: '3 Months', description: 'Nawawi short selections for kids', objectives: 'Understand core prophetic manners', materials: 'Hadith booklet', status: 'Approved' }
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
      { id: 'c-201', title: 'Quarter of 40 Hadith', code: 'FND-201', semester: 1, type: 'Required', duration: '3 Months', description: 'First 10 hadiths of Imam Nawawi', objectives: 'Memorization and basic explanation', materials: 'Nawawi text', status: 'Approved' },
      { id: 'c-202', title: 'Quarter of Al-Akhdari', code: 'FND-202', semester: 1, type: 'Required', duration: '3 Months', description: 'Maliki fiqh foundations part 1', objectives: 'Understand ritual purification and prayer rules', materials: 'Al-Akhdari text', status: 'Approved' },
      { id: 'c-203', title: 'Juz\'u Naba\'', code: 'FND-203', semester: 2, type: 'Required', duration: '3 Months', description: 'Tajwid and memorization of Juz 30', objectives: 'Fluent recitation with tajwid rules', materials: 'Tajweed Mushaf', status: 'Approved' },
      { id: 'c-204', title: 'Khulasatu Nur Al-Yaqeen (Part 1)', code: 'FND-204', semester: 3, type: 'Required', duration: '3 Months', description: 'Seerah of the Prophet (PBUH)', objectives: 'Trace early prophetic timeline', materials: 'Nur Al-Yaqeen book', status: 'Approved' }
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
    coordinator: 'Ustadh Bilal',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-15', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      { id: 'c-301', title: 'Juz\'u Mulk', code: 'INT-301', semester: 1, type: 'Required', duration: '3 Months', description: 'Memorization and study of Surah Al-Mulk to Al-Mursalat', objectives: 'Precise memorization and reflection', materials: 'Mushaf', status: 'Approved' },
      { id: 'c-302', title: 'Applied Tajwid', code: 'INT-302', semester: 1, type: 'Required', duration: '3 Months', description: 'Advanced rules of recitation', objectives: 'Practical application of rules in daily recitation', materials: 'Textbook of Tajwid', status: 'Approved' },
      { id: 'c-303', title: 'Half of 40 Hadith & Al-Akhdari', code: 'FND-303', semester: 2, type: 'Required', duration: '3 Months', description: 'Continuation of core texts', objectives: 'Deepen legal and ethical understanding', materials: 'Source texts', status: 'Approved' },
      { id: 'c-304', title: 'Aqidah Essentials', code: 'FND-304', semester: 3, type: 'Required', duration: '3 Months', description: 'Core Islamic beliefs', objectives: 'Understand articles of faith securely', materials: 'Aqidah tracts', status: 'Approved' }
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
    coordinator: 'Dr. Luqman',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-20', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      { id: 'c-401', title: 'Hifdh of Juz\'u Naba\'', code: 'CRT-401', semester: 1, type: 'Elective/Required', duration: '3 Months', description: 'Quranic memorization', objectives: 'Hifdh fluency', materials: 'Mushaf', status: 'Approved' },
      { id: 'c-402', title: 'Full 40 Hadith', code: 'CRT-402', semester: 1, type: 'Elective/Required', duration: '3 Months', description: 'Complete Nawawi collection', objectives: 'Mastery of prophetic foundations', materials: 'Hadith text', status: 'Approved' },
      { id: 'c-403', title: 'Full Al-Akhdari', code: 'CRT-403', semester: 2, type: 'Elective/Required', duration: '3 Months', description: 'Complete Maliki jurisprudence text', objectives: 'Comprehensive ritual and transactional jurisprudence', materials: 'Al-Akhdari', status: 'Approved' },
      { id: 'c-404', title: 'Matn Al-Ajrumiyyah', code: 'CRT-404', semester: 3, type: 'Elective/Required', duration: '3 Months', description: 'Classical Arabic grammar', objectives: 'Syntactical analysis proficiency', materials: 'Ajrumiyyah text', status: 'Approved' }
    ]
  },
  {
    id: 'prog-5',
    name: 'Diploma in Islamic Sciences',
    description: 'Comprehensive multi-year diploma covering Tafsir, Qur\'ان, Fiqh, Arabic Language, Hadith, and Aqidah.',
    level: 'Diploma',
    duration: '2 Years',
    semesters: 6,
    status: 'Active',
    coordinator: 'Prof. Abdul-Rahman',
    academicDuration: { ...DEFAULT_ACADEMIC_SETTINGS },
    history: [{ date: '2026-01-25', action: 'Created Programme', user: 'Super Admin' }],
    curriculum: [
      { id: 'c-501', title: 'Tafsir Studies', code: 'DIP-501', semester: 1, type: 'Required', duration: '3 Months', description: 'Exegesis of selected Quranic chapters', objectives: 'Understand contextual revelation and linguistic meanings', materials: 'Tafsir Ibn Kathir / Jalalayn', status: 'Approved' },
      { id: 'c-502', title: 'Fiqh (Jurisprudence)', code: 'DIP-502', semester: 1, type: 'Required', duration: '3 Months', description: 'Advanced comparative jurisprudence', objectives: 'Derive legal rulings from proofs', materials: 'Textbooks of fiqh', status: 'Approved' },
      { id: 'c-503', title: 'Arabic Language Mastery', code: 'DIP-503', semester: 2, type: 'Required', duration: '3 Months', description: 'Advanced rhetoric, morphology, and grammar', objectives: 'Absolute fluency in classical Arabic text processing', materials: 'Advanced Arabic manuals', status: 'Approved' },
      { id: 'c-504', title: 'Hadith Sciences & Terminology', code: 'DIP-504', semester: 3, type: 'Required', duration: '3 Months', description: 'Mustalah al-Hadith and prophetic reports', objectives: 'Critique and grade chains of narration', materials: 'Bayquniyyah & Sunnah texts', status: 'Approved' }
    ]
  }
];

const INITIAL_PROPOSALS = [
  {
    id: 'prop-01',
    programmeId: 'prog-1',
    programmeName: 'Junior Learners Programme',
    submittedBy: 'Ustadh Ahmad (Programme Coordinator)',
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
    paymentMethod: { type: 'Direct Bank Account', provider: 'GCB Bank', number: '1029384859' },
    earnings: { total: 4500, pending: 1500, approved: 3000 },
    paymentHistory: [{ date: '2026-07-01', amount: 1500, status: 'Approved' }]
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
    paymentMethod: { type: 'Mobile Money', provider: 'MTN', number: '+233 24 987 6543' },
    earnings: { total: 3200, pending: 1200, approved: 2000 },
    paymentHistory: [{ date: '2026-07-01', amount: 1000, status: 'Approved' }]
  }
];

const INITIAL_POSITIONS = [
  'Instructor', 'Senior Instructor', 'Head of Department', 'Dean of Students Affairs', 
  'Programme Coordinator', 'Course Manager', 'Academic Adviser', 'Examination Officer'
];

const INITIAL_SESSIONS = [
  { id: 'sess-1', course: 'Hadith Studies', topic: 'Introduction to Forty Hadith', date: 'Monday', startTime: '09:00', endTime: '10:30', platform: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij', instructor: 'Ahmad Ibrahim' }
];

const INITIAL_GRADE_SUBMISSIONS = [
  { id: 'grade-1', course: 'Hadith Studies', title: 'Midterm Examination', instructor: 'Ahmad Ibrahim', submissionDate: '2026-08-02', status: 'Pending Review', comments: '', data: 'Class average: 82%' }
];

const INITIAL_SUPPORT_TICKETS = [
  { id: 't-1', instructor: 'Bilal Al-Hassan', issueType: 'Technical', subject: 'Projector connectivity in Hall 2', status: 'Open', date: '2026-08-02' }
];

const INITIAL_PRIVATE_REQUESTS = [
  { id: 'pr-1', studentName: 'Zainab Umar', course: 'Advanced Quran Hifdh', status: 'Pending Assignment', instructor: 'Unassigned', date: '2026-08-03' }
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 'ann-1', target: 'All students', title: 'Semester Registration Reminder', message: 'All course registrations must be finalized by Friday.', date: '2026-08-01', instructor: 'Ahmad Ibrahim' }
];

// Helper to simulate printing / generating a PDF Report via browser print window or formatted blob
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
          body { font-family: Helvetica, Arial, sans-serif; color: #333; padding: 30px; }
          h1 { color: #2c3e50; border-bottom: 2px solid #2980b9; padding-bottom: 10px; }
          .meta { margin-bottom: 20px; font-size: 0.9em; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.9em; }
          th { background-color: #2c3e50; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 40px; font-size: 0.8em; text-align: center; color: #888; border-top: 1px solid #ddd; paddingTop: 10px; }
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
          &copy; ${new Date().getFullYear()} Ilm Hub Institute Academic & Curriculum Management System. All rights reserved.
        </div>
        <script>
          window.onload = function() { window.print(); };
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

export default function PortalHub() {
  const [activePortal, setActivePortal] = useState('select');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [programmes, setProgrammes] = useState(INITIAL_PROGRAMMES);
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [instructors, setInstructors] = useState(INITIAL_INSTRUCTORS);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [gradeSubmissions, setGradeSubmissions] = useState(INITIAL_GRADE_SUBMISSIONS);
  const [supportTickets, setSupportTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [privateRequests, setPrivateRequests] = useState(INITIAL_PRIVATE_REQUESTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(DEFAULT_ACADEMIC_SETTINGS);
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-08-01 10:00', user: 'Super Admin', action: 'System Initialized with Academic Structures' }
  ]);

  const logAction = (user, action) => {
    setAuditLogs(prev => [{ timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), user, action }, ...prev]);
  };

  const handleSignOut = () => {
    logAction(currentUser?.name || 'User', 'Signed out from portal');
    setCurrentUser(null);
    setActivePortal('select');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1>Academic & Curriculum Management Hub</h1>
          {currentUser && (
            <button style={styles.signOutBtn} onClick={handleSignOut}>
              Sign Out ({currentUser.name})
            </button>
          )}
        </div>
        
        {!currentUser && (
          <div style={styles.navBar}>
            <button 
              style={{ ...styles.navButton, backgroundColor: activePortal === 'select' ? '#2c3e50' : '#7f8c8d' }} 
              onClick={() => setActivePortal('select')}
            >
              Portal Selection & Login Gateway
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
                privateRequests={privateRequests}
                setPrivateRequests={setPrivateRequests}
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

function PortalSelector({ activePortal, setActivePortal, setCurrentUser, logAction }) {
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
    if (loginRole === 'admin') roleName = 'Super Administrator';
    else if (loginRole === 'coordinator') roleName = username;
    else if (loginRole === 'instructor') roleName = username;

    setCurrentUser({ role: loginRole, name: roleName });
    logAction(roleName, `Successfully logged into ${loginRole.toUpperCase()} portal`);
    setUsername('');
    setPassword('');
  };

  return (
    <div style={styles.cardContainer}>
      <h2>Select Your Academic Portal & Login</h2>
      <p>Choose your portal role below and log in with your credentials to access secured curriculum controls.</p>
      
      <div style={styles.roleSelectorTabs}>
        <button 
          style={{ ...styles.roleTabBtn, background: loginRole === 'admin' ? '#27ae60' : '#bdc3c7' }} 
          onClick={() => setLoginRole('admin')}
        >
          Super Admin
        </button>
        <button 
          style={{ ...styles.roleTabBtn, background: loginRole === 'coordinator' ? '#2980b9' : '#bdc3c7' }} 
          onClick={() => setLoginRole('coordinator')}
        >
          Coordinator
        </button>
        <button 
          style={{ ...styles.roleTabBtn, background: loginRole === 'instructor' ? '#8e44ad' : '#bdc3c7' }} 
          onClick={() => setLoginRole('instructor')}
        >
          Instructor
        </button>
      </div>

      <div style={styles.loginFormCard}>
        <h3>{loginRole === 'admin' ? 'Super Admin Secure Login' : loginRole === 'coordinator' ? 'Programme Coordinator Login' : 'Instructor Login'}</h3>
        <form onSubmit={handleLoginSubmit}>
          <div style={styles.inputGroup}>
            <label>Username / Staff ID:</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder={loginRole === 'admin' ? 'e.g. admin' : loginRole === 'coordinator' ? 'e.g. Ustadh Ahmad' : 'e.g. Ahmad Ibrahim'} 
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
              backgroundColor: loginRole === 'admin' ? '#27ae60' : loginRole === 'coordinator' ? '#2980b9' : '#8e44ad' 
            }} 
            type="submit"
          >
            Login to {loginRole.toUpperCase()} Portal
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN / SUPER ADMIN PORTAL
// ==========================================

function AdminPortal({ 
  programmes, setProgrammes, proposals, setProposals, 
  instructors, setInstructors, positions, setPositions,
  gradeSubmissions, setGradeSubmissions, privateRequests, setPrivateRequests,
  attendanceRecords, globalSettings, setGlobalSettings, archivedCourses, setArchivedCourses, 
  auditLogs, logAction 
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProgId, setSelectedProgId] = useState(programmes[0]?.id || '');
  
  const [progForm, setProgForm] = useState({
    name: '', description: '', level: 'Foundation', duration: '1 Year', semesters: 3, status: 'Active', coordinator: 'Unassigned'
  });
  const [isEditingProg, setIsEditingProg] = useState(false);
  const [editProgId, setEditProgId] = useState(null);

  const [newInst, setNewInst] = useState({
    name: '', position: 'Instructor', department: 'Islamic Sciences', staffId: '', email: '', phone: '', qualification: '', specialisation: '', experienceYears: 1
  });
  const [newPositionName, setNewPositionName] = useState('');

  const currentProg = programmes.find(p => p.id === selectedProgId) || programmes[0];

  const handleSaveProgramme = (e) => {
    e.preventDefault();
    if (isEditingProg) {
      setProgrammes(programmes.map(p => p.id === editProgId ? { ...p, ...progForm } : p));
      logAction('Administrator', `Updated programme details for: ${progForm.name}`);
      setIsEditingProg(false);
      setEditProgId(null);
    } else {
      const newProg = {
        id: `prog-${Date.now()}`,
        ...progForm,
        academicDuration: { ...globalSettings },
        history: [{ date: new Date().toISOString().substring(0, 10), action: 'Created Programme', user: 'Administrator' }],
        curriculum: []
      };
      setProgrammes([...programmes, newProg]);
      logAction('Administrator', `Created new programme: ${progForm.name}`);
    }
    setProgForm({ name: '', description: '', level: 'Foundation', duration: '1 Year', semesters: 3, status: 'Active', coordinator: 'Unassigned' });
  };

  const handleToggleStatus = (id) => {
    setProgrammes(programmes.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        logAction('Administrator', `Changed status of ${p.name} to ${newStatus}`);
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleArchiveProgramme = (id) => {
    setProgrammes(programmes.map(p => {
      if (p.id === id) {
        logAction('Administrator', `Archived programme: ${p.name}`);
        return { ...p, status: 'Archived' };
      }
      return p;
    }));
  };

  const handleRestoreProgramme = (id) => {
    setProgrammes(programmes.map(p => {
      if (p.id === id) {
        logAction('Administrator', `Restored programme: ${p.name}`);
        return { ...p, status: 'Active' };
      }
      return p;
    }));
  };

  const handleReviewProposal = (propId, decision) => {
    setProposals(proposals.map(prop => {
      if (prop.id === propId) {
        logAction('Administrator', `${decision} proposal ID ${propId}`);
        return { ...prop, status: decision };
      }
      return prop;
    }));
  };

  const handleCreateInstructor = (e) => {
    e.preventDefault();
    const created = {
      id: `inst-${Date.now()}`,
      ...newInst,
      status: 'Active',
      assignedProgrammes: [],
      assignedCourses: [],
      paymentMethod: { type: 'Direct Bank Account', provider: 'Standard Bank', number: '' },
      earnings: { total: 0, pending: 0, approved: 0 },
      paymentHistory: []
    };
    setInstructors([...instructors, created]);
    logAction('Administrator', `Created instructor account for ${newInst.name}`);
    setNewInst({ name: '', position: 'Instructor', department: 'Islamic Sciences', staffId: '', email: '', phone: '', qualification: '', specialisation: '', experienceYears: 1 });
  };

  const handleAddPosition = (e) => {
    e.preventDefault();
    if (newPositionName && !positions.includes(newPositionName)) {
      setPositions([...positions, newPositionName]);
      logAction('Administrator', `Created new staff position: ${newPositionName}`);
      setNewPositionName('');
    }
  };

  const handleReviewGrade = (gradeId, decision) => {
    setGradeSubmissions(gradeSubmissions.map(g => {
      if (g.id === gradeId) {
        logAction('Administrator', `${decision} grade submission for ${g.course} - ${g.title}`);
        return { ...g, status: decision === 'Approved' ? 'Approved & Published' : 'Rejected' };
      }
      return g;
    }));
  };

  const handleAssignPrivateInstructor = (reqId, instructorName) => {
    setPrivateRequests(privateRequests.map(r => {
      if (r.id === reqId) {
        logAction('Administrator', `Assigned instructor ${instructorName} to private course request for ${r.studentName}`);
        return { ...r, instructor: instructorName, status: 'Assigned & Active' };
      }
      return r;
    }));
  };

  return (
    <div style={styles.portalWrapper}>
      <h2>Administrator & Super Admin Control Center</h2>
      
      <div style={styles.subNavBar}>
        <button style={activeTab === 'dashboard' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button style={activeTab === 'programmes' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('programmes')}>Programmes & Courses</button>
        <button style={activeTab === 'instructors' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('instructors')}>Instructor Management & HR</button>
        <button style={activeTab === 'approvals' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('approvals')}>Approvals ({proposals.filter(p => p.status === 'Pending').length + gradeSubmissions.filter(g => g.status === 'Pending Review').length})</button>
        <button style={activeTab === 'private' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('private')}>Private Courses</button>
        <button style={activeTab === 'settings' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('settings')}>Academic Settings</button>
        <button style={activeTab === 'reports' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('reports')}>Reports & Audit Logs</button>
      </div>

      {activeTab === 'dashboard' && (
        <div style={styles.section}>
          <h3>Academic Programme & Institutional Dashboard</h3>
          <div style={styles.gridCards}>
            <div style={styles.metricCard}>
              <h4>Total Programmes</h4>
              <p style={styles.metricValue}>{programmes.length}</p>
            </div>
            <div style={styles.metricCard}>
              <h4>Active Instructors</h4>
              <p style={styles.metricValue}>{instructors.length}</p>
            </div>
            <div style={styles.metricCard}>
              <h4>Total Courses</h4>
              <p style={styles.metricValue}>{programmes.reduce((acc, p) => acc + p.curriculum.length, 0)}</p>
            </div>
            <div style={styles.metricCard}>
              <h4>Pending Approvals</h4>
              <p style={styles.metricValue}>{proposals.filter(p => p.status === 'Pending').length + gradeSubmissions.filter(g => g.status === 'Pending Review').length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'programmes' && (
        <div style={styles.section}>
          <h3>Programme Management & Structures</h3>
          <div style={styles.splitRow}>
            <div style={{flex: 1, marginRight: '20px'}}>
              <h4>Existing Programmes</h4>
              <ul style={styles.list}>
                {programmes.map(p => (
                  <li key={p.id} style={{ ...styles.listItem, background: selectedProgId === p.id ? '#ecf0f1' : '#fff' }}>
                    <span onClick={() => setSelectedProgId(p.id)} style={{cursor: 'pointer', flex: 1}}>
                      <strong>{p.name}</strong> ({p.level}) - <em>{p.status}</em>
                    </span>
                    <div>
                      <button style={styles.smallBtn} onClick={() => {
                        setIsEditingProg(true);
                        setEditProgId(p.id);
                        setProgForm({ name: p.name, description: p.description, level: p.level, duration: p.duration, semesters: p.semesters, status: p.status, coordinator: p.coordinator });
                      }}>Edit</button>
                      {p.status === 'Archived' ? (
                        <button style={{...styles.smallBtn, background: '#27ae60'}} onClick={() => handleRestoreProgramme(p.id)}>Restore</button>
                      ) : (
                        <>
                          <button style={{...styles.smallBtn, background: '#e67e22'}} onClick={() => handleToggleStatus(p.id)}>{p.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                          <button style={{...styles.smallBtn, background: '#c0392b'}} onClick={() => handleArchiveProgramme(p.id)}>Archive</button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{flex: 1, background: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>{isEditingProg ? 'Edit Programme Details' : 'Create New Programme'}</h4>
              <form onSubmit={handleSaveProgramme}>
                <div style={styles.inputGroup}>
                  <label>Programme Name:</label>
                  <input style={styles.input} type="text" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label>Description:</label>
                  <input style={styles.input} type="text" value={progForm.description} onChange={e => setProgForm({...progForm, description: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label>Level:</label>
                  <select style={styles.input} value={progForm.level} onChange={e => setProgForm({...progForm, level: e.target.value})}>
                    <option value="Elementary">Elementary</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Specialised Certificate">Specialised Certificate</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label>Duration:</label>
                  <input style={styles.input} type="text" value={progForm.duration} onChange={e => setProgForm({...progForm, duration: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label>Coordinator:</label>
                  <input style={styles.input} type="text" value={progForm.coordinator} onChange={e => setProgForm({...progForm, coordinator: e.target.value})} />
                </div>
                <button style={styles.primaryBtn} type="submit">{isEditingProg ? 'Update Programme' : 'Create Programme'}</button>
                {isEditingProg && (
                  <button style={{...styles.secondaryBtn, marginLeft: '10px'}} onClick={() => { setIsEditingProg(false); setProgForm({ name: '', description: '', level: 'Foundation', duration: '1 Year', semesters: 3, status: 'Active', coordinator: 'Unassigned' }); }}>Cancel</button>
                )}
              </form>
            </div>
          </div>

          <div style={{marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4>Curriculum for Selected Programme: {currentProg.name}</h4>
              <button 
                style={styles.secondaryBtn} 
                onClick={() => {
                  const rowsHTML = `
                    <h3>Curriculum Report: ${currentProg.name}</h3>
                    <table>
                      <thead><tr><th>Code</th><th>Course Title</th><th>Semester</th><th>Type</th><th>Duration</th><th>Status</th></tr></thead>
                      <tbody>
                        ${currentProg.curriculum.map(c => `<tr><td>${c.code}</td><td>${c.title}</td><td>Semester ${c.semester}</td><td>${c.type}</td><td>${c.duration}</td><td>${c.status}</td></tr>`).join('')}
                      </tbody>
                    </table>
                  `;
                  generatePDFReport(`Curriculum_${currentProg.name.replace(/\s+/g, '_')}`, rowsHTML);
                  logAction('Administrator', `Downloaded curriculum PDF report for ${currentProg.name}`);
                }}
              >
                Download Curriculum PDF Report
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Semester</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentProg.curriculum.map(c => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.title}</td>
                    <td>Semester {c.semester}</td>
                    <td>{c.type}</td>
                    <td>{c.duration}</td>
                    <td><strong style={{color: 'green'}}>{c.status}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'instructors' && (
        <div style={styles.section}>
          <h3>Instructor Management, HR & Payroll</h3>
          <div style={styles.splitRow}>
            <div style={{flex: 1, marginRight: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>Registered Instructors & Faculty</h4>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => {
                    const rowsHTML = `
                      <h3>Instructors Directory Report</h3>
                      <table>
                        <thead><tr><th>Name</th><th>Staff ID</th><th>Position</th><th>Department</th><th>Email</th><th>Approved Earnings</th><th>Payment Details</th></tr></thead>
                        <tbody>
                          ${instructors.map(i => `<tr><td>${i.name}</td><td>${i.staffId}</td><td>${i.position}</td><td>${i.department}</td><td>${i.email}</td><td>$${i.earnings.approved}</td><td>${i.paymentMethod.type} (${i.paymentMethod.provider}): ${i.paymentMethod.number}</td></tr>`).join('')}
                        </tbody>
                      </table>
                    `;
                    generatePDFReport('Instructors_Directory_Report', rowsHTML);
                    logAction('Administrator', 'Downloaded instructors PDF report');
                  }}
                >
                  Download Instructors PDF Report
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Payout Destination</th>
                    <th>Earnings (Approved)</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map(inst => (
                    <tr key={inst.id}>
                      <td><strong>{inst.name}</strong><br/><small>{inst.email}</small></td>
                      <td>{inst.position}</td>
                      <td>{inst.department}</td>
                      <td><small>{inst.paymentMethod.type} - {inst.paymentMethod.provider}<br/><b>No:</b> {inst.paymentMethod.number}</small></td>
                      <td>${inst.earnings.approved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={{marginTop: '20px'}}>Manage Staff Positions / Roles</h4>
              <ul style={styles.list}>
                {positions.map((pos, idx) => (
                  <li key={idx} style={styles.listItem}><span>{pos}</span></li>
                ))}
              </ul>
              <form onSubmit={handleAddPosition} style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <input style={{...styles.input, margin: 0}} type="text" placeholder="New Position Title" value={newPositionName} onChange={e => setNewPositionName(e.target.value)} required />
                <button style={styles.secondaryBtn} type="submit">Add Position</button>
              </form>
            </div>

            <div style={{flex: 1, background: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>Create New Instructor Account</h4>
              <form onSubmit={handleCreateInstructor}>
                <input style={styles.input} type="text" placeholder="Full Name" value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} required />
                <select style={styles.input} value={newInst.position} onChange={e => setNewInst({...newInst, position: e.target.value})}>
                  {positions.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                </select>
                <input style={styles.input} type="text" placeholder="Department (e.g. Islamic Sciences)" value={newInst.department} onChange={e => setNewInst({...newInst, department: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Staff ID (e.g. STF-1005)" value={newInst.staffId} onChange={e => setNewInst({...newInst, staffId: e.target.value})} required />
                <input style={styles.input} type="email" placeholder="Email Address" value={newInst.email} onChange={e => setNewInst({...newInst, email: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Phone Number" value={newInst.phone} onChange={e => setNewInst({...newInst, phone: e.target.value})} />
                <input style={styles.input} type="text" placeholder="Qualification" value={newInst.qualification} onChange={e => setNewInst({...newInst, qualification: e.target.value})} />
                <button style={styles.primaryBtn} type="submit">Create Instructor Account</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div style={styles.section}>
          <h3>Curriculum Proposals & Grade Approvals</h3>
          <h4>Curriculum Proposals</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Submitted By</th>
                <th>Changes Proposed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(prop => (
                <tr key={prop.id}>
                  <td>{prop.programmeName}</td>
                  <td>{prop.submittedBy}</td>
                  <td>{prop.changes}</td>
                  <td><strong style={{color: prop.status === 'Pending' ? 'orange' : 'green'}}>{prop.status}</strong></td>
                  <td>
                    {prop.status === 'Pending' && (
                      <>
                        <button style={{...styles.smallBtn, background: '#27ae60'}} onClick={() => handleReviewProposal(prop.id, 'Approved')}>Approve</button>
                        <button style={{...styles.smallBtn, background: '#c0392b'}} onClick={() => handleReviewProposal(prop.id, 'Rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{marginTop: '25px'}}>Instructor Grade Submissions</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {gradeSubmissions.map(g => (
                <tr key={g.id}>
                  <td>{g.course}</td>
                  <td>{g.title}</td>
                  <td>{g.instructor}</td>
                  <td>{g.data}</td>
                  <td><strong style={{color: g.status === 'Pending Review' ? 'orange' : 'green'}}>{g.status}</strong></td>
                  <td>
                    {g.status === 'Pending Review' && (
                      <>
                        <button style={{...styles.smallBtn, background: '#27ae60'}} onClick={() => handleReviewGrade(g.id, 'Approved')}>Approve & Publish</button>
                        <button style={{...styles.smallBtn, background: '#c0392b'}} onClick={() => handleReviewGrade(g.id, 'Rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'private' && (
        <div style={styles.section}>
          <h3>Private One-on-One Course Requests</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Requested Course</th>
                <th>Assigned Instructor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {privateRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.studentName}</td>
                  <td>{req.course}</td>
                  <td>{req.instructor}</td>
                  <td><strong style={{color: 'orange'}}>{req.status}</strong></td>
                  <td>
                    <select style={{padding: '5px'}} onChange={e => handleAssignPrivateInstructor(req.id, e.target.value)} defaultValue="">
                      <option value="" disabled>Assign Instructor...</option>
                      {instructors.map(inst => <option key={inst.id} value={inst.name}>{inst.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={styles.section}>
          <h3>Global Academic Settings & Duration Configuration</h3>
          <div style={{maxWidth: '500px', background: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #ddd'}}>
            <div style={styles.inputGroup}>
              <label>Months Per Semester:</label>
              <input style={styles.input} type="number" value={globalSettings.monthsPerSemester} onChange={e => setGlobalSettings({...globalSettings, monthsPerSemester: Number(e.target.value)})} />
            </div>
            <div style={styles.inputGroup}>
              <label>Semesters Per Academic Year:</label>
              <input style={styles.input} type="number" value={globalSettings.semestersPerAcademicYear} onChange={e => setGlobalSettings({...globalSettings, semestersPerAcademicYear: Number(e.target.value)})} />
            </div>
            <div style={styles.inputGroup}>
              <label>Vacation Duration (Months):</label>
              <input style={styles.input} type="number" value={globalSettings.vacationDurationMonths} onChange={e => setGlobalSettings({...globalSettings, vacationDurationMonths: Number(e.target.value)})} />
            </div>
            <div style={styles.inputGroup}>
              <label>Current Academic Year:</label>
              <input style={styles.input} type="text" value={globalSettings.currentAcademicYear} onChange={e => setGlobalSettings({...globalSettings, currentAcademicYear: e.target.value})} />
            </div>
            <button style={styles.primaryBtn} onClick={() => logAction('Administrator', 'Updated global academic settings')}>Save Global Settings</button>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={styles.section}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>System Audit Logs & Activity Reports</h3>
            <button 
              style={styles.secondaryBtn} 
              onClick={() => {
                const rowsHTML = `
                  <h3>System Audit Logs Report</h3>
                  <table>
                    <thead><tr><th>Timestamp</th><th>User / Actor</th><th>Action Performed</th></tr></thead>
                    <tbody>
                      ${auditLogs.map(l => `<tr><td>${l.timestamp}</td><td>${l.user}</td><td>${l.action}</td></tr>`).join('')}
                    </tbody>
                  </table>
                `;
                generatePDFReport('System_Audit_Logs_Report', rowsHTML);
                logAction('Administrator', 'Downloaded audit logs PDF report');
              }}
            >
              Download Audit Logs PDF Report
            </button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Actor</th>
                <th>Action Performed</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.timestamp}</td>
                  <td><strong>{log.user}</strong></td>
                  <td>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. PROGRAMME COORDINATOR PORTAL
// ==========================================

function CoordinatorPortal({ programmes, setProgrammes, proposals, setProposals, logAction }) {
  const [activeTab, setActiveTab] = useState('curriculum');
  const [selectedProgId, setSelectedProgId] = useState(programmes[0]?.id || '');
  const [proposalText, setProposalText] = useState('');

  const currentProg = programmes.find(p => p.id === selectedProgId) || programmes[0];

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (!proposalText) return;
    const newProp = {
      id: `prop-${Date.now()}`,
      programmeId: currentProg.id,
      programmeName: currentProg.name,
      submittedBy: `${currentProg.coordinator} (Programme Coordinator)`,
      date: new Date().toISOString().substring(0, 10),
      status: 'Pending',
      changes: proposalText,
      adminComments: ''
    };
    setProposals([...proposals, newProp]);
    logAction(currentProg.coordinator, `Submitted curriculum change proposal for ${currentProg.name}`);
    setProposalText('');
    alert('Proposal sent successfully to Super Administrator for review.');
  };

  return (
    <div style={styles.portalWrapper}>
      <h2>Programme Coordinator Portal</h2>
      <div style={styles.subNavBar}>
        <button style={activeTab === 'curriculum' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('curriculum')}>My Programme Curriculum</button>
        <button style={activeTab === 'proposals' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('proposals')}>Submit Proposals</button>
      </div>

      {activeTab === 'curriculum' && (
        <div style={styles.section}>
          <h3>Select Programme to Review</h3>
          <select style={styles.input} value={selectedProgId} onChange={e => setSelectedProgId(e.target.value)}>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.name} ({p.level})</option>)}
          </select>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'}}>
            <h4>Curriculum Outline for {currentProg.name}</h4>
            <button 
              style={styles.secondaryBtn} 
              onClick={() => {
                const rowsHTML = `
                  <h3>Coordinator Curriculum Report: ${currentProg.name}</h3>
                  <table>
                    <thead><tr><th>Code</th><th>Course Title</th><th>Semester</th><th>Objectives</th><th>Materials</th></tr></thead>
                    <tbody>
                      ${currentProg.curriculum.map(c => `<tr><td>${c.code}</td><td>${c.title}</td><td>Semester ${c.semester}</td><td>${c.objectives}</td><td>${c.materials}</td></tr>`).join('')}
                    </tbody>
                  </table>
                `;
                generatePDFReport(`Coordinator_Report_${currentProg.name.replace(/\s+/g, '_')}`, rowsHTML);
                logAction(currentProg.coordinator, `Downloaded curriculum PDF report for ${currentProg.name}`);
              }}
            >
              Download PDF Report
            </button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Semester</th>
                <th>Objectives</th>
                <th>Materials</th>
              </tr>
            </thead>
            <tbody>
              {currentProg.curriculum.map(c => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.title}</td>
                  <td>Semester {c.semester}</td>
                  <td>{c.objectives}</td>
                  <td>{c.materials}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div style={styles.section}>
          <h3>Submit Curriculum Changes / Proposals to Admin</h3>
          <form onSubmit={handleSendProposal} style={{maxWidth: '600px'}}>
            <div style={styles.inputGroup}>
              <label>Target Programme:</label>
              <select style={styles.input} value={selectedProgId} onChange={e => setSelectedProgId(e.target.value)}>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label>Proposed Modifications / New Modules:</label>
              <textarea style={{...styles.input, height: '100px'}} value={proposalText} onChange={e => setProposalText(e.target.value)} placeholder="Describe curriculum additions or updates..." required />
            </div>
            <button style={styles.primaryBtn} type="submit">Submit Proposal to Admin</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. INSTRUCTOR / FACULTY PORTAL
// ==========================================

function InstructorPortal({ 
  currentUser, programmes, instructors, setInstructors, 
  sessions, setSessions, gradeSubmissions, setGradeSubmissions, 
  supportTickets, setSupportTickets, announcements, setAnnouncements, 
  attendanceRecords, setAttendanceRecords, logAction 
}) {
  const [activeTab, setActiveTab] = useState('classes');
  
  const [newSession, setNewSession] = useState({ course: 'Hadith Studies', topic: '', date: 'Monday', startTime: '09:00', endTime: '10:30', platform: 'Google Meet', link: '' });
  const [gradeForm, setGradeForm] = useState({ course: 'Hadith Studies', title: '', data: '' });
  const [ticketForm, setTicketForm] = useState({ issueType: 'Technical', subject: '' });
  const [annForm, setAnnForm] = useState({ target: 'All students', title: '', message: '' });

  const currentInstructor = instructors.find(i => i.name === currentUser.name) || instructors[0];
  const [paymentForm, setPaymentForm] = useState(currentInstructor.paymentMethod || { type: 'Direct Bank Account', provider: '', number: '' });

  const handleUpdatePaymentMethod = (e) => {
    e.preventDefault();
    const updatedInstructors = instructors.map(inst => {
      if (inst.id === currentInstructor.id) {
        return { ...inst, paymentMethod: paymentForm };
      }
      return inst;
    });
    setInstructors(updatedInstructors);
    logAction(currentInstructor.name, `Updated payout payment method (${paymentForm.type}) with identifier: ${paymentForm.number}`);
    alert('Payment receiving method and number updated successfully.');
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const created = {
      id: `sess-${Date.now()}`,
      ...newSession,
      instructor: currentInstructor.name
    };
    setSessions([...sessions, created]);
    logAction(currentInstructor.name, `Scheduled live class session: ${newSession.topic}`);
    setNewSession({ course: 'Hadith Studies', topic: '', date: 'Monday', startTime: '09:00', endTime: '10:30', platform: 'Google Meet', link: '' });
    alert('Live class session created successfully.');
  };

  const handleSubmitGrades = (e) => {
    e.preventDefault();
    const sub = {
      id: `grade-${Date.now()}`,
      ...gradeForm,
      instructor: currentInstructor.name,
      submissionDate: new Date().toISOString().substring(0, 10),
      status: 'Pending Review',
      comments: ''
    };
    setGradeSubmissions([...gradeSubmissions, sub]);
    logAction(currentInstructor.name, `Submitted grades for ${gradeForm.course} - ${gradeForm.title}`);
    setGradeForm({ course: 'Hadith Studies', title: '', data: '' });
    alert('Grades submitted to administration for review.');
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const ticket = {
      id: `t-${Date.now()}`,
      instructor: currentInstructor.name,
      ...ticketForm,
      status: 'Open',
      date: new Date().toISOString().substring(0, 10)
    };
    setSupportTickets([...supportTickets, ticket]);
    logAction(currentInstructor.name, `Opened support ticket: ${ticketForm.subject}`);
    setTicketForm({ issueType: 'Technical', subject: '' });
    alert('Support ticket submitted.');
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    const ann = {
      id: `ann-${Date.now()}`,
      ...annForm,
      date: new Date().toISOString().substring(0, 10),
      instructor: currentInstructor.name
    };
    setAnnouncements([...announcements, ann]);
    logAction(currentInstructor.name, `Posted institutional announcement: ${annForm.title}`);
    setAnnForm({ target: 'All students', title: '', message: '' });
    alert('Announcement posted successfully.');
  };

  return (
    <div style={styles.portalWrapper}>
      <h2>Instructor & Faculty Portal ({currentInstructor.name})</h2>
      <div style={styles.subNavBar}>
        <button style={activeTab === 'classes' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('classes')}>Live Classes & LMS</button>
        <button style={activeTab === 'grades' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('grades')}>Grade Submissions</button>
        <button style={activeTab === 'announcements' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('announcements')}>Announcements</button>
        <button style={activeTab === 'finance' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('finance')}>Earnings & Payout Method</button>
        <button style={activeTab === 'support' ? styles.activeSubTab : styles.subTab} onClick={() => setActiveTab('support')}>Support & Tickets</button>
      </div>

      {activeTab === 'classes' && (
        <div style={styles.section}>
          <h3>Live Class Sessions Management</h3>
          <div style={styles.splitRow}>
            <div style={{flex: 1, marginRight: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>Active Class Sessions</h4>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => {
                    const rowsHTML = `
                      <h3>Live Sessions Report</h3>
                      <table>
                        <thead><tr><th>Course</th><th>Topic</th><th>Date</th><th>Start Time</th><th>End Time</th><th>Platform</th></tr></thead>
                        <tbody>
                          ${sessions.map(s => `<tr><td>${s.course}</td><td>${s.topic}</td><td>${s.date}</td><td>${s.startTime}</td><td>${s.endTime}</td><td>${s.platform}</td></tr>`).join('')}
                        </tbody>
                      </table>
                    `;
                    generatePDFReport('Live_Sessions_Report', rowsHTML);
                    logAction(currentInstructor.name, 'Downloaded live sessions PDF report');
                  }}
                >
                  Download PDF Report
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Topic</th>
                    <th>Schedule</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.course}</td>
                      <td>{s.topic}</td>
                      <td>{s.date}, {s.startTime} - {s.endTime}</td>
                      <td><a href={s.link} target="_blank" rel="noreferrer" style={styles.smallBtn}>Join {s.platform}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{flex: 1, background: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>Schedule New Live Session</h4>
              <form onSubmit={handleCreateSession}>
                <input style={styles.input} type="text" placeholder="Course Name" value={newSession.course} onChange={e => setNewSession({...newSession, course: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Topic Title" value={newSession.topic} onChange={e => setNewSession({...newSession, topic: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Day (e.g. Monday)" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Start Time (e.g. 09:00)" value={newSession.startTime} onChange={e => setNewSession({...newSession, startTime: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="End Time (e.g. 10:30)" value={newSession.endTime} onChange={e => setNewSession({...newSession, endTime: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Meeting Link (Google Meet / Zoom URL)" value={newSession.link} onChange={e => setNewSession({...newSession, link: e.target.value})} required />
                <button style={styles.primaryBtn} type="submit">Schedule Live Session</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div style={styles.section}>
          <h3>Submit Student Grades & Assessments</h3>
          <div style={styles.splitRow}>
            <div style={{flex: 1, marginRight: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>My Grade Submissions</h4>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => {
                    const rowsHTML = `
                      <h3>Grade Submissions Report</h3>
                      <table>
                        <thead><tr><th>Course</th><th>Assessment Title</th><th>Submission Date</th><th>Status</th></tr></thead>
                        <tbody>
                          ${gradeSubmissions.map(g => `<tr><td>${g.course}</td><td>${g.title}</td><td>${g.submissionDate}</td><td>${g.status}</td></tr>`).join('')}
                        </tbody>
                      </table>
                    `;
                    generatePDFReport('Grade_Submissions_Report', rowsHTML);
                    logAction(currentInstructor.name, 'Downloaded grade submissions PDF report');
                  }}
                >
                  Download PDF Report
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeSubmissions.map(g => (
                    <tr key={g.id}>
                      <td>{g.course}</td>
                      <td>{g.title}</td>
                      <td><strong style={{color: g.status.includes('Approved') ? 'green' : 'orange'}}>{g.status}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{flex: 1, background: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>Submit New Grades</h4>
              <form onSubmit={handleSubmitGrades}>
                <input style={styles.input} type="text" placeholder="Course Name" value={gradeForm.course} onChange={e => setGradeForm({...gradeForm, course: e.target.value})} required />
                <input style={styles.input} type="text" placeholder="Assessment Title (e.g., Final Exam)" value={gradeForm.title} onChange={e => setGradeForm({...gradeForm, title: e.target.value})} required />
                <textarea style={{...styles.input, height: '80px'}} placeholder="Summary / Grade Data (e.g., Class average: 85%)" value={gradeForm.data} onChange={e => setGradeForm({...gradeForm, data: e.target.value})} required />
                <button style={styles.primaryBtn} type="submit">Submit Grades for Review</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div style={styles.section}>
          <h3>Post Institutional & Course Announcements</h3>
          <form onSubmit={handlePostAnnouncement} style={{maxWidth: '600px'}}>
            <div style={styles.inputGroup}>
              <label>Target Audience:</label>
              <select style={styles.input} value={annForm.target} onChange={e => setAnnForm({...annForm, target: e.target.value})}>
                <option value="All students">All students</option>
                <option value="Foundation Programme">Foundation Programme</option>
                <option value="Junior Learners Programme">Junior Learners Programme</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label>Announcement Title:</label>
              <input style={styles.input} type="text" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label>Message Content:</label>
              <textarea style={{...styles.input, height: '90px'}} value={annForm.message} onChange={e => setAnnForm({...annForm, message: e.target.value})} required />
            </div>
            <button style={styles.primaryBtn} type="submit">Post Announcement</button>
          </form>
        </div>
      )}

      {activeTab === 'finance' && (
        <div style={styles.section}>
          <h3>Earnings, Payouts & Payment Receiving Method</h3>
          <div style={styles.gridCards}>
            <div style={styles.metricCard}>
              <h4>Total Earnings</h4>
              <p style={styles.metricValue}>${currentInstructor.earnings.total}</p>
            </div>
            <div style={styles.metricCard}>
              <h4>Approved Payouts</h4>
              <p style={styles.metricValue}>${currentInstructor.earnings.approved}</p>
            </div>
            <div style={styles.metricCard}>
              <h4>Pending Balance</h4>
              <p style={styles.metricValue}>${currentInstructor.earnings.pending}</p>
            </div>
          </div>

          <div style={styles.splitRow} style={{marginTop: '25px'}}>
            <div style={{flex: 1, background: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>Configure Payout / Payment Receiving Method</h4>
              <form onSubmit={handleUpdatePaymentMethod}>
                <div style={styles.inputGroup}>
                  <label>Payment Method Type:</label>
                  <select 
                    style={styles.input} 
                    value={paymentForm.type} 
                    onChange={e => setPaymentForm({
                      ...paymentForm, 
                      type: e.target.value, 
                      provider: e.target.value === 'Mobile Money' ? 'MTN' : e.target.value === 'Direct Bank Account' ? 'GCB Bank' : 'Visa / Mastercard',
                      number: '' 
                    })}
                  >
                    <option value="Direct Bank Account">Direct Bank Account</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Debit / Mastercard">Debit / Mastercard</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label>Bank Name / MoMo Provider:</label>
                  <input 
                    style={styles.input} 
                    type="text" 
                    placeholder={paymentForm.type === 'Mobile Money' ? 'e.g. MTN / Vodafone Cash / AirtelTigo' : paymentForm.type === 'Direct Bank Account' ? 'e.g. GCB Bank / Stanbic Bank' : 'e.g. Visa / Mastercard'} 
                    value={paymentForm.provider} 
                    onChange={e => setPaymentForm({...paymentForm, provider: e.target.value})} 
                    required 
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>
                    {paymentForm.type === 'Mobile Money' 
                      ? 'Mobile Money Phone Number:' 
                      : paymentForm.type === 'Direct Bank Account' 
                      ? 'Bank Account Number:' 
                      : 'Card Number (Debit / Mastercard):'}
                  </label>
                  <input 
                    style={styles.input} 
                    type="text" 
                    placeholder={
                      paymentForm.type === 'Mobile Money' 
                        ? 'e.g. +233 24 000 0000' 
                        : paymentForm.type === 'Direct Bank Account' 
                        ? 'e.g. 1029384859' 
                        : 'e.g. 4000 1234 5678 9010'
                    } 
                    value={paymentForm.number} 
                    onChange={e => setPaymentForm({...paymentForm, number: e.target.value})} 
                    required 
                  />
                </div>

                <button style={styles.primaryBtn} type="submit">Save Payment Method & Number</button>
              </form>
            </div>

            <div style={{flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>Payment History</h4>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => {
                    const rowsHTML = `
                      <h3>Payment History Report: ${currentInstructor.name}</h3>
                      <table>
                        <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                          ${currentInstructor.paymentHistory.map(ph => `<tr><td>${ph.date}</td><td>$${ph.amount}</td><td>${ph.status}</td></tr>`).join('')}
                        </tbody>
                      </table>
                    `;
                    generatePDFReport('Payment_History_Report', rowsHTML);
                    logAction(currentInstructor.name, 'Downloaded payment history PDF report');
                  }}
                >
                  Download PDF Report
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInstructor.paymentHistory.map((ph, idx) => (
                    <tr key={idx}>
                      <td>{ph.date}</td>
                      <td>${ph.amount}</td>
                      <td><strong style={{color: 'green'}}>{ph.status}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div style={styles.section}>
          <h3>Technical Support Tickets</h3>
          <div style={styles.splitRow}>
            <div style={{flex: 1, marginRight: '20px'}}>
              <h4>My Submitted Tickets</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.filter(t => t.instructor === currentInstructor.name).map(t => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.issueType}</td>
                      <td>{t.subject}</td>
                      <td><strong style={{color: 'orange'}}>{t.status}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{flex: 1, background: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
              <h4>Create Support Ticket</h4>
              <form onSubmit={handleCreateTicket}>
                <select style={styles.input} value={ticketForm.issueType} onChange={e => setTicketForm({...ticketForm, issueType: e.target.value})}>
                  <option value="Technical">Technical / IT</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Payroll">Payroll / Finance</option>
                </select>
                <input style={styles.input} type="text" placeholder="Issue Subject / Description" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} required />
                <button style={styles.primaryBtn} type="submit">Submit Support Ticket</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. GLOBAL STYLES
// ==========================================

const styles = {
  container: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f4f6f7', minHeight: '100vh', color: '#333', padding: '20px' },
  header: { background: '#2c3e50', color: '#fff', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' },
  signOutBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  navBar: { marginTop: '15px', display: 'flex', gap: '10px' },
  navButton: { border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  mainContent: { background: 'transparent' },
  cardContainer: { background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  roleSelectorTabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleTabBtn: { flex: 1, border: 'none', padding: '10px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  loginFormCard: { background: '#f8f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #d5dbdb' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  primaryBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  secondaryBtn: { background: '#2980b9', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  portalWrapper: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  subNavBar: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px', flexWrap: 'wrap' },
  subTab: { background: '#ecf0f1', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
  activeSubTab: { background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  section: { marginTop: '15px' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' },
  metricCard: { background: '#f8f9f9', border: '1px solid #d5dbdb', padding: '15px', borderRadius: '8px', textAlign: 'center' },
  metricValue: { fontSize: '1.8em', fontWeight: 'bold', color: '#2c3e50', margin: '5px 0 0 0' },
  splitRow: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9em' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' },
  smallBtn: { background: '#2980b9', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.85em' }
};