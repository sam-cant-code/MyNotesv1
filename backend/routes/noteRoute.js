import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotesForUser, createNote } from "../controllers/noteController.js";

const router = Router();

// All routes here are protected and require a valid token
router.use(protect);

// Route to get all notes for a user and create a new note
router.route("/")
    .get(getNotesForUser)
    .post(createNote);

// Future routes for updating or deleting can be added here, e.g.:
// router.route("/:id")
//     .put(updateNote)
//     .delete(deleteNote);

export default router;