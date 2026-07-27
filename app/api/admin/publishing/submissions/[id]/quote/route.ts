import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { quoteAmount, quoteDetails, status } = await req.json();

    const updated = await prisma.manuscriptSubmission.update({
      where: { id: params.id },
      data: {
        quoteAmount,
        quoteDetails,
        status: status || 'QUOTE_GENERATED',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error generating quote:', error);
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}
