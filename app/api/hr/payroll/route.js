import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId') || 'INST-2026-01';

    const payrollData = {
      staffId: staffId,
      profile: {
        fullName: 'Ahmad Ibrahim',
        position: 'Head of Department',
        department: 'Islamic Sciences',
        employmentType: 'Full-Time',
        status: 'Active'
      },
      salaryStructure: {
        baseSalary: 'GHS 3,500',
        allowances: 'GHS 500',
        privateCourseEarnings: 'GHS 1,500',
        totalGross: 'GHS 5,500'
      },
      recentPayslips: [
        { period: 'June 2026', netPay: 'GHS 5,200', status: 'Paid', date: '2026-06-30' },
        { period: 'May 2026', netPay: 'GHS 4,800', status: 'Paid', date: '2026-05-31' }
      ]
    };

    return NextResponse.json({ success: true, data: payrollData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, staffId, leaveType, startDate, endDate, reason } = body;

    if (action === 'request_leave') {
      return NextResponse.json({
        success: true,
        message: 'Leave request submitted successfully and set to Pending.',
        data: {
          requestId: 'LEAVE-' + Math.floor(1000 + Math.random() * 9000),
          staffId,
          leaveType,
          startDate,
          endDate,
          reason,
          status: 'Pending'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
