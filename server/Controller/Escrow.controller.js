import Job from "../Model/Job.js";
import Proposal from "../Model/Proposal.js";
import Escrow from "../Model/Escrow.js";

// Get all escrows for current user (as client or freelancer)
const getMyEscrows = async (req, res) => {
  try {
    const userId = req.user.id;

    const escrows = await Escrow.find({
      $or: [{ clientId: userId }, { freelancerId: userId }],
    })
      .populate("jobId", "title")
      .populate("clientId", "name email")
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(escrows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching escrows", error: err.message });
  }
};

export const getEscrowByJob = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ jobId: req.params.jobId });
    if (!escrow) {
      return res.status(404).json({ msg: "Escrow not found" });
    }

    // Allow access if user is the client or freelancer involved
    if (
      req.user.id !== escrow.clientId.toString() &&
      req.user.id !== escrow.freelancerId.toString()
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to view this escrow" });
    }

    res.json(escrow);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching escrow", error: err.message });
  }
};

const createEscrow = async (req, res) => {
  // 1. find job
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return res.status(404).json({ msg: "Job not found" });
  }

  // 2. find accepted proposal
  const proposal = await Proposal.findOne({
    jobId: job._id,
    status: "accepted",
  });

  if (!proposal) {
    return res.status(404).json({ msg: "Accepted proposal not found" });
  }

  // 3. create escrow
  const escrow = await Escrow.create({
    jobId: job._id,
    clientId: job.clientId,
    freelancerId: proposal.freelancerId,
    amount: proposal.amount,
  });

  // 4. update job
  job.status = "in_progress";
  await job.save();

  res.json(escrow);
};

export default { createEscrow, getEscrowByJob, getMyEscrows };
