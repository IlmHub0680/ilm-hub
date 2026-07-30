import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust import based on your prisma instance location

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, genre, description, manuscriptUrl, services, authorId } = body;

    const submission = await prisma.manuscriptSubmission.create({
      data: {
        title,
        genre,
        description,
        manuscriptUrl,
        services: services || [],
        authorId: authorId || 'guest-author-id', // Replace with dynamic user session ID if available
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
