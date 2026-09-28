'use client';

import { useEffect, useMemo, useState } from 'react';

interface Submission {
  id: string;
  title: string;
  genre: string;
  manuscriptUrl: string;
  services: string[];
  status: string;
  quoteAmount?: number;
  quoteDetails?: string;
  user?: {
    email?: string;
    name?: string;
  };
  createdAt: string;
}

const STATUS_OPTIONS = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUOTE_GENERATED',
  'IN_PRODUCTION',
  'PUBLISHED',
  'REJECTED',
];

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  QUOTE_GENERATED: 'Quote Generated',
  IN_PRODUCTION: 'In Production',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
};

const statusStyles: Record<string, string> = {
  SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
  QUOTE_GENERATED: 'bg-purple-50 text-purple-700 border-purple-200',
  IN_PRODUCTION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminPublishingManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteDetails, setQuoteDetails] = useState('');

  const [updating, setUpdating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const res = await fetch('/api/admin/publishing/submissions');

      if (!res.ok) {
        throw new Error('Unable to load publishing submissions.');
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Unable to load manuscript submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setStatusUpdating(id);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch(`/api/admin/publishing/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status.');
      }

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? {
                ...sub,
                status: newStatus,
              }
            : sub
        )
      );

      if (selectedSub?.id === id) {
        setSelectedSub((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
              }
            : null
        );
      }

      setSuccessMessage('Publishing status updated successfully.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not update the publishing status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const openQuotePanel = (submission: Submission) => {
    setSelectedSub(submission);
    setQuoteAmount(submission.quoteAmount || 0);
    setQuoteDetails(submission.quoteDetails || '');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSub) return;

    if (!quoteAmount || quoteAmount <= 0) {
      setErrorMessage('Please enter a valid quote amount.');
      return;
    }

    try {
      setUpdating(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch(
        `/api/admin/publishing/submissions/${selectedSub.id}/quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteAmount: Number(quoteAmount),
            quoteDetails,
            status: 'QUOTE_GENERATED',
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to generate quote.');
      }

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSub.id
            ? {
                ...sub,
                quoteAmount: Number(quoteAmount),
                quoteDetails,
                status: 'QUOTE_GENERATED',
              }
            : sub
        )
      );

      setSelectedSub((prev) =>
        prev
          ? {
              ...prev,
              quoteAmount: Number(quoteAmount),
              quoteDetails,
              status: 'QUOTE_GENERATED',
            }
          : null
      );

      setSuccessMessage('Quote generated and sent to the author.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Unable to generate the quote. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const statistics = useMemo(() => {
    return {
      total: submissions.length,
      submitted: submissions.filter((s) => s.status === 'SUBMITTED').length,
      review: submissions.filter((s) => s.status === 'UNDER_REVIEW').length,
      quotes: submissions.filter((s) => s.status === 'QUOTE_GENERATED').length,
      production: submissions.filter((s) => s.status === 'IN_PRODUCTION').length,
      published: submissions.filter((s) => s.status === 'PUBLISHED').length,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return submissions.filter((submission) => {
      const matchesStatus =
        statusFilter === 'ALL' || submission.status === statusFilter;

      const matchesSearch =
        !search ||
        submission.title.toLowerCase().includes(search) ||
        submission.genre.toLowerCase().includes(search) ||
        submission.user?.name?.toLowerCase().includes(search) ||
        submission.user?.email?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [submissions, searchTerm, statusFilter]);

  const formatDate = (date: string) => {
    if (!date) return '—';

    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                Publishing Administration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Publishing Management Center
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Review manuscripts, manage publishing requests, prepare
                quotations, and track every book through production.
              </p>
            </div>

            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mr-2">↻</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
              ✓
            </span>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
              !
            </span>
            {errorMessage}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total"
            value={statistics.total}
            icon="▦"
            tone="slate"
          />

          <StatCard
            label="Submitted"
            value={statistics.submitted}
            icon="◷"
            tone="amber"
          />

          <StatCard
            label="Under Review"
            value={statistics.review}
            icon="⌕"
            tone="blue"
          />

          <StatCard
            label="Quotes"
            value={statistics.quotes}
            icon="$"
            tone="purple"
          />

          <StatCard
            label="In Production"
            value={statistics.production}
            icon="⚙"
            tone="indigo"
          />

          <StatCard
            label="Published"
            value={statistics.published}
            icon="✓"
            tone="emerald"
          />
        </div>

        {/* Main workspace */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Submission List */}
          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Section Header */}
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Manuscript Submissions
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review and manage author publishing requests.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        ⌕
                      </span>

                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search submissions..."
                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="ALL">All Statuses</option>

                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl border border-slate-100 p-5"
                    >
                      <div className="mb-3 h-4 w-2/5 rounded bg-slate-200" />
                      <div className="mb-2 h-3 w-1/3 rounded bg-slate-100" />
                      <div className="h-3 w-1/4 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                    ▦
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    No submissions found
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    There are no manuscript submissions matching your current
                    search or filter.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => (
                    <SubmissionRow
                      key={sub.id}
                      submission={sub}
                      selected={selectedSub?.id === sub.id}
                      statusUpdating={statusUpdating === sub.id}
                      onSelect={() => openQuotePanel(sub)}
                      onStatusChange={(status) =>
                        handleUpdateStatus(sub.id, status)
                      }
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {/* Footer */}
              {!loading && filteredSubmissions.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {filteredSubmissions.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {submissions.length}
                  </span>{' '}
                  submissions
                </div>
              )}
            </div>
          </section>

          {/* Detail / Quote Panel */}
          <aside className="xl:sticky xl:top-6 xl:self-start">
            {selectedSub ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Panel Header */}
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Submission Details
                    </span>

                    <button
                      onClick={() => setSelectedSub(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                      aria-label="Close details"
                    >
                      ×
                    </button>
                  </div>

                  <h3 className="text-lg font-bold leading-tight text-slate-900">
                    {selectedSub.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSub.genre || 'Unspecified genre'}
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  {/* Author */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Author
                    </h4>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">
                        {selectedSub.user?.name || 'Author'}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {selectedSub.user?.email || 'No email available'}
                      </p>
                    </div>
                  </div>

                  {/* Submission info */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Request Information
                    </h4>

                    <div className="space-y-3">
                      <InfoRow
                        label="Submitted"
                        value={formatDate(selectedSub.createdAt)}
                      />

                      <InfoRow
                        label="Current Status"
                        value={
                          statusLabels[selectedSub.status] ||
                          selectedSub.status
                        }
                      />

                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          Requested Services
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {selectedSub.services?.length ? (
                            selectedSub.services.map((service) => (
                              <span
                                key={service}
                                className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                              >
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">
                              No services specified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manuscript */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Manuscript
                    </h4>

                    {selectedSub.manuscriptUrl ? (
                      <a
                        href={selectedSub.manuscriptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <span>Open Draft File</span>
                        <span>↗</span>
                      </a>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No manuscript file has been attached.
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-slate-900">
                        Publishing Quote
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Set the price and provide the production details that
                        will be sent to the author.
                      </p>
                    </div>

                    <form onSubmit={handleSendQuote} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Quote Amount
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            $
                          </span>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={quoteAmount}
                            onChange={(e) =>
                              setQuoteAmount(Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            placeholder="250.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Production Details
                        </label>

                        <textarea
                          rows={5}
                          value={quoteDetails}
                          onChange={(e) => setQuoteDetails(e.target.value)}
                          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Include editing turnaround, interior layout, cover design, formatting, revisions, and other publishing details..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updating
                          ? 'Saving Quote...'
                          : selectedSub.quoteAmount
                            ? 'Update & Send Quote'
                            : 'Generate & Send Quote'}
                      </button>
                    </form>
                  </div>

                  {/* Workflow */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Production Workflow
                    </h4>

                    <div className="space-y-2">
                      {STATUS_OPTIONS.map((status, index) => {
                        const isCurrent = selectedSub.status === status;

                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={statusUpdating === selectedSub.id}
                            onClick={() =>
                              handleUpdateStatus(selectedSub.id, status)
                            }
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                              isCurrent
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {index + 1}
                            </span>

                            <span className="font-medium">
                              {statusLabels[status]}
                            </span>

                            {isCurrent && (
                              <span className="ml-auto text-xs font-bold">
                                Current
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                  ◫
                </div>

                <h3 className="font-bold text-slate-900">
                  Select a Submission
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select a manuscript from the list to review the author
                  information, open the draft, prepare a quote, and manage its
                  publishing workflow.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: string;
  tone: 'slate' | 'amber' | 'blue' | 'purple' | 'indigo' | 'emerald';
}) {
  const tones = {
    slate: {
      icon: 'bg-slate-100 text-slate-600',
      number: 'text-slate-900',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-600',
      number: 'text-amber-700',
    },
    blue: {
      icon: 'bg-blue-50 text-blue-600',
      number: 'text-blue-700',
    },
    purple: {
      icon: 'bg-purple-50 text-purple-600',
      number: 'text-purple-700',
    },
    indigo: {
      icon: 'bg-indigo-50 text-indigo-600',
      number: 'text-indigo-700',
    },
    emerald: {
      icon: 'bg-emerald-50 text-emerald-600',
      number: 'text-emerald-700',
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className={`mt-1 text-2xl font-bold ${tones[tone].number}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${tones[tone].icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>

      <span className="text-right text-xs font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function SubmissionRow({
  submission,
  selected,
  statusUpdating,
  onSelect,
  onStatusChange,
  formatDate,
}: {
  submission: Submission;
  selected: boolean;
  statusUpdating: boolean;
  onSelect: () => void;
  onStatusChange: (status: string) => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div
      className={`p-5 transition ${
        selected
          ? 'bg-indigo-50/40'
          : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-slate-900">
                {submission.title}
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  statusStyles[submission.status] ||
                  'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {statusLabels[submission.status] || submission.status}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {submission.genre || 'Unspecified genre'}
              <span className="mx-2 text-slate-300">•</span>
              Submitted {formatDate(submission.createdAt)}
            </p>
          </div>

          {submission.quoteAmount ? (
            <div className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                Quote
              </p>

              <p className="text-sm font-bold text-emerald-700">
                ${Number(submission.quoteAmount).toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="shrink-0 rounded-lg bg-amber-50 px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
                Pricing
              </p>

              <p className="text-xs font-bold text-amber-700">
                Not Set
              </p>
            </div>
          )}
        </div>

        {/* Author */}
        <div className="grid grid-cols-1 gap-3 border-y border-slate-100 py-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Author
            </p>

            <p className="truncate text-sm font-semibold text-slate-800">
              {submission.user?.name || 'Author'}
            </p>

            <p className="truncate text-xs text-slate-500">
              {submission.user?.email || 'No email available'}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Requested Services
            </p>

            <p className="line-clamp-2 text-xs leading-5 text-slate-600">
              {submission.services?.length
                ? submission.services.join(', ')
                : 'No services specified'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {submission.manuscriptUrl && (
              <a
                href={submission.manuscriptUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                View Manuscript ↗
              </a>
            )}

            <button
              type="button"
              onClick={onSelect}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                selected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {submission.quoteAmount
                ? 'Review / Edit Quote'
                : 'Review & Generate Quote'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Status
            </label>

            <select
              value={submission.status}
              disabled={statusUpdating}
              onChange={(e) => onStatusChange(e.target.value)}
              className="max-w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}