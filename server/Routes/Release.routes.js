import express from "express";
import ReleaseController from "../Controller/release.controller.js";
import { isClient, protect } from "../Middleware/auth.js";

const router = express.Router();

router.patch(
  "/:escrowId",
  protect,
  isClient,
  ReleaseController.approveAndRelease
);

export default router;
