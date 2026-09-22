import { getImage } from "../components/ProductCard";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [related, setRelated] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  const loadProduct = () => {
    setStatus("loading");
    api.get(`/products/${id}`).then(({ data }) => { setProduct(data.product || data); setStatus("ready"); }).catch(() => setStatus("error"));
  };
  useEffect(loadProduct, [id]);

  useEffect(() => {
    if (!product?.category) return;
    api.get("/products").then(({ data }) => {
      const list = Array.isArray(data) ? data : data.products || [];
      setRelated(list.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 4));
    }).catch(() => {});
  }, [product]);

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

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMsg("");
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      loadProduct();
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Could not submit review");
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
  const alreadyReviewed = user && product.reviews?.some((r) => (r.user?._id || r.user) === user._id);

  return (
    <>
      <main className="container detail">
        <div className="detail-img">{img && <img src={img} alt={product.name} />}</div>
        <div className="detail-info">
          <span className="card-cat">{product.category}</span>
          <h1>{product.name}</h1>
          {product.rating > 0 && <span className="rating">★ {Number(product.rating).toFixed(1)} ({product.numReviews} reviews)</span>}
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

      <section className="container reviews-section">
        <h2>Reviews ({product.numReviews || 0})</h2>

        {product.reviews?.length > 0 ? (
          <div className="reviews-list">
            {product.reviews.map((r) => (
              <div className="review-card" key={r._id}>
                <div className="review-head">
                  <b>{r.name}</b>
                  <span className="rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p>{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)" }}>No reviews yet. Be the first to review this product.</p>
        )}

        {user && user.role !== "seller" && !alreadyReviewed && (
          <form className="card review-form" onSubmit={submitReview}>
            <h3>Write a review</h3>
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </select>
            <textarea placeholder="Share your experience" rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            {reviewMsg && <p className="error-text">{reviewMsg}</p>}
            <button type="submit">Submit review</button>
          </form>
        )}
      </section>

      {related.length > 0 && (
        <section className="container related">
          <h2>You may also like</h2>
          <div className="grid">
            {related.map((p) => <ProductCard key={p._id} product={p} onAdd={(prod) => addToCart(prod._id, 1)} />)}
          </div>
        </section>
      )}
    </>
  );
}