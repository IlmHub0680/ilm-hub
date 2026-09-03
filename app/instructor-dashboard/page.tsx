'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CourseWeights = {
    quiz1: number;
    quiz2: number;
    assignment: number;
    midterm: number;
    final: number;
};

type Course = {
    id: string;
    title: string;
    code: string;
    quiz1Weight: number;
    quiz2Weight: number;
    assignWeight: number;
    midtermWeight: number;
    finalWeight: number;
};

type StudentGrade = {
    studentId: string;
    studentName: string;
    quiz1: number;
    quiz2: number;
    assignment: number;
    midterm: number;
    final: number;
};

export default function InstructorDashboard() {
    const [activeTab, setActiveTab] = useState('courses');
    const router = useRouter();

    // Grades State Management
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [weights, setWeights] = useState<CourseWeights>({
        quiz1: 15,
        quiz2: 15,
        assignment: 10,
        midterm: 20,
        final: 40,
    });
    const [studentsGrades, setStudentsGrades] = useState<StudentGrade[]>([]);
    const [loadingGrades, setLoadingGrades] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
      if (activeTab === 'grades') {
        fetchGradesData();
      }
    }, [activeTab]);

    const fetchGradesData = async (courseId?: string) => {
      setLoadingGrades(true);
      try {
        const url = courseId ? `/api/instructor/portal/grades?courseId=${courseId}` : `/api/instructor/portal/grades`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.courses) {
          setCourses(data.courses);
          setSelectedCourseId(data.activeCourseId);
          setWeights(data.weights);
          setStudentsGrades(data.students);
        }
      } catch (err) {
        console.error("Error loading grade submission data", err);
      } finally {
        setLoadingGrades(false);
      }
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCourseId = e.target.value;
      setSelectedCourseId(newCourseId);
      
      const selectedCourse = courses.find((c) => c.id === newCourseId);
      if (selectedCourse) {
        setWeights({
          quiz1: selectedCourse.quiz1Weight,
          quiz2: selectedCourse.quiz2Weight,
          assignment: selectedCourse.assignWeight,
          midterm: selectedCourse.midtermWeight,
          final: selectedCourse.finalWeight,
        });
      }

      fetchGradesData(newCourseId);
    };

    const handleScoreChange = (studentId: string, field: keyof StudentGrade, value: string) => {
      const numericValue = value === "" ? 0 : parseFloat(value);
      setStudentsGrades((prev) =>
        prev.map((student) =>
          student.studentId === studentId ? { ...student, [field]: numericValue } : student
        )
      );
    };

    const calculateTotal = (student: StudentGrade) => {
      const total =
        (student.quiz1 * weights.quiz1) / 100 +
        (student.quiz2 * weights.quiz2) / 100 +
        (student.assignment * weights.assignment) / 100 +
        (student.midterm * weights.midterm) / 100 +
        (student.final * weights.final) / 100;
      return total.toFixed(2);
    };

    const handleSubmitGrades = async () => {
      setSaving(true);
      setMessage("");
      try {
        const res = await fetch("/api/instructor/portal/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: selectedCourseId,
            grades: studentsGrades,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage("Grades saved successfully!");
        } else {
          setMessage(data.error || "Failed to save grades.");
        }
      } catch (err) {
        setMessage("An error occurred while saving grades.");
      } finally {
        setSaving(false);
      }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#14532d', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0' }}>
                <div>
                    <div style={{ padding: '0 24px 24px 24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        Instructor Portal
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px' }}>
                        {[
                            { id: 'courses', label: 'My Assigned Courses' },
                            { id: 'students', label: 'Student Enrollees' },
                            { id: 'grades', label: 'Grading & Submissions' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? '#16a34a' : 'transparent',
                                    color: '#ffffff',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Bottom / Logout */}
                <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    >
                        Logout
                    </button>
                    <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13px' }}>
                        &larr; Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <h1 style={{ color: '#14532d', margin: '0 0 8px 0', fontSize: '28px' }}>Instructor Dashboard</h1>
                <p style={{ color: '#64748b', margin: '0 0 30px 0', fontSize: '15px' }}>Manage your courses, lectures, and student evaluations.</p>
                
                {activeTab === 'courses' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h2 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Assigned Courses</h2>
                        <p style={{ color: '#64748b' }}>You are currently instructing active modules for the Islamic Studies department.</p>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h2 style={{ color: '#14532d', marginTop: 0, fontSize: '20px' }}>Student Enrollees</h2>
                        <p style={{ color: '#64748b' }}>View list of registered students across your active modules.</p>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ color: '#14532d', margin: '0 0 4px 0', fontSize: '20px' }}>Grade Submissions Portal</h2>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Select a course to dynamically apply its weighting structure and submit marks.</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '350px' }}>
                                <label htmlFor="course-dropdown" style={{ fontWeight: '500', color: '#334155', fontSize: '14px', whiteSpace: 'nowrap' }}>Course:</label>
                                <select
                                    id="course-dropdown"
                                    value={selectedCourseId}
                                    onChange={handleCourseChange}
                                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', backgroundColor: '#ffffff', color: '#1e293b', fontSize: '14px', outline: 'none' }}
                                >
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {message && (
                            <div style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', backgroundColor: message.includes("success") ? '#f0fdf4' : '#fef2f2', color: message.includes("success") ? '#166534' : '#991b1b', border: `1px solid ${message.includes("success") ? '#bbf7d0' : '#fecaca'}` }}>
                                {message}
                            </div>
                        )}

                        {loadingGrades && courses.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading grading structure...</div>
                        ) : (
                            <>
                                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', textAlign: 'left', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8fafc', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Student Name</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Quiz 1 ({weights.quiz1}%)</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Quiz 2 ({weights.quiz2}%)</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Assignment ({weights.assignment}%)</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Midterm ({weights.midterm}%)</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Final ({weights.final}%)</th>
                                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Calculated Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsGrades.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                                        No students enrolled in this course yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentsGrades.map((student) => (
                                                    <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 16px', fontWeight: '500', color: '#0f172a' }}>{student.studentName}</td>
                                                        
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={student.quiz1}
                                                                onChange={(e) => handleScoreChange(student.studentId, "quiz1", e.target.value)}
                                                                style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center', outline: 'none' }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={student.quiz2}
                                                                onChange={(e) => handleScoreChange(student.studentId, "quiz2", e.target.value)}
                                                                style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center', outline: 'none' }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={student.assignment}
                                                                onChange={(e) => handleScoreChange(student.studentId, "assignment", e.target.value)}
                                                                style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center', outline: 'none' }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={student.midterm}
                                                                onChange={(e) => handleScoreChange(student.studentId, "midterm", e.target.value)}
                                                                style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center', outline: 'none' }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={student.final}
                                                                onChange={(e) => handleScoreChange(student.studentId, "final", e.target.value)}
                                                                style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center', outline: 'none' }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff' }}>
                                                            {calculateTotal(student)}%
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <button
                                        onClick={handleSubmitGrades}
                                        disabled={saving || studentsGrades.length === 0}
                                        style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: saving || studentsGrades.length === 0 ? '0.5' : '1' }}
                                    >
                                        {saving ? "Saving Grades..." : "Save & Submit Grades"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}