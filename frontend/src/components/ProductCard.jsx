import { Link } from "react-router-dom";

export const getImage = (p) => p.imageUrl || p.image || p.images?.[0] || null;

export default function ProductCard({ product, onAdd }) {
  const id = product._id || product.id;
  const img = getImage(product);
  const outOfStock = product.stock !== undefined && Number(product.stock) <= 0;

  return (
    <article className="card">
      <Link to={`/product/${id}`} className={`card-img ${img ? "" : "noimg"}`}>
        {img ? (
          <img src={img} alt={product.name} loading="lazy" />
        ) : (
          <span>{product.name?.charAt(0)}</span>
        )}
      </Link>
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