import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // It's good practice to have cors
import passport from "passport";

// --- Local Imports ---
import connectDB from "./config/postgres.js";
import "./config/passport.js"; // This ensures passport config is loaded

// --- Model Imports for Table Creation ---
import { ensureUsersTableExists } from "./models/userModel.js";
import { ensureNotesTableExists } from "./models/noteModel.js";

// --- Route Imports ---
import authRoutes from "./routes/authRoute.js";
import protectedRoutes from "./routes/protectedRoute.js";
import noteRoutes from "./routes/noteRoute.js";

// --- Initial Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// ====================================================================
// --- CRITICAL: Middleware Setup ---
// These MUST come before your routes are defined.
// ====================================================================

// 1. Enable CORS
app.use(cors());

// 2. Add middleware to parse JSON request bodies. This fixes the `req.body` error.
app.use(express.json());

// 3. Initialize Passport
app.use(passport.initialize());

// ====================================================================
// --- API Routes ---
// ====================================================================
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/notes", noteRoutes);


// ====================================================================
// --- Server Startup Function ---
// This function controls the order of operations.
// ====================================================================
const startServer = async () => {
  try {
    // Step 1: Connect to the database
    await connectDB();
    
    // Step 2: Ensure all required tables exist. The server will not start if this fails.
    await ensureUsersTableExists();
    await ensureNotesTableExists();

    // Step 3: Only after the database is ready, start listening for requests.
    app.listen(PORT, () => {
      console.log(`✅ Server is running and listening on port ${PORT}`);
      console.log("Database and tables are confirmed to be ready.");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// --- Execute the Startup ---
startServer();