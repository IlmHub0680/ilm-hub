import { redirect } from 'next/navigation';

// Model 32 §3 -- the Finance dashboard's landing route now redirects to
// its work queue (overdue fees, unverified payments, open refunds)
// instead of Create Fee, so Finance staff see what needs attention
// first thing.
export default function FinanceDashboardPage() {
    redirect('/finance-dashboard/queue');
}
