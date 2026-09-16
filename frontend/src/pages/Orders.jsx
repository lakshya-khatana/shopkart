import { useEffect, useState } from "react";
import api from "../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="container">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <div className="card" key={order._id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>Order #{order._id.slice(-6).toUpperCase()}</b>
            <span className="status-pill">{order.status}</span>
          </div>
          <p style={{ fontSize: 13, color: "#888" }}>
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
          {order.items.map((item, i) => (
            <div key={i} style={{ fontSize: 14, padding: "4px 0" }}>
              {item.name} × {item.quantity} — ₹{item.price * item.quantity}
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{order.totalPrice}</span>
          </div>
          <p style={{ fontSize: 13 }}>{order.isPaid ? "✅ Paid" : "⏳ Payment pending"}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
