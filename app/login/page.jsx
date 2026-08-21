'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

// ============================================================
// ILM HUB - STUDENT PORTAL
// Complete Student Portal
// ============================================================

export default function LoginPage() {
  // ==========================================================
  // LOGIN
  // ==========================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [activeStudentTab, setActiveStudentTab] = useState('dashboard');

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [profilePicture, setProfilePicture] = useState(null);
  const profilePictureRef = useRef(null);

  // ==========================================================
  // STUDENT DATA
  // ==========================================================

  const [students, setStudents] = useState([
    {
      id: 'stu-1',
      studentId: 'ILM-2026-001',
      name: 'Zainab Umar',
      email: 'student@ilmhub.edu',
      phone: '+233 24 000 0000',
      enrolledProgramme: 'Foundation Programme',
      studyType: 'Morning',
      academicStatus: 'Regular',
      registeredCourses: [
        'Quarter of 40 Hadith'
      ],
      grades: [
        {
          course: 'Quarter of 40 Hadith',
          title: 'Midterm Examination',
          score: 88,
          grade: 'B+'
        }
      ],
      semesterGPA: 3.72,
      cgpa: 3.68,
      feeStatus: 'Paid in Full'
    }
  ]);

  // ==========================================================
  // PROGRAMMES / COURSES
  // ==========================================================

  const [programmes] = useState([
    {
      id: 'prog-1',
      name: 'Foundation Programme',
      level: 'Foundation Level',
      curriculum: [
        {
          id: 'c-201',
          title: 'Quarter of 40 Hadith',
          code: 'FND-201',
          credits: 3
        },
        {
          id: 'c-202',
          title: 'Quarter of Al-Akhdari',
          code: 'FND-202',
          credits: 3
        },
        {
          id: 'c-203',
          title: 'Introduction to Quranic Studies',
          code: 'FND-203',
          credits: 3
        },
        {
          id: 'c-204',
          title: 'Arabic Language',
          code: 'FND-204',
          credits: 3
        },
        {
          id: 'c-205',
          title: 'Islamic Jurisprudence',
          code: 'FND-205',
          credits: 3
        }
      ]
    }
  ]);

  // ==========================================================
  // LIVE CLASSES
  // ==========================================================

  const [sessions] = useState([
    {
      id: 'sess-1',
      course: 'Hadith Studies',
      topic: 'Introduction to Forty Hadith',
      date: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      link: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 'sess-2',
      course: 'Arabic Language',
      topic: 'Basic Grammar',
      date: 'Wednesday',
      startTime: '11:00',
      endTime: '12:30',
      link: 'https://meet.google.com/xyz-abcd-efg'
    }
  ]);

  // ==========================================================
  // ANNOUNCEMENTS
  // Faculty + Instructor announcements
  // ==========================================================

  const [announcements] = useState([
    {
      id: 'ann-1',
      title: 'Semester Registration Reminder',
      message:
        'All course registrations must be finalized before the registration deadline.',
      date: '2026-08-01',
      author: 'Academic Faculty',
      type: 'Faculty'
    },
    {
      id: 'ann-2',
      title: 'Hadith Class Assignment',
      message:
        'Students should review the assigned Hadith before the next lecture.',
      date: '2026-08-05',
      author: 'Ahmad Ibrahim',
      type: 'Instructor'
    },
    {
      id: 'ann-3',
      title: 'Final Examination Preparation',
      message:
        'Students are encouraged to begin preparing early for the final examinations.',
      date: '2026-08-08',
      author: 'Academic Faculty',
      type: 'Faculty'
    }
  ]);

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

  const instructors = [
    {
      id: 'ins-1',
      name: 'Shaykh Ahmad Abdullah Dawud',
      courses: ['Quarter of 40 Hadith', 'Islamic Jurisprudence'],
      fee: 100
    },
    {
      id: 'ins-2',
      name: 'Imam Muhammad Jalaal Deen Umar',
      courses: ['Arabic Language', 'Quranic Studies'],
      fee: 150
    },
    {
      id: 'ins-3',
      name: 'Shaykh Armiya Tahir Abdul Mumin',
      courses: ['Quarter of Al-Akhdari', 'Arabic Language'],
      fee: 170
    }
  ];

  // ==========================================================
  // REGISTRATION
  // ==========================================================

  const [selectedCourseToRegister, setSelectedCourseToRegister] =
    useState('');

  // ==========================================================
  // ACADEMIC SYSTEM
  // ==========================================================

  const [academicStatus] = useState('Regular');

  const [nameChangeRequest, setNameChangeRequest] = useState('');
  const [nameChangeSubmitted, setNameChangeSubmitted] = useState(false);

  const [nationalityRequest, setNationalityRequest] = useState('');
  const [nationalitySubmitted, setNationalitySubmitted] = useState(false);

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

  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

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

  const [documentRequest, setDocumentRequest] = useState('');
  const [documentRequests, setDocumentRequests] = useState([]);

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Low GPA Warning',
      message:
        'Your current GPA is below the recommended level. Please speak with your academic supervisor.',
      type: 'warning',
      unread: true
    },
    {
      id: 2,
      title: 'Final Examination',
      message:
        'Your final examination timetable is now available.',
      type: 'academic',
      unread: true
    },
    {
      id: 3,
      title: 'Assignment Reminder',
      message:
        'You have an upcoming assignment submission.',
      type: 'reminder',
      unread: true
    }
  ]);

  // ==========================================================
  // HIDDEN DASHBOARD MENUS
  // ==========================================================

  const [openDashboardMenu, setOpenDashboardMenu] = useState(null);

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
    students.find(
      (student) =>
        student.email.toLowerCase() === email.toLowerCase()
    ) || {
      ...students[0],
      email: email || 'student@ilmhub.edu',
      name: email
        ? email.split('@')[0]
        : 'Zainab Umar'
    };

  // ==========================================================
  // ACADEMIC RECORD
  // ==========================================================

  const academicSemesters = [
    {
      semester: 'Semester 1',
      academicYear: '2025/2026',
      gpa: 3.55,
      courses: [
        {
          course: 'Quarter of 40 Hadith',
          grade: 'B+',
          score: 87
        },
        {
          course: 'Arabic Language',
          grade: 'A',
          score: 91
        }
      ]
    },
    {
      semester: 'Semester 2',
      academicYear: '2025/2026',
      gpa: 3.72,
      courses: [
        {
          course: 'Islamic Jurisprudence',
          grade: 'B+',
          score: 88
        },
        {
          course: 'Quranic Studies',
          grade: 'A',
          score: 92
        }
      ]
    }
  ];

  // ==========================================================
  // GPA
  // ==========================================================

  const currentGPA = currentStudent.semesterGPA;
  const currentCGPA = currentStudent.cgpa;

  const isLowGPA = currentGPA < 2.5;

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
  // GRADING SYSTEM
  // ==========================================================

  const gradingSystem = [
    ['90 - 100', 'A+', 'Excellent'],
    ['85 - 89', 'B+', 'Very Good'],
    ['80 - 84', 'B', 'Good'],
    ['75 - 79', 'C+', 'Average'],
    ['70 - 74', 'C', 'Fair'],
    ['65 - 69', 'D+', 'Baley satisfactory'],
    ['60 - 64', 'D', 'Weak Pass'],
    ['0 - 59', 'F', 'Fail']
  ];

  // ==========================================================
  // ATTENDANCE
  // 25% absence = fail/repeat course
  // ==========================================================

  const attendanceRecords = [
    {
      course: 'Quarter of 40 Hadith',
      totalClasses: 20,
      attended: 17,
      absent: 3
    },
    {
      course: 'Arabic Language',
      totalClasses: 20,
      attended: 19,
      absent: 1
    },
    {
      course: 'Islamic Jurisprudence',
      totalClasses: 20,
      attended: 18,
      absent: 2
    }
  ];

  const getAbsencePercentage = (record) => {
    if (!record.totalClasses) return 0;

    return Math.round(
      (record.absent / record.totalClasses) * 100
    );
  };



  // ==========================================================
  // REMAINING COURSES
  // ==========================================================

  const remainingCourses = [
    {
      code: 'FND-202',
      title: 'Quarter of Al-Akhdari',
      credits: 3
    },
    {
      code: 'FND-203',
      title: 'Introduction to Quranic Studies',
      credits: 3
    },
    {
      code: 'FND-205',
      title: 'Islamic Jurisprudence',
      credits: 3
    }
  ];

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
  // FINAL EXAMINATION TIMETABLE
  // ==========================================================

  const finalExamTimetable = [
    {
      date: '2026-09-07',
      day: 'Monday',
      time: '09:00 AM',
      course: 'Quarter of 40 Hadith',
      venue: 'Examination Hall A'
    },
    {
      date: '2026-09-09',
      day: 'Wednesday',
      time: '09:00 AM',
      course: 'Arabic Language',
      venue: 'Examination Hall B'
    },
    {
      date: '2026-09-11',
      day: 'Friday',
      time: '11:00 AM',
      course: 'Islamic Jurisprudence',
      venue: 'Examination Hall A'
    }
  ];

  // ==========================================================
  // QUIZZES & ASSIGNMENTS
  // ==========================================================

  const assessments = [
    {
      course: 'Quarter of 40 Hadith',
      assignment: '15%',
      midterm: '20%',
      final: '50%',
      quiz: '15%'
    },
    {
      course: 'Arabic Language',
      assignment: '15%',
      midterm: '20%',
      final: '50%',
      quiz: '15%'
    }
  ];

  // ==========================================================
  // EXAM CERTIFICATE
  // ==========================================================

  const certificateNumber = 'ILM-CERT-2026-001';

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in both fields.');
      return;
    }

    setIsLoggedIn(true);
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveStudentTab('dashboard');
  };

  // ==========================================================
  // COURSE REGISTRATION
  // ==========================================================

  const handleRegisterCourse = (e) => {
    e.preventDefault();

    if (!selectedCourseToRegister) {
      alert('Please select a course.');
      return;
    }

    if (
      currentStudent.registeredCourses.includes(
        selectedCourseToRegister
      )
    ) {
      alert('You are already registered for this course.');
      return;
    }

    const updatedCourses = [
      ...currentStudent.registeredCourses,
      selectedCourseToRegister
    ];

    setStudents(
      students.map((student) =>
        student.id === currentStudent.id
          ? {
              ...student,
              registeredCourses: updatedCourses
            }
          : student
      )
    );

    alert(
      `Successfully registered for ${selectedCourseToRegister}.`
    );

    setSelectedCourseToRegister('');
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

  const handlePrivateTutoring = (e) => {
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

    const newRequest = {
      id: `pr-${Date.now()}`,
      studentName: currentStudent.name,
      course: privateTutoringForm.course,
      instructor: privateTutoringForm.instructor,
      fee: instructor ? instructor.fee : 0,
      status: 'Pending',
      date: new Date().toISOString().substring(0, 10),
      notes: privateTutoringForm.notes
    };

    setPrivateRequests([
      newRequest,
      ...privateRequests
    ]);

    setPrivateTutoringForm({
      course: '',
      instructor: '',
      notes: ''
    });

    alert(
      'Private tutoring request submitted. It will remain pending until approved by administration.'
    );
  };

  // ==========================================================
  // PRIVATE TUTORING PAYMENT
  // Only available after admin approval
  // ==========================================================

  const handlePrivatePayment = (request) => {
    if (request.status !== 'Approved') {
      alert(
        'Payment is only available after the administration approves the tutoring request.'
      );
      return;
    }

    setPrivatePayment({
      ...request,
      paymentReference: `PAY-${Date.now()}`,
      paidAt: new Date().toLocaleString()
    });

    alert('Payment recorded successfully.');
  };

  // ==========================================================
  // ABSENCE EXCUSE
  // ==========================================================

  const handleAbsenceSubmit = (e) => {
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

    const newExcuse = {
      id: `absence-${Date.now()}`,
      ...absenceForm,
      status: 'Pending Review'
    };

    setAbsenceExcuses([
      newExcuse,
      ...absenceExcuses
    ]);

    setAbsenceForm({
      type: 'Lecture',
      date: '',
      course: '',
      reason: ''
    });

    alert('Absence excuse submitted.');
  };

  // ==========================================================
  // SUPERVISOR
  // ==========================================================

  const handleSupervisorMessage = (e) => {
    e.preventDefault();

    if (!supervisorTopic || !supervisorMessage) {
      alert('Please select a topic and enter your message.');
      return;
    }

    setSupervisorMessages([
      {
        id: Date.now(),
        topic: supervisorTopic,
        message: supervisorMessage,
        status: 'Sent',
        date: new Date().toLocaleDateString()
      },
      ...supervisorMessages
    ]);

    setSupervisorTopic('');
    setSupervisorMessage('');

    alert('Message sent to your academic supervisor.');
  };

  // ==========================================================
  // NAME CHANGE
  // ==========================================================

  const handleNameChangeRequest = (e) => {
    e.preventDefault();

    if (!nameChangeRequest.trim()) {
      alert('Please enter the requested name.');
      return;
    }

    setNameChangeSubmitted(true);

    alert(
      'Name change request submitted for administrative review.'
    );
  };

  // ==========================================================
  // NATIONALITY CHANGE
  // ==========================================================

  const handleNationalityRequest = (e) => {
    e.preventDefault();

    if (!nationalityRequest.trim()) {
      alert('Please enter the requested nationality.');
      return;
    }

    setNationalitySubmitted(true);

    alert(
      'Nationality change request submitted for administrative review.'
    );
  };

  // ==========================================================
  // DOCUMENT REQUEST
  // ==========================================================

  const handleDocumentRequest = (e) => {
    e.preventDefault();

    if (!documentRequest) {
      alert('Please select a document.');
      return;
    }

    setDocumentRequests([
      {
        id: Date.now(),
        document: documentRequest,
        status: 'Processing',
        date: new Date().toLocaleDateString()
      },
      ...documentRequests
    ]);

    setDocumentRequest('');

    alert('Official document request submitted.');
  };

  // ==========================================================
  // PASSCODE
  // ==========================================================

  const handlePasscodeChange = (e) => {
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

    alert('Passcode changed successfully.');

    setPasscodeForm({
      oldPasscode: '',
      newPasscode: '',
      confirmPasscode: ''
    });
  };

  // ==========================================================
  // PROFILE PICTURE
  // ==========================================================

  const handleProfilePicture = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePicture(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ==========================================================
  // ASSIGNMENT UPLOAD
  // ==========================================================

  const handleAssignmentUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowed =
      file.type === 'application/pdf' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx');

    if (!allowed) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    setAssignmentFile(file);
    setAssignmentSubmitted(false);
  };

  const submitAssignment = () => {
    if (!assignmentFile) {
      alert('Please select a PDF or DOCX file first.');
      return;
    }

    setAssignmentSubmitted(true);

    alert(
      `${assignmentFile.name} has been submitted successfully.`
    );
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

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '⌂'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: '◉'
    },
    {
      id: 'academic',
      label: 'Academic System',
      icon: '▣'
    },
    {
      id: 'registration',
      label: 'Course Registration',
      icon: '☷'
    },
    {
      id: 'classes',
      label: 'Live Classes',
      icon: '▶'
    },
    {
      id: 'quiz',
      label: 'Quizzes & Assignments',
      icon: '✓'
    },
    {
      id: 'submission',
      label: 'Assignment & Submission',
      icon: '↑'
    },
    {
      id: 'private',
      label: 'Private Tutoring',
      icon: '♙'
    },
    {
      id: 'attendance',
      label: 'Attendance Record',
      icon: '◷'
    },
    {
      id: 'calendar',
      label: 'Academic Calendar',
      icon: '▦'
    },
    {
      id: 'exams',
      label: 'Final Exam Timetable',
      icon: '▤'
    },
    {
      id: 'excuses',
      label: 'Absence Excuses',
      icon: '!'
    },
    {
      id: 'supervisor',
      label: 'Academic Supervisor',
      icon: '☏'
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: '◌'
    },
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: '🔔',
      badge: unreadNotifications
    },
    {
      id: 'documents',
      label: 'Official Documents',
      icon: '▤'
    },
    {
      id: 'certificate',
      label: 'Exam Certificate',
      icon: '★'
    }
  ];

  // ==========================================================
  // LOGIN PAGE
  // ==========================================================

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBack}>
          <Link
            href="/"
            style={styles.backLink}
          >
            ← Back to Home
          </Link>
        </div>

        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>
            <div style={styles.logoCircle}>IH</div>
          </div>

          <div style={styles.loginHeading}>
            <h1 style={styles.loginTitle}>
              Student Portal
            </h1>

            <p style={styles.loginSubtitle}>
              Access your Ilm Hub student account
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
                placeholder="student@ilmhub.edu"
                required
                style={styles.input}
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
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              style={styles.primaryButton}
            >
              Login as Student
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
      </div>
    );
  }

  // ==========================================================
  // STUDENT PORTAL
  // ==========================================================

  return (
    <div style={styles.portal}>
      {/* SIDEBAR */}

      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>
            IH
          </div>

          <div>
            <div style={styles.brandTitle}>
              Ilm Hub
            </div>

            <div style={styles.brandSubtitle}>
              Student Portal
            </div>
          </div>
        </div>

        <div style={styles.studentMiniProfile}>
          <div style={styles.avatar}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Student"
                style={styles.avatarImage}
              />
            ) : (
              currentStudent.name
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={styles.miniName}>
              {currentStudent.name}
            </div>

            <div style={styles.miniId}>
              {currentStudent.studentId}
            </div>
          </div>
        </div>

        <div style={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveStudentTab(item.id);
                setOpenDashboardMenu(null);
              }}
              style={{
                ...styles.sideMenuButton,
                ...(activeStudentTab === item.id
                  ? styles.sideMenuButtonActive
                  : {})
              }}
            >
              <span style={styles.menuIcon}>
                {item.icon}
              </span>

              <span style={styles.menuText}>
                {item.label}
              </span>

              {item.badge > 0 && (
                <span style={styles.menuBadge}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            ⇥ Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main style={styles.main}>
        {/* TOP HEADER */}

        <header style={styles.header}>
          <div>
            <div style={styles.headerEyebrow}>
              STUDENT PORTAL
            </div>

            <h1 style={styles.headerTitle}>
              Welcome, {currentStudent.name}
            </h1>

            <p style={styles.headerDescription}>
              Stay focused, monitor your academic progress,
              and keep your studies on track.
            </p>
          </div>

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
                Your GPA is currently {currentGPA}.
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

              {/* GPA HERO */}

              <div style={styles.gpaHero}>
                <div>
                  <span style={styles.gpaLabel}>
                    CURRENT SEMESTER GPA
                  </span>

                  <strong style={styles.gpaValue}>
                    {currentGPA.toFixed(2)}
                  </strong>

                  <span style={styles.gpaHint}>
                    Semester performance
                  </span>
                </div>

                <div style={styles.cgpaBlock}>
                  <span style={styles.gpaLabel}>
                    CGPA
                  </span>

                  <strong style={styles.cgpaValue}>
                    {currentCGPA.toFixed(2)}
                  </strong>
                </div>

                <div style={styles.statusPill}>
                  {academicStatus}
                </div>
              </div>

              {/* SNAPSHOT */}

              <DashboardSection
                title="Academic Snapshot"
                menuKey="snapshot"
                openDashboardMenu={openDashboardMenu}
                setOpenDashboardMenu={setOpenDashboardMenu}
              >
                <div style={styles.statsGrid}>
                  <StatCard
                    title="Programme"
                    value={
                      currentStudent.enrolledProgramme
                    }
                  />

                  <StatCard
                    title="Study Type"
                    value={
                      currentStudent.studyType
                    }
                  />

                  <StatCard
                    title="Registered Courses"
                    value={
                      currentStudent.registeredCourses
                        .length
                    }
                  />

                  <StatCard
                    title="Fee Status"
                    value={
                      currentStudent.feeStatus
                    }
                  />
                </div>
              </DashboardSection>

              {/* STUDENT PLAN */}

              <DashboardSection
                title="Student Plan"
                menuKey="plan"
                openDashboardMenu={openDashboardMenu}
                setOpenDashboardMenu={setOpenDashboardMenu}
              >
                <div style={styles.planList}>
                  {studentPlan.map((item, index) => (
                    <div
                      key={index}
                      style={styles.planItem}
                    >
                      <span style={styles.planNumber}>
                        {index + 1}
                      </span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.planOverviewHeader}>
                  <div>
                    <strong>Programme Course Overview</strong>
                  </div>
                </div>

                <div style={styles.courseOverviewList}>
                  {coursePlanOverview.map((course) => (
                    <div
                      key={course.code}
                      style={{
                        ...styles.courseOverviewCard,
                        ...(course.status === 'current'
                          ? styles.courseOverviewCurrent
                          : course.status === 'completed'
                            ? styles.courseOverviewCompleted
                            : styles.courseOverviewRemaining)
                      }}
                    >
                      <div style={styles.courseOverviewContent}>
                        <span style={styles.courseOverviewLevel}>
                          {course.level}
                        </span>
                        <strong style={styles.courseOverviewTitle}>
                          {course.title}
                        </strong>
                        <small style={styles.courseOverviewMeta}>
                          {course.code} · {course.credits} Credits
                        </small>
                      </div>

                      <StatusBadge
                        status={
                          course.status === 'current'
                            ? 'Currently Taking'
                            : course.status === 'completed'
                              ? 'Completed'
                              : 'Not Yet Taken'
                        }
                      />
                    </div>
                  ))}
                </div>

                <div style={styles.courseOverviewLegend}>
                  <span style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.legendDot,
                        ...styles.legendCurrent
                      }}
                    />
                    Green = currently taking
                  </span>
                  <span style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.legendDot,
                        ...styles.legendCompleted
                      }}
                    />
                    Blue = completed
                  </span>
                  <span style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.legendDot,
                        ...styles.legendRemaining
                      }}
                    />
                    Red = not yet taken
                  </span>
                </div>
              </DashboardSection>

              {/* ACADEMIC RECORD */}

              <DashboardSection
                title="Academic Record"
                menuKey="record"
                openDashboardMenu={openDashboardMenu}
                setOpenDashboardMenu={setOpenDashboardMenu}
              >
                {academicSemesters.map(
                  (semester) => (
                    <div
                      key={semester.semester}
                      style={styles.semesterBlock}
                    >
                      <div style={styles.semesterHeader}>
                        <strong>
                          {semester.semester}
                        </strong>

                        <span>
                          {semester.academicYear} · GPA{' '}
                          {semester.gpa.toFixed(2)}
                        </span>
                      </div>

                      {semester.courses.map(
                        (course) => (
                          <div
                            key={course.course}
                            style={styles.recordRow}
                          >
                            <span>
                              {course.course}
                            </span>

                            <strong>
                              {course.score}%
                            </strong>

                            <span
                              style={
                                styles.gradeBadge
                              }
                            >
                              {course.grade}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </DashboardSection>

              {/* REMAINING COURSES */}

              <DashboardSection
                title="Remaining Courses"
                menuKey="remaining"
                openDashboardMenu={openDashboardMenu}
                setOpenDashboardMenu={setOpenDashboardMenu}
              >
                <div style={styles.courseGrid}>
                  {remainingCourses.map(
                    (course) => (
                      <div
                        key={course.code}
                        style={styles.courseCard}
                      >
                        <span style={styles.courseCode}>
                          {course.code}
                        </span>

                        <strong>
                          {course.title}
                        </strong>

                        <small>
                          {course.credits} Credits
                        </small>
                      </div>
                    )
                  )}
                </div>
              </DashboardSection>

              {/* GRADING SYSTEM */}

              <DashboardSection
                title="Grading System"
                menuKey="grading"
                openDashboardMenu={openDashboardMenu}
                setOpenDashboardMenu={setOpenDashboardMenu}
              >
                <div style={styles.gradingGrid}>
                  {gradingSystem.map(
                    ([range, grade, description]) => (
                      <div
                        key={range}
                        style={styles.gradingItem}
                      >
                        <strong>{range}</strong>
                        <span>{grade}</span>
                        <small>{description}</small>
                      </div>
                    )
                  )}
                </div>
              </DashboardSection>
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
                  >
                    Change Profile Picture
                  </button>

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
                  >
                    Change Passcode
                  </button>
                </form>
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              ACADEMIC SYSTEM
          ================================================== */}

          {activeStudentTab === 'academic' && (
            <div>
              <PageHeading
                title="Academic System"
                description="Monitor your academic status, GPA, CGPA and official academic records."
              />

              <div style={styles.academicHero}>
                <div>
                  <span style={styles.gpaLabel}>
                    ACADEMIC STATUS
                  </span>

                  <strong
                    style={{
                      ...styles.academicStatus,
                      color:
                        academicStatus === 'Regular'
                          ? '#15803d'
                          : '#b45309'
                    }}
                  >
                    {academicStatus}
                  </strong>

                  <p style={styles.welcomeMessage}>
                    Keep studying consistently and aim
                    to improve your GPA every semester.
                    Your academic progress is built one
                    course at a time.
                  </p>
                </div>

                <div style={styles.academicNumbers}>
                  <div>
                    <small>
                      Semester GPA
                    </small>
                    <strong>
                      {currentGPA.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <small>CGPA</small>
                    <strong>
                      {currentCGPA.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <SectionCard title="Academic Status">
                <div style={styles.statusGrid}>
                  {[
                    'Regular',
                    'Suspended',
                    'Deferred'
                  ].map((status) => (
                    <div
                      key={status}
                      style={{
                        ...styles.statusOption,
                        ...(academicStatus === status
                          ? styles.statusOptionActive
                          : {})
                      }}
                    >
                      <strong>{status}</strong>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="GPA & CGPA">
                <div style={styles.gpaCards}>
                  <div style={styles.bigMetric}>
                    <small>
                      Semester GPA
                    </small>
                    <strong>
                      {currentGPA.toFixed(2)}
                    </strong>
                  </div>

                  <div style={styles.bigMetric}>
                    <small>CGPA</small>
                    <strong>
                      {currentCGPA.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="All Semester Transcript">
                {academicSemesters.map(
                  (semester) => (
                    <div
                      key={semester.semester}
                      style={styles.semesterBlock}
                    >
                      <div style={styles.semesterHeader}>
                        <strong>
                          {semester.semester}
                        </strong>

                        <span>
                          GPA {semester.gpa.toFixed(2)}
                        </span>
                      </div>

                      {semester.courses.map(
                        (course) => (
                          <div
                            key={course.course}
                            style={styles.recordRow}
                          >
                            <span>
                              {course.course}
                            </span>

                            <span>
                              {course.score}%
                            </span>

                            <strong>
                              {course.grade}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
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
                  >
                    Submit Request
                  </button>
                </form>

                {nameChangeSubmitted && (
                  <p style={styles.successText}>
                    Request submitted for
                    administrative review.
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
                  >
                    Submit Request
                  </button>
                </form>

                {nationalitySubmitted && (
                  <p style={styles.successText}>
                    Nationality change request submitted
                    for review.
                  </p>
                )}
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              COURSE REGISTRATION
          ================================================== */}

          {activeStudentTab === 'registration' && (
            <div>
              <PageHeading
                title="Course Registration"
                description="Register for courses available in your current programme."
              />

              <SectionCard title="Currently Registered">
                <div style={styles.courseGrid}>
                  {currentStudent.registeredCourses.map(
                    (course) => (
                      <div
                        key={course}
                        style={styles.courseCard}
                      >
                        <span style={styles.activeDot}>
                          ●
                        </span>

                        <strong>{course}</strong>

                        <small>
                          Registered
                        </small>
                      </div>
                    )
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Register for a Course">
                <form
                  onSubmit={handleRegisterCourse}
                  style={styles.formStack}
                >
                  <label style={styles.label}>
                    Select Course
                  </label>

                  <select
                    value={
                      selectedCourseToRegister
                    }
                    onChange={(e) =>
                      setSelectedCourseToRegister(
                        e.target.value
                      )
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Choose a Course --
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
                          {course.title} (
                          {course.code})
                        </option>
                      ))}
                  </select>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                  >
                    Complete Registration
                  </button>
                </form>
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              LIVE CLASSES
          ================================================== */}

          {activeStudentTab === 'classes' && (
            <div>
              <PageHeading
                title="Live Classes"
                description="View your virtual class timetable and join scheduled sessions."
              />

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Course
                      </th>
                      <th style={styles.th}>
                        Topic
                      </th>
                      <th style={styles.th}>
                        Schedule
                      </th>
                      <th style={styles.th}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td style={styles.td}>
                          <strong>
                            {session.course}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {session.topic}
                        </td>

                        <td style={styles.td}>
                          {session.date} ·{' '}
                          {session.startTime} -{' '}
                          {session.endTime}
                        </td>

                        <td style={styles.td}>
                          <a
                            href={session.link}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.tableLink}
                          >
                            Join Session →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================
              QUIZZES & ASSIGNMENTS
          ================================================== */}

          {activeStudentTab === 'quiz' && (
            <div>
              <PageHeading
                title="Quizzes & Assignments"
                description="View assessment structure and your assessment scores."
              />

              <div style={styles.assessmentInfo}>
                <strong>
                  Assessment Structure
                </strong>

                <span>
                  Assignment 15% · Midterm 20% ·
                  Final 50% · Quiz 15%
                </span>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Course
                      </th>
                      <th style={styles.th}>
                        Assignment
                      </th>
                      <th style={styles.th}>
                        Midterm
                      </th>
                      <th style={styles.th}>
                        Final
                      </th>
                      <th style={styles.th}>
                        Quiz
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assessments.map(
                      (assessment) => (
                        <tr key={assessment.course}>
                          <td style={styles.td}>
                            <strong>
                              {assessment.course}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {assessment.assignment}
                          </td>

                          <td style={styles.td}>
                            {assessment.midterm}
                          </td>

                          <td style={styles.td}>
                            {assessment.final}
                          </td>

                          <td style={styles.td}>
                            {assessment.quiz}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <SectionCard title="My Assessment Scores">
                <div style={styles.scoreList}>
                  <ScoreRow
                    label="Midterm Examination"
                    score="88%"
                  />

                  <ScoreRow
                    label="Quiz 1"
                    score="92%"
                  />

                  <ScoreRow
                    label="Assignment 1"
                    score="90%"
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              ASSIGNMENT SUBMISSION
          ================================================== */}

          {activeStudentTab === 'submission' && (
            <div>
              <PageHeading
                title="Assignment & Submission"
                description="Submit your assignments in PDF or DOCX format."
              />

              <SectionCard title="Submit Assignment">
                <div style={styles.uploadBox}>
                  <div style={styles.uploadIcon}>
                    ↑
                  </div>

                  <h3 style={{ margin: '10px 0 5px' }}>
                    Upload Assignment
                  </h3>

                  <p style={styles.mutedText}>
                    Accepted formats: PDF and DOCX
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={
                      handleAssignmentUpload
                    }
                    style={styles.fileInput}
                  />

                  {assignmentFile && (
                    <div style={styles.filePreview}>
                      <strong>
                        {assignmentFile.name}
                      </strong>

                      <span>
                        {(assignmentFile.size / 1024).toFixed(
                          1
                        )}{' '}
                        KB
                      </span>
                    </div>
                  )}

                  <button
                    onClick={submitAssignment}
                    style={styles.primaryButton}
                  >
                    Submit Assignment
                  </button>

                  {assignmentSubmitted && (
                    <p style={styles.successText}>
                      Assignment submitted successfully.
                    </p>
                  )}
                </div>
              </SectionCard>
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
                        {selectedInstructor.fee}{' '}
                        GHS
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
                              {request.fee} GHS ·{' '}
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

                            {request.status ===
                              'Approved' && (
                              <button
                                onClick={() =>
                                  handlePrivatePayment(
                                    request
                                  )
                                }
                                style={
                                  styles.primarySmallButton
                                }
                              >
                                Make Payment
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
                        IH
                      </div>

                      <div>
                        <h2
                          style={{
                            margin: 0,
                            color: '#16343a'
                          }}
                        >
                          Ilm Hub
                        </h2>

                        <p
                          style={{
                            margin: '3px 0 0',
                            color: '#64748b'
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
              ATTENDANCE
          ================================================== */}

          {activeStudentTab === 'attendance' && (
            <div>
              <PageHeading
                title="Attendance Record"
                description="Monitor your lecture attendance and absence percentage."
              />

              <div style={styles.attendanceRule}>
                <strong>
                  Important Attendance Rule
                </strong>

                <p>
                  A student who reaches 25% absence in a
                  specific course fails that course and must
                  repeat it, subject to the institute's
                  academic regulations.
                </p>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Course
                      </th>
                      <th style={styles.th}>
                        Classes
                      </th>
                      <th style={styles.th}>
                        Attended
                      </th>
                      <th style={styles.th}>
                        Absence
                      </th>
                      <th style={styles.th}>
                        Percentage
                      </th>
                      <th style={styles.th}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceRecords.map(
                      (record) => {
                        const percentage =
                          getAbsencePercentage(
                            record
                          );

                        const failed =
                          percentage >= 25;

                        return (
                          <tr key={record.course}>
                            <td style={styles.td}>
                              <strong>
                                {record.course}
                              </strong>
                            </td>

                            <td style={styles.td}>
                              {record.totalClasses}
                            </td>

                            <td style={styles.td}>
                              {record.attended}
                            </td>

                            <td style={styles.td}>
                              {record.absent}
                            </td>

                            <td style={styles.td}>
                              <strong
                                style={{
                                  color: failed
                                    ? '#dc2626'
                                    : '#15803d'
                                }}
                              >
                                {percentage}%
                              </strong>
                            </td>

                            <td style={styles.td}>
                              <StatusBadge
                                status={
                                  failed
                                    ? 'Repeat Course'
                                    : 'Good Standing'
                                }
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
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
                <div>
                  <strong>Today</strong>
                  <span>{formatCalendarDate(today)}</span>
                </div>

                <button
                  onClick={goToCurrentMonth}
                  style={styles.calendarTodayButton}
                >
                  Today
                </button>
              </div>

              <SectionCard title="Academic Events">
                <div style={styles.horizontalEvents}>
                  <CalendarEvent
                    date="01 Aug"
                    title="Course Registration"
                  />

                  <CalendarEvent
                    date="15 Sep"
                    title="Midterm Preparation"
                  />

                  <CalendarEvent
                    date="01 Oct"
                    title="Midterm Examinations"
                  />

                  <CalendarEvent
                    date="30 Nov"
                    title="Final Examinations"
                  />
                </div>
              </SectionCard>

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
              EXAM TIMETABLE
          ================================================== */}

          {activeStudentTab === 'exams' && (
            <div>
              <PageHeading
                title="Final Examination Timetable"
                description="Your official final examination schedule."
              />

              <div
                id="exam-timetable"
                style={styles.tableWrapper}
              >
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Date
                      </th>
                      <th style={styles.th}>
                        Day
                      </th>
                      <th style={styles.th}>
                        Time
                      </th>
                      <th style={styles.th}>
                        Course
                      </th>
                      <th style={styles.th}>
                        Venue
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {finalExamTimetable.map(
                      (exam) => (
                        <tr key={exam.date + exam.course}>
                          <td style={styles.td}>
                            {exam.date}
                          </td>

                          <td style={styles.td}>
                            {exam.day}
                          </td>

                          <td style={styles.td}>
                            {exam.time}
                          </td>

                          <td style={styles.td}>
                            <strong>
                              {exam.course}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {exam.venue}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => printCurrentPage('exam-timetable')}
                style={styles.primaryButton}
              >
                Print Examination Timetable
              </button>
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
                  >
                    Submit Excuse
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
                        color: '#16343a'
                      }}
                    >
                      {announcement.title}
                    </h3>

                    <p
                      style={{
                        margin: '0 0 10px',
                        color: '#475569'
                      }}
                    >
                      {announcement.message}
                    </p>

                    <small
                      style={{
                        color: '#64748b'
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
                title="Official Documents"
                description="Request official documents from the institute."
              />

              <SectionCard title="Request Official Document">
                <form
                  onSubmit={
                    handleDocumentRequest
                  }
                  style={styles.formStack}
                >
                  <select
                    value={documentRequest}
                    onChange={(e) =>
                      setDocumentRequest(
                        e.target.value
                      )
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">
                      -- Select Document --
                    </option>

                    <option value="Official Transcript">
                      Official Transcript
                    </option>

                    <option value="Certificate of Enrolment">
                      Certificate of Enrolment
                    </option>

                    <option value="Academic Standing Letter">
                      Academic Standing Letter
                    </option>

                    <option value="Student Status Letter">
                      Student Status Letter
                    </option>

                    <option value="Examination Certificate">
                      Examination Certificate
                    </option>
                  </select>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                  >
                    Request Document
                  </button>
                </form>
              </SectionCard>

              <SectionCard title="My Requests">
                {documentRequests.length === 0 ? (
                  <EmptyState
                    text="No document requests submitted."
                  />
                ) : (
                  documentRequests.map(
                    (request) => (
                      <div
                        key={request.id}
                        style={styles.requestCard}
                      >
                        <div>
                          <strong>
                            {request.document}
                          </strong>

                          <small>
                            {request.date}
                          </small>
                        </div>

                        <StatusBadge
                          status={request.status}
                        />
                      </div>
                    )
                  )
                )}
              </SectionCard>
            </div>
          )}

          {/* ==================================================
              EXAM CERTIFICATE
          ================================================== */}

          {activeStudentTab === 'certificate' && (
            <div>
              <PageHeading
                title="Examination Certificate"
                description="View and print your examination certificate."
              />

              <div
                id="exam-certificate"
                style={styles.certificate}
              >
                <div className="certificateBorder" style={styles.certificateBorder}>
                  <div
                    style={
                      styles.certificateLogo
                    }
                  >
                    IH
                  </div>

                  <p
                    style={{
                      margin: '10px 0 3px',
                      letterSpacing: '3px',
                      color: '#64748b',
                      fontSize: '13px'
                    }}
                  >
                    ILM HUB
                  </p>

                  <h1
                    className="certificateTitle"
                    style={
                      styles.certificateTitle
                    }
                  >
                    EXAMINATION CERTIFICATE
                  </h1>

                  <div
                    style={
                      styles.certificateLine
                    }
                  />

                  <p
                    style={
                      styles.certificateIntro
                    }
                  >
                    This is to certify that
                  </p>

                  <h2
                    className="certificateName"
                    style={
                      styles.certificateName
                    }
                  >
                    {currentStudent.name}
                  </h2>

                  <p
                    className="certificateBody"
                    style={
                      styles.certificateBody
                    }
                  >
                    Student ID:{' '}
                    <strong>
                      {currentStudent.studentId}
                    </strong>
                  </p>

                  <p
                    className="certificateBody"
                    style={
                      styles.certificateBody
                    }
                  >
                    has completed the applicable
                    examination requirements for the
                  </p>

                  <h3
                    style={{
                      color: '#16343a',
                      margin: '8px 0'
                    }}
                  >
                    {currentStudent.enrolledProgramme}
                  </h3>

                  <p
                    className="certificateBody"
                    style={
                      styles.certificateBody
                    }
                  >
                    with a cumulative academic
                    performance of
                  </p>

                  <div
                    style={
                      styles.certificateGPA
                    }
                  >
                    CGPA {currentCGPA.toFixed(2)}
                  </div>

                  <p
                    className="certificateBody"
                    style={
                      styles.certificateBody
                    }
                  >
                    Certificate No:{' '}
                    {certificateNumber}
                  </p>

                  <div
                    className="certificateFooter"
                    style={
                      styles.certificateFooter
                    }
                  >
                    <div>
                      <span />
                      <small>
                        Academic Registrar
                      </small>
                    </div>

                    <div>
                      <span />
                      <small>
                        Date of Issue
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => printCurrentPage('exam-certificate')}
                style={styles.primaryButton}
              >
                Print Certificate
              </button>
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
// DASHBOARD SECTION WITH THREE-DOT MENU
// ============================================================

function DashboardSection({
  title,
  menuKey,
  openDashboardMenu,
  setOpenDashboardMenu,
  children
}) {
  const isOpen =
    openDashboardMenu === menuKey;

  return (
    <div style={styles.dashboardSection}>
      <div style={styles.dashboardSectionHeader}>
        <h3 style={styles.dashboardSectionTitle}>
          {title}
        </h3>

        <div style={styles.menuWrapper}>
          <button
            onClick={() =>
              setOpenDashboardMenu(
                isOpen ? null : menuKey
              )
            }
            style={styles.dotsButton}
            aria-label={`Open ${title}`}
          >
            ⋮
          </button>

          {isOpen && (
            <div
              style={
                styles.dashboardDropdown
              }
            >
              <button
                onClick={() =>
                  setOpenDashboardMenu(null)
                }
                style={styles.dropdownItem}
              >
                Open {title}
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div style={styles.dashboardSectionContent}>
          {children}
        </div>
      )}

      {!isOpen && (
        <div style={styles.hiddenSectionHint}>
          Tap ⋮ to view
        </div>
      )}
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
  let background = '#e2e8f0';
  let color = '#334155';

  if (
    status === 'Approved' ||
    status === 'Good Standing' ||
    status === 'Paid'
  ) {
    background = '#dcfce7';
    color = '#166534';
  }

  if (
    status === 'Pending' ||
    status === 'Pending Review' ||
    status === 'Processing'
  ) {
    background = '#fef3c7';
    color = '#92400e';
  }

  if (
    status === 'Repeat Course' ||
    status === 'Rejected' ||
    status === 'Suspended'
  ) {
    background = '#fee2e2';
    color = '#991b1b';
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
      'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 55%, #ecfdf5 100%)',
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
    color: '#16343a',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px'
  },

  loginCard: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '500px',
    padding: '42px',
    borderRadius: '20px',
    border: '1px solid #dbe5e2',
    boxShadow:
      '0 20px 50px rgba(22, 52, 58, 0.10)'
  },

  loginLogo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '18px'
  },

  logoCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    background: '#16343a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    letterSpacing: '1px'
  },

  loginHeading: {
    textAlign: 'center',
    marginBottom: '28px'
  },

  loginTitle: {
    color: '#14532d',
    margin: '0 0 8px',
    fontSize: '29px'
  },

  loginSubtitle: {
    color: '#64748b',
    fontSize: '15px',
    margin: 0
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
    color: '#334155',
    marginBottom: '7px'
  },

  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#1e293b',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none'
  },

  textarea: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#1e293b',
    background: '#ffffff',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },

  primaryButton: {
    background: '#16343a',
    color: '#ffffff',
    border: 'none',
    padding: '13px 18px',
    borderRadius: '9px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    minHeight: '46px'
  },

  primarySmallButton: {
    background: '#16343a',
    color: '#ffffff',
    border: 'none',
    padding: '9px 13px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer'
  },

  secondaryButton: {
    background: '#f1f5f9',
    color: '#16343a',
    border: '1px solid #dbe5e2',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer'
  },

  loginFooter: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '14px',
    color: '#64748b'
  },

  link: {
    color: '#16343a',
    fontWeight: 800,
    textDecoration: 'none'
  },

  // ----------------------------------------------------------
  // PORTAL
  // ----------------------------------------------------------

  portal: {
    minHeight: '100vh',
    background: '#f5f8f7',
    display: 'flex',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#334155'
  },

  sidebar: {
    width: '270px',
    background: '#102e34',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '22px 14px',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    overflowY: 'auto'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '5px 10px 22px',
    borderBottom:
      '1px solid rgba(255,255,255,0.10)'
  },

  brandMark: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#ffffff',
    color: '#16343a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900
  },

  brandTitle: {
    fontSize: '18px',
    fontWeight: 900
  },

  brandSubtitle: {
    fontSize: '12px',
    color: '#b6c9cc',
    marginTop: '2px'
  },

  studentMiniProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '18px 10px'
  },

  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#d9f0e5',
    color: '#16343a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    overflow: 'hidden',
    flexShrink: 0
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  miniName: {
    fontWeight: 800,
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  miniId: {
    fontSize: '11px',
    color: '#b6c9cc',
    marginTop: '3px'
  },

  sidebarMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  sideMenuButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '11px 12px',
    border: 'none',
    background: 'transparent',
    color: '#cbdadd',
    borderRadius: '9px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 650
  },

  sideMenuButtonActive: {
    background: '#ffffff',
    color: '#16343a'
  },

  menuIcon: {
    width: '22px',
    textAlign: 'center',
    fontSize: '15px'
  },

  menuText: {
    flex: 1
  },

  menuBadge: {
    minWidth: '21px',
    height: '21px',
    borderRadius: '50%',
    background: '#ef4444',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 900
  },

  sidebarBottom: {
    marginTop: '25px',
    paddingTop: '15px',
    borderTop:
      '1px solid rgba(255,255,255,0.10)'
  },

  logoutButton: {
    width: '100%',
    padding: '11px',
    background:
      'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '9px',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer'
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: '30px 34px 60px'
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px'
  },

  headerEyebrow: {
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.6px',
    color: '#15803d',
    marginBottom: '6px'
  },

  headerTitle: {
    margin: 0,
    color: '#16343a',
    fontSize: '28px',
    fontWeight: 900
  },

  headerDescription: {
    margin: '7px 0 0',
    color: '#64748b',
    fontSize: '15px'
  },

  notificationButton: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: '#ffffff',
    border: '1px solid #dbe5e2',
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
    background: '#dc2626',
    color: '#ffffff',
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
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderLeft: '5px solid #f97316',
    borderRadius: '12px',
    padding: '16px 18px',
    marginBottom: '20px',
    color: '#7c2d12',
    fontSize: '14px'
  },

  warningIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#f97316',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    flexShrink: 0
  },

  contentCard: {
    background: '#ffffff',
    border: '1px solid #dfe8e5',
    borderRadius: '16px',
    padding: '28px',
    boxShadow:
      '0 8px 30px rgba(22, 52, 58, 0.05)'
  },

  pageHeading: {
    marginBottom: '24px'
  },

  pageTitle: {
    color: '#16343a',
    fontSize: '23px',
    margin: 0,
    fontWeight: 900
  },

  pageDescription: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: '15px'
  },

  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------

  gpaHero: {
    background:
      'linear-gradient(135deg, #16343a, #1e4d4c)',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '35px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },

  gpaLabel: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '1.2px',
    fontWeight: 900,
    color: '#b7d9cf'
  },

  gpaValue: {
    display: 'block',
    fontSize: '50px',
    lineHeight: 1,
    fontWeight: 950,
    marginTop: '7px'
  },

  gpaHint: {
    display: 'block',
    marginTop: '6px',
    color: '#c9dcda',
    fontSize: '13px'
  },

  cgpaBlock: {
    paddingLeft: '30px',
    borderLeft:
      '1px solid rgba(255,255,255,0.20)'
  },

  cgpaValue: {
    display: 'block',
    fontSize: '32px',
    marginTop: '7px',
    fontWeight: 900
  },

  statusPill: {
    marginLeft: 'auto',
    background: '#dcfce7',
    color: '#166534',
    padding: '9px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 900
  },

  dashboardSection: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '15px',
    overflow: 'visible',
    background: '#ffffff'
  },

  dashboardSectionHeader: {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px'
  },

  dashboardSectionTitle: {
    margin: 0,
    color: '#16343a',
    fontSize: '17px',
    fontWeight: 850
  },

  menuWrapper: {
    position: 'relative'
  },

  dotsButton: {
    border: 'none',
    background: '#f1f5f9',
    color: '#334155',
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
    background: '#ffffff',
    border: '1px solid #dbe5e2',
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
    background: '#ffffff',
    textAlign: 'left',
    padding: '9px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#334155'
  },

  dashboardSectionContent: {
    borderTop: '1px solid #e2e8f0',
    padding: '18px'
  },

  hiddenSectionHint: {
    color: '#94a3b8',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px'
  },

  statLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '6px'
  },

  statValue: {
    display: 'block',
    color: '#16343a',
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
    background: '#f8fafc',
    padding: '12px',
    borderRadius: '9px',
    fontSize: '14px'
  },

  planOverviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '22px',
    marginBottom: '10px',
    color: '#16343a',
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
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
    fontSize: '14px'
  },

  courseOverviewCurrent: {
    background: '#f0fdf4',
    borderColor: '#86efac'
  },

  courseOverviewCompleted: {
    background: '#eff6ff',
    borderColor: '#93c5fd'
  },

  courseOverviewRemaining: {
    background: '#fef2f2',
    borderColor: '#fecaca'
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
    color: '#16343a',
    fontSize: '15px',
    lineHeight: 1.45,
    marginBottom: '8px'
  },

  courseOverviewMeta: {
    display: 'block',
    color: '#64748b',
    fontSize: '12px'
  },

  courseOverviewLevel: {
    display: 'block',
    color: '#64748b',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#475569',
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
    background: '#22c55e'
  },

  legendCompleted: {
    background: '#3b82f6'
  },

  legendRemaining: {
    background: '#ef4444'
  },



  planNumber: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#d9f0e5',
    color: '#16343a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    flexShrink: 0
  },

  semesterBlock: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    marginBottom: '12px',
    overflow: 'hidden'
  },

  semesterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    background: '#f1f5f9',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#334155'
  },

  recordRow: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(150px, 1fr) 100px 80px',
    gap: '10px',
    padding: '12px 14px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '14px',
    alignItems: 'center'
  },

  gradeBadge: {
    display: 'inline-flex',
    justifyContent: 'center',
    background: '#e0f2fe',
    color: '#075985',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '14px'
  },

  courseCode: {
    color: '#15803d',
    fontWeight: 900,
    fontSize: '12px'
  },

  activeDot: {
    color: '#16a34a',
    fontSize: '11px'
  },

  gradingGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px'
  },

  gradingItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    background: '#ffffff'
  },

  sectionTitle: {
    color: '#16343a',
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
    background: '#f8fafc',
    borderRadius: '9px',
    padding: '13px',
    border: '1px solid #e2e8f0'
  },

  infoLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '5px'
  },

  infoValue: {
    display: 'block',
    color: '#334155',
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
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '18px'
  },

  largeAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#d9f0e5',
    color: '#16343a',
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
    color: '#16343a',
    margin: '0 0 5px',
    fontSize: '22px'
  },

  profileMeta: {
    color: '#64748b',
    margin: '0 0 12px',
    fontSize: '14px'
  },

  successText: {
    color: '#15803d',
    fontWeight: 700,
    fontSize: '14px',
    marginTop: '12px'
  },

  mutedText: {
    color: '#64748b',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // ACADEMIC SYSTEM
  // ----------------------------------------------------------

  academicHero: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
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
    color: '#475569',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    textAlign: 'center'
  },

  statusOptionActive: {
    background: '#dcfce7',
    borderColor: '#86efac',
    color: '#166534'
  },

  gpaCards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px'
  },

  bigMetric: {
    background: '#f8fafc',
    padding: '22px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },

  // ----------------------------------------------------------
  // TABLE
  // ----------------------------------------------------------

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    marginBottom: '16px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px'
  },

  th: {
    background: '#f1f5f9',
    color: '#334155',
    padding: '13px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 850
  },

  td: {
    padding: '13px',
    borderTop: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '14px'
  },

  tableLink: {
    color: '#166534',
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
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
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
    background: '#f8fafc',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // UPLOAD
  // ----------------------------------------------------------

  uploadBox: {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    background: '#f8fafc'
  },

  uploadIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto',
    borderRadius: '12px',
    background: '#d9f0e5',
    color: '#16343a',
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

  filePreview: {
    maxWidth: '500px',
    margin: '0 auto 15px',
    padding: '12px',
    borderRadius: '8px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
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
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '14px',
    borderRadius: '9px',
    color: '#166534'
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
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
    color: '#64748b',
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    marginTop: '15px'
  },

  receipt: {
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '15px',
    position: 'relative',
    background: '#ffffff'
  },

  receiptHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '18px',
    borderBottom: '1px solid #e2e8f0',
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
    border: '2px solid #16a34a',
    color: '#16a34a',
    fontWeight: 900,
    transform: 'rotate(-5deg)',
    borderRadius: '5px'
  },

  // ----------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------

  attendanceRule: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderLeft: '5px solid #f97316',
    padding: '15px 18px',
    borderRadius: '10px',
    marginBottom: '18px',
    color: '#7c2d12',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '15px 18px',
    marginBottom: '14px'
  },

  calendarModeSelect: {
    minWidth: '190px',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    fontSize: '14px'
  },

  calendarToday: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    background: '#16343a',
    color: '#ffffff',
    padding: '16px 18px',
    borderRadius: '10px',
    marginBottom: '16px'
  },

  calendarTodayButton: {
    background: '#ffffff',
    color: '#16343a',
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
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  calendarBox: {
    border: '1px solid #dbe5e2',
    borderRadius: '12px',
    background: '#ffffff',
    overflow: 'hidden'
  },

  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },

  calendarMonthTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: '#16343a',
    fontSize: '16px'
  },

  calendarMonthTitleSmall: {
    color: '#64748b',
    fontSize: '12px'
  },

  calendarNavButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid #dbe5e2',
    background: '#ffffff',
    color: '#16343a',
    cursor: 'pointer',
    fontSize: '24px',
    lineHeight: 1
  },

  calendarWeekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    background: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0'
  },

  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)'
  },

  calendarDay: {
    minHeight: '82px',
    padding: '9px 7px',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '4px',
    fontSize: '13px',
    color: '#334155'
  },

  calendarDayOutsideMonth: {
    background: '#f8fafc',
    color: '#94a3b8'
  },

  calendarDayToday: {
    background: '#16343a',
    color: '#ffffff',
    boxShadow: 'inset 0 0 0 2px #86efac'
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
    border: '1px solid #dbe5e2',
    background: '#f8fafc',
    color: '#334155',
    padding: '11px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 650,
    fontSize: '13px'
  },

  topicButtonActive: {
    background: '#16343a',
    color: '#ffffff',
    borderColor: '#16343a'
  },

  messageCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '15px',
    borderRadius: '9px',
    marginBottom: '9px'
  },

  // ----------------------------------------------------------
  // ANNOUNCEMENTS
  // ----------------------------------------------------------

  announcementCard: {
    border: '1px solid #e2e8f0',
    borderLeft: '5px solid #16343a',
    borderRadius: '10px',
    padding: '17px',
    marginBottom: '12px',
    background: '#ffffff'
  },

  announcementBadge: {
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '999px',
    background: '#e0f2fe',
    color: '#075985',
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
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '15px'
  },

  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    position: 'relative',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '10px',
    background: '#ffffff'
  },

  notificationIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '9px',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  unreadDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: '#ef4444',
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
    background: '#f8fafc',
    color: '#64748b',
    borderRadius: '10px',
    fontSize: '14px'
  },

  // ----------------------------------------------------------
  // CERTIFICATE
  // ----------------------------------------------------------

  certificate: {
    background: '#f8fafc',
    padding: '18px',
    borderRadius: '12px',
    marginBottom: '18px',
    boxSizing: 'border-box'
  },

  certificateBorder: {
    border: '7px double #16343a',
    padding: '32px 34px',
    textAlign: 'center',
    background: '#ffffff',
    minHeight: '650px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  certificateLogo: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: '#16343a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '20px'
  },

  certificateTitle: {
    color: '#16343a',
    fontSize: '26px',
    letterSpacing: '2px',
    margin: '12px 0'
  },

  certificateLine: {
    width: '180px',
    height: '3px',
    background: '#b58b45',
    margin: '8px 0 22px'
  },

  certificateIntro: {
    color: '#64748b',
    fontSize: '15px'
  },

  certificateName: {
    color: '#16343a',
    fontSize: '28px',
    margin: '4px 0 10px'
  },

  certificateBody: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: 1.7,
    maxWidth: '650px'
  },

  certificateGPA: {
    color: '#16343a',
    fontSize: '24px',
    fontWeight: 900,
    padding: '10px 20px',
    borderTop: '1px solid #cbd5e1',
    borderBottom: '1px solid #cbd5e1',
    margin: '12px 0'
  },

  certificateFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '600px',
    marginTop: '34px',
    gap: '60px'
  },

  certificateFooterDiv: {},

  certificateFooterSpan: {},

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
      'ilm-hub-student-print-style'
    );

  if (!existingStyle) {
    const styleElement =
      document.createElement('style');

    styleElement.id =
      'ilm-hub-student-print-style';

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

        body.ilm-print-mode #exam-certificate {
          padding: 0 !important;
          background: white !important;
        }

        body.ilm-print-mode #exam-certificate .certificateBorder {
          min-height: 0 !important;
          height: 257mm !important;
          padding: 24mm 18mm !important;
          box-sizing: border-box !important;
          page-break-inside: avoid !important;
        }

        body.ilm-print-mode #exam-certificate .certificateTitle {
          font-size: 23px !important;
        }

        body.ilm-print-mode #exam-certificate .certificateName {
          font-size: 25px !important;
        }

        body.ilm-print-mode #exam-certificate .certificateBody {
          font-size: 13px !important;
          line-height: 1.45 !important;
        }

        body.ilm-print-mode #exam-certificate .certificateFooter {
          margin-top: 25mm !important;
        }

        body.ilm-print-mode #private-receipt,
        body.ilm-print-mode #exam-timetable {
          display: block !important;
          box-shadow: none !important;
          border: none !important;
        }
      }

      @media (max-width: 900px) {
        aside {
          width: 220px !important;
        }

        main {
          padding: 20px !important;
        }
      }

      @media (max-width: 700px) {
        body {
          overflow-x: hidden;
        }

        aside {
          display: none !important;
        }

        main {
          width: 100% !important;
          padding: 15px !important;
        }

        .student-mobile {
          display: block;
        }
      }
    `;

    document.head.appendChild(styleElement);
  }
}