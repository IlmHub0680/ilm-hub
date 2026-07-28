"use client";
import { useEffect, useState } from 'react';

export default function AdminAuthorApprovals() {
  const [pendingAuthors, setPendingAuthors] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/pending-authors')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPendingAuthors(data); });
  }, []);

  const handleApprove = async (userId: string) => {
    const res = await fetch('/api/admin/approve-author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setPendingAuthors(pendingAuthors.filter((a) => a.id !== userId));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pending Author Approvals</h1>
      {pendingAuthors.length === 0 ? (
        <p>No pending author requests found.</p>
      ) : (
        <ul className="space-y-4">
          {pendingAuthors.map((author) => (
            <li key={author.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-gray-500">{author.email}</p>
              </div>
              <button onClick={() => handleApprove(author.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
