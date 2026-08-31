export const dynamic = 'force-dynamic';


import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/account");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      items: {
        include: {
          book: true,
        },
      },
      payments: true,
    },
  });

  return (
    <main style={page}>
      <div style={container}>
        <div style={header}>
          <div>
            <h1 style={title}>Orders</h1>
            <p style={muted}>
              Manage customer orders and payment status.
            </p>
          </div>

          <a href="/admin" style={back}>
            ← Admin Dashboard
          </a>
        </div>

        {orders.length === 0 ? (
          <div style={empty}>
            <h2>No orders yet</h2>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div style={ordersBox}>
            {orders.map((order) => (
              <div key={order.id} style={orderCard}>
                <div style={topRow}>
                  <div>
                    <strong style={orderNumber}>
                      #{order.orderNumber}
                    </strong>

                    <p style={muted}>
                      {order.user?.name || "Customer"}
                    </p>

                    <p style={muted}>
                      {order.user?.email || ""}
                    </p>
                  </div>

                  <div style={amount}>
                    ${Number(order.totalUSD).toFixed(2)}
                  </div>
                </div>

                <div style={details}>
                  <div>
                    <strong>Order Status</strong>
                    <span>{order.status}</span>
                  </div>

                  <div>
                    <strong>Payment Status</strong>
                    <span>{order.paymentStatus}</span>
                  </div>

                  <div>
                    <strong>Payment Method</strong>
                    <span>{order.paymentMethod}</span>
                  </div>

                  <div>
                    <strong>Currency</strong>
                    <span>{order.currencyCode}</span>
                  </div>

                  <div>
                    <strong>Created</strong>
                    <span>
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={items}>
                  <strong>Items</strong>

                  {order.items.map((item) => (
                    <div key={item.id} style={itemRow}>
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
                  <div style={reference}>
                    Payment Reference: {order.paymentRef}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "40px 20px",
  fontFamily: "Inter, sans-serif",
};

const container = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "30px",
};

const title = {
  color: "#14532d",
  fontFamily: "Georgia, serif",
  fontSize: "38px",
  margin: 0,
};

const muted = {
  color: "#64748b",
};

const back = {
  color: "#14532d",
  textDecoration: "none",
  fontWeight: "700",
};

const empty = {
  background: "#fff",
  borderRadius: "14px",
  padding: "60px",
  textAlign: "center",
  color: "#64748b",
};

const ordersBox = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const orderCard = {
  background: "#fff",
  borderRadius: "14px",
  padding: "25px",
  boxShadow: "0 4px 20px rgba(0,0,0,.06)",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: "18px",
};

const orderNumber = {
  color: "#14532d",
  fontSize: "20px",
};

const amount = {
  color: "#14532d",
  fontSize: "22px",
  fontWeight: "800",
};

const details = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: "18px",
  padding: "20px 0",
};

const items = {
  borderTop: "1px solid #e2e8f0",
  paddingTop: "18px",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  color: "#475569",
};

const reference = {
  marginTop: "15px",
  padding: "12px",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: "8px",
  fontSize: "13px",
};
