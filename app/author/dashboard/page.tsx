'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  title: string;
  genre: string;
  status: string;
  services: string[];
  quoteAmount?: number;
  quoteDetails?: string;
  updatedAt: string;
}

export default function AuthorDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch author submissions
    fetch('/api/publishing/my-submissions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubmissions(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAcceptQuote = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/quote/${id}/accept`, { method: 'POST' });
      if (res.ok) {
        alert('Quote accepted! Your project is moving to Production.');
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, status: 'IN_PRODUCTION' } : sub))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusSteps = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'QUOTE_GENERATED',
    'QUOTE_ACCEPTED',
    'IN_PRODUCTION',
    'PUBLISHED',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600">Track your manuscript submissions and manage publishing quotes.</p>
        </div>
        <a
          href="/publishing/request-quote"
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors"
        >
          Submit New Manuscript
        </a>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't submitted any manuscripts yet.</p>
          <a
            href="/publishing/request-quote"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Submit your first manuscript &rarr;
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {submissions.map((sub) => {
            const currentStepIndex = statusSteps.indexOf(sub.status);

            return (
              <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{sub.title}</h2>
                    <p className="text-sm text-gray-500">Genre: {sub.genre}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full uppercase">
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Workflow Stepper */}
                <div className="my-6">
                  <div className="flex justify-between items-center relative">
                    {statusSteps.map((step, idx) => {
                      const isComplete = idx <= currentStepIndex;
                      return (
                        <div key={step} className="flex-1 text-center relative z-10">
                          <div
                            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                              isComplete ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <p className="text-[10px] mt-1 font-medium text-gray-600 uppercase hidden sm:block">
                            {step.replace('_', ' ')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Services Requested */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Requested Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {sub.services.map((srv) => (
                      <span key={srv} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quote details block if available */}
                {sub.status === 'QUOTE_GENERATED' && sub.quoteAmount && (
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Publishing Proposal Ready</p>
                      <p className="text-xs text-indigo-700">{sub.quoteDetails || 'Includes editing, layout, and publishing setup.'}</p>
                      <p className="text-lg font-bold text-indigo-950 mt-1">Total: ${sub.quoteAmount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptQuote(sub.id)}
                      className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2 rounded hover:bg-indigo-500 transition-colors"
                    >
                      Accept Proposal & Begin
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
