'use client';
import { useState, useEffect, Fragment } from 'react';
import { MONTH_NAMES, getPayslipStatusLabel } from '@/lib/payroll';
import { fieldStyle, PayrollStaffRow, Payslip } from '../types';

export default function StaffPayrollPage() {
    const now = new Date();
    const [payrollStaff, setPayrollStaff] = useState<PayrollStaffRow[]>([]);
    const [loadingPayroll, setLoadingPayroll] = useState(true);
    const [payrollError, setPayrollError] = useState('');
    const [payrollMessage, setPayrollMessage] = useState('');
    const [salaryInputs, setSalaryInputs] = useState<Record<string, { baseSalary: string; allowances: string }>>({});
    const [savingSalaryId, setSavingSalaryId] = useState<string | null>(null);

    const [payrollYear, setPayrollYear] = useState(now.getFullYear());
    const [payrollMonth, setPayrollMonth] = useState(now.getMonth() + 1);
    const [generatingPayroll, setGeneratingPayroll] = useState(false);
    const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
    const [staffPayslips, setStaffPayslips] = useState<Payslip[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [deductionInputs, setDeductionInputs] = useState<Record<string, string>>({});
    const [savingPayslipId, setSavingPayslipId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayrollStaff();
    }, []);

    const fetchPayrollStaff = async () => {
        setLoadingPayroll(true);
        setPayrollError('');
        try {
            const res = await fetch('/api/finance/payroll', { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data.success) {
                setPayrollStaff(data.staff || []);
            } else {
                setPayrollError(data.error || 'Failed to load payroll data.');
            }
        } catch (err) {
            setPayrollError('An error occurred while loading payroll data.');
        } finally {
            setLoadingPayroll(false);
        }
    };

    const fetchStaffDetail = async (staffId: string) => {
        setLoadingDetail(true);
        try {
            const res = await fetch(`/api/finance/payroll/${staffId}`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data.success) {
                setStaffPayslips(data.payslips || []);
            }
        } catch (err) {
            // Keep whatever was already shown rather than clearing it on a transient error.
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSetSalary = async (staffId: string) => {
        const input = salaryInputs[staffId];
        if (!input || input.baseSalary === '' || input.baseSalary === undefined) {
            setPayrollMessage('Enter a base salary first.');
            return;
        }

        setSavingSalaryId(staffId);
        setPayrollMessage('');
        try {
            const res = await fetch('/api/finance/payroll', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'set_salary',
                    staffId,
                    baseSalary: Number(input.baseSalary),
                    allowances: Number(input.allowances || 0),
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPayrollMessage('Salary structure saved.');
                fetchPayrollStaff();
            } else {
                setPayrollMessage(data.error || 'Failed to save salary.');
            }
        } catch (err) {
            setPayrollMessage('An error occurred.');
        } finally {
            setSavingSalaryId(null);
        }
    };

    const handleGeneratePayroll = async () => {
        setGeneratingPayroll(true);
        setPayrollMessage('');
        try {
            const res = await fetch('/api/finance/payroll', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_payroll', year: payrollYear, month: payrollMonth }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const parts = [`${data.created} payslip(s) created`];
                if (data.skippedExisting) parts.push(`${data.skippedExisting} already existed`);
                if (data.skippedNoSalary) parts.push(`${data.skippedNoSalary} staff have no salary set up yet`);
                setPayrollMessage(`Payroll generated for ${MONTH_NAMES[payrollMonth - 1]} ${payrollYear}: ${parts.join(', ')}.`);
                fetchPayrollStaff();
                if (expandedStaffId) fetchStaffDetail(expandedStaffId);
            } else {
                setPayrollMessage(data.error || 'Failed to generate payroll.');
            }
        } catch (err) {
            setPayrollMessage('An error occurred.');
        } finally {
            setGeneratingPayroll(false);
        }
    };

    const handleToggleExpand = (staffId: string) => {
        if (expandedStaffId === staffId) {
            setExpandedStaffId(null);
            setStaffPayslips([]);
            return;
        }
        setExpandedStaffId(staffId);
        fetchStaffDetail(staffId);
    };

    const handleUpdatePayslip = async (staffId: string, payslipId: string, markPaid: boolean) => {
        setSavingPayslipId(payslipId);
        setPayrollMessage('');
        try {
            const res = await fetch(`/api/finance/payroll/${staffId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payslipId,
                    deductions: deductionInputs[payslipId] !== undefined ? Number(deductionInputs[payslipId]) : undefined,
                    markPaid,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPayrollMessage(markPaid ? 'Payslip marked as paid.' : 'Deductions updated.');
                fetchStaffDetail(staffId);
                fetchPayrollStaff();
            } else {
                setPayrollMessage(data.error || 'Failed to update payslip.');
            }
        } catch (err) {
            setPayrollMessage('An error occurred.');
        } finally {
            setSavingPayslipId(null);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Staff Payroll</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Generate monthly payroll and manage staff salary structures.
            </p>

            <div className="ih-card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Generate Monthly Payroll</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Month</label>
                        <select value={payrollMonth} onChange={(e) => setPayrollMonth(Number(e.target.value))} style={fieldStyle}>
                            {MONTH_NAMES.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Year</label>
                        <input type="number" value={payrollYear} onChange={(e) => setPayrollYear(Number(e.target.value))} style={{ ...fieldStyle, width: 90 }} />
                    </div>
                    <button onClick={handleGeneratePayroll} disabled={generatingPayroll} className="ih-btn ih-btn-primary">
                        {generatingPayroll ? 'Generating…' : 'Generate Payroll'}
                    </button>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>
                    Creates one payslip for every active staff member who already has a salary structure set up below, using their current base salary and allowances. Staff already generated for the selected month are skipped automatically — this never duplicates or overwrites an existing payslip.
                </p>
            </div>

            {payrollMessage && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 16, background: payrollMessage.toLowerCase().includes('fail') || payrollMessage.toLowerCase().includes('error') || payrollMessage.toLowerCase().includes('enter') ? 'var(--danger-tint)' : 'var(--success-tint)', color: payrollMessage.toLowerCase().includes('fail') || payrollMessage.toLowerCase().includes('error') || payrollMessage.toLowerCase().includes('enter') ? 'var(--danger)' : 'var(--success)' }}>
                    {payrollMessage}
                </div>
            )}

            {loadingPayroll ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading staff payroll…</div>
            ) : payrollError ? (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>{payrollError}</div>
            ) : (
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Staff & Salary Structure</h3>
                    <div className="ih-tbl-wrap">
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Position</th>
                                    <th>Base Salary</th>
                                    <th>Allowances</th>
                                    <th>Latest Payslip</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollStaff.map((s) => {
                                    const input = salaryInputs[s.id] || {
                                        baseSalary: s.salary ? String(s.salary.baseSalary) : '',
                                        allowances: s.salary ? String(s.salary.allowances) : '',
                                    };
                                    return (
                                        <Fragment key={s.id}>
                                            <tr>
                                                <td>
                                                    <strong>{s.name}</strong>
                                                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{s.employeeNo} · {s.email}</div>
                                                </td>
                                                <td>{s.position || '—'}{s.department ? ` · ${s.department}` : ''}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={input.baseSalary}
                                                        onChange={(e) => setSalaryInputs((prev) => ({ ...prev, [s.id]: { ...input, baseSalary: e.target.value } }))}
                                                        style={{ ...fieldStyle, width: 90 }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={input.allowances}
                                                        onChange={(e) => setSalaryInputs((prev) => ({ ...prev, [s.id]: { ...input, allowances: e.target.value } }))}
                                                        style={{ ...fieldStyle, width: 90 }}
                                                    />
                                                </td>
                                                <td>
                                                    {s.latestPayslip ? (
                                                        <>
                                                            <div className="mono">${s.latestPayslip.netPay.toFixed(2)}</div>
                                                            <span className={`ih-badge ${s.latestPayslip.status === 'PAID' ? 'ih-b-success' : 'ih-b-warning'}`}>
                                                                {getPayslipStatusLabel(s.latestPayslip.status)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--ink-soft)', fontSize: 12.5 }}>No payslip yet</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        <button onClick={() => handleSetSalary(s.id)} disabled={savingSalaryId === s.id} className="ih-btn ih-btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}>
                                                            {savingSalaryId === s.id ? '…' : s.salary ? 'Update' : 'Save'}
                                                        </button>
                                                        <button onClick={() => handleToggleExpand(s.id)} className="ih-btn ih-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                                                            {expandedStaffId === s.id ? 'Hide History' : 'Payslip History'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedStaffId === s.id && (
                                                <tr>
                                                    <td colSpan={6} style={{ background: 'var(--paper)' }}>
                                                        {loadingDetail ? (
                                                            <div style={{ padding: 12, color: 'var(--ink-soft)' }}>Loading payslip history…</div>
                                                        ) : staffPayslips.length === 0 ? (
                                                            <div style={{ padding: 12, color: 'var(--ink-soft)' }}>No payslips generated yet for this staff member.</div>
                                                        ) : (
                                                            <div style={{ padding: 12 }}>
                                                                <table className="ih-tbl">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Period</th>
                                                                            <th>Base</th>
                                                                            <th>Allowances</th>
                                                                            <th>Deductions</th>
                                                                            <th>Net Pay</th>
                                                                            <th>Status</th>
                                                                            <th>Paid On</th>
                                                                            <th>Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {staffPayslips.map((p) => (
                                                                            <tr key={p.id}>
                                                                                <td>{MONTH_NAMES[p.month - 1]} {p.year}</td>
                                                                                <td className="mono">${p.baseSalary.toFixed(2)}</td>
                                                                                <td className="mono">${p.allowances.toFixed(2)}</td>
                                                                                <td>
                                                                                    {p.status === 'PENDING' ? (
                                                                                        <input
                                                                                            type="number"
                                                                                            placeholder={p.deductions.toFixed(2)}
                                                                                            value={deductionInputs[p.id] ?? String(p.deductions)}
                                                                                            onChange={(e) => setDeductionInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                                                                            style={{ ...fieldStyle, width: 80 }}
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="mono">${p.deductions.toFixed(2)}</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>${p.netPay.toFixed(2)}</td>
                                                                                <td>
                                                                                    <span className={`ih-badge ${p.status === 'PAID' ? 'ih-b-success' : 'ih-b-warning'}`}>
                                                                                        {getPayslipStatusLabel(p.status)}
                                                                                    </span>
                                                                                </td>
                                                                                <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                                                                                <td>
                                                                                    {p.status === 'PENDING' && (
                                                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                                                            <button onClick={() => handleUpdatePayslip(s.id, p.id, false)} disabled={savingPayslipId === p.id} className="ih-btn ih-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>
                                                                                                Save
                                                                                            </button>
                                                                                            <button onClick={() => handleUpdatePayslip(s.id, p.id, true)} disabled={savingPayslipId === p.id} className="ih-btn ih-btn-primary" style={{ padding: '4px 8px', fontSize: 11 }}>
                                                                                                {savingPayslipId === p.id ? '…' : 'Mark Paid'}
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
