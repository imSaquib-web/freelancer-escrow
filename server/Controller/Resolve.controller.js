import UserDB from "../Model/User.js";
import EscrowDB from "../Model/Escrow.js";
import JobDB from "../Model/Job.js";

const resolveDispute = async (req, res) => {
  try {
    const { decision } = req.body;



    if (decision === "split") {
      freelancer.walletBalance = escrow.amount / 2;
      await freelancer.save();
    }

    escrow.locked = false;
    await escrow.save();

    await JobDB.findByIdAndUpdate(dispute.jobId, { status: "completed" });

    res.json({ msg: "Dispute resolved" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Not able to resolve dispute", err: err.message });
  }
};

export default { resolveDispute };
