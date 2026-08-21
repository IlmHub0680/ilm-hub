"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  category: string;
  year: string;
  price: number;
  status: "Pending Review" | "Approved & Live";
}

interface Order {
  orderId: string;
  bookTitle: string;
  author: string;
  amount: number;
  platformShare: number;
  authorShare: number;
  date: string;
  payoutStatus: "Released" | "Pending Release";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "books" | "payouts">(
    "overview"
  );

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([
    {
      id: "MS-101",
      title: "Foundations of Classical Fiqh",
      author: "Dr. Ahmad Al-Mansoor",
      category: "Fiqh",
      year: "2025",
      price: 30,
      status: "Pending Review",
    },
    {
      id: "MS-102",
      title: "Introductory Arabic Morphology",
      author: "Bilal Ibn Rabah",
      category: "Language",
      year: "2024",
      price: 25,
      status: "Approved & Live",
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      orderId: "ORD-8821",
      bookTitle: "Introductory Arabic Morphology",
      author: "Bilal Ibn Rabah",
      amount: 25,
      platformShare: 7.5,
      authorShare: 17.5,
      date: "2026-07-28",
      payoutStatus: "Released",
    },
    {
      orderId: "ORD-8825",
      bookTitle: "Introductory Arabic Morphology",
      author: "Bilal Ibn Rabah",
      amount: 25,
      platformShare: 7.5,
      authorShare: 17.5,
      date: "2026-07-27",
      payoutStatus: "Pending Release",
    },
    {
      orderId: "ORD-8829",
      bookTitle: "Foundations of Classical Fiqh",
      author: "Dr. Ahmad Al-Mansoor",
      amount: 30,
      platformShare: 9,
      authorShare: 21,
      date: "2026-07-25",
      payoutStatus: "Pending Release",
    },
  ]);

  const totalStoreGross = useMemo(
    () => orders.reduce((total, order) => total + order.amount, 0),
    [orders]
  );

  const totalPlatformShare = useMemo(
    () => orders.reduce((total, order) => total + order.platformShare, 0),
    [orders]
  );

  const totalAuthorObligation = useMemo(
    () => orders.reduce((total, order) => total + order.authorShare, 0),
    [orders]
  );

  const pendingBooks = manuscripts.filter(
    (book) => book.status === "Pending Review"
  ).length;

  const pendingPayouts = orders.filter(
    (order) => order.payoutStatus === "Pending Release"
  ).length;

  const releasedPayouts = orders.filter(
    (order) => order.payoutStatus === "Released"
  ).length;

  const approveBook = (id: string) => {
    setManuscripts((previous) =>
      previous.map((book) =>
        book.id === id
          ? { ...book, status: "Approved & Live" }
          : book
      )
    );
  };

  const releasePayout = (orderId: string) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.orderId === orderId
          ? { ...order, payoutStatus: "Released" }
          : order
      )
    );
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =========================
          TOP NAVIGATION
      ========================== */}
      <header
        style={{
          backgroundColor: "#0f172a",
          color: "#ffffff",
          borderBottom: "1px solid #1e293b",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#14532d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "21px",
                fontWeight: "800",
              }}
            >
              IH
            </div>

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  letterSpacing: "-0.2px",
                }}
              >
                Ilm-Hub
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Administration
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                textAlign: "right",
                display: "none",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "700" }}>
                Administrator
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                Full platform access
              </div>
            </div>

            <Link
              href="/"
              style={{
                color: "#e2e8f0",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
                border: "1px solid #334155",
                padding: "9px 14px",
                borderRadius: "8px",
              }}
            >
              Exit Admin
            </Link>
          </div>
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
        {/* Page heading */}
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
                color: "#64748b",
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
                fontSize: "30px",
                lineHeight: 1.2,
                fontWeight: "800",
                letterSpacing: "-0.8px",
                color: "#0f172a",
              }}
            >
              Platform Overview
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "14px",
                maxWidth: "680px",
                lineHeight: 1.6,
              }}
            >
              Manage books, authors, publishing workflows, sales,
              payouts, and platform operations from one central console.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#166534",
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
                backgroundColor: "#16a34a",
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
              color: "#334155",
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
            <Link
              href="/admin/author-approvals"
              style={{
                textDecoration: "none",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "17px",
                display: "block",
                color: "#0f172a",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>👤</div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>
                Author Approvals
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Review new author applications
              </div>
            </Link>

            <Link
              href="/admin/publishing"
              style={{
                textDecoration: "none",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "17px",
                display: "block",
                color: "#0f172a",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>📝</div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>
                Publishing Manager
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Manuscripts, quotes & production
              </div>
            </Link>

            <Link
              href="/admin/sponsor-manager"
              style={{
                textDecoration: "none",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "17px",
                display: "block",
                color: "#0f172a",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>📢</div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>
                Sponsor Manager
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Ads and sponsored content
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              style={{
                textDecoration: "none",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "17px",
                display: "block",
                color: "#0f172a",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>📊</div>
              <div style={{ fontSize: "14px", fontWeight: "800" }}>
                Analytics
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Platform performance & reporting
              </div>
            </Link>
          </div>
        </section>

        {/* =========================
            FINANCIAL SUMMARY
        ========================== */}
        <section style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Gross */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Store Gross Revenue
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                {formatCurrency(totalStoreGross)}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Total recorded book sales
              </div>
            </div>

            {/* Platform */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d1fae5",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#166534",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Platform Share · 30%
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#166534",
                }}
              >
                {formatCurrency(totalPlatformShare)}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Ilm-Hub platform allocation
              </div>
            </div>

            {/* Author */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#1d4ed8",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Author Obligation · 70%
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#1d4ed8",
                }}
              >
                {formatCurrency(totalAuthorObligation)}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Total author royalty obligation
              </div>
            </div>

            {/* Pending */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#92400e",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Pending Payouts
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#92400e",
                }}
              >
                {pendingPayouts}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Require administrator action
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            TABS
        ========================== */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "22px",
            overflowX: "auto",
          }}
        >
          {[
            {
              key: "overview" as const,
              label: "Overview",
            },
            {
              key: "books" as const,
              label: `Book Approval${pendingBooks ? ` (${pendingBooks})` : ""}`,
            },
            {
              key: "payouts" as const,
              label: `Payouts${pendingPayouts ? ` (${pendingPayouts})` : ""}`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                border: "none",
                background: "transparent",
                padding: "12px 17px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "800",
                color:
                  activeTab === tab.key ? "#14532d" : "#64748b",
                borderBottom:
                  activeTab === tab.key
                    ? "3px solid #14532d"
                    : "3px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =========================
            OVERVIEW TAB
        ========================== */}
        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
              gap: "20px",
            }}
          >
            {/* Activity */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "800",
                    }}
                  >
                    Recent Platform Activity
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    Items requiring attention from the administration team.
                  </p>
                </div>

                <span
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {pendingBooks + pendingPayouts} pending
                </span>
              </div>

              {/* Pending book */}
              {pendingBooks > 0 && (
                <div
                  style={{
                    padding: "17px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "9px",
                        backgroundColor: "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      📚
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        Book approval required
                      </div>

                      <div
                        style={{
                          marginTop: "3px",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {pendingBooks} manuscript
                        {pendingBooks !== 1 ? "s" : ""} waiting for review
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("books")}
                    style={{
                      border: "1px solid #bbf7d0",
                      backgroundColor: "#f0fdf4",
                      color: "#166534",
                      padding: "8px 12px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Review
                  </button>
                </div>
              )}

              {/* Pending payout */}
              {pendingPayouts > 0 && (
                <div
                  style={{
                    padding: "17px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "9px",
                        backgroundColor: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      💰
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        Author payouts awaiting release
                      </div>

                      <div
                        style={{
                          marginTop: "3px",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {pendingPayouts} payout
                        {pendingPayouts !== 1 ? "s" : ""} awaiting action
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("payouts")}
                    style={{
                      border: "1px solid #bfdbfe",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "8px 12px",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Review
                  </button>
                </div>
              )}

              {pendingBooks === 0 && pendingPayouts === 0 && (
                <div
                  style={{
                    padding: "35px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  All current administrative tasks are up to date.
                </div>
              )}
            </div>

            {/* System summary */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "800",
                }}
              >
                Platform Status
              </h2>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <StatusRow
                  label="Books in approval queue"
                  value={String(pendingBooks)}
                  warning={pendingBooks > 0}
                />

                <StatusRow
                  label="Pending author payouts"
                  value={String(pendingPayouts)}
                  warning={pendingPayouts > 0}
                />

                <StatusRow
                  label="Released payouts"
                  value={String(releasedPayouts)}
                />

                <StatusRow
                  label="Revenue split"
                  value="70 / 30"
                />
              </div>

              <div
                style={{
                  marginTop: "22px",
                  padding: "13px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "#334155" }}>
                  Financial rule:
                </strong>{" "}
                Book sales allocate 70% to the author and 30% to the
                Ilm-Hub platform.
              </div>
            </div>
          </div>
        )}

        {/* =========================
            BOOK APPROVAL TAB
        ========================== */}
        {activeTab === "books" && (
          <section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: "800",
                }}
              >
                Book Approval Queue
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Review submitted books before making them available in
                the Ilm-Hub bookstore.
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {[
                      "ID",
                      "Book",
                      "Author",
                      "Category",
                      "Year",
                      "Price",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "13px 16px",
                          textAlign: "left",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {manuscripts.map((book) => (
                    <tr
                      key={book.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#475569",
                        }}
                      >
                        {book.id}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#0f172a",
                        }}
                      >
                        {book.title}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {book.author}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {book.category}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {book.year}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(book.price)}
                      </td>

                      <td style={{ padding: "16px" }}>
                        <StatusBadge
                          status={book.status}
                          success={book.status === "Approved & Live"}
                        />
                      </td>

                      <td style={{ padding: "16px" }}>
                        {book.status === "Pending Review" ? (
                          <button
                            onClick={() => approveBook(book.id)}
                            style={{
                              backgroundColor: "#14532d",
                              color: "#ffffff",
                              border: "none",
                              padding: "8px 13px",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                            }}
                          >
                            Approve & Publish
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Published
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =========================
            PAYOUTS TAB
        ========================== */}
        {activeTab === "payouts" && (
          <section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: "800",
                  }}
                >
                  Sales & Author Payouts
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Review gross sales and release the author&apos;s 70%
                  royalty obligation.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  fontWeight: "800",
                }}
              >
                Active Split: 70% Author / 30% Platform
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1000px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {[
                      "Order",
                      "Book",
                      "Author",
                      "Gross",
                      "Platform 30%",
                      "Author 70%",
                      "Date",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "13px 16px",
                          textAlign: "left",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#475569",
                        }}
                      >
                        {order.orderId}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        {order.bookTitle}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          color: "#64748b",
                        }}
                      >
                        {order.author}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {formatCurrency(order.amount)}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          color: "#166534",
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        {formatCurrency(order.platformShare)}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          color: "#1d4ed8",
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        {formatCurrency(order.authorShare)}
                      </td>

                      <td
                        style={{
                          padding: "16px",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {order.date}
                      </td>

                      <td style={{ padding: "16px" }}>
                        <StatusBadge
                          status={order.payoutStatus}
                          success={order.payoutStatus === "Released"}
                        />
                      </td>

                      <td style={{ padding: "16px" }}>
                        {order.payoutStatus === "Pending Release" ? (
                          <button
                            onClick={() => releasePayout(order.orderId)}
                            style={{
                              backgroundColor: "#1d4ed8",
                              color: "#ffffff",
                              border: "none",
                              padding: "8px 13px",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                            }}
                          >
                            Release Payout
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =========================
            FOOTER NOTE
        ========================== */}
        <div
          style={{
            marginTop: "25px",
            padding: "15px 18px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            color: "#64748b",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#334155" }}>Administrator note:</strong>{" "}
          This console provides platform-level controls. Financial
          actions should ultimately be verified against the server-side
          transaction and authorization records before money is released.
        </div>
      </main>
    </div>
  );
}

/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({
  status,
  success,
}: {
  status: string;
  success: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "800",
        backgroundColor: success ? "#f0fdf4" : "#fff7ed",
        color: success ? "#166534" : "#9a3412",
        border: success
          ? "1px solid #bbf7d0"
          : "1px solid #fed7aa",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

/* =========================================
   SYSTEM STATUS ROW
========================================= */

function StatusRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        paddingBottom: "12px",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: warning ? "#b45309" : "#0f172a",
          fontSize: "13px",
          fontWeight: "800",
        }}
      >
        {value}
      </span>
    </div>
  );
}