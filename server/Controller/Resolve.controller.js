import UserDB from "../Model/User.js";
import EscrowDB from "../Model/Escrow.js";
import JobDB from "../Model/Job.js";
import DisputeDB from "../Model/Dispute.js";

// Get all open disputes (Admin only)
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await DisputeDB.find({ status: "open" })
      .populate("freelancerId", "name email")
      .populate("clientId", "name email")
      .populate("escrowId")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching disputes",
      error: err.message,
    });
  }
};

// Get single dispute by ID (Admin only)
const getDisputeById = async (req, res) => {
  try {
    const dispute = await DisputeDB.findById(req.params.disputeId)
      .populate("freelancerId", "name email walletBalance")
      .populate("clientId", "name email walletBalance")
      .populate("escrowId")
      .populate("jobId");

    if (!dispute) {
      return res.status(404).json({ msg: "Dispute not found" });
    }

    res.json(dispute);
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching dispute",
      error: err.message,
    });
  }
};

// Create dispute (Freelancer or Client)
const createDispute = async (req, res) => {
  try {
    const { escrowId, reason } = req.body;

    // Validate escrow exists
    const escrow = await EscrowDB.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ msg: "Escrow not found" });
    }

    // Check if user is either client or freelancer in the escrow
    if (
      req.user.id !== escrow.clientId.toString() &&
      req.user.id !== escrow.freelancerId.toString()
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to create dispute for this escrow" });
    }

    // Check if dispute already exists for this escrow
    const existingDispute = await DisputeDB.findOne({
      escrowId,
      status: "open",
    });

    if (existingDispute) {
      return res
        .status(400)
        .json({ msg: "An open dispute already exists for this escrow" });
    }

    // Create dispute
    const dispute = await DisputeDB.create({
      escrowId,
      jobId: escrow.jobId,
      freelancerId: escrow.freelancerId,
      clientId: escrow.clientId,
      reason,
      amount: escrow.amount,
      status: "open",
    });

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({
      msg: "Error creating dispute",
      error: err.message,
    });
  }
};

// Resolve dispute (Admin only)
const resolveDispute = async (req, res) => {
  try {
    const { resolution } = req.body;
    const { disputeId } = req.params;

    // Validate resolution option
    if (!["refund_client", "pay_freelancer", "split"].includes(resolution)) {
      return res.status(400).json({
        msg: "Invalid resolution option. Must be: refund_client, pay_freelancer, or split",
      });
    }

    // Get dispute
    const dispute = await DisputeDB.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ msg: "Dispute not found" });
    }

    if (dispute.status !== "open") {
      return res.status(400).json({ msg: "Dispute is already resolved" });
    }

    // Get escrow and users
    const escrow = await EscrowDB.findById(dispute.escrowId);
    const freelancer = await UserDB.findById(dispute.freelancerId);
    const client = await UserDB.findById(dispute.clientId);

    if (!escrow || !freelancer || !client) {
      return res
        .status(404)
        .json({ msg: "Required data not found (escrow or users)" });
    }

    // Apply resolution
    if (resolution === "refund_client") {
      // Refund the client
      client.walletBalance += escrow.amount;
      await client.save();
    } else if (resolution === "pay_freelancer") {
      // Pay the freelancer
      freelancer.walletBalance += escrow.amount;
      await freelancer.save();
    } else if (resolution === "split") {
      // Split the amount 50-50
      const halfAmount = escrow.amount / 2;
      client.walletBalance += halfAmount;
      freelancer.walletBalance += halfAmount;
      await client.save();
      await freelancer.save();
    }

    // Update dispute status
    dispute.status = "resolved";
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user.id;
    await dispute.save();

    // Unlock escrow and mark as resolved
    escrow.locked = false;
    await escrow.save();

    // Update job status to completed
    await JobDB.findByIdAndUpdate(dispute.jobId, { status: "completed" });

    res.json({
      msg: "Dispute resolved successfully",
      dispute,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error resolving dispute",
      error: err.message,
    });
  }
};

// Get disputes for current user (either as freelancer or client)
const getMyDisputes = async (req, res) => {
  try {
    const userId = req.user.id;

    const disputes = await DisputeDB.find({
      $or: [{ freelancerId: userId }, { clientId: userId }],
    })
      .populate("freelancerId", "name email")
      .populate("clientId", "name email")
      .populate("escrowId")
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching disputes",
      error: err.message,
    });
  }
};

// Freelancer adds response to dispute
const addFreelancerResponse = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { response } = req.body;

    if (!response || response.trim() === "") {
      return res.status(400).json({ msg: "Response cannot be empty" });
    }

    const dispute = await DisputeDB.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ msg: "Dispute not found" });
    }

    // Check if user is the freelancer in this dispute
    if (req.user.id !== dispute.freelancerId.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the freelancer can respond to this dispute" });
    }

    // Check if dispute is still open
    if (dispute.status !== "open") {
      return res
        .status(400)
        .json({ msg: "Cannot respond to a resolved dispute" });
    }

    // Add response
    dispute.freelancerResponse = response;
    await dispute.save();

    res.json({
      msg: "Response added successfully",
      dispute,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error adding response",
      error: err.message,
    });
  }
};

export default {
  createDispute,
  getAllDisputes,
  getDisputeById,
  resolveDispute,
  getMyDisputes,
  addFreelancerResponse,
};
