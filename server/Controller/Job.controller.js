import jobDB from "../Model/Job.js";

const createJob = async (req, res) => {
  try {
    // Create job document with client ID from authenticated user
    const Job = await jobDB.create({
      ...req.body,
      clientId: req.user.id,
    });
    res.json(Job);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "got error while creation Job ", err: err.message });
  }
};
const getJob = async (req, res) => {
  try {
    // Fetch all jobs with open status OR no status (old documents)
    const Job = await jobDB
      .find({
        $or: [{ status: "open" }, { status: { $exists: false } }],
      })
      .populate("clientId", "name email");
    res.json(Job);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "got error while fetching Job ", err: err.message });
  }
};

// Get client's own jobs (all statuses)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await jobDB
      .find({ clientId: req.user.id })
      .populate("clientId", "name email")
      .populate("hiredFreelancer", "name email");
    res.json(jobs);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching client jobs", error: err.message });
  }
};

export default { createJob, getJob, getMyJobs };
