import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      books,
    });
  } catch (error) {
    console.error('BOOKS API ERROR:', error);

    return Response.json(
      {
        error: 'Unable to retrieve books.',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown database error.',
      },
      { status: 500 }
    );
  }
}
