import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ line1: "", city: "", state: "", pincode: "", phone: "" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];
  const itemsPrice = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 40;
  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders/create-payment", { shippingAddress: address });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await api.post("/orders/verify-payment", { orderId: data.orderId });
      await refreshCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Could not start checkout");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="state">
          <h3>Your cart is empty</h3>
          <p>Add items to your cart before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560, paddingBottom: 64 }}>
      <h2 className="page-title">Checkout</h2>

      <div className="demo-banner">
        <span>⚠️</span>
        <span><strong>Demo mode:</strong> no real payment gateway is connected. Clicking "Pay" simulates a successful payment — no card or UPI details are charged.</span>
      </div>

      <form onSubmit={handlePayment}>
        <div className="card">
          <h3>Shipping address</h3>
          <input name="line1" placeholder="Address line" onChange={handleChange} required />
          <input name="city" placeholder="City" onChange={handleChange} required />
          <input name="state" placeholder="State" onChange={handleChange} required />
          <input name="pincode" placeholder="Pincode" onChange={handleChange} required />
          <input name="phone" placeholder="Phone number" onChange={handleChange} required />
        </div>

        <div className="card">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Items</span><span>₹{itemsPrice.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{taxPrice}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{totalPrice}</span></div>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={placing} style={{ width: "100%", marginTop: 14 }}>
            {placing ? "Processing..." : `Pay ₹${totalPrice}`}
          </button>
          <p className="helper-text">Demo mode — payment is simulated, no real gateway is charged.</p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;