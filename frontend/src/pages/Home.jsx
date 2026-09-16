import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty", "Sports"];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const search = searchParams.get("search") || "";

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, maxPrice, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { search, category, maxPrice, page, limit: 12 },
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>{search ? `Search results for "${search}"` : "All Products"}</h2>

      <div className="filters">
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}>
          <option value="">Any Price</option>
          <option value="500">Under ₹500</option>
          <option value="1000">Under ₹1,000</option>
          <option value="5000">Under ₹5,000</option>
          <option value="20000">Under ₹20,000</option>
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <p>No products found. Try a different search or filter.</p>}

      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === page ? "" : "secondary"}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
