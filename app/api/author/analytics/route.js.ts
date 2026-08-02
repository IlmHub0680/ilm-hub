import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // You can later connect this to your database (Prisma/MySQL) to query live author stats
    const mockAnalytics = {
      totalSales: 145,
      totalRevenueUSD: 3625.50,
      activeBooks: 4,
      totalDownloads: 420,
      recentSales: [
        { id: 1, bookTitle: 'Commentary on Al-Ajrumiyyah', buyer: 'Student A.', amount: 25.00, date: '2026-08-01' },
        { id: 2, bookTitle: 'Mutun Al-Ilmiyyah Compendium', buyer: 'Student B.', amount: 40.00, date: '2026-07-30' },
      ]
    };

    return NextResponse.json({ success: true, data: mockAnalytics }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}