import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, refreshCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = cart.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <div className="container" style={{ maxWidth: 720, paddingBottom: 64 }}>
      <h2 className="page-title">Your Cart</h2>

      {items.length === 0 && (
        <div className="state">
          <h3>Your cart is empty</h3>
          <p>Add something you like and it'll show up here.</p>
          <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>Continue shopping</Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="card">
            {items.map((item) => (
              <div className="cart-item" key={item.product._id}>
                <img
                  src={item.product.imageUrl || "https://placehold.co/100x100?text=No+Image"}
                  alt={item.product.name}
                />
                <div style={{ flex: 1 }}>
                  <b>{item.product.name}</b>
                  <p className="price">₹{Number(item.product.price).toLocaleString("en-IN")}</p>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                </div>
                <button className="danger" onClick={() => removeFromCart(item.product._id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="summary-row total">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button style={{ width: "100%", marginTop: 14 }} onClick={() => navigate("/checkout")}>
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;