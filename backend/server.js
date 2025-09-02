import express from "express";
import dotenv from "dotenv";
import passport from "passport";

// --- IMPORT LOCAL MODULES ---
import connectDB from "./config/postgres.js";
// This import runs the code in passport.js, configuring the Google Strategy
import "./config/passport.js";
// This imports the routes you defined in authRoute.js
import authRoutes from "./routes/authRoute.js";
// Import the function to ensure the users table exists
import { ensureUsersTableExists } from "./models/userModel.js";

// --- INITIAL SETUP ---
// Load environment variables from .env file AT THE VERY TOP
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- DATABASE CONNECTION ---
connectDB().then(() => {
  // Ensure the users table exists after connecting to the database
  ensureUsersTableExists();
});

// --- MIDDLEWARE ---
// This initializes Passport, which is required for it to work.
app.use(passport.initialize());

// --- ROUTES ---
// This provides the link on the homepage.
app.get("/", (req, res) => {
  res.send(`
    <h1>Authentication Server</h1>
    <p>Use the link below to sign in with your Google account.</p>
    <a href="/auth/google" style="
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #fff;
      background-color: #4285F4;
      text-decoration: none;
      border-radius: 5px;
      font-family: sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      Sign In with Google
    </a>
  `);
});

// This line tells Express to use your authRoutes for any URL that starts with '/auth'
app.use("/auth", authRoutes);

// A simple failure route for testing
app.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Login failed. Please try again.' });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Login by visiting: http://localhost:${PORT}/`);
});