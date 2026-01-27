// src/pages/Client/ViewProposal.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const ViewProposal = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, [jobId]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await Api.get(`/proposals/${jobId}`);
      setProposals(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch proposals failed:", err);
      setError(
        err.response?.data?.msg || "Failed to fetch proposals"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await Api.patch(`/proposals/accept/${proposalId}`);
      alert("Proposal accepted");
      navigate(`/client/escrow/${jobId}`);
    } catch (err) {
      console.error("Accept proposal failed:", err);
      setError(
        err.response?.data?.msg || "Failed to accept proposal"
      );
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        Proposals Received
      </h1>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {proposals.length === 0 && (
        <p className="text-gray-600">No proposals yet</p>
      )}

      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <div
            key={proposal._id}
            className="border rounded-lg p-6 bg-white shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {proposal.freelancerId?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {proposal.freelancerId?.email}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  proposal.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : proposal.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {proposal.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">
              {proposal.message}
            </p>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-green-600">
                  ₹{proposal.amount}
                </p>
                <p className="text-sm text-gray-500">
                  {proposal.deliveryTime}
                </p>
              </div>

              {proposal.status === "pending" && (
                <button
                  onClick={() =>
                    handleAcceptProposal(proposal._id)
                  }
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Accept Proposal
                </button>
              )}

              {proposal.status === "accepted" && (
                <span className="text-green-700 font-semibold">
                  ✅ Accepted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewProposal;
