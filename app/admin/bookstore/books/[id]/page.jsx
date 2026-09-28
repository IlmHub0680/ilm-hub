'use client';
import BackToAdmin from '../../BackToAdmin';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ManageBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadBook() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${id}`,
        {
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to load book.'
        );
      }

      setBook(result.data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load book.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadBook();
  }, [id]);

  function update(field, value) {
    setBook((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadPdf(event) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setMessage('');
    setError('');

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Please select a PDF file.');
      return;
    }

    if (file.size <= 0) {
      setError('The selected PDF is empty.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('The PDF must be 100 MB or smaller.');
      return;
    }

    if (
      !window.confirm(
        book.r2FileKey
          ? 'Replace the existing PDF with this file?'
          : 'Upload this PDF to the book?'
      )
    ) {
      return;
    }

    try {
      setUploadingPdf(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `/api/admin/publishing/books/${id}/asset`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to upload the PDF.'
        );
      }

      setBook((current) => ({
        ...current,
        r2FileKey: result.data.r2FileKey,
      }));

      setMessage(
        result.message || 'PDF uploaded successfully.'
      );
    } catch (error) {
      console.error(
        'UPLOAD PDF ERROR:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to upload the PDF.'
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titleEn: book.titleEn,
            titleAr: book.titleAr,
            slug: book.slug,
            descriptionEn: book.descriptionEn,
            descriptionAr: book.descriptionAr,
            priceUSD: Number(book.priceUSD || 0),
            coverImageUrl: book.coverImageUrl || '',
            r2FileKey: book.r2FileKey || '',
            categoryId: book.categoryId,
            isFeatured: Boolean(book.isFeatured),
            isNewRelease: Boolean(book.isNewRelease),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to save changes.'
        );
      }

      setBook(result.data);
      setMessage('Book information saved successfully.');
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to save changes.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status) {
    const labels = {
      DRAFT: 'move this book to Draft',
      PENDING_REVIEW: 'send this book for review',
      APPROVED: 'approve this book',
      REJECTED: 'reject this book',
      PUBLISHED: 'publish this book',
    };

    if (
      !window.confirm(
        `Are you sure you want to ${labels[status] || status}?`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to change book status.'
        );
      }

      setBook(result.data);
      setMessage(
        `Book status changed to ${status}.`
      );
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to change book status.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook() {
    if (
      !window.confirm(
        `Delete "${book.titleEn}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to delete book.'
        );
      }

      router.push('/admin/bookstore/books');
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to delete book.'
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
        <div style={styles.loading}>
          Loading book...
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main style={styles.page}>
        <div style={styles.error}>
          {error || 'Book not found.'}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <Link
          href="/admin/bookstore/books"
          style={styles.back}
        >
          ← Back to Books
        </Link>

        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              BOOKSTORE MANAGEMENT
            </div>

            <h1 style={styles.title}>
              {book.titleEn}
            </h1>

            <p style={styles.subtitle}>
              Complete book management and publishing controls.
            </p>
          </div>

          <StatusBadge status={book.status} />
        </div>

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Publishing Lifecycle
          </h2>

          <div style={styles.lifecycle}>
            {[
              'DRAFT',
              'PENDING_REVIEW',
              'APPROVED',
              'PUBLISHED',
            ].map((status) => (
              <div
                key={status}
                style={{
                  ...styles.step,
                  ...(book.status === status
                    ? styles.activeStep
                    : {}),
                }}
              >
                {status.replace('_', ' ')}
              </div>
            ))}
          </div>

          <div style={styles.statusActions}>
            {book.status !== 'DRAFT' && (
              <button
                onClick={() => changeStatus('DRAFT')}
                disabled={saving}
                style={styles.secondaryButton}
              >
                Move to Draft
              </button>
            )}

            {book.status === 'DRAFT' && (
              <button
                onClick={() =>
                  changeStatus('PENDING_REVIEW')
                }
                disabled={saving}
                style={styles.primaryButton}
              >
                Submit for Review
              </button>
            )}

            {book.status === 'PENDING_REVIEW' && (
              <>
                <button
                  onClick={() =>
                    changeStatus('APPROVED')
                  }
                  disabled={saving}
                  style={styles.approveButton}
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    changeStatus('REJECTED')
                  }
                  disabled={saving}
                  style={styles.rejectButton}
                >
                  Reject
                </button>
              </>
            )}

            {book.status === 'APPROVED' && (
              <button
                onClick={() =>
                  changeStatus('PUBLISHED')
                }
                disabled={saving}
                style={styles.publishButton}
              >
                Publish to Bookstore
              </button>
            )}

            {book.status === 'PUBLISHED' && (
              <button
                onClick={() =>
                  changeStatus('APPROVED')
                }
                disabled={saving}
                style={styles.secondaryButton}
              >
                Unpublish
              </button>
            )}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Book Information
          </h2>

          <div style={styles.grid}>

            <Field
              label="English Title"
              value={book.titleEn}
              onChange={(value) =>
                update('titleEn', value)
              }
            />

            <Field
              label="Arabic Title"
              value={book.titleAr}
              onChange={(value) =>
                update('titleAr', value)
              }
              dir="rtl"
            />

            <Field
              label="Slug"
              value={book.slug}
              onChange={(value) =>
                update('slug', value)
              }
            />

            <Field
              label="Price (USD)"
              type="number"
              value={book.priceUSD}
              onChange={(value) =>
                update('priceUSD', value)
              }
            />

            <Field
              label="Cover Image URL"
              value={book.coverImageUrl || ''}
              onChange={(value) =>
                update('coverImageUrl', value)
              }
            />

            <Field
              label="Digital File Key"
              value={book.r2FileKey || ''}
              onChange={(value) =>
                update('r2FileKey', value)
              }
            />

          </div>

          <div style={styles.grid}>

            <Textarea
              label="English Description"
              value={book.descriptionEn || ''}
              onChange={(value) =>
                update('descriptionEn', value)
              }
            />

            <Textarea
              label="Arabic Description"
              value={book.descriptionAr || ''}
              onChange={(value) =>
                update('descriptionAr', value)
              }
              dir="rtl"
            />

          </div>

          <div style={styles.checkboxRow}>

            <label>
              <input
                type="checkbox"
                checked={Boolean(book.isFeatured)}
                onChange={(e) =>
                  update(
                    'isFeatured',
                    e.target.checked
                  )
                }
              />{' '}
              Featured
            </label>

            <label>
              <input
                type="checkbox"
                checked={Boolean(book.isNewRelease)}
                onChange={(e) =>
                  update(
                    'isNewRelease',
                    e.target.checked
                  )
                }
              />{' '}
              New Release
            </label>

          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            style={styles.primaryButton}
          >
            {saving
              ? 'Saving...'
              : 'Save Book Changes'}
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Digital Asset
          </h2>

          <div style={styles.assetBox}>
            <div>
              <strong>Digital PDF</strong>

              <p style={styles.muted}>
                {book.r2FileKey
                  ? 'A real PDF file is attached to this book.'
                  : 'No PDF file is attached yet.'}
              </p>

              {book.r2FileKey && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: 'var(--ink-soft)',
                    wordBreak: 'break-all',
                  }}
                >
                  Storage key: {book.r2FileKey}
                </div>
              )}
            </div>

            <div
              style={{
                color: book.r2FileKey
                  ? 'var(--brand)'
                  : 'var(--warning)',
                fontWeight: 700,
              }}
            >
              {book.r2FileKey
                ? 'READY'
                : 'NOT UPLOADED'}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <label
              style={{
                ...styles.primaryButton,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingPdf
                  ? 'not-allowed'
                  : 'pointer',
                opacity: uploadingPdf ? 0.65 : 1,
              }}
            >
              {uploadingPdf
                ? 'Uploading PDF...'
                : book.r2FileKey
                  ? 'Replace PDF'
                  : 'Upload PDF'}

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={uploadPdf}
                disabled={uploadingPdf}
                style={{
                  display: 'none',
                }}
              />
            </label>

            {book.r2FileKey && (
              <span
                style={{
                  color: 'var(--ink-soft)',
                  fontSize: 13,
                }}
              >
                Select a new PDF to replace the current file.
              </span>
            )}
          </div>

          <p style={styles.help}>
            The PDF is stored securely in Cloudflare R2 and
            attached to this specific book. Uploading or replacing
            the digital file does not automatically publish the
            book. Publication remains controlled by the publishing
            status above.
          </p>
        </section>

        <section style={styles.dangerCard}>
          <div>
            <h2 style={styles.sectionTitle}>
              Delete Book
            </h2>

            <p style={styles.muted}>
              Permanently remove this book from the bookstore system.
            </p>
          </div>

          <button
            onClick={deleteBook}
            disabled={saving}
            style={styles.deleteButton}
          >
            Delete Book
          </button>
        </section>

      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  dir,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        dir={dir}
        type={type}
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  dir,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <textarea
        dir={dir}
        rows="7"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

function StatusBadge({ status }) {
  const colors = {
    DRAFT: ['var(--border)', 'var(--ink-soft)'],
    PENDING_REVIEW: ['var(--warning-tint)', 'var(--warning)'],
    APPROVED: ['var(--success-tint)', 'var(--brand-light)'],
    PUBLISHED: ['var(--info-tint)', 'var(--brand-dark)'],
    REJECTED: ['var(--danger-tint)', 'var(--danger)'],
  };

  const [background, color] =
    colors[status] || colors.DRAFT;

  return (
    <span
      style={{
        ...styles.badge,
        background,
        color,
      }}
    >
      {status}
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--paper)',
    padding: 32,
    fontFamily: 'Arial, sans-serif',
  },

  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },

  back: {
    color: 'var(--ink-soft)',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: 20,
  },

  header: {
    background:
      'linear-gradient(135deg,var(--ink),var(--brand-dark))',
    color: 'var(--on-accent)',
    padding: 30,
    borderRadius: 18,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.7,
    fontWeight: 700,
  },

  title: {
    margin: '8px 0',
    fontSize: 32,
  },

  subtitle: {
    margin: 0,
    color: 'var(--border)',
  },

  badge: {
    padding: '9px 15px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  card: {
    background: 'var(--surface)',
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    boxShadow: '0 4px 18px rgba(15,23,42,.06)',
  },

  dangerCard: {
    background: 'var(--surface)',
    border: '1px solid var(--danger-tint)',
    borderRadius: 16,
    padding: 25,
    marginBottom: 30,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },

  sectionTitle: {
    marginTop: 0,
    color: 'var(--ink)',
  },

  lifecycle: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(150px,1fr))',
    gap: 10,
    marginBottom: 20,
  },

  step: {
    padding: 14,
    borderRadius: 10,
    background: 'var(--border-soft)',
    color: 'var(--ink-soft)',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 800,
  },

  activeStep: {
    background: 'var(--info-tint)',
    color: 'var(--brand-dark)',
    boxShadow:
      'inset 0 0 0 2px var(--info)',
  },

  statusActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(280px,1fr))',
    gap: 18,
    marginBottom: 18,
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    color: 'var(--ink-soft)',
    fontWeight: 700,
  },

  checkboxRow: {
    display: 'flex',
    gap: 25,
    margin: '10px 0 22px',
    color: 'var(--ink-soft)',
  },

  primaryButton: {
    background: 'var(--brand)',
    color: 'var(--on-accent)',
    border: 0,
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  approveButton: {
    background: 'var(--brand)',
    color: 'var(--on-accent)',
    border: 0,
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  rejectButton: {
    background: 'var(--danger)',
    color: 'var(--on-accent)',
    border: 0,
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  publishButton: {
    background: 'var(--info)',
    color: 'var(--on-accent)',
    border: 0,
    padding: '11px 20px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  secondaryButton: {
    background: 'var(--surface)',
    color: 'var(--ink-soft)',
    border: '1px solid var(--border)',
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  deleteButton: {
    background: 'var(--danger)',
    color: 'var(--on-accent)',
    border: 0,
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  assetBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    background: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 18,
  },

  muted: {
    color: 'var(--ink-soft)',
    marginBottom: 0,
  },

  help: {
    color: 'var(--ink-soft)',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 15,
  },

  success: {
    background: 'var(--success-tint)',
    color: 'var(--brand-light)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },

  error: {
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },

  loading: {
    maxWidth: 1000,
    margin: '60px auto',
    background: 'var(--surface)',
    padding: 30,
    borderRadius: 15,
  },
};
