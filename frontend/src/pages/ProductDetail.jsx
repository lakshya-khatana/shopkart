import { getImage } from "../components/ProductCard";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setStatus("loading");
    api
      .get(`/products/${id}`)
      .then(({ data }) => { setProduct(data.product || data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, [id]);

  const handleAdd = async (goToCart) => {
    if (!user) return navigate("/login");
    if (user.role === "seller") return setMsg("Seller accounts can't shop. Log in as a customer.");
    try {
      await addToCart(product._id || product.id, qty);
      if (goToCart) navigate("/cart");
      else setMsg("Added to cart");
    } catch (e) {
      setMsg(e.response?.data?.message || "Couldn't add to cart. Try again.");
    }
  };

  if (status === "loading") return <main className="container"><div className="skeleton" style={{ height: 380, marginTop: 32 }} /></main>;
  if (status === "error" || !product)
    return (
      <main className="container">
        <div className="state">
          <h3>Product not found</h3>
          <p>It may have been removed, or the server is still waking up.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Back to shop</button>
        </div>
      </main>
    );

  const img = getImage(product);
  const stock = product.stock === undefined ? null : Number(product.stock);
  const outOfStock = stock !== null && stock <= 0;

  return (
    <main className="container detail">
      <div className="detail-img">{img && <img src={img} alt={product.name} />}</div>
      <div className="detail-info">
        <span className="card-cat">{product.category}</span>
        <h1>{product.name}</h1>
        {product.rating > 0 && <span className="rating">★ {Number(product.rating).toFixed(1)}</span>}
        <p className="detail-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
        {product.description && <p className="detail-desc">{product.description}</p>}
        <p className="detail-stock">{outOfStock ? "Out of stock" : stock !== null ? `${stock} in stock` : "In stock"}</p>

        {!outOfStock && (
          <div className="detail-actions">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => (stock ? Math.min(stock, q + 1) : q + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn btn-ghost" onClick={() => handleAdd(false)}>Add to cart</button>
            <button className="btn btn-primary" onClick={() => handleAdd(true)}>Buy now</button>
          </div>
        )}
        {msg && <p className="detail-msg" role="status">{msg}</p>}
      </div>
    </main>
  );
}