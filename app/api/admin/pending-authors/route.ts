import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pendingAuthors = await prisma.user.findMany({
      where: { role: 'AUTHOR', authorStatus: 'PENDING' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json(pendingAuthors);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
