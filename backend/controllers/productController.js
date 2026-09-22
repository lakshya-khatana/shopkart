const Product = require("../models/Product");

// @desc Get products with search, category filter, price range, pagination
// @route GET /api/products?search=&category=&minPrice=&maxPrice=&page=&limit=
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get single product by id
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Create a product (seller only)
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl, images } = req.body;
    const cleanImages = Array.isArray(images) ? images.filter(Boolean).slice(0, 4) : [];
    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      category,
      price,
      stock,
      imageUrl: imageUrl || cleanImages[0] || "", // first image also saved here for old code that still reads imageUrl
      images: cleanImages,
    });
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update a product (seller who owns it only)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this product" });
    }

    Object.assign(product, req.body);
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete a product (seller who owns it only)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }
    await product.deleteOne();
    return res.json({ message: "Product removed" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get products belonging to the logged-in seller
// @route GET /api/products/seller/mine
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Add a review to a product
// @route POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
};