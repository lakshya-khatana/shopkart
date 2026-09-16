# ShopKart 🛒 — Full-Stack E-commerce Platform

A full-stack online shopping platform with product search/filtering, cart management,
checkout, and a seller dashboard for inventory and order management — built with the
MERN stack.

> **Payment integration:** Mock flow (Razorpay-ready architecture — server-side price
> recalculation and an order/payment state machine are already in place). Live Razorpay
> keys are pending KYC approval; swapping in real payments means restoring the
> create-order/verify-signature calls in `orderController.js` behind the same API
> contract the frontend already uses. See `backend/.env.example` for the note on where
> those keys go.

## Tech Stack
- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose) with a text index for product search
- **Payments:** Mocked (Razorpay-ready — pending KYC for live keys)
- **Auth:** JWT + bcrypt

## Features
- Customer & Seller auth with role-based access
- Product catalog: search (MongoDB text search), category filter, price filter, pagination
- Product detail page with ratings & reviews
- Persistent cart (stored in MongoDB, synced across sessions)
- Checkout flow with address form + mock payment (server-side price recalculation,
  never trusts client-sent totals; architecture ready to drop in a real gateway)
- Order history for customers; order status management for sellers
  (processing → shipped → delivered → cancelled)
- Seller dashboard: add/edit/delete products, track stock, view total sales

## Project Structure
```
shopkart/
  backend/
    config/db.js
    models/User.js, Product.js, Cart.js, Order.js
    controllers/authController.js, productController.js, cartController.js, orderController.js
    routes/authRoutes.js, productRoutes.js, cartRoutes.js, orderRoutes.js
    middleware/authMiddleware.js
    server.js
  frontend/
    src/pages/Home.jsx, ProductDetail.jsx, Cart.jsx, Checkout.jsx, Orders.jsx,
               SellerDashboard.jsx, Login.jsx, Register.jsx
    src/components/Navbar.jsx, ProductCard.jsx, PrivateRoute.jsx
    src/context/AuthContext.jsx, CartContext.jsx
```

## Setup & Run Locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET — no payment keys needed (mocked)
npm run dev
```
Backend runs on `http://localhost:5000`. Use the same MongoDB Atlas setup approach
as before (a `quickride`-style connection string works fine — just point it at a
new database name, e.g. `shopkart`).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Try it out
1. Register a **Seller** account, add a couple of products (with an image URL —
   any public image link works, e.g. from Unsplash).
2. Register a **Customer** account (in an incognito window), browse/search products,
   add to cart, and checkout.
3. Click "Pay" — the mock flow simulates a short processing delay and always
   succeeds (no card details needed; see the demo-mode banner on the checkout page).
4. Confirm the order appears under "My Orders" (customer) and "Seller Dashboard →
   Orders" (seller), and update its status as the seller.

## How the core logic works
- **Search & filters:** MongoDB text index (`name`, `description`, `category`) powers
  `$text` search; category and price range are plain field filters, combined in one query.
- **Cart:** stored server-side per user in MongoDB (not just localStorage), so it
  persists across devices/sessions as long as the user is logged in.
- **Payment flow:** the backend recomputes the order total from the cart (never
  trusts a price sent by the client), creates an order in a "pending" state, then a
  mock verify step marks it paid and decrements stock. This mirrors the shape of a
  real gateway (create → client pays → server verifies) so swapping in Razorpay
  later is a matter of restoring the create-order call and HMAC-SHA256 signature
  check in `orderController.js`, not a redesign.

## Possible Improvements (good interview talking points)
- Real image upload (Cloudinary/Multer) instead of pasted image URLs
- Admin-level moderation across all sellers
- Coupon/discount codes
- Wishlist page (the field already exists on the User model)
- Real Razorpay/Stripe integration once KYC is approved (create-order + webhook +
  HMAC signature verification, restoring the logic the mock currently stands in for)
- Deploy: frontend → Vercel, backend → Render, DB → MongoDB Atlas (same flow as QuickRide)

## Resume bullet
> Built ShopKart, a full-stack e-commerce platform (React, Node.js, Express, MongoDB)
> with product search/filtering, a persistent server-side cart, and a checkout flow
> with server-side price validation and a gateway-ready payment architecture
> (mocked pending KYC), plus a seller dashboard for inventory and order management.
