const STEPS = ["processing", "shipped", "delivered"];

export default function OrderTracker({ status }) {
  if (status === "cancelled") {
    return <div className="tracker tracker-cancelled">Order cancelled</div>;
  }
  const activeIdx = STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STEPS.map((step, i) => (
        <div key={step} className={`tracker-step ${i <= activeIdx ? "done" : ""}`}>
          <span className="tracker-dot" />
          <span className="tracker-label">{step}</span>
          {i < STEPS.length - 1 && <span className={`tracker-line ${i < activeIdx ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}