import express from "express";
import PaymentController from "../Controller/Payment.controller.js";
import { protect, isClient } from "../Middleware/auth.js";

const router = express.Router();

router.post("/order", protect, isClient, PaymentController.createOrder);
// router.patch("/funded", protect, isClient, PaymentController.markEscrowFunded);
router.post("/verify", protect, isClient, PaymentController.verifyPayment);

export default router;
