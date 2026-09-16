import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
  };

  const handleAddToCart = async () => {
    await addToCart(id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      setReviewComment("");
      fetchProduct();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    }
  };

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <img
          src={product.imageUrl || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          style={{ width: 320, height: 320, objectFit: "cover", borderRadius: 10, background: "#eee" }}
        />
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2>{product.name}</h2>
          <div className="rating">
            {"★".repeat(Math.round(product.rating || 0))}
            {"☆".repeat(5 - Math.round(product.rating || 0))} ({product.numReviews} reviews)
          </div>
          <h1 className="price" style={{ marginTop: 10 }}>₹{product.price}</h1>
          <p>{product.description}</p>
          <p>Category: <b>{product.category}</b></p>
          <p>{product.stock > 0 ? `${product.stock} in stock` : <span className="error-text">Out of stock</span>}</p>

          {user?.role === "customer" && product.stock > 0 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                style={{ width: 70, marginBottom: 0 }}
              />
              <button onClick={handleAddToCart}>{added ? "Added! ✓" : "Add to Cart"}</button>
            </div>
          )}
          {!user && <p className="link-text">Login as a customer to add this to your cart.</p>}
        </div>
      </div>

      <div className="card">
        <h3>Reviews</h3>
        {product.reviews.length === 0 && <p>No reviews yet.</p>}
        {product.reviews.map((r, i) => (
          <div key={i} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
            <b>{r.name}</b> — {"★".repeat(r.rating)}
            <p style={{ margin: "4px 0 0" }}>{r.comment}</p>
          </div>
        ))}

        {user?.role === "customer" && (
          <form onSubmit={submitReview} style={{ marginTop: 16 }}>
            <h4>Write a review</h4>
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
              ))}
            </select>
            <textarea
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
