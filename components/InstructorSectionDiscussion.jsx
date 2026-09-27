'use client';

import { useEffect, useState } from 'react';

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

/**
 * Instructor-side Section Discussion — post regular discussions or real
 * exercises (with a deadline and optional supporting file), respond to
 * students, and review + give feedback on every submission for a course
 * the instructor is actually assigned to (enforced server-side against
 * InstructorCourse, not just hidden in the UI).
 */
export default function InstructorSectionDiscussion() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [listError, setListError] = useState('');

  const [isExercise, setIsExercise] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [savingFeedbackId, setSavingFeedbackId] = useState(null);

  useEffect(() => {
    fetch('/api/instructor/discussions', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load your assigned courses.');
        }
        setCourses(result.courses || []);
        if (result.courses && result.courses.length > 0) {
          setSelectedCourseId(result.courses[0].id);
        }
      })
      .catch((err) => setCoursesError(err.message || 'Unable to load your assigned courses.'))
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
    fetch(`/api/instructor/discussions?courseId=${courseId}`, { credentials: 'include' })
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
    fetch(`/api/instructor/discussions/${id}`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load this discussion.');
        }
        setDetail(result.discussion);
        setSubmissions(result.submissions);
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
      setPostError('Enter a title and instructions.');
      return;
    }
    setPosting(true);
    setPostError('');
    try {
      let attachmentKey = null;
      if (isExercise && newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadRes = await fetch('/api/instructor/discussions/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Unable to upload the supporting file.');
        }
        attachmentKey = uploadResult.key;
      }

      const res = await fetch('/api/instructor/discussions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: newTitle,
          body: newBody,
          isExercise,
          deadline: isExercise && newDeadline ? newDeadline : null,
          attachmentKey,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to post.');
      }
      setNewTitle('');
      setNewBody('');
      setNewDeadline('');
      setNewFile(null);
      setIsExercise(false);
      loadDiscussions(selectedCourseId);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Unable to post.');
    } finally {
      setPosting(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !expandedId) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/instructor/discussions/${expandedId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to post your reply.');
      }
      setNewComment('');
      loadDetail(expandedId);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Unable to post your reply.');
    } finally {
      setPostingComment(false);
    }
  }

  async function handleOpenFile(type, id) {
    try {
      const res = await fetch(`/api/instructor/discussions/file?type=${type}&id=${id}`, { credentials: 'include' });
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

  async function handleSaveFeedback(submissionId) {
    if (!expandedId) return;
    setSavingFeedbackId(submissionId);
    try {
      const res = await fetch(`/api/instructor/discussions/${expandedId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, feedback: feedbackInputs[submissionId] ?? '' }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to save feedback.');
      }
      loadDetail(expandedId);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Unable to save feedback.');
    } finally {
      setSavingFeedbackId(null);
    }
  }

  if (loadingCourses) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading your assigned courses…</div>;
  }

  if (coursesError) {
    return <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>{coursesError}</div>;
  }

  if (courses.length === 0) {
    return <div className="ih-card" style={{ color: 'var(--ink-soft)', textAlign: 'center' }}>You aren't assigned to any courses yet.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 6, fontWeight: 600 }}>Course</label>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} style={{ ...fieldStyle, maxWidth: 360 }}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.titleEn} ({c.courseCode})</option>
          ))}
        </select>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Post a Discussion or Exercise</h2>
        {postError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{postError}</div>}
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input type="checkbox" checked={isExercise} onChange={(e) => setIsExercise(e.target.checked)} />
            This is a graded exercise/activity (with a deadline and, optionally, a supporting file)
          </label>
          <input type="text" placeholder="Title (e.g. Exercise 1 — Introduction to Financial Accounting)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={fieldStyle} />
          <textarea placeholder="Instructions / description" value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          {isExercise && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Deadline</label>
                <input type="datetime-local" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>Supporting File (optional)</label>
                <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} style={{ fontSize: 12.5 }} />
              </div>
            </div>
          )}
          <div>
            <button type="submit" disabled={posting} className="ih-btn ih-btn-primary">
              {posting ? 'Posting…' : isExercise ? 'Post Exercise' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>

      {listError && <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', marginBottom: 16 }}>{listError}</div>}

      {loadingDiscussions ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading discussions…</div>
      ) : discussions.length === 0 ? (
        <div className="ih-card" style={{ color: 'var(--ink-soft)', textAlign: 'center' }}>No discussions posted in this course yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {discussions.map((d) => (
            <div key={d.id} className="ih-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => toggleExpand(d.id)}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 15 }}>{d.title}</strong>
                    {d.isExercise && <span className="ih-badge ih-b-info">Exercise</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {d.author.name} · {new Date(d.createdAt).toLocaleDateString()} · {d.commentCount} comment{d.commentCount === 1 ? '' : 's'}
                    {d.isExercise ? ` · ${d.submissionCount} submission${d.submissionCount === 1 ? '' : 's'}` : ''}
                    {d.deadline ? ` · Due ${new Date(d.deadline).toLocaleString()}` : ''}
                  </div>
                </div>
                <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{expandedId === d.id ? '▲' : '▼'}</span>
              </div>

              {expandedId === d.id && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  {loadingDetail || !detail ? (
                    <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13.5, whiteSpace: 'pre-line', marginTop: 0 }}>{detail.body}</p>

                      {detail.attachmentUrl && (
                        <button type="button" onClick={() => handleOpenFile('attachment', d.id)} style={{ ...ghostButtonStyle, marginBottom: 14 }}>
                          📎 Download Supporting File
                        </button>
                      )}

                      {detail.isExercise && (
                        <div style={{ marginBottom: 16 }}>
                          <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>Submissions ({submissions ? submissions.length : 0})</h3>
                          {!submissions || submissions.length === 0 ? (
                            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>No submissions yet.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {submissions.map((sub) => (
                                <div key={sub.id} style={{ padding: 10, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--border)' }}>
                                  <strong style={{ fontSize: 13.5 }}>{sub.student.name}</strong>
                                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>
                                    Submitted {new Date(sub.submittedAt).toLocaleString()}
                                  </div>
                                  {sub.answerText && <p style={{ fontSize: 13, margin: '6px 0' }}>{sub.answerText}</p>}
                                  {sub.fileUrl && (
                                    <button type="button" onClick={() => handleOpenFile('submission', sub.id)} style={{ ...ghostButtonStyle, marginBottom: 8, padding: '4px 10px', fontSize: 11.5 }}>
                                      📎 File
                                    </button>
                                  )}
                                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                    <input
                                      type="text"
                                      placeholder="Give feedback..."
                                      value={feedbackInputs[sub.id] ?? sub.feedback ?? ''}
                                      onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                                      style={fieldStyle}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveFeedback(sub.id)}
                                      disabled={savingFeedbackId === sub.id}
                                      className="ih-btn ih-btn-primary"
                                      style={{ padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                                    >
                                      {savingFeedbackId === sub.id ? '…' : 'Save Feedback'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <h4 style={{ fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', margin: '0 0 8px' }}>Comments</h4>
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
                        <input type="text" placeholder="Write a reply..." value={newComment} onChange={(e) => setNewComment(e.target.value)} style={fieldStyle} />
                        <button type="submit" disabled={postingComment} className="ih-btn ih-btn-primary">
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
