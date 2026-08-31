import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function serializeDecimal(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = String(
      searchParams.get('search') || ''
    ).trim();

    const categorySlug = String(
      searchParams.get('category') || ''
    ).trim();

    const where = {};

    if (search) {
      where.OR = [
        {
          titleEn: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          titleAr: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          descriptionEn: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          descriptionAr: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    const books = await prisma.book.findMany({
      where,

      include: {
        category: true,

        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    /*
     * Convert Prisma records into the shape expected
     * by the existing bookstore frontend.
     *
     * IMPORTANT:
     * We keep the original database values available,
     * while also exposing the legacy/frontend field names.
     */

    const formattedBooks = books.map((book) => {
      const price = serializeDecimal(book.priceUSD);

      const categoryName =
        book.category?.nameEn ||
        book.category?.nameAr ||
        '';

      const categorySlugValue =
        book.category?.slug || '';

      const authorName =
        book.author?.name || '';

      return {
        id: book.id,

        title: book.titleEn || '',
        titleEn: book.titleEn || '',
        arabic_title: book.titleAr || '',
        titleAr: book.titleAr || '',

        description:
          book.descriptionEn || '',
        descriptionEn:
          book.descriptionEn || '',
        descriptionAr:
          book.descriptionAr || '',

        /*
         * Frontend price fields.
         */
        price,
        priceUSD: price,

        /*
         * Image fields used by different parts
         * of the existing application.
         */
        cover_image:
          book.coverImageUrl || '',
        coverImage:
          book.coverImageUrl || '',
        coverImageUrl:
          book.coverImageUrl || '',

        /*
         * Download/storage key.
         */
        r2FileKey:
          book.r2FileKey || '',

        /*
         * Category.
         */
        category: categoryName,
        categorySlug:
          categorySlugValue,
        categoryDetails:
          book.category || null,

        /*
         * Author.
         */
        author: authorName,
        authorName,
        authorDetails:
          book.author || null,

        isFeatured:
          Boolean(book.isFeatured),

        isNewRelease:
          Boolean(book.isNewRelease),

        categoryId:
          book.categoryId || null,

        authorId:
          book.authorId || null,

        createdAt:
          book.createdAt,
      };
    });

    return Response.json({
      success: true,
      books: formattedBooks,
    });
  } catch (error) {
    console.error(
      'BOOKS_API_ERROR:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load books.',
        books: [],
      },
      {
        status: 500,
      }
    );
  }
}
