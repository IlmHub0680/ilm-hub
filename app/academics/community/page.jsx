'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as s from '../styles';

const CATEGORY_BADGE_CLASS = {
  GENERAL: 'ih-b-neutral',
  ACADEMIC: 'ih-b-info',
  EVENTS: 'ih-b-warning',
  ANNOUNCEMENTS: 'ih-b-success',
};

const CATEGORY_LABELS = {
  GENERAL: 'General',
  ACADEMIC: 'Academic',
  EVENTS: 'Events',
  ANNOUNCEMENTS: 'Announcements',
};

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'OTHER', label: 'Other' },
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CommunityPage() {
  const [posts, setPosts] = useState(null);
  const [canPost, setCanPost] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [posting, setPosting] = useState(false);
  const [composeError, setComposeError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDraft, setCommentDraft] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Report modal: { targetType: 'post' | 'comment', targetId } or null.
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedList, setBlockedList] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileBio, setProfileBio] = useState('');
  const [profileInterests, setProfileInterests] = useState('');
  const [profilePublic, setProfilePublic] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [guidelinesStatus, setGuidelinesStatus] = useState(null);
  const [guidelinesChecked, setGuidelinesChecked] = useState(false);
  const [guidelinesAccepting, setGuidelinesAccepting] = useState(false);
  const [guidelinesError, setGuidelinesError] = useState('');

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (canPost) loadGuidelines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPost]);

  async function loadGuidelines() {
    try {
      const res = await fetch('/api/community/guidelines', { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) setGuidelinesStatus(result.data);
    } catch {
      // leave guidelinesStatus null (treated as "still checking", never
      // as "accepted") rather than fail open on a mandatory gate
    }
  }

  async function acceptGuidelines() {
    setGuidelinesAccepting(true);
    setGuidelinesError('');
    try {
      const res = await fetch('/api/community/guidelines', { method: 'POST', credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to record acceptance.');
      setGuidelinesStatus((prev) => ({ ...prev, accepted: true, acceptedAt: result.data.acceptedAt }));
    } catch (err) {
      setGuidelinesError(err.message);
    } finally {
      setGuidelinesAccepting(false);
    }
  }

  // A defense against a race where the guidelines are updated by an
  // admin in the brief window between this page loading and a write
  // action being submitted -- the API layer is the real enforcement
  // (see communityHasAcceptedGuidelines in every write route), this
  // just sends the student straight back to the gate instead of a
  // confusing generic error.
  function guardGuidelinesRace(result) {
    if (result?.code === 'GUIDELINES_NOT_ACCEPTED') {
      setGuidelinesStatus((prev) => (prev ? { ...prev, accepted: false } : { accepted: false }));
      return true;
    }
    return false;
  }

  async function load() {
    try {
      const res = await fetch('/api/community/posts', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load the Community.');
      setPosts(result.data);
      setCanPost(Boolean(result.canPost));
      setIsModerator(Boolean(result.isModerator));
    } catch (err) {
      setError(err.message);
      setPosts([]);
    }
  }

  async function submitPost(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setComposeError('Please add a title and a message.');
      return;
    }
    setPosting(true);
    setComposeError('');
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, category }),
      });
      const result = await res.json();
      if (guardGuidelinesRace(result)) return;
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to post.');
      setPosts((prev) => [result.data, ...(prev || [])]);
      setTitle('');
      setBody('');
      setCategory('GENERAL');
      setComposing(false);
    } catch (err) {
      setComposeError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function toggleExpand(postId) {
    if (expandedId === postId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(postId);
    if (!commentsByPost[postId]) {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`, { credentials: 'include' });
        const result = await res.json();
        if (res.ok && result.success) {
          setCommentsByPost((prev) => ({ ...prev, [postId]: result.data }));
        }
      } catch {
        // leave the panel empty rather than block expansion
      }
    }
  }

  async function submitComment(postId) {
    if (!commentDraft.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentDraft }),
      });
      const result = await res.json();
      if (guardGuidelinesRace(result)) return;
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to comment.');
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.data],
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
      );
      setCommentDraft('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function moderate(postId, patch) {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update.');
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...result.data } : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  function openReport(targetType, targetId) {
    setReportTarget({ targetType, targetId });
    setReportReason('SPAM');
    setReportDetails('');
    setReportError('');
  }

  async function submitReport() {
    if (!reportTarget) return;
    setReportSubmitting(true);
    setReportError('');
    try {
      const payload = {
        reason: reportReason,
        details: reportDetails.trim() || undefined,
        ...(reportTarget.targetType === 'post'
          ? { postId: reportTarget.targetId }
          : { commentId: reportTarget.targetId }),
      };
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (guardGuidelinesRace(result)) return;
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to submit report.');
      setReportTarget(null);
      setNotice('Thank you — your report has been sent to the moderation team.');
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportSubmitting(false);
    }
  }

  async function blockAuthor(authorId, authorName) {
    if (!authorId) return;
    if (!window.confirm(`Block ${authorName || 'this member'}? You will no longer see each other's posts and comments.`)) {
      return;
    }
    try {
      const res = await fetch('/api/community/blocks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authorId }),
      });
      const result = await res.json();
      if (guardGuidelinesRace(result)) return;
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to block member.');
      setNotice(`${authorName || 'Member'} has been blocked.`);
      setTimeout(() => setNotice(''), 5000);
      // Blocked content should disappear immediately, not just on next load.
      setPosts((prev) => (prev || []).filter((p) => p.authorId !== authorId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadBlockedList() {
    setShowBlocked(true);
    if (blockedList) return;
    try {
      const res = await fetch('/api/community/blocks', { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) setBlockedList(result.data);
      else setBlockedList([]);
    } catch {
      setBlockedList([]);
    }
  }

  async function unblock(userId) {
    try {
      const res = await fetch(`/api/community/blocks?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to unblock.');
      setBlockedList((prev) => (prev || []).filter((b) => b.userId !== userId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProfile() {
    setShowProfile(true);
    if (profile) return;
    try {
      const res = await fetch('/api/community/profile', { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) {
        setProfile(result.data);
        setProfileBio(result.data.bio || '');
        setProfileInterests(result.data.interests || '');
        setProfilePublic(result.data.isPublic ?? true);
      }
    } catch {
      // leave the modal in its loading state rather than crash
    }
  }

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError('');
    try {
      const res = await fetch('/api/community/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: profileBio, interests: profileInterests, isPublic: profilePublic }),
      });
      const result = await res.json();
      if (guardGuidelinesRace(result)) return;
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save profile.');
      setProfile((prev) => ({ ...prev, ...result.data }));
      setShowProfile(false);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  // Mandatory Community Guidelines acknowledgment (Model 25 addendum).
  // Gated on `canPost` -- the same "has real Community access" flag
  // the rest of this page already uses -- because the requirement is
  // to acknowledge before *joining/using* the Community, not before
  // merely being signed in. A visitor without Community access never
  // sees this gate; they also can't post, comment, block, or report,
  // so there is nothing here for them to acknowledge.
  if (canPost && !guidelinesStatus) {
    return <div style={s.loadingState}>Loading the Community…</div>;
  }

  if (canPost && guidelinesStatus && !guidelinesStatus.accepted) {
    return (
      <div>
        <h1 style={s.pageHeading}>Ulul Azm Community</h1>
        <div className="ih-card">
          <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
            {guidelinesStatus.title || 'Ulul Azm Community Guidelines'}
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)' }}>
            Please read the Community Guidelines before joining. You'll be
            asked to agree once, and again only if the guidelines are
            later updated.
          </p>
          <div
            className="ih-rendered-html"
            style={{
              maxHeight: 360,
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '14px 16px',
              background: 'var(--paper)',
              fontSize: 13.5,
              lineHeight: 1.7,
              color: 'var(--ink)',
              marginBottom: 16,
            }}
            dangerouslySetInnerHTML={{ __html: guidelinesStatus.bodyHtml }}
          />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--ink)', marginBottom: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={guidelinesChecked}
              onChange={(e) => setGuidelinesChecked(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>I have read and agree to the Ulul Azm Community Guidelines.</span>
          </label>
          {guidelinesError && <div style={{ ...s.errorBanner, marginBottom: 12 }}>{guidelinesError}</div>}
          <button
            type="button"
            onClick={acceptGuidelines}
            disabled={!guidelinesChecked || guidelinesAccepting}
            className="ih-btn ih-btn-primary"
          >
            {guidelinesAccepting ? 'Saving…' : 'Agree & Continue'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={s.pageHeading}>Ulul Azm Community</h1>
        {canPost && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={loadProfile} className="ih-btn ih-btn-ghost">
              My Profile
            </button>
            <button type="button" onClick={loadBlockedList} className="ih-btn ih-btn-ghost">
              Blocked Members
            </button>
          </div>
        )}
      </div>
      <p style={s.pageDescription}>
        A shared space for the whole student body — not tied to any single
        course — to discuss academic life, share events, and hear
        announcements. Section Discussion (inside each course) is still
        the place for course-specific exercises and questions; this is
        for everything wider than one course. Please review the{' '}
        <Link href="/community/guidelines" style={{ color: 'var(--brand)', fontWeight: 700 }}>
          Community Guidelines
        </Link>{' '}
        before posting.
      </p>

      {error && <div style={s.errorBanner}>{error}</div>}
      {notice && (
        <div className="ih-badge ih-b-success" style={{ display: 'block', padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
          {notice}
        </div>
      )}

      {canPost && (
        <div className="ih-card">
          {!composing ? (
            <button type="button" onClick={() => setComposing(true)} className="ih-btn ih-btn-primary">
              + New Post
            </button>
          ) : (
            <form onSubmit={submitPost}>
              <div className="ih-field" style={{ marginBottom: 10 }}>
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="GENERAL">General</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="EVENTS">Events</option>
                  <option value="ANNOUNCEMENTS">Announcements</option>
                </select>
              </div>
              <div className="ih-field" style={{ marginBottom: 10 }}>
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  maxLength={150}
                />
              </div>
              <div className="ih-field" style={{ marginBottom: 10 }}>
                <label>Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What would you like to share?"
                  rows={4}
                  style={{ resize: 'vertical' }}
                  maxLength={5000}
                />
              </div>
              {composeError && <div style={{ ...s.errorBanner, marginBottom: 10 }}>{composeError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={posting} className="ih-btn ih-btn-primary">
                  {posting ? 'Posting…' : 'Post'}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="ih-btn ih-btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {posts === null && <div style={s.loadingState}>Loading the Community…</div>}
      {posts && posts.length === 0 && (
        <div style={s.emptyState}>No posts yet — be the first to start a conversation.</div>
      )}

      {posts && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map((post) => (
            <div key={post.id} className="ih-card" style={{ marginBottom: 0, opacity: post.isHidden ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {post.isPinned && <span aria-hidden="true">📌</span>}
                  <span className={`ih-badge ${CATEGORY_BADGE_CLASS[post.category] || 'ih-b-neutral'}`}>{CATEGORY_LABELS[post.category]}</span>
                  {post.isHidden && <span className="ih-badge ih-b-danger">Hidden</span>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{timeAgo(post.createdAt)}</span>
              </div>

              <h3 style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{post.title}</h3>
              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {post.body}
              </p>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>— {post.authorName}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => toggleExpand(post.id)} className="ih-btn ih-btn-ghost">
                  💬 {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                </button>
                {canPost && (
                  <button type="button" onClick={() => openReport('post', post.id)} className="ih-btn ih-btn-ghost">
                    🚩 Report
                  </button>
                )}
                {canPost && post.authorId && (
                  <button type="button" onClick={() => blockAuthor(post.authorId, post.authorName)} className="ih-btn ih-btn-ghost">
                    🚫 Block
                  </button>
                )}
                {isModerator && (
                  <>
                    <button type="button" onClick={() => moderate(post.id, { isPinned: !post.isPinned })} className="ih-btn ih-btn-ghost">
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button type="button" onClick={() => moderate(post.id, { isHidden: !post.isHidden })} className="ih-btn ih-btn-ghost">
                      {post.isHidden ? 'Unhide' : 'Hide'}
                    </button>
                  </>
                )}
              </div>

              {expandedId === post.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  {(commentsByPost[post.id] || []).map((c) => (
                    <div key={c.id} style={{ marginBottom: 10, fontSize: 13 }}>
                      <div style={{ color: 'var(--ink)' }}>{c.body}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span>— {c.authorName} · {timeAgo(c.createdAt)}</span>
                        {canPost && (
                          <button
                            type="button"
                            onClick={() => openReport('comment', c.id)}
                            className="ih-btn ih-btn-ghost"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(commentsByPost[post.id] || []).length === 0 && (
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 10 }}>No comments yet.</div>
                  )}

                  {canPost && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
                      <div className="ih-field" style={{ flex: 1, margin: 0 }}>
                        <input
                          type="text"
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          placeholder="Add a comment…"
                          maxLength={2000}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => submitComment(post.id)}
                        disabled={commentSubmitting}
                        className="ih-btn ih-btn-secondary"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reportTarget && (
        <div style={modalOverlayStyle} onClick={() => setReportTarget(null)}>
          <div className="ih-card" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
              Report {reportTarget.targetType === 'post' ? 'Post' : 'Comment'}
            </h3>
            <div className="ih-field" style={{ marginBottom: 10 }}>
              <label>Reason</label>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="ih-field" style={{ marginBottom: 10 }}>
              <label>Additional details (optional)</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                maxLength={1000}
                style={{ resize: 'vertical' }}
              />
            </div>
            {reportError && <div style={{ ...s.errorBanner, marginBottom: 10 }}>{reportError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={submitReport} disabled={reportSubmitting} className="ih-btn ih-btn-danger">
                {reportSubmitting ? 'Sending…' : 'Submit Report'}
              </button>
              <button type="button" onClick={() => setReportTarget(null)} className="ih-btn ih-btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlocked && (
        <div style={modalOverlayStyle} onClick={() => setShowBlocked(false)}>
          <div className="ih-card" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
              Blocked Members
            </h3>
            {blockedList === null && <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</div>}
            {blockedList && blockedList.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>You haven't blocked anyone.</div>
            )}
            {blockedList && blockedList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {blockedList.map((b) => (
                  <div key={b.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                    <span>{b.name || 'Member'}</span>
                    <button type="button" onClick={() => unblock(b.userId)} className="ih-btn ih-btn-ghost" style={{ padding: '6px 12px' }}>
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={() => setShowBlocked(false)} className="ih-btn ih-btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div style={modalOverlayStyle} onClick={() => setShowProfile(false)}>
          <div className="ih-card" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
              My Community Profile
            </h3>
            {!profile && <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</div>}
            {profile && (
              <>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 12 }}>
                  {profile.name}
                  {profile.department ? ` · ${profile.department}` : ''}
                  {profile.program ? ` · ${profile.program}` : ''}
                  {profile.isAlumni ? ' · Alumni' : ''}
                </div>
                <div className="ih-field" style={{ marginBottom: 10 }}>
                  <label>Bio</label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    rows={3}
                    maxLength={500}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="ih-field" style={{ marginBottom: 10 }}>
                  <label>Interests</label>
                  <input
                    type="text"
                    value={profileInterests}
                    onChange={(e) => setProfileInterests(e.target.value)}
                    maxLength={300}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 12, color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={profilePublic}
                    onChange={(e) => setProfilePublic(e.target.checked)}
                  />
                  Make my profile visible to other Community members
                </label>
                {profileError && <div style={{ ...s.errorBanner, marginBottom: 10 }}>{profileError}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={saveProfile} disabled={profileSaving} className="ih-btn ih-btn-primary">
                    {profileSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowProfile(false)} className="ih-btn ih-btn-ghost">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
};

const modalCardStyle = {
  background: 'var(--surface)',
  borderRadius: 12,
  padding: 22,
  width: '100%',
  maxWidth: 440,
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 12px 40px rgba(0,0,0,.25)',
};
