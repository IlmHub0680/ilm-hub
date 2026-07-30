import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminRole = searchParams.get('role') || 'Super Administrator';

    const adminDashboardData = {
      role: adminRole,
      statistics: {
        students: { total: 450, active: 420, newAdmissions: 30 },
        academics: { programs: 5, courses: 28, activeInstructors: 14, currentSemester: 'Semester 1' },
        finances: { totalRevenue: 'GHS 45,000', pendingPayments: 'GHS 5,200', outstanding: 'GHS 3,100' },
        staff: { totalInstructors: 14, activeStaff: 18, pendingApprovals: 4 }
      },
      pendingApprovals: [
        { id: 'APP-001', type: 'Admission', applicant: 'Fatima Zahra', status: 'Pending Verification' },
        { id: 'CUR-002', type: 'Curriculum Change', program: 'Intermediate Programme', status: 'Pending Review' },
        { id: 'PAY-003', type: 'Payment Verification', student: 'Khalid Muhammad', status: 'Pending Approval' }
      ]
    };

    return NextResponse.json({ success: true, data: adminDashboardData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
