import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-dark">
      <div className="footer-watermark" aria-hidden="true">SHOPKART</div>

      <div className="container footer-dark-inner">
        <div>
          <h2 className="footer-dark-brand">ShopKart</h2>
          <p>Everything you need, delivered to your door — a full-stack shopping experience built with care.</p>
        </div>

        <div>
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3>Help</h3>
          <ul>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-dark-bar">
        <span>© {new Date().getFullYear()} ShopKart. All rights reserved.</span>
        <span className="footer-status">Built by Lakshya Khatana</span>
      </div>
    </footer>
  );
}