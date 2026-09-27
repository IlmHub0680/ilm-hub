"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface OverviewStats {
  totalRevenueUSD: number;
  paidOrderCount: number;
  orderCount: number;
  pendingApprovalCount: number;
  awaitingPaymentCount: number;
  activatedCount: number;
  publishedBooksCount: number;
  pendingBooksCount: number;
  pendingSubmissionsCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  totalUSD: number;
  currencyCode: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  customerName: string;
}

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "var(--brand-light)",
  PENDING: "var(--warning)",
  FAILED: "var(--danger)",
  CANCELLED: "var(--ink-soft)",
  ACTIVATED: "var(--brand-light)",
  COMPLETED: "var(--brand-light)",
  REJECTED: "var(--danger)",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/admin/bookstore/overview", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active) return;

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load bookstore overview.");
        }

        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load bookstore overview."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* =========================
          TOP NAVIGATION
      ========================== */}
      <header
        style={{
          backgroundColor: "var(--brand-dark)",
          color: "var(--on-accent)",
          borderBottom: "1px solid var(--brand-deepest)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 24px",
            minHeight: "72px",
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
                background:
                  "linear-gradient(135deg, var(--brand), var(--brand-light))",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "21px",
                fontWeight: "800",
                border: "1px solid rgba(163,121,47,.5)",
              }}
            >
              UA
            </div>

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  letterSpacing: "-0.2px",
                }}
              >
                Ulul Azm
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--ink-soft)",
                  marginTop: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Administration
              </div>
            </div>
          </div>

          <Link
            href="/admin"
            style={{
              color: "var(--border)",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              border: "1px solid var(--ink-soft)",
              padding: "9px 14px",
              borderRadius: "8px",
            }}
          >
            Exit Admin
          </Link>
        </div>
      </header>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "34px 24px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-soft)",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Master Control Console
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                lineHeight: 1.2,
                fontWeight: "800",
                letterSpacing: "-0.8px",
                color: "var(--ink)",
              }}
            >
              Platform Overview
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "var(--ink-soft)",
                fontSize: "14px",
                maxWidth: "680px",
                lineHeight: 1.6,
              }}
            >
              Real-time bookstore figures, computed live from orders, books
              and submissions — every number below reflects what is
              actually in the database right now.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--success-tint)",
              border: "1px solid var(--success-tint)",
              color: "var(--brand-light)",
              borderRadius: "10px",
              padding: "11px 15px",
              fontSize: "12px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--success)",
                display: "inline-block",
              }}
            />
            Administrator Access
          </div>
        </div>

        {/* =========================
            QUICK ACTIONS
        ========================== */}
        <section style={{ marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "800",
              color: "var(--ink-soft)",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.7px",
            }}
          >
            Administration
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
            }}
          >
            <QuickAction
              href="/admin/bookstore/books"
              icon="📚"
              title="Books"
              description="Manage the live catalog"
            />
            <QuickAction
              href="/admin/bookstore/submissions"
              icon="📝"
              title="Submissions"
              description="Manuscript review queue"
            />
            <QuickAction
              href="/admin/bookstore/orders"
              icon="🧾"
              title="Orders"
              description="Payments & activation"
            />
            <QuickAction
              href="/admin/author-approvals"
              icon="👤"
              title="Author Approvals"
              description="Review new author applications"
            />
            <QuickAction
              href="/admin/publishing"
              icon="🏭"
              title="Publishing Manager"
              description="Manuscripts, quotes & production"
            />
            <QuickAction
              href="/admin/sponsor-manager"
              icon="📢"
              title="Sponsor Manager"
              description="Ads and sponsored content"
            />
            <QuickAction
              href="/admin/analytics"
              icon="📊"
              title="Analytics"
              description="Platform performance & reporting"
            />
          </div>
        </section>

        {error && (
          <div
            style={{
              background: "var(--danger-tint)",
              color: "var(--danger)",
              border: "1px solid var(--danger)",
              borderRadius: "10px",
              padding: "14px 16px",
              fontSize: "13.5px",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              color: "var(--ink-soft)",
              fontSize: "14px",
              padding: "30px 0",
            }}
          >
            Loading real bookstore figures…
          </div>
        ) : stats ? (
          <>
            {/* =========================
                FINANCIAL SUMMARY
            ========================== */}
            <section style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "16px",
                }}
              >
                <StatTile
                  label="Total Revenue (Paid Orders, USD)"
                  value={formatCurrency(stats.totalRevenueUSD)}
                  note={`${stats.paidOrderCount} paid order${
                    stats.paidOrderCount === 1 ? "" : "s"
                  }`}
                  accent="var(--ink)"
                />
                <StatTile
                  label="Total Orders"
                  value={String(stats.orderCount)}
                  note={`${stats.activatedCount} activated`}
                  accent="var(--brand-light)"
                />
                <StatTile
                  label="Awaiting Payment"
                  value={String(stats.awaitingPaymentCount)}
                  note="Payment not yet confirmed"
                  accent="var(--warning)"
                  href="/admin/bookstore/orders"
                />
                <StatTile
                  label="Awaiting Admin Approval"
                  value={String(stats.pendingApprovalCount)}
                  note="Paid — needs activation"
                  accent="var(--info)"
                  href="/admin/bookstore/orders"
                />
              </div>
            </section>

            {/* =========================
                CATALOG SUMMARY
            ========================== */}
            <section style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "16px",
                }}
              >
                <StatTile
                  label="Published Books"
                  value={String(stats.publishedBooksCount)}
                  note="Live in the catalog"
                  accent="var(--brand)"
                  href="/admin/bookstore/books"
                />
                <StatTile
                  label="Books Pending Review"
                  value={String(stats.pendingBooksCount)}
                  note="Needs an editorial decision"
                  accent="var(--warning)"
                  href="/admin/bookstore/books"
                />
                <StatTile
                  label="Manuscript Submissions Pending"
                  value={String(stats.pendingSubmissionsCount)}
                  note="Submitted, under review or in production"
                  accent="var(--info)"
                  href="/admin/bookstore/submissions"
                />
              </div>
            </section>

            {/* =========================
                RECENT ORDERS (real activity)
            ========================== */}
            <section
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 18px rgba(27,36,31,.08)",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                    Recent Orders
                  </h2>
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "var(--ink-soft)",
                      fontSize: "12px",
                    }}
                  >
                    The 8 most recent bookstore orders, most recent first.
                  </p>
                </div>
                <Link
                  href="/admin/bookstore/orders"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--brand)",
                    textDecoration: "none",
                  }}
                >
                  View all orders →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div
                  style={{
                    padding: "28px 20px",
                    color: "var(--ink-soft)",
                    fontSize: "13.5px",
                  }}
                >
                  No orders have been placed yet.
                </div>
              ) : (
                <div>
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--border-soft)",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                          {order.orderNumber}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--ink-soft)",
                            marginTop: "2px",
                          }}
                        >
                          {order.customerName} · {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                          {formatCurrency(order.totalUSD)}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "4px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <StatusPill
                            label={order.paymentStatus}
                            color={
                              STATUS_COLORS[order.paymentStatus] ||
                              "var(--ink-soft)"
                            }
                          />
                          <StatusPill
                            label={order.status}
                            color={
                              STATUS_COLORS[order.status] || "var(--ink-soft)"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =========================
                HONEST NOTE — no fabricated payouts
            ========================== */}
            <section
              style={{
                backgroundColor: "var(--paper)",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "16px 18px",
                color: "var(--ink-soft)",
                fontSize: "12.5px",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--ink)" }}>
                Author royalty payouts:
              </strong>{" "}
              there is no per-sale revenue-split or payout ledger in the
              system yet — building one would need a defined split
              percentage per book/author and a real payout model, which
              doesn't exist today. This overview no longer shows a
              fabricated split or payout count; when a real payout system
              is scoped and built, its figures will appear here.
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "17px",
        display: "block",
        color: "var(--ink)",
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "14px", fontWeight: "800" }}>{title}</div>
      <div
        style={{ marginTop: "4px", fontSize: "12px", color: "var(--ink-soft)" }}
      >
        {description}
      </div>
    </Link>
  );
}

function StatTile({
  label,
  value,
  note,
  accent,
  href,
}: {
  label: string;
  value: string;
  note: string;
  accent: string;
  href?: string;
}) {
  const content = (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 18px rgba(27,36,31,.08)",
        height: "100%",
      }}
    >
      <div
        style={{
          color: "var(--ink-soft)",
          fontSize: "11px",
          fontWeight: "800",
          letterSpacing: "0.7px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: "10px",
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: "800",
          color: accent,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: "7px", fontSize: "12px", color: "var(--ink-soft)" }}>
        {note}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }

  return content;
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: "10.5px",
        fontWeight: 800,
        letterSpacing: "0.03em",
        color,
        background: "var(--paper)",
        border: `1px solid ${color}`,
        borderRadius: "999px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
