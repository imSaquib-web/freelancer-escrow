import express from "express";
import RatingController from "../Controller/Rating.controller.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// Add rating (client rates freelancer after payment release)
router.post("/", protect, RatingController.addRating);

// Get freelancer's ratings
router.get("/freelancer/:freelancerId", RatingController.getFreelancerRatings);

// Get user's rating info
router.get("/user/:userId", RatingController.getUserRating);

export default router;
