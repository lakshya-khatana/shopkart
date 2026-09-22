const FAQS = [
  { q: "How do I track my order?", a: "Log in and open the Orders page. Each order shows its current status: processing, shipped, or delivered." },
  { q: "Can I cancel an order after placing it?", a: "Contact us as soon as possible after placing the order. Once an order is shipped, it can no longer be cancelled." },
  { q: "How do I become a seller?", a: "Register for an account and choose \"I want to sell\" during sign-up. You'll get access to the Seller Dashboard." },
  { q: "Is payment on ShopKart real?", a: "No. ShopKart is a demo project — checkout simulates a successful payment and no real transaction occurs." },
];

export default function Faqs() {
  return (
    <div className="info-page">
      <h1>Frequently asked questions</h1>
      <p className="subtitle">Quick answers to common questions.</p>
      {FAQS.map((f, i) => (
        <div className="faq-item" key={i}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </div>
  );
}
