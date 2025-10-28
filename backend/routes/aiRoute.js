import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { chatWithAI } from "../controllers/aiController.js";

const router = Router();

// All AI routes require authentication
router.use(protect);

// Main chat endpoint
router.post("/chat", chatWithAI);

export default router;