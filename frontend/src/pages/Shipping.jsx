export default function Shipping() {
  return (
    <div className="info-page">
      <h1>Shipping information</h1>
      <p className="subtitle">How orders move from checkout to your door.</p>
      <h2>Delivery charges</h2>
      <p>Orders above ₹500 ship for free. Orders below ₹500 have a flat shipping fee of ₹40, calculated automatically at checkout.</p>
      <h2>Order status</h2>
      <ul>
        <li><b>Processing</b> — your order has been placed and is being prepared</li>
        <li><b>Shipped</b> — your order is on its way</li>
        <li><b>Delivered</b> — your order has arrived</li>
      </ul>
      <p>You can track any order's status from the Orders page after logging in.</p>
    </div>
  );
}
