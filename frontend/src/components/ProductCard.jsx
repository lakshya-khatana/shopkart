import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <img
        src={product.imageUrl || "https://placehold.co/300x300?text=No+Image"}
        alt={product.name}
      />
      <h4>{product.name}</h4>
      <div className="rating">
        {"★".repeat(Math.round(product.rating || 0))}
        {"☆".repeat(5 - Math.round(product.rating || 0))} ({product.numReviews || 0})
      </div>
      <div className="price">₹{product.price}</div>
      {product.stock === 0 && <div className="error-text">Out of stock</div>}
    </Link>
  );
};

export default ProductCard;
