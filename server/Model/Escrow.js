import mongoose, { mongo } from "mongoose";

const escrowSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    locked: {
      type: Boolean,
      default: true,
    },
    funded: {
      type: Boolean, // Should match default value type
      default: false, // Whether payment has been received from client
    },
  },
  { timestamps: true },
);

export default mongoose.model("Escrow", escrowSchema);
