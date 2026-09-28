"use client";

import { useEffect, useMemo, useState } from "react";

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
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTE_GENERATED",
  "QUOTE_ACCEPTED",
  "IN_PRODUCTION",
  "PUBLISHED",
  "REJECTED",
];

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  QUOTE_GENERATED: "Quote Generated",
  QUOTE_ACCEPTED: "Quote Accepted",
  IN_PRODUCTION: "In Production",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

export default function AdminPublishingManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteDetails, setQuoteDetails] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/publishing/submissions");

      if (!res.ok) {
        throw new Error("Failed to load submissions");
      }

      const data = await res.json();

      if (data?.success && Array.isArray(data.data)) {
        setSubmissions(data.data);
      } else {
        throw new Error(
          data?.error || "Invalid submissions response"
        );
      }
    } catch (err) {
      console.error("Publishing submissions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(
        `/api/admin/publishing/submissions/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setSubmissions((previous) =>
        previous.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                status: newStatus,
              }
            : submission
        )
      );

      if (selectedSub?.id === id) {
        setSelectedSub((previous) =>
          previous
            ? {
                ...previous,
                status: newStatus,
              }
            : previous
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Unable to update the publishing status.");
    }
  };

  const openQuotePanel = (submission: Submission) => {
    setSelectedSub(submission);
    setQuoteAmount(submission.quoteAmount || 0);
    setQuoteDetails(submission.quoteDetails || "");
  };

  const handleSendQuote = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedSub) return;

    if (!quoteAmount || quoteAmount <= 0) {
      alert("Please enter a valid quote amount.");
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch(
        `/api/admin/publishing/submissions/${selectedSub.id}/quote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteAmount: Number(quoteAmount),
            quoteDetails,
            status: "QUOTE_GENERATED",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate quote");
      }

      alert("Quote generated and sent to author.");

      setSelectedSub(null);
      setQuoteAmount(0);
      setQuoteDetails("");

      await fetchSubmissions();
    } catch (err) {
      console.error("Quote error:", err);
      alert("Unable to generate the quote.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !query ||
        submission.title.toLowerCase().includes(query) ||
        submission.genre.toLowerCase().includes(query) ||
        submission.user?.name?.toLowerCase().includes(query) ||
        submission.user?.email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        submission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: submissions.length,

      submitted: submissions.filter(
        (submission) => submission.status === "SUBMITTED"
      ).length,

      review: submissions.filter(
        (submission) => submission.status === "UNDER_REVIEW"
      ).length,

      quotes: submissions.filter(
        (submission) => submission.status === "QUOTE_GENERATED"
      ).length,

      production: submissions.filter(
        (submission) => submission.status === "IN_PRODUCTION"
      ).length,

      published: submissions.filter(
        (submission) => submission.status === "PUBLISHED"
      ).length,
    };
  }, [submissions]);

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return "—";

    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--paper)", color: "var(--ink)" }}>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header style={{ backgroundColor: "var(--ink)", color: "var(--on-accent)" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "72px",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "900",
              }}
            >
              UA
            </div>

            <div>
              <div style={{ fontSize: "17px", fontWeight: "800" }}>Ulul Azm</div>

              <div
                style={{
                  marginTop: "2px",
                  color: "var(--ink-soft)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Publishing Administration
              </div>
            </div>
          </div>

          <a href="/admin/dashboard" className="ih-btn ih-btn-ghost" style={{ color: "var(--border)" }}>
            ← Admin Dashboard
          </a>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "34px 24px 60px",
        }}
      >
        {/* PAGE HEADING */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--ink-soft)",
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Publishing Operations
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: 1.2,
                fontWeight: "800",
                letterSpacing: "-0.8px",
              }}
            >
              Publishing Manager
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                maxWidth: "720px",
                color: "var(--ink-soft)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Review author manuscripts, prepare publishing quotes,
              manage production stages, and track completed books.
            </p>
          </div>

          <button onClick={fetchSubmissions} className="ih-btn ih-btn-secondary">
            ↻ Refresh Submissions
          </button>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <section className="ih-stat-grid" style={{ marginBottom: "28px" }}>
          <MetricCard
            label="Total Submissions"
            value={stats.total}
            description="All manuscript requests"
          />

          <MetricCard
            label="New"
            value={stats.submitted}
            description="Awaiting first review"
            tone="amber"
          />

          <MetricCard
            label="Under Review"
            value={stats.review}
            description="Currently being assessed"
            tone="blue"
          />

          <MetricCard
            label="Quotes"
            value={stats.quotes}
            description="Quote stage"
            tone="purple"
          />

          <MetricCard
            label="In Production"
            value={stats.production}
            description="Active publishing work"
            tone="green"
          />

          <MetricCard
            label="Published"
            value={stats.published}
            description="Completed titles"
            tone="dark"
          />
        </section>

        {/* =====================================================
            FILTER BAR
        ====================================================== */}

        <section className="ih-card" style={{ padding: "16px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div className="ih-field" style={{ flex: "1 1 320px" }}>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, author, email or genre..."
              />
            </div>

            <div className="ih-field" style={{ minWidth: "190px" }}>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All Statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {(search || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="ih-btn ih-btn-ghost"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {loading ? (
          <LoadingState />
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            hasFilters={Boolean(
              search || statusFilter !== "ALL"
            )}
            clearFilters={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                selectedSub
                  ? "minmax(0, 1.7fr) minmax(320px, 0.8fr)"
                  : "1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* =================================================
                SUBMISSION LIST
            ================================================== */}

            <section className="ih-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "19px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                    Manuscript Submissions
                  </h2>

                  <p style={{ margin: "5px 0 0", color: "var(--ink-soft)", fontSize: "12px" }}>
                    {filteredSubmissions.length} submission
                    {filteredSubmissions.length !== 1 ? "s" : ""}{" "}
                    displayed
                  </p>
                </div>

                <span className="ih-badge ih-b-neutral">Publishing Queue</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {filteredSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    selected={
                      selectedSub?.id === submission.id
                    }
                    onSelect={() =>
                      setSelectedSub(submission)
                    }
                    onQuote={() =>
                      openQuotePanel(submission)
                    }
                    onStatusChange={handleUpdateStatus}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </section>

            {/* =================================================
                QUOTE / DETAILS PANEL
            ================================================== */}

            {selectedSub && (
              <aside
                style={{
                  position: "sticky",
                  top: "20px",
                }}
              >
                <QuotePanel
                  submission={selectedSub}
                  quoteAmount={quoteAmount}
                  quoteDetails={quoteDetails}
                  updating={updating}
                  setQuoteAmount={setQuoteAmount}
                  setQuoteDetails={setQuoteDetails}
                  onSubmit={handleSendQuote}
                  onClose={() => setSelectedSub(null)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </aside>
            )}
          </div>
        )}

        {/* =====================================================
            FOOTER NOTE
        ====================================================== */}

        <div
          className="ih-card"
          style={{
            marginTop: "24px",
            padding: "15px 18px",
            color: "var(--ink-soft)",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--ink-soft)" }}>
            Publishing workflow:
          </strong>{" "}
          Review each manuscript before generating a quote. Once
          the author accepts the publishing arrangement, move the
          submission through production and mark it published only
          after the final deliverables are complete.
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: number;
  description: string;
  tone?: "default" | "amber" | "blue" | "purple" | "green" | "dark";
}) {
  const tones = {
    default: {
      border: "var(--border)",
      label: "var(--ink-soft)",
      value: "var(--ink)",
    },
    amber: {
      border: "var(--warning-tint)",
      label: "var(--warning)",
      value: "var(--warning)",
    },
    blue: {
      border: "var(--info-tint)",
      label: "var(--info)",
      value: "var(--info)",
    },
    purple: {
      border: "#ddd6fe",
      label: "#6d28d9",
      value: "#6d28d9",
    },
    green: {
      border: "var(--success-tint)",
      label: "var(--brand-light)",
      value: "var(--brand-light)",
    },
    dark: {
      border: "var(--border)",
      label: "var(--ink-soft)",
      value: "var(--ink)",
    },
  };

  const current = tones[tone];

  return (
    <div className={`ih-stat-tile${tone === "default" || tone === "dark" ? "" : " accent"}`}>
      <div className="l" style={{ color: current.label, textTransform: "uppercase", letterSpacing: "0.7px" }}>
        {label}
      </div>

      <div className="n" style={{ color: current.value }}>
        {value}
      </div>

      <div style={{ marginTop: "8px", color: "var(--ink-soft)", fontSize: "11px" }}>
        {description}
      </div>
    </div>
  );
}

/* ============================================================
   SUBMISSION CARD
============================================================ */

function SubmissionCard({
  submission,
  selected,
  onSelect,
  onQuote,
  onStatusChange,
  formatCurrency,
  formatDate,
}: {
  submission: Submission;
  selected: boolean;
  onSelect: () => void;
  onQuote: () => void;
  onStatusChange: (
    id: string,
    status: string
  ) => void;
  formatCurrency: (amount?: number) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div
      style={{
        padding: "20px",
        borderBottom: "1px solid var(--border-soft)",
        backgroundColor: selected ? "var(--paper)" : "var(--surface)",
        borderLeft: selected
          ? "3px solid var(--brand)"
          : "3px solid transparent",
        transition: "background-color 0.15s ease",
      }}
    >
      {/* Top */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <button
            onClick={onSelect}
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              color: "var(--ink)",
              fontSize: "16px",
              fontWeight: "800",
            }}
          >
            {submission.title}
          </button>

          <div
            style={{
              marginTop: "5px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "7px",
              color: "var(--ink-soft)",
              fontSize: "11px",
            }}
          >
            <span>
              {submission.user?.name ||
                submission.user?.email ||
                "Unknown author"}
            </span>

            <span>•</span>

            <span>{submission.genre || "Uncategorized"}</span>

            <span>•</span>

            <span>{formatDate(submission.createdAt)}</span>
          </div>
        </div>

        <StatusBadge status={submission.status} />
      </div>

      {/* Services */}

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {submission.services?.length ? (
          submission.services.map((service) => (
            <span key={service} className="ih-badge ih-b-neutral">
              {service}
            </span>
          ))
        ) : (
          <span style={{ color: "var(--ink-soft)", fontSize: "11px" }}>
            No services specified
          </span>
        )}
      </div>

      {/* Bottom */}

      <div
        style={{
          marginTop: "17px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <a
            href={submission.manuscriptUrl}
            target="_blank"
            rel="noreferrer"
            className="ih-btn ih-btn-secondary"
            style={{ textDecoration: "none" }}
          >
            View Manuscript ↗
          </a>

          <span
            style={{
              color: "var(--ink-soft)",
              fontSize: "11px",
            }}
          >
            Quote:{" "}
            <strong style={{ color: "var(--ink-soft)" }}>
              {formatCurrency(submission.quoteAmount)}
            </strong>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "7px",
            alignItems: "center",
          }}
        >
          <button onClick={onQuote} className="ih-btn ih-btn-gold">
            {submission.quoteAmount ? "Edit Quote" : "Generate Quote"}
          </button>

          <div className="ih-field" style={{ margin: 0 }}>
            <select
              value={submission.status}
              onChange={(event) => onStatusChange(submission.id, event.target.value)}
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTE_GENERATED">Quote Generated</option>
              <option value="QUOTE_ACCEPTED">Quote Accepted</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QUOTE PANEL
============================================================ */

function QuotePanel({
  submission,
  quoteAmount,
  quoteDetails,
  updating,
  setQuoteAmount,
  setQuoteDetails,
  onSubmit,
  onClose,
  formatCurrency,
  formatDate,
}: {
  submission: Submission;
  quoteAmount: number;
  quoteDetails: string;
  updating: boolean;
  setQuoteAmount: (value: number) => void;
  setQuoteDetails: (value: string) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  onClose: () => void;
  formatCurrency: (amount?: number) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="ih-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Panel heading */}

      <div
        style={{
          padding: "18px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--paper)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                color: "#6d28d9",
                fontSize: "10px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Publishing Quote
            </div>

            <h2 style={{ margin: "7px 0 0", fontSize: "17px", lineHeight: 1.35, fontWeight: "800" }}>
              {submission.title}
            </h2>
          </div>

          <button onClick={onClose} type="button" className="ih-btn ih-btn-ghost" style={{ padding: "6px 10px" }}>
            ×
          </button>
        </div>
      </div>

      {/* Author summary */}

      <div
        style={{
          padding: "17px 18px",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <DetailRow
          label="Author"
          value={
            submission.user?.name ||
            submission.user?.email ||
            "Unknown"
          }
        />

        <DetailRow
          label="Email"
          value={submission.user?.email || "Not provided"}
        />

        <DetailRow
          label="Genre"
          value={submission.genre || "Not specified"}
        />

        <DetailRow
          label="Submitted"
          value={formatDate(submission.createdAt)}
        />

        <DetailRow
          label="Current status"
          value={STATUS_LABELS[submission.status] || submission.status}
          last
        />
      </div>

      {/* Requested services */}

      <div
        style={{
          padding: "17px 18px",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div
          style={{
            color: "var(--ink-soft)",
            fontSize: "10px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            marginBottom: "9px",
          }}
        >
          Requested Services
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {submission.services?.length ? (
            submission.services.map((service) => (
              <span key={service} className="ih-badge ih-b-neutral">
                {service}
              </span>
            ))
          ) : (
            <span style={{ color: "var(--ink-soft)", fontSize: "11px" }}>
              No services specified
            </span>
          )}
        </div>
      </div>

      {/* Quote form */}

      <form
        onSubmit={onSubmit}
        style={{
          padding: "18px",
        }}
      >
        <div className="ih-field" style={{ marginBottom: "15px" }}>
          <label>Quote Price (USD)</label>

          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={quoteAmount}
            onChange={(event) => setQuoteAmount(Number(event.target.value))}
            placeholder="e.g. 250.00"
            style={{ fontSize: "14px", fontWeight: "700" }}
          />
        </div>

        <div className="ih-field" style={{ marginBottom: "15px" }}>
          <label>Quote Description &amp; Details</label>

          <textarea
            rows={6}
            value={quoteDetails}
            onChange={(event) => setQuoteDetails(event.target.value)}
            placeholder="Describe the publishing package, editing scope, formatting, cover work, turnaround times, revisions, and other relevant details..."
            style={{ resize: "vertical" }}
          />
        </div>

        {submission.quoteAmount ? (
          <div className="ih-badge ih-b-info" style={{ marginBottom: "14px", display: "block", width: "fit-content" }}>
            Existing quote: {formatCurrency(submission.quoteAmount)}
          </div>
        ) : null}

        <button type="submit" disabled={updating} className="ih-btn ih-btn-primary" style={{ width: "100%" }}>
          {updating
            ? "Saving Quote..."
            : submission.quoteAmount
            ? "Update & Send Quote"
            : "Generate & Send Quote"}
        </button>
      </form>
    </div>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "8px 0",
        borderBottom: last
          ? "none"
          : "1px solid var(--paper)",
      }}
    >
      <span
        style={{
          color: "var(--ink-soft)",
          fontSize: "11px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "var(--ink-soft)",
          fontSize: "11px",
          fontWeight: "700",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const toneClass: Record<string, string> = {
    SUBMITTED: "ih-b-warning",
    UNDER_REVIEW: "ih-b-info",
    QUOTE_GENERATED: "ih-b-info",
    QUOTE_ACCEPTED: "ih-b-success",
    IN_PRODUCTION: "ih-b-success",
    PUBLISHED: "ih-b-success",
    REJECTED: "ih-b-danger",
  };

  const tone = toneClass[status] || "ih-b-neutral";

  return (
    <span className={`ih-badge ${tone}`} style={{ whiteSpace: "nowrap" }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="ih-card" style={{ padding: "70px 20px", textAlign: "center" }}>
      <div
        style={{
          width: "34px",
          height: "34px",
          margin: "0 auto 14px",
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--brand)",
          animation: "publishing-spin 0.8s linear infinite",
        }}
      />

      <div
        style={{
          color: "var(--ink-soft)",
          fontSize: "14px",
          fontWeight: "800",
        }}
      >
        Loading publishing submissions...
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "var(--ink-soft)",
          fontSize: "11px",
        }}
      >
        Please wait while the manuscript queue is retrieved.
      </div>

      <style jsx>{`
        @keyframes publishing-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasFilters,
  clearFilters,
}: {
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="ih-card" style={{ padding: "70px 20px", textAlign: "center" }}>
      <div
        style={{
          width: "52px",
          height: "52px",
          margin: "0 auto 14px",
          borderRadius: "12px",
          backgroundColor: "var(--border-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
        }}
      >
        📚
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "800",
          color: "var(--ink-soft)",
        }}
      >
        {hasFilters
          ? "No matching submissions"
          : "No manuscript submissions"}
      </h2>

      <p
        style={{
          margin: "7px auto 0",
          maxWidth: "450px",
          color: "var(--ink-soft)",
          fontSize: "12px",
          lineHeight: 1.6,
        }}
      >
        {hasFilters
          ? "Try adjusting your search or status filter."
          : "New publishing requests will appear here when authors submit manuscripts."}
      </p>

      {hasFilters && (
        <button onClick={clearFilters} className="ih-btn ih-btn-secondary" style={{ marginTop: "16px" }}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
