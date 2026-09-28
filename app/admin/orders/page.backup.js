import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApproveOrderButton from "./ApproveOrderButton";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/account?next=/admin/orders");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          book: {
            select: {
              id: true,
              titleEn: true,
              titleAr: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "PAID"
  );

  const activatedOrders = orders.filter(
    (order) => order.status === "ACTIVATED"
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <div style={styles.badge}>ADMIN PANEL</div>

            <h1 style={styles.title}>
              Book Orders
            </h1>

            <p style={styles.subtitle}>
              Review customer book purchases, confirm payments,
              and activate purchased book access.
            </p>
          </div>

          <a href="/admin" style={styles.back}>
            ← Admin Dashboard
          </a>
        </div>

        <div style={styles.summary}>

          <div style={styles.summaryCard}>
            <strong>{orders.length}</strong>
            <span>Total Orders</span>
          </div>

          <div style={styles.summaryCard}>
            <strong>{paidOrders.length}</strong>
            <span>Paid Orders</span>
          </div>

          <div style={styles.summaryCard}>
            <strong>{activatedOrders.length}</strong>
            <span>Activated</span>
          </div>

        </div>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <h2>No customer orders yet</h2>
            <p>
              Customer book purchases will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.orders}>

            {orders.map((order) => {

              const paid =
                order.paymentStatus === "PAID";

              const activated =
                order.status === "ACTIVATED";

              const canApprove =
                paid &&
                !activated &&
                !["COMPLETED", "REJECTED"].includes(
                  order.status
                );

              return (
                <section
                  key={order.id}
                  style={styles.card}
                >

                  <div style={styles.cardHeader}>

                    <div>
                      <div style={styles.orderNumber}>
                        #{order.orderNumber}
                      </div>

                      <div style={styles.customer}>
                        {order.user?.name || "Customer"}
                      </div>

                      <div style={styles.email}>
                        {order.user?.email || ""}
                      </div>
                    </div>

                    <div style={styles.total}>
                      ${Number(order.totalUSD).toFixed(2)}
                    </div>

                  </div>

                  <div style={styles.grid}>

                    <Info
                      label="Payment"
                      value={order.paymentStatus}
                      color={
                        paid
                          ? "#166534"
                          : "#92400e"
                      }
                    />

                    <Info
                      label="Order Status"
                      value={order.status}
                      color={
                        activated
                          ? "#166534"
                          : "#92400e"
                      }
                    />

                    <Info
                      label="Payment Method"
                      value={order.paymentMethod}
                    />

                    <Info
                      label="Currency"
                      value={order.currencyCode}
                    />

                    <Info
                      label="Created"
                      value={new Date(
                        order.createdAt
                      ).toLocaleString()}
                    />

                  </div>

                  <div style={styles.items}>

                    <h3>Books Purchased</h3>

                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={styles.item}
                      >
                        <span>
                          {item.book?.titleEn || "Book"}
                        </span>

                        <span>
                          × {item.quantity}
                        </span>

                        <span>
                          ${Number(item.priceUSD).toFixed(2)}
                        </span>
                      </div>
                    ))}

                  </div>

                  {order.paymentRef && (
                    <div style={styles.reference}>
                      Payment Reference: {order.paymentRef}
                    </div>
                  )}

                  <div style={styles.actionRow}>

                    {activated ? (
                      <span style={styles.activated}>
                        ✓ BOOK ACCESS ACTIVATED
                      </span>
                    ) : canApprove ? (
                      <ApproveOrderButton
                        orderId={order.id}
                      />
                    ) : (
                      <span style={styles.waiting}>
                        Waiting for payment confirmation
                      </span>
                    )}

                  </div>

                </section>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

function Info({ label, value, color }) {
  return (
    <div style={styles.info}>
      <span>{label}</span>

      <strong
        style={{
          color: color || "#14532d",
        }}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px 20px",
    fontFamily: "Inter, Arial, sans-serif",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  badge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    color: "#14532d",
    fontFamily: "Georgia, serif",
    fontSize: "38px",
  },

  subtitle: {
    color: "#64748b",
    marginTop: "8px",
    lineHeight: 1.6,
  },

  back: {
    color: "#166534",
    fontWeight: "700",
    textDecoration: "none",
  },

  summary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "30px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  orders: {
    display: "grid",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: "18px",
    padding: "26px",
    boxShadow:
      "0 10px 30px rgba(6, 78, 59, 0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "22px",
  },

  orderNumber: {
    color: "#166534",
    fontWeight: "800",
    fontSize: "16px",
  },

  customer: {
    marginTop: "7px",
    color: "#14532d",
    fontWeight: "800",
    fontSize: "20px",
  },

  email: {
    marginTop: "3px",
    color: "#64748b",
    fontSize: "13px",
  },

  total: {
    color: "#166534",
    fontSize: "24px",
    fontWeight: "800",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "22px",
  },

  info: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  items: {
    borderTop: "1px solid #dcfce7",
    paddingTop: "18px",
  },

  item: {
    display: "grid",
    gridTemplateColumns:
      "1fr auto auto",
    gap: "20px",
    padding: "10px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  reference: {
    marginTop: "16px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
    color: "#64748b",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  actionRow: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #dcfce7",
  },

  activated: {
    color: "#166534",
    fontWeight: "800",
  },

  waiting: {
    color: "#92400e",
    fontWeight: "700",
  },

  empty: {
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: "18px",
    padding: "50px",
    textAlign: "center",
  },
};
