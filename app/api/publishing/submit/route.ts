import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
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

    const body = await req.json();

    const title =
      typeof body?.title === 'string'
        ? body.title.trim()
        : '';

    const genre =
      typeof body?.genre === 'string'
        ? body.genre.trim()
        : '';

    const description =
      typeof body?.description === 'string'
        ? body.description.trim()
        : '';

    const manuscriptUrl =
      typeof body?.manuscriptUrl === 'string'
        ? body.manuscriptUrl.trim()
        : '';

    const services = Array.isArray(body?.services)
      ? body.services
          .filter(
            (service: unknown): service is string =>
              typeof service === 'string'
          )
          .map((service: string) => service.trim())
          .filter(Boolean)
      : [];

    if (!title || !genre || !description || !manuscriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Title, genre, description, and manuscript link are required.',
        },
        { status: 400 }
      );
    }

    try {
      new URL(manuscriptUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid manuscript URL.',
        },
        { status: 400 }
      );
    }

    const submission =
      await prisma.manuscriptSubmission.create({
        data: {
          id: crypto.randomUUID(),
          authorId: user.id,
          title,
          genre,
          description,
          manuscriptUrl,
          services,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json(
      {
        success: true,
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Error creating manuscript submission:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create manuscript submission.',
      },
      { status: 500 }
    );
  }
}
