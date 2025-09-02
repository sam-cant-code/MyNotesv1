import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// This route is protected by the 'protect' middleware
router.get("/profile", protect, (req, res) => {
  // If the token is valid, req.user will be populated by the middleware
  res.status(200).json({
    message: "You have accessed the protected profile data!",
    user: req.user,
  });
});

export default router;