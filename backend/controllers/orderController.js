const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Razorpay removed — mock payment mode. Re-enable by restoring the
// Razorpay import + client and swapping these two functions back.

const SHIPPING_FLAT = 40;
const TAX_RATE = 0.05; // 5%

// @desc Create a (mock) payment order from the user's current cart
// @route POST /api/orders/create-payment
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Recompute prices server-side — never trust client-sent totals
    const itemsPrice = cart.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
    const shippingPrice = itemsPrice > 500 ? 0 : SHIPPING_FLAT; // free shipping above ₹500
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Fake order id in place of razorpay.orders.create(...)
    const mockOrderId = `order_mock_${Date.now()}`;

    const order = await Order.create({
      customer: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        seller: i.product.seller,
      })),
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      razorpayOrderId: mockOrderId, // field name kept so schema/frontend don't need changes
    });

    return res.status(201).json({
      orderId: order._id,
      razorpayOrderId: mockOrderId,
      amount: Math.round(totalPrice * 100), // paise, same shape as before
      currency: "INR",
      keyId: "mock_key", // frontend can ignore this in mock mode
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Mark order as paid — no real signature to verify, always succeeds
// @route POST /api/orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    // razorpay_order_id / razorpay_payment_id / razorpay_signature ignored in mock mode

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const mockPaymentId = `pay_mock_${Date.now()}`;

    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpayPaymentId = mockPaymentId;
    await order.save();

    // Decrease stock for each purchased product
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Empty the cart now that checkout succeeded
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    return res.json({ message: "Payment verified (mock)", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get logged-in customer's orders
// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get orders containing products sold by the logged-in seller
// @route GET /api/orders/seller
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id, isPaid: true })
      .sort({ createdAt: -1 })
      .populate("customer", "name email");
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update order status (seller)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
};
