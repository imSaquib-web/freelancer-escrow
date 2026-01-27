import ProposalDB from "../Model/Proposal.js";
import JobDB from "../Model/Job.js";
import EscrowDB from "../Model/Escrow.js";
import Proposal from "../Model/Proposal.js";

//proposal FREELANCER create krta h
const createProposal = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { amount, message, deliveryTime } = req.body;

    const proposal = await ProposalDB.create({
      jobId: req.params.jobId,
      freelancerId: req.user.id,
      amount,
      message,
      deliveryTime,
    });

    res.status(201).json({ proposal });
  } catch (err) {
    console.error("CREATE PROPOSAL ERROR:", err);
    res.status(500).json({
      msg: "proposal not created",
      error: err.message,
    });
  }
};

// FREELANCER: get my proposals
const getMyProposals = async (req, res) => {
  try {
    const proposals = await ProposalDB.find({
      freelancerId: req.user.id,
    }).populate({
      path: "jobId",
      populate: {
        path: "clientId",
        select: "name email",
      },
    });

    res.json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch freelancer proposals" });
  }
};

// proposal client get kare q ki freelancer proposal job k bhejta h or job kon banaya h CLIENT
const getProposal = async (req, res) => {
  // This says:
  // “Give me all proposals that belong to THIS job.”
  // inshort ye job pr freelancerId name email dedo
  try {
    const proposal = await ProposalDB.find({
      jobId: req.params.jobId,
    }).populate("freelancerId", "name email");
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ msg: "proposal not get" }, err.message);
  }
};

//client hi porposal ko final krta h
const updateProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // 1. Get proposal
    const proposal = await ProposalDB.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ msg: "proposal not found" });
    }

    // 2. Get job
    const job = await JobDB.findById(proposal.jobId);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // 3. Auth check
    if (job.clientId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to accept this proposal" });
    }

    // 4. Accept proposal
    await ProposalDB.findByIdAndUpdate(
      proposalId,
      { status: "accepted" },
      { new: true },
    );

    // 5. Reject other proposals
    await ProposalDB.updateMany(
      {
        jobId: proposal.jobId,
        _id: { $ne: proposal._id },
      },
      { status: "rejected" },
    );

    // 6. Update job to "hired"
    await JobDB.findByIdAndUpdate(proposal.jobId, {
      status: "hired",
      hiredFreelancer: proposal.freelancerId,
    });

    // 7. CREATE ESCROW - Escrow is created when proposal is accepted
    const escrow = await EscrowDB.create({
      jobId: proposal.jobId,
      proposalId: proposal._id,
      clientId: job.clientId,
      freelancerId: proposal.freelancerId,
      amount: proposal.amount,
      funded: false, // Escrow starts unfunded, will be funded after payment
    });

    res.json({
      msg: "freelancer hired & escrow created. Please fund the escrow.",
      escrow,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error updating proposal",
      err: err.message,
    });
  }
};

export default { getProposal, createProposal, updateProposal, getMyProposals };
