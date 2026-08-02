import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, specialty, bio, password } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Create user with AUTHOR role and PENDING status
    const newAuthor = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, handle hashing via your auth setup
        role: 'AUTHOR',
        authorStatus: 'PENDING',
        bio: bio || '',
        specialty: specialty || '',
      },
    });

    return NextResponse.json({ success: true, authorId: newAuthor.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
