import express from "express";
import jobController from "../Controller/Job.controller.js";
import { protect, isClient } from "../Middleware/auth.js";

const router = express.Router();

router.get("/my", protect, isClient, jobController.getMyJobs);
router.get("/", jobController.getJob);
router.post("/", protect, isClient, jobController.createJob);

export default router;
