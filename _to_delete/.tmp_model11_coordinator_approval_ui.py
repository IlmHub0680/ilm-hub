# -*- coding: utf-8 -*-
import io

PATH = "app/coordinator-dashboard/page.tsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    """    isPublished: boolean;
    categoryId: string;
    programId: string;
    category?: { nameEn: string } | null;
    prerequisites: Prerequisite[];
};""",
    """    isPublished: boolean;
    categoryId: string;
    programId: string;
    category?: { nameEn: string } | null;
    prerequisites: Prerequisite[];
    approvalStatus: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'RETURNED_FOR_REVISION';
    approvalNote?: string | null;
};

const APPROVAL_BADGE: Record<string, string> = {
    DRAFT: 'ih-b-neutral',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    RETURNED_FOR_REVISION: 'ih-b-danger',
};""",
    "Course type approvalStatus + badge map",
)

c = r1(
    c,
    "    const [togglingId, setTogglingId] = useState('');",
    "    const [togglingId, setTogglingId] = useState('');\n    const [submittingId, setSubmittingId] = useState('');",
    "submittingId state",
)

c = r1(
    c,
    """    async function deleteCourse(course: Course) {""",
    """    // Model 11 — a coordinator explicitly submits a DRAFT (or returned)
    // course to their Head of Department for real approval, rather than
    // isPublished alone standing in for "approved."
    async function submitForReview(course: Course) {
        setSubmittingId(course.id);
        setActionError('');

        try {
            const response = await fetch(`/api/coordinator/courses/${course.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit_for_review' }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to submit this course for review.');
            }

            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to submit this course for review.');
        } finally {
            setSubmittingId('');
        }
    }

    async function deleteCourse(course: Course) {""",
    "submitForReview function",
)

c = r1(
    c,
    """                                                <th>Credits</th>
                                                <th>Status</th>
                                                <th>Actions</th>""",
    """                                                <th>Credits</th>
                                                <th>Status</th>
                                                <th>Approval</th>
                                                <th>Actions</th>""",
    "curriculum table Approval column header",
)

c = r1(
    c,
    """                                                            <td>
                                                                <span className={`ih-badge ${course.isPublished ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                    <button type="button" style={secondaryButtonStyle} onClick={() => startEdit(course)}>Edit</button>
                                                                    <button type="button" disabled={togglingId === course.id} style={secondaryButtonStyle} onClick={() => togglePublish(course)}>
                                                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                                                    </button>
                                                                    <button type="button" disabled={deletingId === course.id} style={dangerButtonStyle} onClick={() => deleteCourse(course)}>
                                                                        {deletingId === course.id ? 'Removing…' : 'Delete'}
                                                                    </button>
                                                                </div>
                                                            </td>""",
    """                                                            <td>
                                                                <span className={`ih-badge ${course.isPublished ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`ih-badge ${APPROVAL_BADGE[course.approvalStatus] || 'ih-b-neutral'}`}>
                                                                    {course.approvalStatus.replace(/_/g, ' ')}
                                                                </span>
                                                                {course.approvalStatus === 'RETURNED_FOR_REVISION' && course.approvalNote && (
                                                                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4, maxWidth: 180 }}>{course.approvalNote}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                    <button type="button" style={secondaryButtonStyle} onClick={() => startEdit(course)}>Edit</button>
                                                                    <button type="button" disabled={togglingId === course.id} style={secondaryButtonStyle} onClick={() => togglePublish(course)}>
                                                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                                                    </button>
                                                                    {(course.approvalStatus === 'DRAFT' || course.approvalStatus === 'RETURNED_FOR_REVISION') && (
                                                                        <button type="button" disabled={submittingId === course.id} style={primaryButtonStyle(submittingId === course.id)} onClick={() => submitForReview(course)}>
                                                                            {submittingId === course.id ? 'Submitting…' : 'Submit for Review'}
                                                                        </button>
                                                                    )}
                                                                    <button type="button" disabled={deletingId === course.id} style={dangerButtonStyle} onClick={() => deleteCourse(course)}>
                                                                        {deletingId === course.id ? 'Removing…' : 'Delete'}
                                                                    </button>
                                                                </div>
                                                            </td>""",
    "curriculum table Approval cell + Submit for Review button",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("Coordinator dashboard curriculum tab updated with course approval workflow UI.")
