import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { handleChat } from "../controllers/aiController.js";

const router = Router();

// All AI routes are protected
router.use(protect);

// Main chat endpoint
router.post("/chat", handleChat);

export default router;