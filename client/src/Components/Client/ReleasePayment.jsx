import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const ReleasePayment = () => {
  const { jobId } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const escrowResponse = await Api.get(`/escrow/job/${jobId}`);
      setEscrow(escrowResponse.data);
    } catch (err) {
      console.error("Fetch escrow error:", err);
      setError("Failed to load escrow");
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayment = async () => {
    try {
      if (!escrow?._id) {
        setError("Invalid escrow data");
        return;
      }

      if (rating === 0) {
        setError("Please provide a rating before releasing payment");
        return;
      }

      setReleasing(true);
      setError("");

      // Release payment
      await Api.patch(`/release/${escrow._id}`);

      // Add rating
      if (rating > 0) {
        await Api.post("/ratings", {
          escrowId: escrow._id,
          rating,
          review,
        });
      }

      alert("✅ Payment released and rating submitted! Freelancer has been paid.");
      navigate("/client/dashboard");
    } catch (err) {
      console.error("Release payment error:", err);
      setError(err.response?.data?.msg || "Failed to release payment");
      setReleasing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!escrow) {
    return (
      <div className="text-center py-10 text-red-600">Escrow not found</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Release Payment to Freelancer</h1>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded mb-6">{error}</div>
      )}

      <div className="border rounded-lg p-8 bg-white shadow-lg">
        <div className="mb-8 pb-6 border-b">
          <p className="text-sm text-gray-600 mb-2">Freelancer</p>
          <p className="text-2xl font-bold">{escrow.freelancerId?.name}</p>
          <p className="text-sm text-gray-500">{escrow.freelancerId?.email}</p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Amount in Escrow</p>
          <p className="text-5xl font-bold text-blue-600">₹{escrow.amount}</p>
          <p className="text-xs text-gray-600 mt-2">
            90% will go to freelancer, 10% platform fee
          </p>
        </div>

        <div className="mb-8 p-4 bg-green-50 rounded border border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-2">
            Freelancer will receive:
          </p>
          <p className="text-3xl font-bold text-green-600">
            ₹{Math.floor(escrow.amount * 0.9)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Platform fee: ₹{escrow.amount - Math.floor(escrow.amount * 0.9)}
          </p>
        </div>

        {/* RATING SECTION */}
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">⭐ Rate This Freelancer</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Your rating helps other clients make informed decisions
          </p>
          
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  <span className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-semibold text-yellow-800">
                You rated: <span className="text-lg">{rating}/5</span>
              </p>
            )}
            {rating === 0 && (
              <p className="text-sm text-yellow-700">Click to rate</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-yellow-900 mb-2">
              Review (Optional):
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience working with this freelancer..."
              maxLength={500}
              className="w-full p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"
            />
            <p className="text-xs text-yellow-700 mt-1">{review.length}/500 characters</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-800 p-4 rounded">{error}</div>
        )}

        <button
          onClick={handleReleasePayment}
          disabled={releasing || rating === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold transition"
        >
          {releasing ? "Processing..." : `✅ Release Payment & Submit Rating (${rating}/5)`}
        </button>

        <button
          onClick={() => navigate(`/client/disputes?escrowId=${escrow._id}`)}
          className="w-full mt-3 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-bold transition"
        >
          ⚖️ File a Dispute
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-700">
          <p className="font-semibold mb-2">Before releasing:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify freelancer completed the work satisfactorily</li>
            <li>Check quality meets your requirements</li>
            <li>Provide an honest rating to help the community</li>
            <li>Payment cannot be reversed once released</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReleasePayment;
