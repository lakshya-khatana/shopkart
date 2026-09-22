import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import OrderTracker from "../components/OrderTracker";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => { setOrders(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="container" style={{ maxWidth: 720, paddingBottom: 64 }}>
      <h2 className="page-title">My Orders</h2>

      {status === "loading" && (
        <div className="card">
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line short" />
        </div>
      )}

      {status === "error" && (
        <div className="state">
          <h3>Couldn't load your orders</h3>
          <p>The server may be waking up. Please try again in a moment.</p>
        </div>
      )}

      {status === "ready" && orders.length === 0 && (
        <div className="state">
          <h3>No orders yet</h3>
          <p>Once you place an order, it'll show up here.</p>
          <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>Start shopping</Link>
        </div>
      )}

      {orders.map((order) => (
        <div className="card" key={order._id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>Order #{order._id.slice(-6).toUpperCase()}</b>
            <span className="status-pill">{order.status}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 12px" }}>
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
          {order.items.map((item, i) => (
            <div key={i} style={{ fontSize: 14, padding: "4px 0" }}>
              {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </div>
          ))}

          <OrderTracker status={order.status} />

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{Number(order.totalPrice).toLocaleString("en-IN")}</span>
          </div>
          <p style={{ fontSize: 13, marginTop: 8, fontWeight: 600, color: order.isPaid ? "#15803d" : "#b45309" }}>
            {order.isPaid ? "Paid" : "Payment pending"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Orders;