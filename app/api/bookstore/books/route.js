import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'marketplace';

    if (view === 'marketplace') {
      const marketplaceData = {
        portal: 'Islamic Bookstore Management Portal',
        featuredBooks: [
          { id: 'BOOK-01', title: 'Introduction to Hadith Sciences', author: 'Sheikh Ahmad', price: 'GHS 50.00', status: 'Approved' },
          { id: 'BOOK-02', title: 'Understanding Fiqh Made Easy', author: 'Dr. Mahmud', price: 'GHS 40.00', status: 'Approved' }
        ]
      };
      return NextResponse.json({ success: true, data: marketplaceData });
    } else if (view === 'author_dashboard') {
      const authorDashboard = {
        authorId: 'AUTH-101',
        name: 'Sheikh Ahmad',
        uploadedBooks: 3,
        totalSales: 125,
        earnings: 'GHS 5,000.00',
        payoutStatus: 'Pending Approval'
      };
      return NextResponse.json({ success: true, data: authorDashboard });
    }

    return NextResponse.json({ success: false, error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, title, authorId, price, category } = body;

    if (action === 'upload_book') {
      return NextResponse.json({
        success: true,
        message: 'Book uploaded successfully and submitted for administrator review.',
        data: {
          bookId: 'BOOK-' + Math.floor(1000 + Math.random() * 9000),
          title,
          authorId,
          price,
          category,
          status: 'Pending Review',
          downloadApprovalRequired: true
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
