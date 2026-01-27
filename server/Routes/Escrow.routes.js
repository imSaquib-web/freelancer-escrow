import express from "express";
import EscrowController from "../Controller/Escrow.controller.js";
import { isClient, protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/:jobId", protect, isClient, EscrowController.createEscrow);
router.get("/job/:jobId", protect, EscrowController.getEscrowByJob);


export default router;
