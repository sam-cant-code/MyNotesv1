import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotesForUser,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  getTagsForUser, // --- NEW IMPORT ---
} from "../controllers/noteController.js";

const router = Router();

router.use(protect);

router.route("/").get(getNotesForUser).post(createNote);

// --- NEW ROUTE ---
router.route("/tags").get(getTagsForUser);

router.route("/:id/pin").patch(togglePin);

router.route("/:id").put(updateNote).delete(deleteNote);

export default router;