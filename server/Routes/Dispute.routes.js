import express from "express";
import DisputeController from "../Controller/Resolve.controller.js";
import { protect, isAdmin } from "../Middleware/auth.js";

const router = express.Router();

// Create dispute (freelancer or client)
router.post("/", protect, DisputeController.createDispute);

// Get my disputes (for current user)
router.get("/my-disputes", protect, DisputeController.getMyDisputes);

// Get all open disputes (admin only)
router.get("/", protect, isAdmin, DisputeController.getAllDisputes);

// Get single dispute by ID (admin only)
router.get("/:disputeId", protect, isAdmin, DisputeController.getDisputeById);

// Add freelancer response to dispute
router.patch(
  "/:disputeId/response",
  protect,
  DisputeController.addFreelancerResponse,
);

// Resolve dispute (admin only)
router.patch(
  "/:disputeId/resolve",
  protect,
  isAdmin,
  DisputeController.resolveDispute,
);

export default router;
