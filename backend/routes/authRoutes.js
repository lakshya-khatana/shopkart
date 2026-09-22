const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, addAddress, toggleWishlist, getWishlist } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/address", protect, addAddress);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);

module.exports = router;