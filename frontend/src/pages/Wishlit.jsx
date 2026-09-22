import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = () => {
    setStatus("loading");
    api.get("/auth/wishlist").then(({ data }) => { setProducts(data); setStatus("ready"); }).catch(() => setStatus("error"));
  };
  useEffect(load, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h2 className="page-title">My Wishlist</h2>
      {status === "ready" && products.length === 0 && (
        <div className="state">
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>Browse products</Link>
        </div>
      )}
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} onAdd={(prod) => addToCart(prod._id, 1)} />
        ))}
      </div>
    </div>
  );
}