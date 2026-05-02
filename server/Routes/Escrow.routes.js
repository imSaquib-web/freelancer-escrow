import express from "express";
import EscrowController from "../Controller/Escrow.controller.js";
import { isClient, protect } from "../Middleware/auth.js";

const router = express.Router();

// Specific routes BEFORE general routes (important for Express routing)
// Get escrow by job ID
router.get("/job/:jobId", protect, EscrowController.getEscrowByJob);

// Create escrow for a job
router.post("/:jobId", protect, isClient, EscrowController.createEscrow);

// Get all escrows for current user (MUST be last)
router.get("/", protect, EscrowController.getMyEscrows);

export default router;
