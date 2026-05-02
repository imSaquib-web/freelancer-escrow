import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const Dispute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [escrows, setEscrows] = useState([]);
  const [selectedEscrow, setSelectedEscrow] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [disputeSent, setDisputeSent] = useState(false);
  const [submittedDispute, setSubmittedDispute] = useState(null);

  useEffect(() => {
    fetchEscrows();
  }, []);

  useEffect(() => {
    // Pre-fill the selected escrow if provided in URL
    const escrowId = searchParams.get("escrowId");
    if (escrowId && escrows.length > 0) {
      setSelectedEscrow(escrowId);
    }
  }, [searchParams, escrows]);

  const fetchEscrows = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch all escrows for the current user
      const response = await Api.get("/escrow");
      console.log("Escrows fetched:", response.data);

      // Filter for locked escrows (payment not yet released)
      const lockedEscrows = response.data.filter((e) => e.locked);
      console.log("Locked escrows:", lockedEscrows);

      setEscrows(lockedEscrows);

      if (lockedEscrows.length === 0) {
        setError(
          "No locked escrows available. Release payment to file a dispute.",
        );
      }
    } catch (err) {
      console.error("Failed to fetch escrows:", err);
      setError(
        err.response?.data?.msg || "Failed to load escrows. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();

    if (!selectedEscrow || !reason.trim()) {
      alert("Please select an escrow and provide a reason");
      return;
    }

    try {
      setSubmitting(true);
      const response = await Api.post("/disputes", {
        escrowId: selectedEscrow,
        reason,
      });

      setDisputeSent(true);
      setSubmittedDispute(response.data);
      setSelectedEscrow("");
      setReason("");
    } catch (err) {
      console.error("Error filing dispute:", err.response || err);
      alert(
        `Failed to file dispute: ${
          err.response?.data?.msg || err.response?.data?.error || err.message
        }`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  // Show success message when dispute is sent
  if (disputeSent && submittedDispute) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Dispute Sent Successfully!
          </h1>
          <p className="text-green-700 mb-6">
            Your dispute has been filed and submitted to our admin team. The freelancer will be notified and given an opportunity to respond to your claim.
          </p>

          <div className="bg-white p-6 rounded-lg mb-6 text-left border border-green-200">
            <h3 className="font-bold text-lg mb-4">Dispute Details:</h3>
            <div className="space-y-3">
              <p>
                <strong>Dispute ID:</strong>{" "}
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {submittedDispute._id}
                </span>
              </p>
              <p>
                <strong>Amount:</strong> ₹{submittedDispute.amount}
              </p>
              <p>
                <strong>Your Reason:</strong>
              </p>
              <p className="bg-gray-50 p-3 rounded text-gray-700">
                {submittedDispute.reason}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                  Open - Awaiting Freelancer Response
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              <strong>What happens next?</strong>
            </p>
            <ol className="text-left space-y-2 text-gray-600 ml-4">
              <li>1️⃣ The freelancer will receive notification of the dispute</li>
              <li>2️⃣ They will have the opportunity to provide their side of the story</li>
              <li>3️⃣ Our admin team will review both sides and make a decision</li>
              <li>4️⃣ You will be notified of the resolution</li>
            </ol>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => {
                setDisputeSent(false);
                setSubmittedDispute(null);
                fetchEscrows();
              }}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              File Another Dispute
            </button>
            <button
              onClick={() => navigate("/client/dashboard")}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">⚖️ File a Dispute</h1>

      {error && (
        <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {escrows.length > 0 && (
        <form
          onSubmit={handleSubmitDispute}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Select Escrow
            </label>
            <select
              value={selectedEscrow}
              onChange={(e) => setSelectedEscrow(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">-- Select an escrow --</option>
              {escrows.map((escrow) => (
                <option key={escrow._id} value={escrow._id}>
                  Escrow #{escrow._id.substring(0, 8)} - ₹{escrow.amount} (
                  {escrow.jobId?.title || "No title"})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're filing this dispute..."
              className="w-full p-2 border rounded h-32"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {submitting ? "Filing..." : "File Dispute"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Dispute;
