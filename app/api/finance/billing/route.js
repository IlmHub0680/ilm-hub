import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 'EP2026001';

    const financeData = {
      studentId: studentId,
      billingOverview: {
        totalFees: 1000,
        paid: 700,
        balance: 300,
        status: 'Outstanding Balance',
        currency: 'GHS'
      },
      transactions: [
        { id: 'TXN-9081', type: 'Tuition Fee', amount: 400, method: 'Mobile Money', date: '2026-06-15', status: 'Approved' },
        { id: 'TXN-9422', type: 'Admission Fee', amount: 300, method: 'Debit Card', date: '2026-05-10', status: 'Approved' },
        { id: 'TXN-9850', type: 'Tuition Fee', amount: 300, method: 'Mobile Money', date: '2026-07-20', status: 'Pending Verification' }
      ]
    };

    return NextResponse.json({ success: true, data: financeData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, amount, paymentMethod, paymentType } = body;

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully and set to Pending Verification.',
      data: {
        transactionReference: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
        studentId,
        amount,
        paymentMethod,
        paymentType,
        status: 'Pending Verification',
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
