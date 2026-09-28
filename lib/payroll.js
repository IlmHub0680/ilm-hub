// Shared helpers for the real Staff Payroll system (Finance module). Net
// pay is always computed here from base salary + allowances - deductions
// — never entered by hand anywhere in the app — so "generate payroll"
// and "edit a payslip" can never disagree with what a payslip actually
// displays.

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year, month) {
  const name = MONTH_NAMES[month - 1] || `Month ${month}`;
  return `${name} ${year}`;
}

export function computeNetPay({ baseSalary, allowances = 0, deductions = 0 }) {
  const net = Number(baseSalary || 0) + Number(allowances || 0) - Number(deductions || 0);
  return Math.round(net * 100) / 100;
}

export const PAYSLIP_STATUS_LABELS = {
  PENDING: "Pending Payment",
  PAID: "Paid",
};

export function getPayslipStatusLabel(status) {
  return PAYSLIP_STATUS_LABELS[status] || status || "Unknown";
}
