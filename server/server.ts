import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";

// Route Imports - Ensure these match your actual .js or .ts file extensions in the project
import ProductRouter from "./routes/productsRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRouter from "./routes/ordersRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import WishlistRouter from "./routes/wishlistRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
import paymentRouter from "./routes/paymentRoute.js";

// Script & Controller Imports
import makeAdmin from "./scripts/makeAdmin.js";
import { clerkWebhook } from "./controllers/webhooks.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";
import { seedProducts } from "./scripts/seedProducts.js";

const app = express();

// 1. Connect to MongoDB
await connectDB();

// 2. Webhooks MUST come before express.json() middleware 
// Webhooks need the raw body to verify signatures.
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

if (process.env.STRIPE_SECRET_KEY) {
    app.post("/api/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);
}

// 3. Global Middleware
app.use(cors());
app.use(express.json()); // Parses JSON for all other routes
app.use(clerkMiddleware()); // Adds auth context to requests

// 4. Routes
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Mounting routers under /api prefix
app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/wishlist", WishlistRouter); // This matches your frontend call
app.use("/api/admin", AdminRouter);

if (process.env.STRIPE_SECRET_KEY) {
    app.use("/api/payments", paymentRouter);
}

// 5. Port Configuration
const PORT = process.env.PORT || 3000;

// 6. Startup Scripts
try {
    await makeAdmin();
    
    // Check if URI exists before seeding to avoid Type Errors
    if (process.env.MONGODB_URI) {
        await seedProducts(process.env.MONGODB_URI);
    } else {
        console.warn("MONGODB_URI is missing. Skipping product seed.");
    }
} catch (error) {
    console.error("Error during startup scripts:", error);
}

// 7. Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});