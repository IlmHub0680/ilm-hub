"use client";

import { useEffect, useMemo, useState } from "react";

interface Author {
  id: string;
  name?: string;
  email?: string;
  specialty?: string;
  bio?: string;
  createdAt?: string;
}

export default function AdminAuthorApprovals() {
  const [pendingAuthors, setPendingAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] =
    useState<Author | null>(null);

  const fetchPendingAuthors = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/pending-authors");

      if (!res.ok) {
        throw new Error("Failed to load pending authors");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setPendingAuthors(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAuthors();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setApprovingId(userId);

      const res = await fetch("/api/admin/approve-author", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve author");
      }

      setPendingAuthors((prev) =>
        prev.filter((author) => author.id !== userId)
      );

      if (selectedAuthor?.id === userId) {
        setSelectedAuthor(null);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to approve this author. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const filteredAuthors = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return pendingAuthors;
    }

    return pendingAuthors.filter((author) => {
      return (
        (author.name || "").toLowerCase().includes(search) ||
        (author.email || "").toLowerCase().includes(search) ||
        (author.specialty || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [pendingAuthors, searchTerm]);

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Admin
                </span>

                <span className="text-xs font-medium text-slate-400">
                  Author Management
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Author Approvals
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review and approve scholars who have applied to
                become published authors on Ilm-Hub.
              </p>
            </div>

            <button
              onClick={fetchPendingAuthors}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ↻ Refresh Requests
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Pending Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {pendingAuthors.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Authors awaiting approval
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Requires Review
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {filteredAuthors.length}
            </p>

            <p className="mt-1 text-xs text-amber-600">
              Matching current search
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Approval Status
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-800">
              Admin Review Required
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Approval grants author access
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search by author name, email, or specialization..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="text-sm font-medium text-slate-500">
              Loading author applications...
            </p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          /* Empty */
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="mb-4 text-5xl">✓</div>

            <h3 className="font-bold text-slate-900">
              No pending author applications
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {searchTerm
                ? "No applications match your search."
                : "All current author applications have been reviewed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Author List */}
            <div className="space-y-4 xl:col-span-2">
              {filteredAuthors.map((author) => {
                const isSelected =
                  selectedAuthor?.id === author.id;

                const isApproving =
                  approvingId === author.id;

                return (
                  <div
                    key={author.id}
                    className={`rounded-xl border bg-white p-6 shadow-sm transition ${
                      isSelected
                        ? "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        {/* Avatar */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                          {(author.name || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">
                              {author.name ||
                                "Unnamed Applicant"}
                            </h2>

                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {author.email ||
                              "No email provided"}
                          </p>

                          {author.specialty && (
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              {author.specialty}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAuthor(author)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={() =>
                            handleApprove(author.id)
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isApproving
                            ? "Approving..."
                            : "Approve Author"}
                        </button>
                      </div>
                    </div>

                    {/* Application Info */}
                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Specialization
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {author.specialty ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Application Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(author.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Review Panel */}
            <div>
              {selectedAuthor ? (
                <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        Applicant Review
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        {selectedAuthor.name ||
                          "Unnamed Applicant"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAuthor(null)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                      Contact
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-emerald-900">
                      {selectedAuthor.email ||
                        "No email provided"}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Academic Specialization
                      </p>

                      <p className="text-sm leading-6 text-slate-700">
                        {selectedAuthor.specialty ||
                          "No specialization provided."}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Scholar Bio
                      </p>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {selectedAuthor.bio ||
                            "No biography was provided with this application."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Application Submitted
                      </p>

                      <p className="text-sm text-slate-700">
                        {formatDate(
                          selectedAuthor.createdAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-semibold leading-5 text-amber-800">
                        Approving this application will grant
                        the applicant author access according to
                        your existing approval system.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        approvingId === selectedAuthor.id
                      }
                      onClick={() =>
                        handleApprove(selectedAuthor.id)
                      }
                      className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approvingId === selectedAuthor.id
                        ? "Approving Author..."
                        : "Approve This Author"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sticky top-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <div className="mb-4 text-4xl">👤</div>

                  <h3 className="font-bold text-slate-900">
                    Author Review
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Select an applicant to review their
                    specialization, biography, contact details,
                    and application information.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}