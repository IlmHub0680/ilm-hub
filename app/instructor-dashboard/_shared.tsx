export const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)' };

export function FeedbackBanner({ text }: { text: string }) {
    const isSuccess = text.includes('success');
    return (
        <div className="ih-card" style={{ padding: '12px 14px', marginBottom: 20, background: isSuccess ? 'var(--success-tint)' : 'var(--danger-tint)', color: isSuccess ? 'var(--success)' : 'var(--danger)' }}>
            {text}
        </div>
    );
}

export const STATUS_TONE_CLASS: Record<string, string> = {
    success: 'ih-b-success',
    warning: 'ih-b-warning',
    danger: 'ih-b-danger',
    neutral: 'ih-b-neutral',
};

export type AttendanceMark = 'PRESENT' | 'LATE' | 'ABSENT';

export function AttendanceMarkCell({
    active,
    tone,
    onSelect,
    name,
}: {
    active: boolean;
    tone: 'success' | 'warning' | 'danger';
    onSelect: () => void;
    name: string;
}) {
    return (
        <td style={{ textAlign: 'center' }}>
            <label
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: active ? '2px solid var(--' + tone + ')' : '1px solid var(--border)',
                    background: active ? 'var(--' + tone + '-tint)' : 'var(--surface)',
                }}
            >
                <input
                    type="radio"
                    name={name}
                    checked={active}
                    onChange={onSelect}
                    style={{ width: 18, height: 18, accentColor: `var(--${tone})`, cursor: 'pointer' }}
                    aria-label={tone}
                />
            </label>
        </td>
    );
}
