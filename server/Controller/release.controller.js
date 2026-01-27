// server/Controller/release.controller.js (UPDATED)
import UserDB from "../Model/User.js";
import EscrowDB from "../Model/Escrow.js";
import JobDB from "../Model/Job.js";

const approveAndRelease = async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Find escrow
    const escrow = await EscrowDB.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ msg: "Escrow not found" });
    }

    // Check if already released
    if (escrow.status === "released") {
      return res.status(400).json({ msg: "Payment already released" });
    }

    // Find freelancer
    const freelancer = await UserDB.findById(escrow.freelancerId);
    if (!freelancer) {
      return res.status(404).json({ msg: "Freelancer not found" });
    }

    // Calculate payout (90% to freelancer, 10% platform fee)
    const platformFee = 0.1;
    const payout = escrow.amount * (1 - platformFee);

    // Add to freelancer wallet
    freelancer.walletBalance += payout;
    await freelancer.save();

    // Update escrow status
    escrow.status = "released";
    await escrow.save();

    // Update job status
    await JobDB.findByIdAndUpdate(escrow.jobId, { status: "completed" });

    console.log(`✅ Payment released: ₹${payout} to ${freelancer.name}`);

    res.json({
      msg: "Payment released successfully",
      freelancerName: freelancer.name,
      amountPaid: payout,
      platformFee: escrow.amount - payout,
    });
  } catch (err) {
    console.error("Error releasing payment:", err);
    res.status(500).json({ msg: "Failed to release payment", error: err.message });
  }
};

export default { approveAndRelease };