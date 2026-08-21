"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

/**
 * ILM-HUB AUTHOR PORTAL
 *
 * This is a polished frontend version of the Author Portal.
 *
 * IMPORTANT:
 * - Authentication is still demo/frontend authentication.
 * - Book uploads are simulated.
 * - Replace demo state with your database/API when connecting backend.
 * - The 70/30 royalty split is centralized here so all calculations agree.
 */

const ROYALTY_RATE = 0.7;
const PLATFORM_RATE = 0.3;

const COLORS = {
  primary: "#14532d",
  primaryHover: "#166534",
  primarySoft: "#f0fdf4",
  primaryBorder: "#bbf7d0",

  navy: "#0f172a",
  text: "#334155",
  muted: "#64748b",
  lightMuted: "#94a3b8",

  background: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",

  blue: "#0369a1",
  blueSoft: "#f0f9ff",

  amber: "#b45309",
  amberSoft: "#fffbeb",

  red: "#b91c1c",
  redSoft: "#fef2f2",

  purple: "#6d28d9",
  purpleSoft: "#f5f3ff",
};

const INITIAL_BOOKS = [
  {
    id: 1,
    title: "Foundations of Islamic Jurisprudence",
    publishDate: "2026-05-12",
    status: "Published",
    price: 18.5,
    category: "Fiqh",
    sales: 142,
    coverUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    title: "Advanced Arabic Morphology & Syntax",
    publishDate: "2026-06-20",
    status: "Under Review",
    price: 22,
    category: "Arabic Language",
    sales: 0,
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80",
  },
];

const INITIAL_COUPONS = [
  {
    id: 1,
    code: "RAMADAN20",
    discount: 20,
    bookTitle: "Foundations of Islamic Jurisprudence",
    status: "Active",
    uses: 14,
  },
  {
    id: 2,
    code: "SCHOLAR50",
    discount: 50,
    bookTitle: "All Books",
    status: "Active",
    uses: 3,
  },
];

const INITIAL_PAYOUTS = [
  {
    id: "PO-1082",
    date: "2026-07-01",
    gross: 1240,
    author: 868,
    platform: 372,
    status: "Completed",
    method: "Mobile Money",
  },
  {
    id: "PO-1051",
    date: "2026-06-01",
    gross: 980.5,
    author: 686.35,
    platform: 294.15,
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: "PO-1019",
    date: "2026-05-01",
    gross: 408,
    author: 285.6,
    platform: 122.4,
    status: "Completed",
    method: "Mobile Money",
  },
];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function royalty(value) {
  return Number(value || 0) * ROYALTY_RATE;
}

function platformFee(value) {
  return Number(value || 0) * PLATFORM_RATE;
}

function StatusBadge({ status }) {
  const styles = {
    Published: {
      background: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0",
    },
    Approved: {
      background: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0",
    },
    "Under Review": {
      background: "#fffbeb",
      color: "#a16207",
      border: "#fde68a",
    },
    "Pending Review": {
      background: "#fffbeb",
      color: "#a16207",
      border: "#fde68a",
    },
    Draft: {
      background: "#f8fafc",
      color: "#475569",
      border: "#cbd5e1",
    },
    "Changes Requested": {
      background: "#fff7ed",
      color: "#c2410c",
      border: "#fed7aa",
    },
    Rejected: {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "#fecaca",
    },
    Active: {
      background: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0",
    },
    Completed: {
      background: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0",
    },
  };

  const style = styles[status] || {
    background: "#f8fafc",
    color: "#475569",
    border: "#cbd5e1",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.color,
        }}
      />
      {status}
    </span>
  );
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
  };

  const icons = {
    dashboard: (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    book: (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    ),
    plus: (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    chart: (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 3-3 3 2 5-6" />
      </svg>
    ),
    money: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 8h.01M17 16h.01" />
      </svg>
    ),
    coupon: (
      <svg {...common}>
        <path d="M20 12a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z" />
        <path d="M12 6v2M12 10v2M12 14v2" />
      </svg>
    ),
    user: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
    bell: (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),
    logout: (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </svg>
    ),
    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    ),
    settings: (
      <svg {...common}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V19.6h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7.75v-2h.09A1.7 1.7 0 0 0 9.4 10.94a1.7 1.7 0 0 0-.34-1.88L9 9l1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.38 6.4v-.09h2v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.76 9l-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 12h.09v2h-.09A1.7 1.7 0 0 0 19.4 15Z" />
      </svg>
    ),
    menu: (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    close: (
      <svg {...common}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    ),
    download: (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    ),
    arrow: (
      <svg {...common}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    ),
    lock: (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  };

  return icons[name] || null;
}

function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  style = {},
}) {
  const variants = {
    primary: {
      background: COLORS.primary,
      color: "#fff",
      border: `1px solid ${COLORS.primary}`,
    },
    secondary: {
      background: "#fff",
      color: COLORS.text,
      border: `1px solid #cbd5e1`,
    },
    soft: {
      background: COLORS.primarySoft,
      color: COLORS.primary,
      border: `1px solid ${COLORS.primaryBorder}`,
    },
    danger: {
      background: COLORS.redSoft,
      color: COLORS.red,
      border: "1px solid #fecaca",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 9,
        padding: "10px 15px",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all .2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 7,
          }}
        >
          {label}
        </label>
      )}

      <input
        {...props}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: 9,
          padding: "11px 13px",
          fontSize: 14,
          color: COLORS.navy,
          outline: "none",
          background: "#fff",
          ...props.style,
        }}
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 7,
          }}
        >
          {label}
        </label>
      )}

      <textarea
        {...props}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: 9,
          padding: "11px 13px",
          fontSize: 14,
          color: COLORS.navy,
          outline: "none",
          background: "#fff",
          resize: "vertical",
          ...props.style,
        }}
      />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        boxShadow: "0 4px 18px rgba(15,23,42,.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, description, icon, color }) {
  return (
    <Card style={{ padding: 20, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: -15,
          top: -15,
          width: 75,
          height: 75,
          borderRadius: "50%",
          background: `${color}12`,
        }}
      />

      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}12`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Icon name={icon} />
      </div>

      <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 700 }}>
        {label}
      </div>

      <div
        style={{
          color: COLORS.navy,
          fontSize: 25,
          fontWeight: 800,
          marginTop: 5,
          letterSpacing: "-.5px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: COLORS.muted,
          fontSize: 12,
          marginTop: 5,
        }}
      >
        {description}
      </div>
    </Card>
  );
}

export default function AuthorPortal() {
  const [viewMode, setViewMode] = useState("login");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [formData, setFormData] = useState({
    name: "Dr. Ahmad Al-Mansoor",
    email: "ahmad.mansoor@ilmhub.edu",
    bio: "Specialist in Islamic Jurisprudence and Arabic Morphology with over 15 years of academic teaching experience.",
    specialty: "Fiqh & Arabic Language",
    password: "",
    payoutMethod: "Mobile Money",
    bankAccount: "•••• •••• •••• 4892",
    bankName: "Global Islamic Bank",
    momoNumber: "+233 24 555 0192",
    momoNetwork: "MTN Mobile Money",
  });

  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [payoutHistory] = useState(INITIAL_PAYOUTS);

  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("All");

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "10",
    bookTitle: "All Books",
  });

  const [newBook, setNewBook] = useState({
    title: "",
    category: "",
    price: "",
    publishDate: new Date().toISOString().split("T")[0],
    description: "",
    coverImage: null,
    bookFile: null,
  });

  const [uploadingBook, setUploadingBook] = useState(false);

  const totalSales = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.sales || 0), 0),
    [books]
  );

  const publishedBooks = useMemo(
    () => books.filter((book) => book.status === "Published"),
    [books]
  );

  const pendingBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.status === "Under Review" ||
          book.status === "Pending Review"
      ),
    [books]
  );

  const grossRevenue = useMemo(
    () =>
      books.reduce(
        (sum, book) => sum + Number(book.price || 0) * Number(book.sales || 0),
        0
      ),
    [books]
  );

  const authorRevenue = royalty(grossRevenue);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        bookFilter === "All" || book.status === bookFilter;

      return matchesSearch && matchesFilter;
    });
  }, [books, search, bookFilter]);

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const navigate = (view) => {
    setViewMode(view);
    setMobileMenu(false);
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/author/admission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(
          data.error || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Failed to submit application. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      /*
       * Replace this with your real authentication endpoint.
       *
       * Example:
       * const res = await fetch("/api/author/login", {...})
       */

      if (!formData.email || !formData.password) {
        setErrorMsg("Please enter both email and password.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate("dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoading(false);
    setResetSent(true);
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();

    if (
      !newBook.title ||
      !newBook.category ||
      !newBook.price ||
      !newBook.description ||
      !newBook.coverImage ||
      !newBook.bookFile
    ) {
      setErrorMsg("Please complete all required book fields.");
      return;
    }

    if (Number(newBook.price) <= 0) {
      setErrorMsg("Book price must be greater than zero.");
      return;
    }

    setUploadingBook(true);
    setErrorMsg("");

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const createdBook = {
      id: Date.now(),
      title: newBook.title,
      publishDate: newBook.publishDate,
      status: "Under Review",
      price: Number(newBook.price),
      category: newBook.category,
      sales: 0,
      coverUrl: newBook.coverImage
        ? URL.createObjectURL(newBook.coverImage)
        : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80",
    };

    setBooks((current) => [createdBook, ...current]);

    setNewBook({
      title: "",
      category: "",
      price: "",
      publishDate: new Date().toISOString().split("T")[0],
      description: "",
      coverImage: null,
      bookFile: null,
    });

    setUploadingBook(false);
    showSuccess(
      "Book submitted successfully. It has been sent to the administration review queue."
    );

    navigate("dashboard");
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();

    if (!newCoupon.code.trim()) {
      setErrorMsg("Please enter a coupon code.");
      return;
    }

    const normalizedCode = newCoupon.code.trim().toUpperCase();

    if (coupons.some((coupon) => coupon.code === normalizedCode)) {
      setErrorMsg("That coupon code already exists.");
      return;
    }

    const discount = Number(newCoupon.discount);

    if (discount < 1 || discount > 100) {
      setErrorMsg("Discount must be between 1% and 100%.");
      return;
    }

    const createdCoupon = {
      id: Date.now(),
      code: normalizedCode,
      discount,
      bookTitle: newCoupon.bookTitle,
      status: "Active",
      uses: 0,
    };

    setCoupons((current) => [createdCoupon, ...current]);

    setNewCoupon({
      code: "",
      discount: "10",
      bookTitle: "All Books",
    });

    showSuccess(`Coupon ${normalizedCode} created successfully.`);
    setErrorMsg("");
  };

  const handleProfileSave = (e) => {
    e.preventDefault();

    showSuccess("Your author profile and payout settings have been updated.");
  };

  const signOut = () => {
    setViewMode("login");
    setMobileMenu(false);
    setFormData((current) => ({
      ...current,
      password: "",
    }));
  };

  if (submitted) {
    return (
      <div style={styles.authPage}>
        <Card style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>

          <div
            style={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: 13,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Application received
          </div>

          <h1 style={styles.successTitle}>Author Application Submitted</h1>

          <p style={styles.successText}>
            Thank you for applying to publish your books on Ilm-Hub. Your
            application has been sent to the administration team for review.
          </p>

          <div style={styles.successNotice}>
            Once your author account is approved, you will receive access to
            your complete publishing dashboard.
          </div>

          <Button
            onClick={() => {
              setSubmitted(false);
              setViewMode("login");
            }}
            style={{ width: "100%", marginTop: 20 }}
          >
            Go to Author Sign In
          </Button>
        </Card>
      </div>
    );
  }

  /*
   * AUTHENTICATION
   */

  if (["login", "register", "reset"].includes(viewMode)) {
    return (
      <div style={styles.authPage}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ marginBottom: 22 }}>
            <Link
              href="/"
              style={{
                color: COLORS.primary,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              ← Back to Ilm-Hub
            </Link>
          </div>

          <Card style={{ padding: 34 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={styles.logo}>ILM</div>

              <h1
                style={{
                  margin: "16px 0 6px",
                  color: COLORS.navy,
                  fontSize: 25,
                  fontWeight: 800,
                }}
              >
                Author Portal
              </h1>

              <p
                style={{
                  margin: 0,
                  color: COLORS.muted,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Publish your knowledge, manage your books, and track your
                earnings.
              </p>
            </div>

            {viewMode !== "reset" && (
              <div style={styles.authTabs}>
                <button
                  onClick={() => {
                    setViewMode("login");
                    setErrorMsg("");
                  }}
                  style={{
                    ...styles.authTab,
                    ...(viewMode === "login" ? styles.authTabActive : {}),
                  }}
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setViewMode("register");
                    setErrorMsg("");
                  }}
                  style={{
                    ...styles.authTab,
                    ...(viewMode === "register"
                      ? styles.authTabActive
                      : {}),
                  }}
                >
                  Become an Author
                </button>
              </div>
            )}

            {errorMsg && (
              <div style={styles.errorBox}>
                <strong>Unable to continue</strong>
                <div style={{ marginTop: 3 }}>{errorMsg}</div>
              </div>
            )}

            {viewMode === "login" && (
              <form
                onSubmit={handleLoginSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div>
                  <h2 style={styles.formTitle}>Welcome back</h2>
                  <p style={styles.formDescription}>
                    Sign in to manage your publications and earnings.
                  </p>
                </div>

                <Input
                  label="Email address"
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <div>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Password</label>

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("reset");
                        setErrorMsg("");
                        setResetSent(false);
                      }}
                      style={styles.linkButton}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                  }}
                >
                  {loading ? "Signing in..." : "Sign In to Author Portal"}
                  {!loading && <Icon name="arrow" size={16} />}
                </Button>

                <div style={styles.securityNote}>
                  <Icon name="lock" size={14} />
                  Your author account is protected by secure authentication.
                </div>
              </form>
            )}

            {viewMode === "register" && (
              <form
                onSubmit={handleRegisterSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <h2 style={styles.formTitle}>Apply as an author</h2>
                  <p style={styles.formDescription}>
                    Submit your credentials for administration review.
                  </p>
                </div>

                <Input
                  label="Full name / professional title"
                  required
                  placeholder="Dr. Ahmad Al-Mansoor"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />

                <Input
                  label="Email address"
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  label="Academic specialization"
                  required
                  placeholder="Fiqh, Hadith, Arabic Language..."
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialty: e.target.value,
                    })
                  }
                />

                <Textarea
                  label="Professional biography"
                  required
                  rows={4}
                  placeholder="Tell us about your academic background and publications."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bio: e.target.value,
                    })
                  }
                />

                <Input
                  label="Create password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />

                <div style={styles.infoBox}>
                  <strong>Author review process</strong>
                  <p style={{ margin: "5px 0 0", lineHeight: 1.5 }}>
                    Applications are reviewed by Ilm-Hub administration before
                    publishing privileges are activated.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                  }}
                >
                  {loading ? "Submitting application..." : "Submit Author Application"}
                </Button>
              </form>
            )}

            {viewMode === "reset" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("login");
                    setErrorMsg("");
                    setResetSent(false);
                  }}
                  style={styles.backButton}
                >
                  ← Back to sign in
                </button>

                <h2 style={styles.formTitle}>Reset your password</h2>

                <p style={styles.formDescription}>
                  Enter your registered email address and we'll send you
                  instructions to reset your password.
                </p>

                {resetSent ? (
                  <div style={styles.successNotice}>
                    <strong>Password reset request received.</strong>
                    <p style={{ margin: "7px 0 0" }}>
                      If an account exists for{" "}
                      <strong>{resetEmail}</strong>, reset instructions will be
                      sent to that address.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleResetSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <Input
                      label="Email address"
                      type="email"
                      required
                      placeholder="author@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />

                    <Button type="submit" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Instructions"}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </Card>

          <p
            style={{
              textAlign: "center",
              color: COLORS.lightMuted,
              fontSize: 12,
              marginTop: 20,
            }}
          >
            © {new Date().getFullYear()} Ilm-Hub · Author Publishing Portal
          </p>
        </div>
      </div>
    );
  }

  /*
   * MAIN AUTHOR PORTAL
   */

  const navigation = [
    {
      section: "Workspace",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "books", label: "My Books", icon: "book" },
        { id: "add-book", label: "Add New Book", icon: "plus" },
        { id: "analytics", label: "Sales & Analytics", icon: "chart" },
      ],
    },
    {
      section: "Business",
      items: [
        { id: "payouts", label: "Earnings & Payouts", icon: "money" },
        { id: "coupons", label: "Coupons & Promotions", icon: "coupon" },
      ],
    },
    {
      section: "Account",
      items: [
        { id: "profile", label: "Author Profile", icon: "user" },
        { id: "settings", label: "Payment & Settings", icon: "settings" },
      ],
    },
  ];

  const normalizedView =
    viewMode === "books" || viewMode === "analytics" || viewMode === "settings"
      ? viewMode
      : viewMode;

  const pageTitles = {
    dashboard: {
      title: `Good morning, ${formData.name.split(" ").slice(0, 2).join(" ")}`,
      description:
        "Here's an overview of your publications, sales and author earnings.",
    },
    books: {
      title: "My Books",
      description:
        "Manage your manuscripts, publications, approval status and catalog.",
    },
    "add-book": {
      title: "Publish a New Book",
      description:
        "Submit your publication details and digital assets for review.",
    },
    analytics: {
      title: "Sales & Analytics",
      description:
        "Understand how your publications are performing over time.",
    },
    payouts: {
      title: "Earnings & Payouts",
      description:
        "Review your royalty earnings, payout history and payment destination.",
    },
    coupons: {
      title: "Coupons & Promotions",
      description:
        "Create promotional offers and monitor their performance.",
    },
    profile: {
      title: "Author Profile",
      description:
        "Manage the professional profile displayed alongside your publications.",
    },
    settings: {
      title: "Payment & Settings",
      description:
        "Manage your payout destination and account preferences.",
    },
  };

  const currentPage = pageTitles[normalizedView] || pageTitles.dashboard;

  return (
    <div style={styles.portal}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        button, input, textarea, select {
          font-family: inherit;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #14532d !important;
          box-shadow: 0 0 0 3px rgba(20,83,45,.08);
        }

        button:hover:not(:disabled) {
          filter: brightness(.98);
        }

        @media (max-width: 900px) {
          .author-sidebar {
            transform: translateX(-100%);
          }

          .author-sidebar.open {
            transform: translateX(0);
          }

          .author-main {
            margin-left: 0 !important;
          }

          .author-mobile-menu {
            display: flex !important;
          }

          .author-top-user {
            display: none !important;
          }

          .author-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .author-two-columns {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .author-content {
            padding: 20px 14px !important;
          }

          .author-topbar {
            padding: 12px 14px !important;
          }

          .author-stats-grid {
            grid-template-columns: 1fr !important;
          }

          .author-form-grid {
            grid-template-columns: 1fr !important;
          }

          .author-page-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .author-book-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .author-book-actions {
            width: 100% !important;
            align-items: flex-start !important;
          }

          .author-responsive-table {
            overflow-x: auto;
          }

          .author-table {
            min-width: 760px;
          }
        }
      `}</style>

      {/* SIDEBAR */}

      <aside
        className={`author-sidebar ${mobileMenu ? "open" : ""}`}
        style={styles.sidebar}
      >
        <div style={styles.sidebarLogo}>
          <div style={styles.sidebarLogoMark}>ILM</div>

          <div>
            <div
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "-.3px",
              }}
            >
              Ilm-Hub
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: 10,
                marginTop: 2,
              }}
            >
              AUTHOR PORTAL
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 12px" }}>
          {navigation.map((group) => (
            <div key={group.section} style={{ marginBottom: 24 }}>
              <div style={styles.sidebarSection}>{group.section}</div>

              {group.items.map((item) => {
                const active =
                  normalizedView === item.id ||
                  (item.id === "books" && viewMode === "books") ||
                  (item.id === "settings" && viewMode === "settings");

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    style={{
                      ...styles.sidebarItem,
                      ...(active ? styles.sidebarItemActive : {}),
                    }}
                  >
                    <Icon name={item.icon} size={17} />
                    <span>{item.label}</span>

                    {item.id === "books" && pendingBooks.length > 0 && (
                      <span style={styles.sidebarCount}>
                        {pendingBooks.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.sidebarAuthorCard}>
            <div style={styles.avatar}>
              {formData.name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formData.name}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                Verified Author
              </div>
            </div>
          </div>

          <button onClick={signOut} style={styles.signOutButton}>
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          style={styles.mobileOverlay}
        />
      )}

      {/* MAIN */}

      <main className="author-main" style={styles.main}>
        {/* TOPBAR */}

        <header className="author-topbar" style={styles.topbar}>
          <button
            className="author-mobile-menu"
            onClick={() => setMobileMenu(true)}
            style={styles.mobileMenuButton}
          >
            <Icon name="menu" />
          </button>

          <div style={styles.breadcrumb}>
            <span>Author Portal</span>
            <span style={{ color: "#cbd5e1" }}>/</span>
            <strong>{currentPage.title}</strong>
          </div>

          <div
            className="author-top-user"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <button
              onClick={() => showSuccess("You have no new notifications.")}
              style={styles.iconButton}
              aria-label="Notifications"
            >
              <Icon name="bell" size={18} />
              <span style={styles.notificationDot} />
            </button>

            <div style={styles.topProfile}>
              <div style={styles.topAvatar}>
                {formData.name
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.navy,
                  }}
                >
                  {formData.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.muted,
                    marginTop: 2,
                  }}
                >
                  Author account
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="author-content" style={styles.content}>
          {/* PAGE HEADER */}

          <div
            className="author-page-actions"
            style={styles.pageHeader}
          >
            <div>
              <div style={styles.eyebrow}>AUTHOR WORKSPACE</div>

              <h1 style={styles.pageTitle}>{currentPage.title}</h1>

              <p style={styles.pageDescription}>
                {currentPage.description}
              </p>
            </div>

            <div style={{ display: "flex", gap: 9 }}>
              {viewMode === "dashboard" && (
                <Button onClick={() => navigate("add-book")}>
                  <Icon name="plus" size={16} />
                  Add New Book
                </Button>
              )}

              {viewMode === "books" && (
                <Button onClick={() => navigate("add-book")}>
                  <Icon name="plus" size={16} />
                  Add New Book
                </Button>
              )}

              {["add-book", "payouts", "coupons", "profile", "settings"].includes(
                viewMode
              ) && (
                <Button
                  variant="secondary"
                  onClick={() => navigate("dashboard")}
                >
                  ← Dashboard
                </Button>
              )}
            </div>
          </div>

          {successMsg && (
            <div style={styles.successBanner}>
              <div style={styles.successBannerIcon}>✓</div>

              <div>
                <strong>Success</strong>
                <div style={{ marginTop: 2 }}>{successMsg}</div>
              </div>

              <button
                onClick={() => setSuccessMsg("")}
                style={styles.dismissButton}
              >
                ×
              </button>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorBanner}>
              <strong>Action required</strong>
              <div style={{ marginTop: 2 }}>{errorMsg}</div>

              <button
                onClick={() => setErrorMsg("")}
                style={styles.dismissButton}
              >
                ×
              </button>
            </div>
          )}

          {/* DASHBOARD */}

          {viewMode === "dashboard" && (
            <>
              <div
                className="author-stats-grid"
                style={styles.statsGrid}
              >
                <StatCard
                  label="Net author earnings"
                  value={money(authorRevenue)}
                  description="70% of gross catalog sales"
                  icon="money"
                  color={COLORS.primary}
                />

                <StatCard
                  label="Total book sales"
                  value={totalSales}
                  description="Copies sold across your catalog"
                  icon="book"
                  color={COLORS.blue}
                />

                <StatCard
                  label="Published books"
                  value={publishedBooks.length}
                  description={`${pendingBooks.length} currently under review`}
                  icon="chart"
                  color={COLORS.amber}
                />

                <StatCard
                  label="Active coupons"
                  value={coupons.filter((c) => c.status === "Active").length}
                  description="Promotional codes currently active"
                  icon="coupon"
                  color={COLORS.purple}
                />
              </div>

              <div
                className="author-two-columns"
                style={styles.twoColumns}
              >
                <Card style={{ padding: 22 }}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.cardTitle}>
                        Sales performance
                      </h2>

                      <p style={styles.cardDescription}>
                        Revenue generated by your current catalog.
                      </p>
                    </div>

                    <span style={styles.periodBadge}>
                      Last 6 months
                    </span>
                  </div>

                  <div style={styles.chartArea}>
                    {[38, 54, 47, 72, 61, 84, 76].map((height, index) => (
                      <div
                        key={index}
                        style={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "65%",
                            maxWidth: 34,
                            height: `${height}%`,
                            background:
                              index === 6
                                ? COLORS.primary
                                : "linear-gradient(180deg,#86efac,#bbf7d0)",
                            borderRadius: "7px 7px 3px 3px",
                          }}
                        />

                        <span
                          style={{
                            fontSize: 10,
                            color: COLORS.lightMuted,
                          }}
                        >
                          {
                            ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Now"][
                              index
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.chartSummary}>
                    <div>
                      <div style={styles.chartSummaryLabel}>
                        Gross sales
                      </div>
                      <strong style={styles.chartSummaryValue}>
                        {money(grossRevenue)}
                      </strong>
                    </div>

                    <div>
                      <div style={styles.chartSummaryLabel}>
                        Your share
                      </div>
                      <strong
                        style={{
                          ...styles.chartSummaryValue,
                          color: COLORS.primary,
                        }}
                      >
                        {money(authorRevenue)}
                      </strong>
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: 22 }}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.cardTitle}>
                        Recent activity
                      </h2>

                      <p style={styles.cardDescription}>
                        Latest events on your author account.
                      </p>
                    </div>

                    <Icon name="bell" size={17} />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    {[
                      {
                        title: "Foundations of Islamic Jurisprudence",
                        message: "is live in the store",
                        color: COLORS.primary,
                        time: "Recently",
                      },
                      {
                        title: "Advanced Arabic Morphology",
                        message: "is awaiting review",
                        color: COLORS.amber,
                        time: "2 days ago",
                      },
                      {
                        title: "July payout",
                        message: "was completed",
                        color: COLORS.blue,
                        time: "Jul 01",
                      },
                      {
                        title: "RAMADAN20",
                        message: "was redeemed 14 times",
                        color: COLORS.purple,
                        time: "This month",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom:
                            index === 3
                              ? "none"
                              : `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: activity.color,
                            marginTop: 5,
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              color: COLORS.navy,
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {activity.title}
                          </div>

                          <div
                            style={{
                              color: COLORS.muted,
                              fontSize: 12,
                              marginTop: 3,
                            }}
                          >
                            {activity.message}
                          </div>
                        </div>

                        <span
                          style={{
                            color: COLORS.lightMuted,
                            fontSize: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card style={{ marginTop: 20, overflow: "hidden" }}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Your publications</h2>
                    <p style={styles.cardDescription}>
                      Monitor your latest books and their publication status.
                    </p>
                  </div>

                  <Button
                    variant="soft"
                    onClick={() => navigate("books")}
                  >
                    View all books
                    <Icon name="arrow" size={15} />
                  </Button>
                </div>

                <div>
                  {books.slice(0, 3).map((book, index) => (
                    <BookRow
                      key={book.id}
                      book={book}
                      last={index === Math.min(books.length, 3) - 1}
                    />
                  ))}
                </div>
              </Card>

              <Card style={{ marginTop: 20, padding: 22 }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Quick actions</h2>
                    <p style={styles.cardDescription}>
                      Common tasks for managing your author account.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                    marginTop: 18,
                  }}
                  className="author-stats-grid"
                >
                  {[
                    {
                      label: "Publish a book",
                      icon: "plus",
                      action: () => navigate("add-book"),
                    },
                    {
                      label: "View earnings",
                      icon: "money",
                      action: () => navigate("payouts"),
                    },
                    {
                      label: "Create coupon",
                      icon: "coupon",
                      action: () => navigate("coupons"),
                    },
                    {
                      label: "Edit profile",
                      icon: "user",
                      action: () => navigate("profile"),
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.action}
                      style={styles.quickAction}
                    >
                      <div style={styles.quickActionIcon}>
                        <Icon name={action.icon} size={17} />
                      </div>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* BOOKS */}

          {viewMode === "books" && (
            <Card style={{ overflow: "hidden" }}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Publication library</h2>
                  <p style={styles.cardDescription}>
                    {books.length} books in your author catalog.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={styles.searchBox}>
                    <Icon name="search" size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search books..."
                      style={styles.searchInput}
                    />
                  </div>

                  <select
                    value={bookFilter}
                    onChange={(e) => setBookFilter(e.target.value)}
                    style={styles.select}
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Under Review</option>
                    <option>Draft</option>
                    <option>Changes Requested</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>

              {filteredBooks.length === 0 ? (
                <EmptyState
                  title="No books found"
                  description="Try changing your search or filter."
                />
              ) : (
                filteredBooks.map((book, index) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    last={index === filteredBooks.length - 1}
                  />
                ))
              )}
            </Card>
          )}

          {/* ADD BOOK */}

          {viewMode === "add-book" && (
            <Card style={{ padding: 28 }}>
              <form
                onSubmit={handleAddBookSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                <div style={styles.formSectionHeading}>
                  <div style={styles.formSectionNumber}>01</div>

                  <div>
                    <h2 style={styles.cardTitle}>Publication details</h2>
                    <p style={styles.cardDescription}>
                      Enter the core information that shoppers will see.
                    </p>
                  </div>
                </div>

                <div
                  className="author-form-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Input
                    label="Book title"
                    required
                    placeholder="Principles of Islamic Finance"
                    value={newBook.title}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        title: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Category / subject"
                    required
                    placeholder="Fiqh, Hadith, Arabic..."
                    value={newBook.category}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        category: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Price (USD)"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={newBook.price}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        price: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Publication date"
                    type="date"
                    required
                    value={newBook.publishDate}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        publishDate: e.target.value,
                      })
                    }
                  />
                </div>

                {newBook.price && Number(newBook.price) > 0 && (
                  <div style={styles.royaltyPreview}>
                    <div>
                      <span style={styles.royaltyLabel}>
                        Author royalty
                      </span>
                      <strong style={styles.royaltyValue}>
                        {money(royalty(newBook.price))}
                      </strong>
                    </div>

                    <div style={styles.royaltyDivider} />

                    <div>
                      <span style={styles.royaltyLabel}>
                        Platform allocation
                      </span>
                      <strong style={styles.royaltyPlatformValue}>
                        {money(platformFee(newBook.price))}
                      </strong>
                    </div>

                    <div style={styles.royaltyRate}>
                      70 / 30
                    </div>
                  </div>
                )}

                <Textarea
                  label="Book description / synopsis"
                  required
                  rows={6}
                  placeholder="Provide a clear overview of the book, its audience and what readers will learn."
                  value={newBook.description}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      description: e.target.value,
                    })
                  }
                />

                <div style={styles.formSectionHeading}>
                  <div style={styles.formSectionNumber}>02</div>

                  <div>
                    <h2 style={styles.cardTitle}>Publication assets</h2>
                    <p style={styles.cardDescription}>
                      Upload the cover and digital book file.
                    </p>
                  </div>
                </div>

                <div
                  className="author-form-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <FileUpload
                    title="Book cover"
                    description="PNG, JPG or WEBP"
                    accept="image/*"
                    onChange={(file) =>
                      setNewBook({
                        ...newBook,
                        coverImage: file,
                      })
                    }
                  />

                  <FileUpload
                    title="Digital book file"
                    description="PDF or EPUB"
                    accept=".pdf,.epub"
                    onChange={(file) =>
                      setNewBook({
                        ...newBook,
                        bookFile: file,
                      })
                    }
                  />
                </div>

                <div style={styles.reviewNotice}>
                  <div style={styles.reviewNoticeIcon}>!</div>

                  <div>
                    <strong>Before you submit</strong>

                    <ul
                      style={{
                        margin: "7px 0 0 18px",
                        padding: 0,
                        color: COLORS.muted,
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      <li>
                        Your publication will enter the administration review
                        queue.
                      </li>
                      <li>
                        It will not appear publicly until approved.
                      </li>
                      <li>
                        You may be asked to make changes before publication.
                      </li>
                    </ul>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 8,
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={() => navigate("dashboard")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={uploadingBook}>
                    {uploadingBook
                      ? "Submitting publication..."
                      : "Submit for Review"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ANALYTICS */}

          {viewMode === "analytics" && (
            <>
              <div
                className="author-stats-grid"
                style={styles.statsGrid}
              >
                <StatCard
                  label="Gross revenue"
                  value={money(grossRevenue)}
                  description="Before royalty split"
                  icon="chart"
                  color={COLORS.blue}
                />

                <StatCard
                  label="Your earnings"
                  value={money(authorRevenue)}
                  description="70% author share"
                  icon="money"
                  color={COLORS.primary}
                />

                <StatCard
                  label="Units sold"
                  value={totalSales}
                  description="Across all publications"
                  icon="book"
                  color={COLORS.purple}
                />

                <StatCard
                  label="Average book price"
                  value={
                    books.length
                      ? money(
                          books.reduce(
                            (sum, book) => sum + Number(book.price),
                            0
                          ) / books.length
                        )
                      : "$0.00"
                  }
                  description="Current catalog average"
                  icon="chart"
                  color={COLORS.amber}
                />
              </div>

              <Card style={{ padding: 24, marginTop: 20 }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Revenue overview
                    </h2>
                    <p style={styles.cardDescription}>
                      Your current catalog revenue and royalty position.
                    </p>
                  </div>

                  <span style={styles.periodBadge}>
                    70% Author / 30% Platform
                  </span>
                </div>

                <div style={styles.largeChart}>
                  {[35, 48, 44, 67, 58, 76, 88, 73, 94, 82, 90, 97].map(
                    (height, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "65%",
                            maxWidth: 42,
                            height: `${height}%`,
                            background:
                              index === 11
                                ? COLORS.primary
                                : "linear-gradient(180deg,#4ade80,#bbf7d0)",
                            borderRadius: "7px 7px 2px 2px",
                          }}
                        />
                      </div>
                    )
                  )}
                </div>

                <div style={styles.chartMonths}>
                  {[
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                  ].map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </Card>

              <Card style={{ marginTop: 20, overflow: "hidden" }}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Performance by publication
                    </h2>
                    <p style={styles.cardDescription}>
                      Compare sales and earnings across your books.
                    </p>
                  </div>
                </div>

                <div className="author-responsive-table">
                  <table
                    className="author-table"
                    style={styles.table}
                  >
                    <thead>
                      <tr>
                        <th style={styles.th}>Book</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Units</th>
                        <th style={styles.th}>Gross revenue</th>
                        <th style={styles.th}>Your earnings</th>
                      </tr>
                    </thead>

                    <tbody>
                      {books.map((book) => {
                        const gross = book.price * book.sales;

                        return (
                          <tr key={book.id}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 700 }}>
                                {book.title}
                              </div>
                              <div
                                style={{
                                  color: COLORS.muted,
                                  fontSize: 11,
                                  marginTop: 3,
                                }}
                              >
                                {book.category}
                              </div>
                            </td>

                            <td style={styles.td}>
                              <StatusBadge status={book.status} />
                            </td>

                            <td style={styles.td}>
                              {money(book.price)}
                            </td>

                            <td style={styles.td}>
                              {book.sales}
                            </td>

                            <td style={styles.td}>
                              {money(gross)}
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                color: COLORS.primary,
                                fontWeight: 800,
                              }}
                            >
                              {money(royalty(gross))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* PAYOUTS */}

          {viewMode === "payouts" && (
            <>
              <div
                className="author-stats-grid"
                style={styles.statsGrid}
              >
                <StatCard
                  label="Available balance"
                  value="$412.50"
                  description="Scheduled for next payout"
                  icon="money"
                  color={COLORS.primary}
                />

                <StatCard
                  label="Total paid"
                  value={money(
                    payoutHistory.reduce(
                      (sum, payout) => sum + payout.author,
                      0
                    )
                  )}
                  description="Completed author payouts"
                  icon="chart"
                  color={COLORS.blue}
                />

                <StatCard
                  label="Royalty rate"
                  value="70%"
                  description="Current author agreement"
                  icon="money"
                  color={COLORS.purple}
                />

                <StatCard
                  label="Next payout"
                  value="Sep 01"
                  description="Estimated scheduled date"
                  icon="chart"
                  color={COLORS.amber}
                />
              </div>

              <Card style={{ marginTop: 20, padding: 24 }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Royalty agreement
                    </h2>

                    <p style={styles.cardDescription}>
                      Your earnings are calculated consistently using the
                      platform royalty structure.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      alert(
                        "In production, this button should download a real CSV statement."
                      )
                    }
                  >
                    <Icon name="download" size={15} />
                    Export statement
                  </Button>
                </div>

                <div style={styles.splitBox}>
                  <div style={{ flex: 7 }}>
                    <div style={styles.splitBarAuthor}>
                      70% Author
                    </div>
                  </div>

                  <div style={{ flex: 3 }}>
                    <div style={styles.splitBarPlatform}>
                      30% Platform
                    </div>
                  </div>
                </div>

                <div style={styles.splitExplanation}>
                  <div>
                    <strong>Author earnings</strong>
                    <p>
                      70% of eligible book-sale revenue is allocated to the
                      author.
                    </p>
                  </div>

                  <div>
                    <strong>Platform allocation</strong>
                    <p>
                      30% is allocated according to your platform agreement.
                    </p>
                  </div>
                </div>
              </Card>

              <Card style={{ marginTop: 20, overflow: "hidden" }}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Payout history
                    </h2>
                    <p style={styles.cardDescription}>
                      Your completed author disbursements.
                    </p>
                  </div>
                </div>

                <div className="author-responsive-table">
                  <table
                    className="author-table"
                    style={styles.table}
                  >
                    <thead>
                      <tr>
                        <th style={styles.th}>Reference</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Method</th>
                        <th style={styles.th}>Gross</th>
                        <th style={styles.th}>Author 70%</th>
                        <th style={styles.th}>Platform 30%</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payoutHistory.map((payout) => (
                        <tr key={payout.id}>
                          <td style={{ ...styles.td, fontWeight: 800 }}>
                            {payout.id}
                          </td>

                          <td style={styles.td}>
                            {payout.date}
                          </td>

                          <td style={styles.td}>
                            {payout.method}
                          </td>

                          <td style={styles.td}>
                            {money(payout.gross)}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              color: COLORS.primary,
                              fontWeight: 800,
                            }}
                          >
                            {money(payout.author)}
                          </td>

                          <td style={styles.td}>
                            {money(payout.platform)}
                          </td>

                          <td style={styles.td}>
                            <StatusBadge status={payout.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* COUPONS */}

          {viewMode === "coupons" && (
            <>
              <Card style={{ padding: 24 }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Create promotional coupon
                    </h2>

                    <p style={styles.cardDescription}>
                      Give your students and readers a special discount.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleCouponSubmit}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr .8fr 1.8fr auto",
                    gap: 12,
                    alignItems: "end",
                    marginTop: 20,
                  }}
                  className="author-form-grid"
                >
                  <Input
                    label="Coupon code"
                    required
                    placeholder="SCHOLAR25"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />

                  <div>
                    <label style={styles.label}>Discount</label>

                    <select
                      value={newCoupon.discount}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discount: e.target.value,
                        })
                      }
                      style={styles.selectFull}
                    >
                      <option value="10">10% off</option>
                      <option value="15">15% off</option>
                      <option value="20">20% off</option>
                      <option value="25">25% off</option>
                      <option value="50">50% off</option>
                      <option value="100">100% free</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Applicable publication</label>

                    <select
                      value={newCoupon.bookTitle}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          bookTitle: e.target.value,
                        })
                      }
                      style={styles.selectFull}
                    >
                      <option value="All Books">All Books</option>

                      {books.map((book) => (
                        <option key={book.id} value={book.title}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit">
                    Generate
                  </Button>
                </form>
              </Card>

              <Card
                style={{
                  marginTop: 20,
                  overflow: "hidden",
                }}
              >
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Your promotional codes
                    </h2>

                    <p style={styles.cardDescription}>
                      Manage and monitor your active offers.
                    </p>
                  </div>
                </div>

                <div className="author-responsive-table">
                  <table
                    className="author-table"
                    style={styles.table}
                  >
                    <thead>
                      <tr>
                        <th style={styles.th}>Code</th>
                        <th style={styles.th}>Discount</th>
                        <th style={styles.th}>Applicable book</th>
                        <th style={styles.th}>Redemptions</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td
                            style={{
                              ...styles.td,
                              color: COLORS.primary,
                              fontWeight: 800,
                              letterSpacing: ".5px",
                            }}
                          >
                            {coupon.code}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 800,
                            }}
                          >
                            {coupon.discount}%
                          </td>

                          <td style={styles.td}>
                            {coupon.bookTitle}
                          </td>

                          <td style={styles.td}>
                            {coupon.uses}
                          </td>

                          <td style={styles.td}>
                            <StatusBadge status={coupon.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* PROFILE */}

          {viewMode === "profile" && (
            <Card style={{ padding: 28 }}>
              <form
                onSubmit={handleProfileSave}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                <div style={styles.profileHero}>
                  <div style={styles.profileAvatar}>
                    {formData.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        color: COLORS.navy,
                        fontSize: 19,
                        fontWeight: 800,
                      }}
                    >
                      {formData.name}
                    </h2>

                    <div
                      style={{
                        color: COLORS.primary,
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      {formData.specialty}
                    </div>

                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Verified Ilm-Hub Author
                    </div>
                  </div>
                </div>

                <div style={styles.formSectionHeading}>
                  <div style={styles.formSectionNumber}>01</div>

                  <div>
                    <h2 style={styles.cardTitle}>
                      Public author profile
                    </h2>

                    <p style={styles.cardDescription}>
                      This information may appear alongside your books.
                    </p>
                  </div>
                </div>

                <div
                  className="author-form-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Input
                    label="Full name / professional title"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Academic specialization"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialty: e.target.value,
                      })
                    }
                  />
                </div>

                <Textarea
                  label="Professional biography"
                  rows={6}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bio: e.target.value,
                    })
                  }
                />

                <div style={styles.formSectionHeading}>
                  <div style={styles.formSectionNumber}>02</div>

                  <div>
                    <h2 style={styles.cardTitle}>
                      Account information
                    </h2>

                    <p style={styles.cardDescription}>
                      Your registered email address.
                    </p>
                  </div>
                </div>

                <Input
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button type="submit">
                    Save profile changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SETTINGS */}

          {viewMode === "settings" && (
            <Card style={{ padding: 28 }}>
              <form
                onSubmit={handleProfileSave}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                <div style={styles.formSectionHeading}>
                  <div style={styles.formSectionNumber}>01</div>

                  <div>
                    <h2 style={styles.cardTitle}>
                      Payout destination
                    </h2>

                    <p style={styles.cardDescription}>
                      Choose where your author earnings should be sent.
                    </p>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>
                    Preferred payout method
                  </label>

                  <select
                    value={formData.payoutMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payoutMethod: e.target.value,
                      })
                    }
                    style={styles.selectFull}
                  >
                    <option value="Mobile Money">
                      Mobile Money
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                  </select>
                </div>

                {formData.payoutMethod === "Mobile Money" ? (
                  <div
                    className="author-form-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 18,
                      background: COLORS.primarySoft,
                      border: `1px solid ${COLORS.primaryBorder}`,
                      borderRadius: 12,
                      padding: 18,
                    }}
                  >
                    <div>
                      <label style={styles.label}>
                        Mobile Money provider
                      </label>

                      <select
                        value={formData.momoNetwork}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            momoNetwork: e.target.value,
                          })
                        }
                        style={styles.selectFull}
                      >
                        <option>MTN Mobile Money</option>
                        <option>Telecel Cash</option>
                        <option>AirtelTigo Money</option>
                      </select>
                    </div>

                    <Input
                      label="Mobile Money number"
                      value={formData.momoNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          momoNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div
                    className="author-form-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 18,
                      background: COLORS.background,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 12,
                      padding: 18,
                    }}
                  >
                    <Input
                      label="Bank name"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankName: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Account number / IBAN"
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div style={styles.securityBox}>
                  <div style={styles.securityIcon}>
                    <Icon name="lock" size={17} />
                  </div>

                  <div>
                    <strong>Payment information security</strong>

                    <p>
                      Financial details should be securely stored and
                      encrypted by your backend. Never rely on frontend state
                      for financial security.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button type="submit">
                    Save payment settings
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| BOOK ROW
|--------------------------------------------------------------------------
*/

function BookRow({ book, last }) {
  return (
    <div
      className="author-book-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: 20,
        borderBottom: last ? "none" : `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 15,
          minWidth: 0,
          alignItems: "center",
        }}
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          style={{
            width: 58,
            height: 76,
            borderRadius: 8,
            objectFit: "cover",
            background: "#e2e8f0",
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={styles.categoryBadge}>
              {book.category}
            </span>

            <StatusBadge status={book.status} />
          </div>

          <h3
            style={{
              margin: "7px 0 5px",
              color: COLORS.navy,
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {book.title}
          </h3>

          <div
            style={{
              display: "flex",
              gap: 15,
              flexWrap: "wrap",
              color: COLORS.muted,
              fontSize: 12,
            }}
          >
            <span>
              Published: {book.publishDate}
            </span>

            <span>
              Price: {money(book.price)}
            </span>

            <span>
              Sales: {book.sales}
            </span>

            <span
              style={{
                color: COLORS.primary,
                fontWeight: 700,
              }}
            >
              Your share: {money(royalty(book.price))}
            </span>
          </div>
        </div>
      </div>

      <div
        className="author-book-actions"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        {book.status === "Published" ? (
          <span
            style={{
              color: COLORS.primary,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            ● Live in store
          </span>
        ) : (
          <span
            style={{
              color: COLORS.amber,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            ● Awaiting review
          </span>
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FILE UPLOAD
|--------------------------------------------------------------------------
*/

function FileUpload({
  title,
  description,
  accept,
  onChange,
}) {
  const [fileName, setFileName] = useState("");

  return (
    <label
      style={{
        display: "block",
        border: "1.5px dashed #cbd5e1",
        borderRadius: 12,
        padding: 22,
        background: COLORS.background,
        cursor: "pointer",
        transition: "all .2s ease",
      }}
    >
      <input
        type="file"
        accept={accept}
        required
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            setFileName(file.name);
            onChange(file);
          }
        }}
      />

      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.primary,
          marginBottom: 12,
        }}
      >
        <Icon name="download" size={18} />
      </div>

      <div
        style={{
          color: COLORS.navy,
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: COLORS.muted,
          fontSize: 12,
          marginTop: 4,
        }}
      >
        {fileName || `Click to choose a file · ${description}`}
      </div>

      {fileName && (
        <div
          style={{
            color: COLORS.primary,
            fontSize: 12,
            fontWeight: 700,
            marginTop: 9,
          }}
        >
          ✓ File selected
        </div>
      )}
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({ title, description }) {
  return (
    <div
      style={{
        padding: "70px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: COLORS.background,
          color: COLORS.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 15px",
        }}
      >
        <Icon name="book" size={22} />
      </div>

      <h3
        style={{
          margin: 0,
          color: COLORS.navy,
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: COLORS.muted,
          fontSize: 13,
          margin: "7px auto 0",
          maxWidth: 400,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = {
  portal: {
    minHeight: "100vh",
    background: COLORS.background,
    color: COLORS.text,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    position: "fixed",
    zIndex: 100,
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    background: "#0b1f16",
    borderRight: "1px solid rgba(255,255,255,.06)",
    transition: "transform .25s ease",
    display: "flex",
    flexDirection: "column",
  },

  sidebarLogo: {
    height: 76,
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: 11,
    borderBottom: "1px solid rgba(255,255,255,.07)",
  },

  sidebarLogoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1,
  },

  sidebarSection: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    padding: "0 12px 8px",
  },

  sidebarItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    gap: 11,
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  sidebarItemActive: {
    background: "rgba(74,222,128,.1)",
    color: "#86efac",
  },

  sidebarCount: {
    marginLeft: "auto",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: "#92400e",
    color: "#fff",
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  sidebarBottom: {
    marginTop: "auto",
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,.07)",
  },

  sidebarAuthorCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    background: "rgba(255,255,255,.04)",
    borderRadius: 10,
    marginBottom: 8,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#166534",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    flexShrink: 0,
  },

  signOutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "9px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },

  main: {
    marginLeft: 250,
    minHeight: "100vh",
  },

  topbar: {
    height: 76,
    background: "#fff",
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 12,
    color: COLORS.muted,
  },

  topProfile: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  topAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
  },

  iconButton: {
    position: "relative",
    border: "none",
    background: "transparent",
    color: COLORS.muted,
    cursor: "pointer",
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  notificationDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#dc2626",
    top: 6,
    right: 6,
  },

  mobileMenuButton: {
    display: "none",
    border: "none",
    background: "transparent",
    color: COLORS.text,
    cursor: "pointer",
    marginRight: 12,
  },

  mobileOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.4)",
    zIndex: 90,
  },

  content: {
    maxWidth: 1250,
    margin: "0 auto",
    padding: "30px 28px 50px",
  },

  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 25,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.1,
    marginBottom: 7,
  },

  pageTitle: {
    color: COLORS.navy,
    fontSize: 27,
    fontWeight: 850,
    letterSpacing: "-.7px",
    margin: 0,
  },

  pageDescription: {
    color: COLORS.muted,
    fontSize: 13,
    margin: "7px 0 0",
    lineHeight: 1.5,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: 18,
    marginTop: 20,
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 15,
  },

  cardTitle: {
    margin: 0,
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: 800,
  },

  cardDescription: {
    margin: "5px 0 0",
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 1.5,
  },

  periodBadge: {
    padding: "5px 9px",
    borderRadius: 7,
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  chartArea: {
    height: 190,
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 25,
    borderBottom: `1px solid ${COLORS.border}`,
    marginTop: 20,
  },

  chartSummary: {
    display: "flex",
    gap: 45,
    marginTop: 18,
  },

  chartSummaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 4,
  },

  chartSummaryValue: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: 800,
  },

  sectionHeader: {
    padding: "20px 22px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
  },

  quickAction: {
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 700,
    textAlign: "left",
  },

  quickActionIcon: {
    width: 31,
    height: 31,
    borderRadius: 8,
    background: COLORS.primarySoft,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  categoryBadge: {
    display: "inline-flex",
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    borderRadius: 5,
    padding: "3px 7px",
    fontSize: 10,
    fontWeight: 800,
  },

  searchBox: {
    height: 38,
    width: 210,
    border: `1px solid #cbd5e1`,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "0 10px",
    color: COLORS.muted,
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 12,
    color: COLORS.navy,
  },

  select: {
    height: 38,
    border: `1px solid #cbd5e1`,
    borderRadius: 8,
    background: "#fff",
    padding: "0 10px",
    color: COLORS.text,
    fontSize: 12,
    outline: "none",
  },

  selectFull: {
    width: "100%",
    boxSizing: "border-box",
    height: 43,
    border: `1px solid #cbd5e1`,
    borderRadius: 9,
    background: "#fff",
    padding: "0 12px",
    color: COLORS.text,
    fontSize: 13,
    outline: "none",
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 7,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "11px 13px",
    fontSize: 14,
    color: COLORS.navy,
    outline: "none",
    background: "#fff",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  linkButton: {
    border: "none",
    background: "transparent",
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },

  formSectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingTop: 5,
  },

  formSectionNumber: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 900,
  },

  royaltyPreview: {
    display: "flex",
    alignItems: "center",
    gap: 25,
    padding: 17,
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    borderRadius: 11,
  },

  royaltyLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 3,
  },

  royaltyValue: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: 800,
  },

  royaltyPlatformValue: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: 800,
  },

  royaltyDivider: {
    width: 1,
    height: 35,
    background: COLORS.primaryBorder,
  },

  royaltyRate: {
    marginLeft: "auto",
    background: COLORS.primary,
    color: "#fff",
    padding: "7px 10px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 800,
  },

  reviewNotice: {
    display: "flex",
    gap: 12,
    padding: 15,
    background: COLORS.amberSoft,
    border: "1px solid #fde68a",
    borderRadius: 10,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 1.5,
  },

  reviewNoticeIcon: {
    width: 23,
    height: 23,
    borderRadius: "50%",
    background: "#fef3c7",
    color: COLORS.amber,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    flexShrink: 0,
  },

  splitBox: {
    display: "flex",
    gap: 5,
    marginTop: 22,
    height: 42,
  },

  splitBarAuthor: {
    height: "100%",
    background: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px 3px 3px 9px",
    fontSize: 12,
    fontWeight: 800,
  },

  splitBarPlatform: {
    height: "100%",
    background: "#cbd5e1",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "3px 9px 9px 3px",
    fontSize: 12,
    fontWeight: 800,
  },

  splitExplanation: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30,
    marginTop: 20,
    paddingTop: 18,
    borderTop: `1px solid ${COLORS.border}`,
  },

  largeChart: {
    height: 280,
    marginTop: 25,
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "20px 10px 0",
  },

  chartMonths: {
    display: "flex",
    justifyContent: "space-between",
    color: COLORS.lightMuted,
    fontSize: 10,
    padding: "9px 10px 0",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 13,
  },

  th: {
    padding: "13px 18px",
    background: COLORS.background,
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".5px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 18px",
    borderBottom: `1px solid #f1f5f9`,
    color: COLORS.text,
    whiteSpace: "nowrap",
  },

  profileHero: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 18,
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
  },

  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
    flexShrink: 0,
  },

  securityBox: {
    display: "flex",
    gap: 12,
    padding: 15,
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    color: COLORS.text,
    fontSize: 12,
  },

  securityIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "#fff",
    color: COLORS.primary,
    border: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  authPage: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(34,197,94,.08), transparent 35%), #f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "35px 18px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 13,
    background: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 1,
    boxShadow: "0 8px 20px rgba(20,83,45,.18)",
  },

  authTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: `1px solid ${COLORS.border}`,
    marginBottom: 25,
  },

  authTab: {
    border: "none",
    background: "transparent",
    color: COLORS.muted,
    padding: "12px 8px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },

  authTabActive: {
    color: COLORS.primary,
    borderBottom: `2px solid ${COLORS.primary}`,
  },

  formTitle: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: 800,
    margin: 0,
  },

  formDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 1.6,
    margin: "6px 0 0",
  },

  errorBox: {
    background: COLORS.redSoft,
    border: "1px solid #fecaca",
    color: COLORS.red,
    padding: 12,
    borderRadius: 9,
    fontSize: 12,
    marginBottom: 18,
    lineHeight: 1.5,
  },

  infoBox: {
    background: COLORS.blueSoft,
    border: "1px solid #bae6fd",
    color: COLORS.blue,
    padding: 13,
    borderRadius: 9,
    fontSize: 12,
    lineHeight: 1.5,
  },

  securityNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    color: COLORS.lightMuted,
    fontSize: 11,
    marginTop: 2,
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: COLORS.primary,
    padding: 0,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 22,
  },

  successCard: {
    width: "100%",
    maxWidth: 560,
    padding: 42,
    textAlign: "center",
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
    fontSize: 28,
    fontWeight: 800,
  },

  successTitle: {
    color: COLORS.navy,
    fontSize: 27,
    fontWeight: 850,
    margin: "0 0 10px",
  },

  successText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
  },

  successNotice: {
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 1.6,
    marginTop: 20,
    textAlign: "left",
  },

  successBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginBottom: 18,
    background: COLORS.primarySoft,
    border: `1px solid ${COLORS.primaryBorder}`,
    borderRadius: 10,
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 1.5,
  },

  successBannerIcon: {
    width: 23,
    height: 23,
    borderRadius: "50%",
    background: COLORS.primary,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    flexShrink: 0,
  },

  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginBottom: 18,
    background: COLORS.redSoft,
    border: "1px solid #fecaca",
    borderRadius: 10,
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 1.5,
  },

  dismissButton: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "currentColor",
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
  },
};
