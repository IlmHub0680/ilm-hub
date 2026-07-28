import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const pendingAuthors = await db.user.findMany({
      where: { role: 'AUTHOR', authorStatus: 'PENDING' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json(pendingAuthors);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
