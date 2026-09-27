'use client';
import { useState, useEffect } from 'react';
import { FeedbackBanner, fieldStyle, AttendanceMarkCell, STATUS_TONE_CLASS, AttendanceMark } from '../_shared';
import { ATTENDANCE_STATUS_TONE } from '@/lib/attendancePolicy';

type Course = {
    id: string;
    title: string;
    code: string;
};

type AttendanceStudent = {
    studentProfileId: string;
    studentName: string;
    studentEmail: string;
    studentNo: string;
    totalClasses: number;
    attended: number;
    late: number;
    absent: number;
    attendanceRate: number | null;
    status: string;
};

export default function AttendancePage() {
    const [attendanceCourses, setAttendanceCourses] = useState<Course[]>([]);
    const [attendanceCourseId, setAttendanceCourseId] = useState<string>("");
    const [attendanceStudents, setAttendanceStudents] = useState<AttendanceStudent[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
    const [attendanceMessage, setAttendanceMessage] = useState<string>("");
    const [savingAttendance, setSavingAttendance] = useState<boolean>(false);
    const [attendanceMarks, setAttendanceMarks] = useState<Record<string, AttendanceMark>>({});

    useEffect(() => {
        fetchAttendanceData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAttendanceData = async (courseId?: string) => {
        setLoadingAttendance(true);
        try {
            const url = courseId ? `/api/instructor/attendance?courseId=${courseId}` : `/api/instructor/attendance`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.courses) {
                setAttendanceCourses(data.courses);
                setAttendanceCourseId(data.activeCourseId || "");
                setAttendanceStudents(data.students || []);
                setAttendanceMarks({});
            }
        } catch (err) {
            console.error("Error loading attendance data", err);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleAttendanceCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCourseId = e.target.value;
        setAttendanceCourseId(newCourseId);
        fetchAttendanceData(newCourseId);
    };

    const handleMarkChange = (studentProfileId: string, mark: AttendanceMark) => {
        setAttendanceMarks((prev) => ({ ...prev, [studentProfileId]: mark }));
    };

    const allStudentsMarked =
        attendanceStudents.length > 0 &&
        attendanceStudents.every((s) => attendanceMarks[s.studentProfileId]);

    const handleSaveAttendance = async () => {
        if (!allStudentsMarked) {
            setAttendanceMessage("Please mark every student Present, Late, or Absent before saving.");
            return;
        }

        setSavingAttendance(true);
        setAttendanceMessage("");
        try {
            const marks = attendanceStudents.map((s) => ({
                studentProfileId: s.studentProfileId,
                mark: attendanceMarks[s.studentProfileId],
            }));

            const res = await fetch("/api/instructor/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId: attendanceCourseId, marks }),
            });

            const data = await res.json();
            if (res.ok) {
                setAttendanceMessage("Today's attendance recorded successfully!");
                fetchAttendanceData(attendanceCourseId);
            } else {
                setAttendanceMessage(data.error || "Failed to save attendance.");
            }
        } catch (err) {
            setAttendanceMessage("An error occurred while saving attendance.");
        } finally {
            setSavingAttendance(false);
        }
    };

    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const markedCount = attendanceStudents.filter((s) => attendanceMarks[s.studentProfileId]).length;

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Attendance</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>{todayLabel}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label htmlFor="attendance-course-dropdown" style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select id="attendance-course-dropdown" value={attendanceCourseId} onChange={handleAttendanceCourseChange} style={{ ...fieldStyle, minWidth: 220 }}>
                        {attendanceCourses.map((course) => (
                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {attendanceMessage && <FeedbackBanner text={attendanceMessage} />}

            {loadingAttendance && attendanceCourses.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading attendance…</div>
            ) : attendanceCourses.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>You are not assigned to any courses.</div>
            ) : (
                <>
                    <div className="ih-tbl-wrap">
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th style={{ textAlign: 'center' }}>Present</th>
                                    <th style={{ textAlign: 'center' }}>Late</th>
                                    <th style={{ textAlign: 'center' }}>Absent</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceStudents.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students enrolled in this course yet.</td></tr>
                                ) : (
                                    attendanceStudents.map((s) => {
                                        const currentMark = attendanceMarks[s.studentProfileId];
                                        const tone = (STATUS_TONE_CLASS[ATTENDANCE_STATUS_TONE[s.status] || 'neutral'] || 'ih-b-neutral');
                                        return (
                                            <tr key={s.studentProfileId}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{s.studentName}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.studentNo}</div>
                                                </td>
                                                <AttendanceMarkCell
                                                    active={currentMark === 'PRESENT'}
                                                    tone="success"
                                                    onSelect={() => handleMarkChange(s.studentProfileId, 'PRESENT')}
                                                    name={`mark-${s.studentProfileId}`}
                                                />
                                                <AttendanceMarkCell
                                                    active={currentMark === 'LATE'}
                                                    tone="warning"
                                                    onSelect={() => handleMarkChange(s.studentProfileId, 'LATE')}
                                                    name={`mark-${s.studentProfileId}`}
                                                />
                                                <AttendanceMarkCell
                                                    active={currentMark === 'ABSENT'}
                                                    tone="danger"
                                                    onSelect={() => handleMarkChange(s.studentProfileId, 'ABSENT')}
                                                    name={`mark-${s.studentProfileId}`}
                                                />
                                                <td>
                                                    <span className={`ih-badge ${tone}`}>{s.status}</span>
                                                    <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                                                        {s.attendanceRate !== null ? `${s.attendanceRate}% attendance so far` : 'No sessions yet'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                            {attendanceStudents.length > 0 ? `${markedCount} of ${attendanceStudents.length} students marked` : ''}
                        </div>
                        <button
                            onClick={handleSaveAttendance}
                            disabled={savingAttendance || !allStudentsMarked}
                            className="ih-btn ih-btn-primary"
                        >
                            {savingAttendance ? "Saving…" : "Save Today's Attendance"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
