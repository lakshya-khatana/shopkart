export default function About() {
  return (
    <div className="info-page">
      <h1>About ShopKart</h1>
      <p className="subtitle">Everything you need, delivered to your door.</p>
      <p>ShopKart is a full-stack e-commerce platform where sellers can list products and customers can browse, add to cart, and check out in a few taps. It was built as a demonstration of the MERN stack (MongoDB, Express, React, Node.js) with real-world features like authentication, role-based dashboards, order tracking, and reviews.</p>
      <h2>What we offer</h2>
      <ul>
        <li>A simple, fast shopping experience across categories like Electronics, Fashion, Books and more</li>
        <li>A seller dashboard to add, edit and manage products and orders</li>
        <li>Order tracking from processing to delivery</li>
      </ul>
      <h2>Note</h2>
      <p>This is a demo project. Payments are simulated and no real transactions take place.</p>
    </div>
  );
}
