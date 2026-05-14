import express from "express";

import {
  createPoll,
  getMyPolls,
  getPollById,
  getPollAnalytics,
  publishResults,
  getPublicResults,
  deletePoll,
} from "../controllers/pollController.js";
import authorized from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new poll
router.post("/", authorized, createPoll);

// Get my polls
router.get("/my", authorized, getMyPolls);

//Get analytics
router.get("/analytics/:id", authorized, getPollAnalytics);

router.put("/publish/:id", authorized, publishResults);

router.get("/results/:id", getPublicResults);

router.delete("/:id", authorized, deletePoll);

// Get poll by ID
router.get("/:id", getPollById);

export default router;
