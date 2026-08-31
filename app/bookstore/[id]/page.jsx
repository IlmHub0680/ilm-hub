import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import './book-detail.css';

export const dynamic = 'force-dynamic';

async function getBook(id) {
  return prisma.book.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

function formatBook(book) {
  if (!book) {
    return null;
  }

  return {
    ...book,
    title: book.titleEn,
    arabicTitle: book.titleAr,
    description: book.descriptionEn,
    price: Number(book.priceUSD),
    currency: 'USD',
    image:
      book.coverImageUrl ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
    rating: 5,
    reviews: 0,
    category:
      book.category?.nameEn ||
      'Islamic Studies',
    format: book.r2FileKey
      ? 'Physical + Digital'
      : 'Physical',
    author:
      book.author?.name ||
      'Ilm-Hub Academic Collection',
    badge: book.isNewRelease
      ? 'NEW'
      : book.isFeatured
        ? 'FEATURED'
        : null,
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const book = await getBook(id);

  if (!book) {
    return {
      title: 'Book Not Found | Ilm-Hub',
    };
  }

  return {
    title: `${book.titleEn} | Ilm-Hub Bookstore`,
    description:
      book.descriptionEn ||
      `Read more about ${book.titleEn}.`,
  };
}

export default async function BookPage({
  params,
}) {
  const { id } = await params;

  const rawBook = await getBook(id);

  if (!rawBook) {
    notFound();
  }

  const book = formatBook(rawBook);

  const formattedPrice = new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: book.currency,
    }
  ).format(book.price);

  return (
    <main className="book-detail">
      <div className="detail-container">

        <Link
          href="/bookstore"
          className="back-link"
        >
          ← Back to Bookstore
        </Link>

        <div className="detail-grid">

          <div className="detail-image">
            <img
              src={book.image}
              alt={book.title}
            />

            {book.badge && (
              <span>
                {book.badge}
              </span>
            )}
          </div>

          <div className="detail-content">

            <small>
              {book.category} · {book.format}
            </small>

            <h1>
              {book.title}
            </h1>

            {book.arabicTitle && (
              <h2 dir="rtl">
                {book.arabicTitle}
              </h2>
            )}

            <p className="author">
              {book.author}
            </p>

            {book.rating > 0 && (
              <div className="rating">
                {'★'.repeat(
                  Math.min(
                    5,
                    Math.round(book.rating)
                  )
                )}

                {'☆'.repeat(
                  Math.max(
                    0,
                    5 - Math.round(book.rating)
                  )
                )}

                {book.reviews > 0 && (
                  <span>
                    {book.reviews} reviews
                  </span>
                )}
              </div>
            )}

            <div className="detail-price">
              {formattedPrice}
            </div>

            <p className="description">
              {book.description ||
                'This book is part of the Ilm-Hub academic bookstore collection.'}
            </p>

            <div className="purchase-box">

              <p>
                This book is available through
                the Ilm-Hub bookstore.
              </p>

              <Link
                href={`/checkout?bookId=${encodeURIComponent(
                  book.id
                )}`}
              >
                Purchase This Book
              </Link>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

