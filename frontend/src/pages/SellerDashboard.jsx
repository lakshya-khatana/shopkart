import { useEffect, useState } from "react";
import api from "../api";

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty", "Sports"];
const emptyForm = { name: "", description: "", category: CATEGORIES[0], price: "", stock: "", images: [""] };

function SalesChart({ orders }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const totals = days.map((d) => {
    const key = d.toDateString();
    return orders.filter((o) => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + o.totalPrice, 0);
  });
  const max = Math.max(...totals, 1);

  return (
    <div className="card">
      <h3>Sales — last 7 days</h3>
      <div className="bar-chart">
        {totals.map((v, i) => (
          <div className="bar-col" key={i}>
            <div className="bar" style={{ height: `${(v / max) * 100}%` }} title={`₹${v}`} />
            <span className="bar-label">{days[i].toLocaleDateString("en-IN", { weekday: "short" })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SellerDashboard = () => {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const fetchProducts = async () => { const { data } = await api.get("/products/seller/mine"); setProducts(data); };
  const fetchOrders = async () => { const { data } = await api.get("/orders/seller"); setOrders(data); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleImageChange = (index, value) => {
    const next = [...form.images];
    next[index] = value;
    setForm({ ...form, images: next });
  };

  const addImageField = () => {
    if (form.images.length >= 4) return;
    setForm({ ...form, images: [...form.images, ""] });
  };

  const removeImageField = (index) => {
    const next = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: next.length ? next : [""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cleanImages = form.images.map((u) => u.trim()).filter(Boolean).slice(0, 4);
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: cleanImages };
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const handleEdit = (p) => {
    const existingImages = p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [""];
    setForm({ name: p.name, description: p.description, category: p.category, price: p.price, stock: p.stock, images: existingImages });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const updateOrderStatus = async (id, status) => { await api.put(`/orders/${id}/status`, { status }); fetchOrders(); };
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

              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginTop: 4 }}>
                Product images (up to 4)
              </label>
              {form.images.map((url, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder={`Image URL ${i + 1}${i === 0 ? " (main)" : ""}`}
                    value={url}
                    onChange={(e) => handleImageChange(i, e.target.value)}
                  />
                  {form.images.length > 1 && (
                    <button type="button" className="secondary" style={{ flexShrink: 0 }} onClick={() => removeImageField(i)}>✕</button>
                  )}
                </div>
              ))}
              {form.images.length < 4 && (
                <button type="button" className="secondary" onClick={addImageField}>+ Add another image</button>
              )}

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
                  <div className="meta">₹{Number(p.price).toLocaleString("en-IN")} · Stock: {p.stock} · {p.images?.length || (p.imageUrl ? 1 : 0)} image(s)</div>
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
          <SalesChart orders={orders} />
          {orders.length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}
          {orders.map((o) => (
            <div className="card" key={o._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <b>Order #{o._id.slice(-6).toUpperCase()}</b>
                <span className="status-pill">{o.status}</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>Customer: {o.customer?.name} ({o.customer?.email})</p>
              {o.items.map((item, i) => (<div key={i} style={{ fontSize: 14, padding: "3px 0" }}>{item.name} × {item.quantity}</div>))}
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
