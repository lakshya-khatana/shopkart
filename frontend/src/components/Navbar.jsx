import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("search") || "");

  useEffect(() => setQ(params.get("search") || ""), [params]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : "/");
  };

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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </form>

        <div className="nav-actions">
          {isSeller ? (
            <Link to="/seller" className="nav-link">Dashboard</Link>
          ) : (
            <>
              {user && <Link to="/orders" className="nav-link">Orders</Link>}
              <Link to="/cart" className="icon-btn" aria-label="Cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" /></svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
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