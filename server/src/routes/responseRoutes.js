import express from "express";

import { submitResponse } from "../controllers/responseController.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

router.post("/:pollId", optionalAuth, submitResponse);

export default router;
