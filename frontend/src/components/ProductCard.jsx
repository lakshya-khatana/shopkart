import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export const getImage = (p) => p.images?.[0] || p.imageUrl || p.image || null;

export default function ProductCard({ product, onAdd }) {
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const id = product._id || product.id;
  const img = getImage(product);
  const outOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const wished = user ? isWishlisted(id) : false;

  return (
    <article className="card">
      <Link to={`/product/${id}`} className={`card-img ${img ? "" : "noimg"}`}>
        {img ? <img src={img} alt={product.name} loading="lazy" /> : <span>{product.name?.charAt(0)}</span>}
      </Link>
      {user?.role !== "seller" && (
        <button
          className={`wish-btn ${wished ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); user ? toggle(id) : null; }}
          aria-label="Toggle wishlist"
        >
          {wished ? "♥" : "♡"}
        </button>
      )}
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-name"><Link to={`/product/${id}`}>{product.name}</Link></h3>
        {product.rating > 0 && <span className="rating">★ {Number(product.rating).toFixed(1)}</span>}
        <div className="card-foot">
          <span className="price">₹{Number(product.price).toLocaleString("en-IN")}</span>
          <button className="btn btn-primary" onClick={() => onAdd?.(product)} disabled={outOfStock}>
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
