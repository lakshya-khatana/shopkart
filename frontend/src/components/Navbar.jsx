import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="navbar">
      <Link to="/" className="brand">
        🛒 ShopKart
      </Link>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <div>
        {user?.role === "customer" && (
          <>
            <Link to="/cart">Cart ({cartCount})</Link>
            <Link to="/orders">My Orders</Link>
          </>
        )}
        {user?.role === "seller" && <Link to="/seller">Seller Dashboard</Link>}
        {user ? (
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); navigate("/login"); }}>
            Logout
          </a>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
