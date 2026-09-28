import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import './book-detail.css';

export const dynamic = 'force-dynamic';

async function getBook(id) {
  return prisma.book.findFirst({
    where: {
      id,
      status: "PUBLISHED",
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
    category:
      book.category?.nameEn ||
      'Islamic Studies',
    format: book.r2FileKey
      ? 'Physical + Digital'
      : 'Physical',
    author:
      book.author?.name ||
      'Ulul Azm Academic Collection',
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
      title: 'Book Not Found | Ulul Azm',
    };
  }

  return {
    title: `${book.titleEn} | Ulul Azm Bookstore`,
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
    <>
      <SiteHeader sectionMode="bookstore" showSearch={false} />

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

            <div className="detail-price">
              {formattedPrice}
            </div>

            <p className="description">
              {book.description ||
                'This book is part of the Ulul Azm academic bookstore collection.'}
            </p>

            <div className="purchase-box">

              <p>
                This book is available through
                the Ulul Azm bookstore.
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

      <SiteFooter />
    </>
  );
}

