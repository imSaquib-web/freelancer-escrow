import express from "express";
import ProposalContainer from "../Controller/Proposal.controller.js";
import { isFreelancer, isClient, protect } from "../Middleware/auth.js";

const router = express.Router();

router.get("/my", protect, isFreelancer, ProposalContainer.getMyProposals);
router.post("/:jobId", protect, isFreelancer, ProposalContainer.createProposal);
router.get("/:jobId", protect, isClient, ProposalContainer.getProposal);
router.patch(
  "/accept/:proposalId",
  protect,
  isClient,
  ProposalContainer.updateProposal,
);

export default router;
    