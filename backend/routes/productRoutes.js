const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/seller/mine", protect, authorizeRoles("seller"), getMyProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorizeRoles("seller"), createProduct);
router.put("/:id", protect, authorizeRoles("seller"), updateProduct);
router.delete("/:id", protect, authorizeRoles("seller"), deleteProduct);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
