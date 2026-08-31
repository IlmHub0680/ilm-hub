import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const submissions =
      await prisma.manuscriptSubmission.findMany({
        where: {
          authorId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error(
      'Error fetching submissions:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submissions.',
      },
      { status: 500 }
    );
  }
}
