import { Router } from "express";
import passport from "passport";
import { googleCallback } from "../controllers/authController.js";

const router = Router();

// Route 1: Initiate Google Authentication
// When a user navigates to '/auth/google', Passport will redirect them to Google.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // We ask for the user's profile info and email
    session: false, // We will use JWTs, so we don't need sessions
  })
);

// Route 2: The Callback URL
// Google redirects the user back to this URL after they have logged in.
router.get(
  "/google/callback",
  // First, Passport authenticates the request. It handles the code exchange with Google.
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed", // A route to redirect to if login fails
  }),
  // If authentication is successful, the controller function is called.
  googleCallback
);

export default router;
