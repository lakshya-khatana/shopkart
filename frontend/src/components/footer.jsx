import { Link } from "react-router-dom";

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
          <Link to="/about">About</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/shipping">Shipping</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/faqs">FAQs</Link>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} ShopKart — Built by Lakshya Khatana</p>
    </footer>
  );
}