'use client';
import BackToAdmin from '../../BackToAdmin';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewBookPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    slug: '',
    descriptionEn: '',
    descriptionAr: '',
    priceUSD: '',
    categoryId: '',
    authorId: '',
    coverImageUrl: '',
    r2FileKey: '',
    isFeatured: false,
    isNewRelease: true,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/admin/publishing/categories', {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || 'Unable to load categories.'
          );
        }

        const data =
          result.categories ||
          result.data ||
          [];

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load categories.'
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createSlug(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      titleEn: value,
      slug:
        current.slug === createSlug(current.titleEn) ||
        !current.slug
          ? createSlug(value)
          : current.slug,
    }));
  }

  async function saveBook(status) {
    setError('');

    if (!form.titleEn.trim()) {
      setError('English title is required.');
      return;
    }

    if (!form.titleAr.trim()) {
      setError('Arabic title is required.');
      return;
    }

    if (!form.descriptionEn.trim()) {
      setError('English description is required.');
      return;
    }

    if (!form.descriptionAr.trim()) {
      setError('Arabic description is required.');
      return;
    }

    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }

    const price = Number(form.priceUSD);

    if (!Number.isFinite(price) || price < 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        '/api/admin/publishing/books',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titleEn: form.titleEn.trim(),
            titleAr: form.titleAr.trim(),
            slug: form.slug.trim(),
            descriptionEn:
              form.descriptionEn.trim(),
            descriptionAr:
              form.descriptionAr.trim(),
            priceUSD: price,
            categoryId: form.categoryId,
            authorId:
              form.authorId.trim() || null,
            coverImageUrl:
              form.coverImageUrl.trim(),
            r2FileKey:
              form.r2FileKey.trim(),
            isFeatured: form.isFeatured,
            isNewRelease: form.isNewRelease,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error ||
            'Unable to create the book.'
        );
      }

      router.push(
        `/admin/bookstore/books/${result.data.id}`
      );
      router.refresh();
    } catch (err) {
      console.error(
        'CREATE BOOK ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create the book.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        padding: '32px',
        fontFamily:
          'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Link
          href="/admin/bookstore/books"
          style={{
            color: 'var(--ink-soft)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          ← Back to Books
        </Link>

        <div
          style={{
            marginTop: 20,
            background:
              'linear-gradient(135deg,var(--ink),var(--brand-dark))',
            color: 'var(--on-accent)',
            borderRadius: 18,
            padding: 28,
            boxShadow:
              '0 12px 30px rgba(15,23,42,.12)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: 'var(--info)',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}
          >
            Bookstore Management
          </div>

          <h1
            style={{
              margin: '7px 0 0',
              fontSize: 32,
            }}
          >
            Add Book
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: 'var(--border)',
            }}
          >
            Create and prepare a book for the
            Ulul Azm bookstore.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 10,
              background: 'var(--danger-tint)',
              color: 'var(--danger)',
              border:
                '1px solid var(--danger-tint)',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: 22,
            background: 'var(--surface)',
            borderRadius: 16,
            padding: 28,
            boxShadow:
              '0 5px 20px rgba(15,23,42,.06)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: 'var(--ink)',
            }}
          >
            Book Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(280px,1fr))',
              gap: 20,
            }}
          >
            <Field
              label="English Title"
              value={form.titleEn}
              onChange={handleTitleChange}
              required
            />

            <Field
              label="Arabic Title"
              value={form.titleAr}
              onChange={(v) =>
                update('titleAr', v)
              }
              dir="rtl"
              required
            />

            <Field
              label="Slug"
              value={form.slug}
              onChange={(v) =>
                update('slug', v)
              }
              hint="Used for the bookstore URL."
              required
            />

            <Field
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
              value={form.priceUSD}
              onChange={(v) =>
                update('priceUSD', v)
              }
              required
            />

            <div>
              <label style={labelStyle}>
                Category *
              </label>

              <select
                value={form.categoryId}
                onChange={(e) =>
                  update(
                    'categoryId',
                    e.target.value
                  )
                }
                disabled={loadingCategories}
                style={inputStyle}
              >
                <option value="">
                  {loadingCategories
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.nameEn ||
                        category.name ||
                        category.slug}
                    </option>
                  )
                )}
              </select>
            </div>

            <Field
              label="Author ID"
              value={form.authorId}
              onChange={(v) =>
                update('authorId', v)
              }
              hint="Optional."
            />

            <Field
              label="Cover Image URL"
              value={form.coverImageUrl}
              onChange={(v) =>
                update(
                  'coverImageUrl',
                  v
                )
              }
              hint="Optional until a cover asset is attached."
            />

            <Field
              label="Digital File Key"
              value={form.r2FileKey}
              onChange={(v) =>
                update('r2FileKey', v)
              }
              hint="Optional. The digital file can be attached later."
            />
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'grid',
              gap: 20,
            }}
          >
            <TextArea
              label="English Description"
              value={form.descriptionEn}
              onChange={(v) =>
                update(
                  'descriptionEn',
                  v
                )
              }
              required
            />

            <TextArea
              label="Arabic Description"
              value={form.descriptionAr}
              onChange={(v) =>
                update(
                  'descriptionAr',
                  v
                )
              }
              dir="rtl"
              required
            />
          </div>

          <div
            style={{
              marginTop: 25,
              paddingTop: 22,
              borderTop:
                '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 22,
            }}
          >
            <label
              style={{
                display: 'flex',
                gap: 9,
                alignItems: 'center',
                fontWeight: 600,
                color: 'var(--ink-soft)',
              }}
            >
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  update(
                    'isFeatured',
                    e.target.checked
                  )
                }
              />
              Featured book
            </label>

            <label
              style={{
                display: 'flex',
                gap: 9,
                alignItems: 'center',
                fontWeight: 600,
                color: 'var(--ink-soft)',
              }}
            >
              <input
                type="checkbox"
                checked={form.isNewRelease}
                onChange={(e) =>
                  update(
                    'isNewRelease',
                    e.target.checked
                  )
                }
              />
              New release
            </label>
          </div>

          <div
            style={{
              marginTop: 30,
              padding: 18,
              background: 'var(--paper)',
              borderRadius: 12,
              border:
                '1px solid var(--border)',
            }}
          >
            <strong
              style={{
                color: 'var(--ink)',
              }}
            >
              Publishing workflow
            </strong>

            <p
              style={{
                margin:
                  '7px 0 0',
                color: 'var(--ink-soft)',
                lineHeight: 1.6,
              }}
            >
              Save as a draft while preparing
              the book. Publishing is separate
              from uploading a digital file.
              Only books with PUBLISHED status
              should appear in the public
              bookstore.
            </p>
          </div>

          <div
            style={{
              marginTop: 25,
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/admin/bookstore/books"
              style={{
                padding:
                  '12px 20px',
                borderRadius: 9,
                border:
                  '1px solid var(--border)',
                color: 'var(--ink-soft)',
                textDecoration:
                  'none',
                fontWeight: 700,
              }}
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBook('DRAFT')
              }
              style={{
                padding:
                  '12px 20px',
                borderRadius: 9,
                border: 'none',
                background:
                  'var(--border)',
                color: 'var(--ink-soft)',
                fontWeight: 700,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Draft'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBook('PUBLISHED')
              }
              style={{
                padding:
                  '12px 22px',
                borderRadius: 9,
                border: 'none',
                background:
                  'var(--brand-light)',
                color: 'var(--on-accent)',
                fontWeight: 700,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Publishing...'
                : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  min,
  step,
  dir,
  required,
  hint,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && ' *'}
      </label>

      <input
        type={type}
        min={min}
        step={step}
        value={value}
        dir={dir}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={inputStyle}
      />

      {hint && (
        <div
          style={{
            marginTop: 5,
            fontSize: 12,
            color: 'var(--ink-soft)',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  dir,
  required,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && ' *'}
      </label>

      <textarea
        value={value}
        dir={dir}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={6}
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: 140,
        }}
      />
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  color: 'var(--ink-soft)',
  fontSize: 14,
  fontWeight: 700,
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 13px',
  border: '1px solid var(--border)',
  borderRadius: 9,
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 15,
  outline: 'none',
};
