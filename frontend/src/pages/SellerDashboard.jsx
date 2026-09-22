import { useEffect, useState } from "react";
import api from "../api";

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty", "Sports"];

const SellerDashboard = () => {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", category: CATEGORIES[0], price: "", stock: "", imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const { data } = await api.get("/products/seller/mine");
    setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await api.get("/orders/seller");
    setOrders(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: "", description: "", category: CATEGORIES[0], price: "", stock: "", imageUrl: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, category: p.category, price: p.price, stock: p.stock, imageUrl: p.imageUrl });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const updateOrderStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Seller Dashboard</h2>

      <div className="dash-tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Products</button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders</button>
      </div>

      {tab === "products" && (
        <>
          <div className="card">
            <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} required />
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} required />
              <input name="stock" type="number" placeholder="Stock quantity" value={form.stock} onChange={handleChange} required />
              <input name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={handleChange} />
              {error && <p className="error-text">{error}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
                {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </div>

          <div className="card">
            <h3>Your Products ({products.length})</h3>
            {products.length === 0 && <p style={{ color: "var(--muted)" }}>No products yet. Add your first one above.</p>}
            {products.map((p) => (
              <div key={p._id} className="product-row">
                <div>
                  <div className="name">{p.name}</div>
                  <div className="meta">₹{Number(p.price).toLocaleString("en-IN")} · Stock: {p.stock}</div>
                </div>
                <div className="actions">
                  <button className="secondary" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "orders" && (
        <>
          <div className="card">
            <h3>Total Sales: ₹{totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
          </div>
          {orders.length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}
          {orders.map((o) => (
            <div className="card" key={o._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <b>Order #{o._id.slice(-6).toUpperCase()}</b>
                <span className="status-pill">{o.status}</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>
                Customer: {o.customer?.name} ({o.customer?.email})
              </p>
              {o.items.map((item, i) => (
                <div key={i} style={{ fontSize: 14, padding: "3px 0" }}>{item.name} × {item.quantity}</div>
              ))}
              <div className="summary-row total"><span>Total</span><span>₹{o.totalPrice}</span></div>
              <select style={{ marginTop: 12 }} value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SellerDashboard;