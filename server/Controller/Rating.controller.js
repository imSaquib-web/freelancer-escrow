import RatingDB from "../Model/Rating.js";
import UserDB from "../Model/User.js";
import EscrowDB from "../Model/Escrow.js";

// Add rating to freelancer
const addRating = async (req, res) => {
  try {
    const { escrowId, rating, review } = req.body;
    const ratedBy = req.user.id;

    if (!escrowId || !rating) {
      return res.status(400).json({ msg: "Escrow ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Get escrow details
    const escrow = await EscrowDB.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ msg: "Escrow not found" });
    }

    // Check if user is the client who released payment
    if (ratedBy !== escrow.clientId.toString()) {
      return res.status(403).json({ msg: "Only the client can rate the freelancer" });
    }

    // Check if rating already exists
    const existingRating = await RatingDB.findOne({
      escrowId,
      ratedBy,
    });

    if (existingRating) {
      return res.status(400).json({ msg: "You have already rated this freelancer for this job" });
    }

    // Create rating
    const newRating = await RatingDB.create({
      ratedBy,
      ratedTo: escrow.freelancerId,
      jobId: escrow.jobId,
      escrowId,
      rating,
      review: review || "",
    });

    // Update freelancer's average rating
    const allRatings = await RatingDB.find({ ratedTo: escrow.freelancerId });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (totalRating / allRatings.length).toFixed(2);

    await UserDB.findByIdAndUpdate(escrow.freelancerId, {
      averageRating: parseFloat(averageRating),
      totalRatings: allRatings.length,
    });

    res.status(201).json({
      msg: "Rating added successfully",
      rating: newRating,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error adding rating",
      error: err.message,
    });
  }
};

// Get freelancer's ratings
const getFreelancerRatings = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const ratings = await RatingDB.find({ ratedTo: freelancerId })
      .populate("ratedBy", "name")
      .sort({ createdAt: -1 });

    const freelancer = await UserDB.findById(freelancerId, "averageRating totalRatings");

    res.json({
      averageRating: freelancer?.averageRating || 0,
      totalRatings: freelancer?.totalRatings || 0,
      ratings,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching ratings",
      error: err.message,
    });
  }
};

// Get user's average rating (for display)
const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserDB.findById(userId, "averageRating totalRatings name");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      name: user.name,
      averageRating: user.averageRating || 0,
      totalRatings: user.totalRatings || 0,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching user rating",
      error: err.message,
    });
  }
};

export default {
  addRating,
  getFreelancerRatings,
  getUserRating,
};
