'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MONTH_NAMES, getPayslipStatusLabel } from '@/lib/payroll';

export default function StaffPayrollPage() {
  const [salary, setSalary] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Where "back" should actually go — the account's own dashboard, not
  // always the staff login screen (an Admin/Super Admin opening their
  // payslip should return to the Admin Dashboard, an Instructor to the
  // Instructor Dashboard, and so on).
  const [backHref, setBackHref] = useState('/staff-login');
  const [backLabel, setBackLabel] = useState('Back to Staff Login');

  useEffect(() => {
    fetch('/api/staff/payroll', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load your payroll information.');
        }
        setSalary(result.salary);
        setPayslips(result.payslips || []);
      })
      .catch((err) => setError(err.message || 'Unable to load your payroll information.'))
      .finally(() => setLoading(false));

    fetch('/api/auth/staff-destination', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (result?.success && result.destination) {
          setBackHref(result.destination);
          setBackLabel(result.destination === '/admin' ? 'Back to Admin Dashboard' : 'Back to Dashboard');
        }
      })
      .catch(() => {});
  }, []);

  const latest = payslips[0] || null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-block', marginBottom: 18, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}
      >
        ← {backLabel}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
        My Payslip
      </h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '0 0 24px', maxWidth: 640 }}>
        Your salary structure and payroll history, as processed by the Finance Office.
      </p>

      {loading ? (
        <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading your payroll information…</div>
      ) : error ? (
        <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="ih-card" style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 14px 0', fontSize: 16 }}>Salary Structure</h2>
            {salary ? (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700 }}>Base Salary</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>${salary.baseSalary.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700 }}>Allowances</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>${salary.allowances.toFixed(2)}</div>
                </div>
                {latest && (
                  <div>
                    <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700 }}>Most Recent Net Pay</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>${latest.netPay.toFixed(2)}</div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>
                The Finance Office hasn't set up your salary structure yet. Once they do, your payslips will appear here.
              </p>
            )}
          </div>

          <div className="ih-card">
            <h2 style={{ margin: '0 0 14px 0', fontSize: 16 }}>Payslip History</h2>
            {payslips.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>
                No payslips have been generated for you yet.
              </p>
            ) : (
              <div className="ih-tbl-wrap">
                <table className="ih-tbl">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Base Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th>Paid On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((p) => (
                      <tr key={p.id}>
                        <td>{MONTH_NAMES[p.month - 1]} {p.year}</td>
                        <td className="mono">${p.baseSalary.toFixed(2)}</td>
                        <td className="mono">${p.allowances.toFixed(2)}</td>
                        <td className="mono">${p.deductions.toFixed(2)}</td>
                        <td className="mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>${p.netPay.toFixed(2)}</td>
                        <td>
                          <span className={`ih-badge ${p.status === 'PAID' ? 'ih-b-success' : 'ih-b-warning'}`}>
                            {getPayslipStatusLabel(p.status)}
                          </span>
                        </td>
                        <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
