export type Fee = {
    id: string;
    feeType: string;
    amountUSD: number;
    paidUSD: number;
    balanceUSD: number;
    status: string;
    term: string | null;
    dueDate: string | null;
};

export type Student = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    program: string | null;
    fees: Fee[];
};

export type Term = { id: string; name: string };

export type PayrollSalary = { baseSalary: number; allowances: number } | null;
export type LatestPayslip = { id: string; year: number; month: number; netPay: number; status: string } | null;
export type PayrollStaffRow = {
    id: string;
    employeeNo: string;
    name: string;
    email: string;
    position: string | null;
    department: string | null;
    salary: PayrollSalary;
    latestPayslip: LatestPayslip;
};
export type Payslip = {
    id: string;
    year: number;
    month: number;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
    status: string;
    note: string | null;
    paidAt: string | null;
};

export const STATUS_BADGE: Record<string, string> = {
    PENDING: 'ih-b-warning',
    PARTIAL: 'ih-b-info',
    PAID: 'ih-b-success',
    OVERDUE: 'ih-b-danger',
};

export const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 };
