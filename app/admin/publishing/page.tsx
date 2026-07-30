'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  title: string;
  genre: string;
  manuscriptUrl: string;
  services: string[];
  status: string;
  quoteAmount?: number;
  quoteDetails?: string;
  user?: { email?: string; name?: string };
  createdAt: string;
}

export default function AdminPublishingManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteDetails, setQuoteDetails] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/publishing/submissions');
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/publishing/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/publishing/submissions/${selectedSub.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteAmount: Number(quoteAmount),
          quoteDetails,
          status: 'QUOTE_GENERATED',
        }),
      });

      if (res.ok) {
        alert('Quote generated and sent to author!');
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Publishing Manager</h1>
        <p className="text-gray-600">Review author manuscript submissions, set quotes, and track production workflows.</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading manuscript submissions...</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No manuscript submissions found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Submissions */}
          <div className="lg:col-span-2 space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:border-indigo-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sub.title}</h3>
                    <p className="text-xs text-gray-500">Genre: {sub.genre} | Author: {sub.user?.email || 'N/A'}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 uppercase">
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500">Requested: </span>
                  <span className="text-xs text-gray-700">{sub.services.join(', ')}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
                  <a
                    href={sub.manuscriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View Draft File &rarr;
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setQuoteAmount(sub.quoteAmount || 0);
                        setQuoteDetails(sub.quoteDetails || '');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded"
                    >
                      {sub.quoteAmount ? 'Edit Quote' : 'Generate Quote'}
                    </button>

                    <select
                      value={sub.status}
                      onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="QUOTE_GENERATED">Quote Generated</option>
                      <option value="IN_PRODUCTION">In Production</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote Modal/Panel */}
          <div>
            {selectedSub ? (
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quote for: {selectedSub.title}</h3>
                <form onSubmit={handleSendQuote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quote Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g. 250.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quote Description & Details</label>
                    <textarea
                      rows={4}
                      value={quoteDetails}
                      onChange={(e) => setQuoteDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Include details on editing turnarounds, layout specs, and cover concepts..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-indigo-600 text-white font-semibold text-xs py-2 rounded hover:bg-indigo-500 transition-colors"
                    >
                      {updating ? 'Saving...' : 'Send Quote'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSub(null)}
                      className="px-3 py-2 border border-gray-300 text-xs text-gray-600 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl text-center text-xs text-gray-500">
                Select a manuscript submission on the left to generate or edit a pricing quote.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
