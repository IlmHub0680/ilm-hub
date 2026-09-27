'use client';

import { useEffect, useState } from 'react';
import * as s from '@/app/academics/styles';

const fieldStyle = {
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: 8,
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 13.5,
  width: '100%',
};

const primaryButtonStyle = {
  padding: '9px 18px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
};

const ghostButtonStyle = {
  padding: '7px 14px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Section Discussion — a per-course discussion & exercise space. "Section"
 * here is the student's real course cohort (their Enrollment + the
 * instructor(s) assigned to that course): a student in another course
 * never sees these threads, matching the scoping enforced server-side in
 * /api/student/discussions/*.
 */
export default function SectionDiscussion() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [listError, setListError] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [answerText, setAnswerText] = useState('');
  const [answerFile, setAnswerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetch('/api/student/discussions', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load your courses.');
        }
        setCourses(result.courses || []);
        if (result.courses && result.courses.length > 0) {
          setSelectedCourseId(result.courses[0].id);
        }
      })
      .catch((err) => setCoursesError(err.message || 'Unable to load your courses.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setExpandedId(null);
    setDetail(null);
    setSubmissions(null);
    loadDiscussions(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  function loadDiscussions(courseId) {
    setLoadingDiscussions(true);
    setListError('');
    fetch(`/api/student/discussions?courseId=${courseId}`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load discussions.');
        }
        setDiscussions(result.discussions || []);
      })
      .catch((err) => setListError(err.message || 'Unable to load discussions.'))
      .finally(() => setLoadingDiscussions(false));
  }

  function loadDetail(id) {
    setLoadingDetail(true);
    fetch(`/api/student/discussions/${id}`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load this discussion.');
        }
        setDetail(result.discussion);
        setSubmissions(result.submissions);
        setAnswerText('');
        setAnswerFile(null);
        setSubmitError('');
        setSubmitSuccess('');
      })
      .catch((err) => setListError(err.message || 'Unable to load this discussion.'))
      .finally(() => setLoadingDetail(false));
  }

  function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setSubmissions(null);
      return;
    }
    setExpandedId(id);
    loadDetail(id);
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      setPostError('Enter a title and a message.');
      return;
    }
    setPosting(true);
    setPostError('');
    try {
      const res = await fetch('/api/student/discussions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId, title: newTitle, body: newBody }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to post your discussion.');
      }
      setNewTitle('');
      setNewBody('');
      loadDiscussions(selectedCourseId);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Unable to post your discussion.');
    } finally {
      setPosting(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !expandedId) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/student/discussions/${expandedId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to post your comment.');
      }
      setNewComment('');
      loadDetail(expandedId);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Unable to post your comment.');
    } finally {
      setPostingComment(false);
    }
  }

  async function handleOpenFile(type, id) {
    try {
      const res = await fetch(`/api/student/discussions/file?type=${type}&id=${id}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Unable to open this file.');
        return;
      }
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Unable to open this file.');
    }
  }

  async function handleSubmitExercise(e) {
    e.preventDefault();
    if (!expandedId) return;

    if (!answerText.trim() && !answerFile) {
      setSubmitError('Write an answer or attach a file before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      let fileKey = null;
      if (answerFile) {
        const formData = new FormData();
        formData.append('file', answerFile);
        const uploadRes = await fetch('/api/student/discussions/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Unable to upload your file.');
        }
        fileKey = uploadResult.key;
      }

      const res = await fetch(`/api/student/discussions/${expandedId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerText, fileKey }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit your answer.');
      }
      setSubmitSuccess('Your submission has been recorded.');
      setAnswerFile(null);
      loadDetail(expandedId);
      loadDiscussions(selectedCourseId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit your answer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingCourses) {
    return <div style={s.loadingState}>Loading your courses...</div>;
  }

  if (coursesError) {
    return <div style={s.errorBanner}>{coursesError}</div>;
  }

  if (courses.length === 0) {
    return <div style={s.emptyState}>You aren't enrolled in any courses yet, so there's no section discussion to show.</div>;
  }

  const mySubmission = submissions ? submissions.find((sub) => sub.isMine) : null;
  const deadlinePassed = detail?.deadline ? new Date() > new Date(detail.deadline) : false;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 6, fontWeight: 600 }}>
          Course
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ ...fieldStyle, maxWidth: 360 }}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleEn} ({c.courseCode})
            </option>
          ))}
        </select>
      </div>

      <div style={{ ...s.card, marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Start a Discussion</h2>
        {postError && <div style={{ ...s.errorBanner, marginBottom: 12 }}>{postError}</div>}
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={fieldStyle}
          />
          <textarea
            placeholder="Ask a question, share something with your classmates..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div>
            <button type="submit" disabled={posting} style={primaryButtonStyle}>
              {posting ? 'Posting…' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>

      {listError && <div style={{ ...s.errorBanner }}>{listError}</div>}

      {loadingDiscussions ? (
        <div style={s.loadingState}>Loading discussions...</div>
      ) : discussions.length === 0 ? (
        <div style={s.emptyState}>No discussions yet in this course — be the first to start one.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {discussions.map((d) => (
            <div key={d.id} style={s.card}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}
                onClick={() => toggleExpand(d.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 15, color: 'var(--ink)' }}>{d.title}</strong>
                    {d.isExercise && <span style={s.badge('var(--brand)')}>Exercise</span>}
                    {d.isExercise && d.hasSubmitted && <span style={s.badge('var(--success)')}>Submitted</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {d.author.name} ({d.author.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}) ·{' '}
                    {new Date(d.createdAt).toLocaleDateString()} · {d.commentCount} comment{d.commentCount === 1 ? '' : 's'}
                    {d.isExercise ? ` · ${d.submissionCount} submission${d.submissionCount === 1 ? '' : 's'}` : ''}
                    {d.deadline ? ` · Due ${formatDeadline(d.deadline)}` : ''}
                  </div>
                </div>
                <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{expandedId === d.id ? '▲' : '▼'}</span>
              </div>

              {expandedId === d.id && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  {loadingDetail || !detail ? (
                    <div style={s.loadingState}>Loading...</div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13.5, color: 'var(--ink)', whiteSpace: 'pre-line', marginTop: 0 }}>{detail.body}</p>

                      {detail.attachmentUrl && (
                        <button type="button" onClick={() => handleOpenFile('attachment', d.id)} style={{ ...ghostButtonStyle, marginBottom: 14 }}>
                          📎 Download Supporting File
                        </button>
                      )}

                      {detail.isExercise && (
                        <div style={{ ...s.card, background: 'var(--paper)', marginBottom: 16 }}>
                          <h3 style={{ ...s.cardTitle, fontSize: 14 }}>
                            My Submission {deadlinePassed && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>· Deadline Passed</span>}
                          </h3>

                          {mySubmission && (
                            <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 10, padding: 10, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                              {mySubmission.answerText && <p style={{ margin: '0 0 6px', whiteSpace: 'pre-line' }}>{mySubmission.answerText}</p>}
                              {mySubmission.fileUrl && (
                                <button type="button" onClick={() => handleOpenFile('submission', mySubmission.id)} style={ghostButtonStyle}>
                                  📎 My Uploaded File
                                </button>
                              )}
                              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6 }}>
                                Submitted {new Date(mySubmission.submittedAt).toLocaleString()}
                              </div>
                              {mySubmission.feedback && (
                                <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--brand-dark)', background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                  <strong>Instructor feedback:</strong> {mySubmission.feedback}
                                </div>
                              )}
                            </div>
                          )}

                          {!deadlinePassed && (
                            <form onSubmit={handleSubmitExercise} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {submitError && <div style={s.errorBanner}>{submitError}</div>}
                              {submitSuccess && <div style={{ ...s.errorBanner, background: 'var(--success-tint)', color: 'var(--success)' }}>{submitSuccess}</div>}
                              <textarea
                                placeholder={mySubmission ? 'Update your answer...' : 'Write your answer...'}
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                rows={3}
                                style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
                              />
                              <input
                                type="file"
                                onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                                style={{ fontSize: 12.5 }}
                              />
                              <div>
                                <button type="submit" disabled={submitting} style={primaryButtonStyle}>
                                  {submitting ? 'Submitting…' : mySubmission ? 'Update Submission' : 'Submit Answer'}
                                </button>
                              </div>
                            </form>
                          )}

                          {submissions && submissions.filter((sub) => !sub.isMine).length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <h4 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
                                Classmates' Submissions
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {submissions.filter((sub) => !sub.isMine).map((sub) => (
                                  <div key={sub.id} style={{ fontSize: 12.5, color: 'var(--ink)', padding: 8, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                    <strong>{sub.student.name}</strong>
                                    {sub.answerText && <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{sub.answerText}</p>}
                                    {sub.fileUrl && (
                                      <button type="button" onClick={() => handleOpenFile('submission', sub.id)} style={{ ...ghostButtonStyle, marginTop: 6, padding: '4px 10px', fontSize: 11.5 }}>
                                        📎 File
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <h4 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
                        Comments
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        {detail.comments.length === 0 ? (
                          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>No comments yet.</div>
                        ) : (
                          detail.comments.map((c) => (
                            <div key={c.id} style={{ fontSize: 13, padding: 8, borderRadius: 6, background: 'var(--paper)' }}>
                              <strong>{c.author.name}</strong>{' '}
                              <span style={{ color: 'var(--ink-soft)', fontSize: 11.5 }}>
                                {c.author.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'} · {new Date(c.createdAt).toLocaleString()}
                              </span>
                              <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{c.body}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          style={fieldStyle}
                        />
                        <button type="submit" disabled={postingComment} style={primaryButtonStyle}>
                          {postingComment ? '…' : 'Reply'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
