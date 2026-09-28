'use client';
import { useLibraryDash } from '../context';

export default function CataloguePage() {
    const { items, loading, error } = useLibraryDash();

    return (
        <>
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}
            {loading ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Available</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No items in catalogue yet.</td></tr>
                            ) : (
                                items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{item.author}</td>
                                        <td>{item.category || '—'}</td>
                                        <td className="mono">{item.availableCopies} / {item.totalCopies}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
