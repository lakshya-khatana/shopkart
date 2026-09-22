import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => setQ(params.get("search") || ""), [params]);

  useEffect(() => {
    api.get("/products").then(({ data }) => {
      setAllProducts(Array.isArray(data) ? data : data.products || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!q.trim()) { setSuggestions([]); return; }
    const term = q.toLowerCase();
    setSuggestions(allProducts.filter((p) => p.name?.toLowerCase().includes(term)).slice(0, 5));
  }, [q, allProducts]);

  const goSearch = (term) => {
    setShowSuggest(false);
    navigate(term.trim() ? `/?search=${encodeURIComponent(term.trim())}` : "/");
  };

  const onSearch = (e) => { e.preventDefault(); goSearch(q); };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isSeller = user?.role === "seller";
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">ShopKart</Link>

        <form className="search" onSubmit={onSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            placeholder="Search products"
            aria-label="Search products"
          />
          {showSuggest && suggestions.length > 0 && (
            <ul className="suggest-list">
              {suggestions.map((p) => (
                <li key={p._id} onMouseDown={() => goSearch(p.name)}>{p.name}</li>
              ))}
            </ul>
          )}
        </form>

        <div className="nav-actions">
          {isSeller ? (
            <Link to="/seller" className="nav-link">Dashboard</Link>
          ) : (
            <>
              {user && <Link to="/orders" className="nav-link">Orders</Link>}

              {user && !isSeller && (
                <div className="nav-icons">
                  <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                    {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                  </Link>

                  <Link to="/cart" className="icon-btn" aria-label="Cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" /></svg>
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                  </Link>
                </div>
              )}
            </>
          )}

          {user ? (
            <>
              {firstName && <span className="nav-user">Hi, {firstName}</span>}
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
