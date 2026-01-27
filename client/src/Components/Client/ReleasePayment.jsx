import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const ReleasePayment = () => {
  const { jobId } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState("");
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

      setReleasing(true);
      setError("");

      // ✅ CORRECT: PATCH (matches backend)
      await Api.patch(`/release/${escrow._id}`);

      alert("✅ Payment released! Freelancer has been paid.");
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

        <button
          onClick={handleReleasePayment}
          disabled={releasing}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
        >
          {releasing ? "Processing..." : "✅ Release Payment"}
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-700">
          <p className="font-semibold mb-2">Before releasing:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify freelancer completed the work satisfactorily</li>
            <li>Check quality meets your requirements</li>
            <li>Payment cannot be reversed once released</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReleasePayment;
