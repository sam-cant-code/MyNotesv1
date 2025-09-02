import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import cors from "cors"; // Import the cors package

// --- IMPORT LOCAL MODULES ---
import connectDB from "./config/postgres.js";
import "./config/passport.js";
import authRoutes from "./routes/authRoute.js";
import { ensureUsersTableExists } from "./models/userModel.js";
import protectedRoutes from "./routes/protectedRoute.js";

// --- INITIAL SETUP ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- DATABASE CONNECTION ---
connectDB().then(() => {
  ensureUsersTableExists();
});

// --- MIDDLEWARE ---

// Enable CORS
// This allows your React app at localhost:3000 to make requests to this backend.
app.use(cors({
  origin: "http://localhost:3000", // The origin of your React app
  credentials: true,
}));

app.use(passport.initialize());

// --- ROUTES ---
// Auth routes for Google login (e.g., /auth/google)
app.use("/auth", authRoutes);

// API routes that are protected (e.g., /api/profile)
app.use("/api", protectedRoutes);

// A simple failure route for testing
app.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Login failed. Please try again.' });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});