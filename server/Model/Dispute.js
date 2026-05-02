import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    escrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escrow",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    freelancerResponse: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    resolution: {
      type: String,
      enum: ["refund_client", "pay_freelancer", "split"],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Dispute", disputeSchema);
