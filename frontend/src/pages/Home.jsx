import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const PRICES = [
  { label: "Any price", test: () => true },
  { label: "Under ₹500", test: (p) => p < 500 },
  { label: "₹500 – ₹2,000", test: (p) => p >= 500 && p <= 2000 },
  { label: "Above ₹2,000", test: (p) => p > 2000 },
];

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const search = (params.get("search") || "").toLowerCase();

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [category, setCategory] = useState("All");
  const [priceIdx, setPriceIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const load = useCallback(() => {
    setStatus("loading");
    api
      .get("/products")
      .then(({ data }) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);
  useEffect(load, [load]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const visible = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      PRICES[priceIdx].test(Number(p.price)) &&
      (!search || p.name?.toLowerCase().includes(search))
  );

  const handleAdd = async (p) => {
    if (!user) return navigate("/login");
    if (user.role === "seller") return showToast("Seller accounts can't shop. Log in as a customer.", true);
    try {
      await addToCart(p._id || p.id, 1);
      showToast("Added to cart");
    } catch (e) {
      showToast(e.response?.data?.message || "Couldn't add to cart. Try again.", true);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>Everything you need, delivered to your door</h1>
          <p>Browse the catalogue, filter by category and price, and check out in a few taps.</p>
        </div>
      </section>

      <main className="container">
        <div className="toolbar">
          <div className="chips">
            {categories.map((c) => (
              <button key={c} className={`chip ${c === category ? "active" : ""}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <select className="select" value={priceIdx} onChange={(e) => setPriceIdx(Number(e.target.value))} aria-label="Filter by price">
            {PRICES.map((p, i) => (
              <option key={p.label} value={i}>{p.label}</option>
            ))}
          </select>
        </div>

        {status === "loading" && (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="sk-card" key={i}>
                <div className="skeleton sk-img" />
                <div className="skeleton sk-line" />
                <div className="skeleton sk-line short" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="state">
            <h3>Couldn't load products</h3>
            <p>The server may be waking up. This can take up to a minute.</p>
            <button className="btn btn-primary" onClick={load}>Try again</button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="state">
            <h3>No products match your filters</h3>
            <p>Try a different category, price range, or search term.</p>
            <button className="btn btn-ghost" onClick={() => { setCategory("All"); setPriceIdx(0); }}>
              Clear filters
            </button>
          </div>
        )}

        {status === "ready" && visible.length > 0 && (
          <>
            <p className="result-count">{visible.length} products</p>
            <div className="grid">
              {visible.map((p) => (
                <ProductCard key={p._id || p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </>
        )}
      </main>

      {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role="status">{toast.msg}</div>}
    </>
  );
}