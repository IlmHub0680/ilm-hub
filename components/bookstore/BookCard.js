'use client';

import Link from 'next/link';

function getText(value, fallback = '') {
  if (value == null) return fallback;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return (
      value.nameEn ||
      value.name ||
      value.title ||
      value.slug ||
      fallback
    );
  }

  return String(value);
}

function getImage(book) {
  const candidates = [
    book?.image,
    book?.imageUrl,
    book?.coverImage,
    book?.coverUrl,
    book?.thumbnail,
    book?.thumbnailUrl,
  ];

  return candidates.find(
    (value) =>
      typeof value === 'string' &&
      value.trim() &&
      !value.includes('undefined') &&
      !value.includes('null')
  ) || '';
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0.00';
  }

  return number.toFixed(2);
}

export default function BookCard({
  book,
  currency = 'USD',
  formatPrice,
  onAdd,
}) {
  const title = getText(book?.title, 'Untitled Book');
  const arabicTitle = getText(book?.arabicTitle);
  const author = getText(
    book?.author,
    'Ilm-Hub Academic Collection'
  );
  const description = getText(book?.description);
  const category = getText(
    book?.category,
    'General'
  );
  const format = getText(
    book?.format,
    'Book'
  );

  const image = getImage(book);

  const price = Number(book?.price ?? 0);
  const oldPrice =
    book?.oldPrice != null
      ? Number(book.oldPrice)
      : null;

  const rating = Number(book?.rating ?? 0);
  const reviews = Number(book?.reviews ?? 0);

  const slug = getText(
    book?.slug,
    book?.id
  );

  let displayPrice;

  try {
    displayPrice =
      typeof formatPrice === 'function'
        ? formatPrice(price, currency)
        : `${currency} ${formatNumber(price)}`;
  } catch {
    displayPrice = `${currency} ${formatNumber(price)}`;
  }

  let displayOldPrice = null;

  if (
    Number.isFinite(oldPrice) &&
    oldPrice > price
  ) {
    try {
      displayOldPrice =
        typeof formatPrice === 'function'
          ? formatPrice(oldPrice, currency)
          : `${currency} ${formatNumber(oldPrice)}`;
    } catch {
      displayOldPrice =
        `${currency} ${formatNumber(oldPrice)}`;
    }
  }

  return (
    <article className="book-card">
      <div className="book-image-wrap">
        {image ? (
          <img
            src={image}
            alt={title}
            className="book-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';

              const fallback =
                event.currentTarget.parentElement?.querySelector(
                  '.book-image-fallback'
                );

              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}

        <div
          className="book-image-fallback"
          style={{
            display: image ? 'none' : 'flex',
          }}
        >
          <div>
            <span>ILM-HUB</span>
            <strong>{title}</strong>
            <small>{author}</small>
          </div>
        </div>

        {book?.badge ? (
          <span className="book-badge">
            {getText(book.badge)}
          </span>
        ) : null}

        <Link
          href={`/bookstore/${encodeURIComponent(slug)}`}
          className="quick-view"
        >
          View Book
        </Link>
      </div>

      <div className="book-body">
        <div className="book-meta">
          <span>{category}</span>
          <span>{format}</span>
        </div>

        <Link
          href={`/bookstore/${encodeURIComponent(slug)}`}
          className="book-title"
        >
          {title}
        </Link>

        {arabicTitle ? (
          <p
            className="book-arabic"
            dir="rtl"
          >
            {arabicTitle}
          </p>
        ) : null}

        <p className="book-author">
          {author}
        </p>

        {description ? (
          <p className="book-description">
            {description}
          </p>
        ) : null}

        {rating > 0 ? (
          <div className="book-rating">
            <span>
              {'★'.repeat(
                Math.min(5, Math.max(0, Math.round(rating)))
              )}
              {'☆'.repeat(
                5 -
                  Math.min(
                    5,
                    Math.max(0, Math.round(rating))
                  )
              )}
            </span>

            <small>
              {rating.toFixed(1)}
              {reviews > 0
                ? ` (${reviews})`
                : ''}
            </small>
          </div>
        ) : null}

        <div className="book-bottom">
          <div>
            <strong>
              {displayPrice}
            </strong>

            {displayOldPrice ? (
              <del>
                {displayOldPrice}
              </del>
            ) : null}
          </div>

          <button
            type="button"
            className="add-button"
            onClick={() => onAdd?.(book)}
            aria-label={`Add ${title} to cart`}
            title="Add to cart"
          >
            +
          </button>
        </div>
      </div>

      <style jsx>{`
        .book-image-fallback {
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          padding: 25px;
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(197, 157, 95, 0.3),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #062b17,
              #0b3b21 55%,
              #14532d
            );
          color: white;
          text-align: center;
        }

        .book-image-fallback > div {
          width: 100%;
          max-width: 210px;
          padding: 24px 18px;
          border: 1px solid rgba(215, 183, 109, 0.65);
          background: rgba(0, 0, 0, 0.18);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .book-image-fallback span {
          display: block;
          margin-bottom: 18px;
          color: #d7b76d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .book-image-fallback strong {
          display: block;
          font: 21px/1.3 Georgia, serif;
        }

        .book-image-fallback small {
          display: block;
          margin-top: 14px;
          color: #cbded2;
          font-size: 11px;
        }

        .book-description {
          display: -webkit-box;
          overflow: hidden;
          margin: 9px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.55;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </article>
  );
}

