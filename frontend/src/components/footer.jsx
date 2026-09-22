export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <span className="logo">ShopKart</span>
          <p>Everything you need, delivered to your door.</p>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>
        <div>
          <h4>Help</h4>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">FAQs</a>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} ShopKart — Built by Lakshya Khatana</p>
    </footer>
  );
}