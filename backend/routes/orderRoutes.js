const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create-payment", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my", protect, getMyOrders);
router.get("/seller", protect, authorizeRoles("seller"), getSellerOrders);
router.put("/:id/status", protect, authorizeRoles("seller"), updateOrderStatus);

module.exports = router;
