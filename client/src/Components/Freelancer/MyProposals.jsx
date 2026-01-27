// src/pages/Freelancer/MyProposals.jsx
import React, { useState, useEffect } from "react";
import Api from "../../Services/Api";

const MyProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProposals();
  }, []);

  const fetchMyProposals = async () => {
    try {
      setLoading(true);

      const proposalsResponse = await Api.get("/proposals/my");

      const proposalsWithEscrow = await Promise.all(
        proposalsResponse.data.map(async (proposal) => {
          if (proposal.status === "accepted") {
            try {
              const escrowResponse = await Api.get(
                `/escrow/job/${proposal.jobId._id}`
              );
              return { ...proposal, escrow: escrowResponse.data };
            } catch (err) {
              console.warn("Escrow fetch failed:", err);
              return proposal;
            }
          }
          return proposal;
        })
      );

      setProposals(proposalsWithEscrow);
      setError("");
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError(
        err.response?.data?.msg || "Failed to fetch proposals"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">
        Loading proposals...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Proposals</h1>

      {proposals.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">
            No proposals submitted yet
          </p>
          <p className="text-sm text-gray-500">
            Start bidding on jobs to see them here!
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {proposals.map((proposal) => {
          const jobStatus = proposal.jobId?.status;
          const escrow = proposal.escrow;

          const isCompleted =
            jobStatus === "completed" ||
            escrow?.released === true;

          const isInProgress =
            jobStatus === "in_progress" && !isCompleted;

          const isAccepted =
            proposal.status === "accepted" && !isCompleted;

          return (
            <div
              key={proposal._id}
              className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {proposal.jobId?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Posted by:{" "}
                    {proposal.jobId?.clientId?.name}
                  </p>
                </div>

                <span className="px-4 py-2 rounded font-semibold text-sm bg-gray-100">
                  {jobStatus?.toUpperCase() ||
                    proposal.status?.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {proposal.message}
              </p>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Your Bid
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{proposal.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Delivery Time
                  </p>
                  <p className="font-semibold">
                    {proposal.deliveryTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Job Budget
                  </p>
                  <p className="font-semibold">
                    ₹{proposal.jobId?.budget}
                  </p>
                </div>
              </div>

              {/* PAYMENT RECEIVED */}
              {isCompleted && (
                <div className="p-4 bg-green-100 rounded border border-green-400">
                  <p className="text-green-800 font-semibold">
                    💰 Payment Received from Client
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Job completed successfully.
                  </p>
                </div>
              )}

              {/* WORK IN PROGRESS */}
              {!isCompleted && isInProgress && (
                <div className="p-4 bg-blue-100 rounded border border-blue-400">
                  <p className="text-blue-800 font-semibold">
                    🔄 Work in Progress
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Client has funded escrow.
                  </p>
                </div>
              )}

              {/* PROPOSAL ACCEPTED */}
              {!isCompleted && isAccepted && (
                <div className="p-4 bg-purple-100 rounded border border-purple-400">
                  <p className="text-purple-800 font-semibold">
                    🎉 Proposal Accepted
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    {escrow && escrow.funded
                      ? "💰 Escrow funded! You can start working."
                      : "⏳ Waiting for client to fund escrow."}
                  </p>

                  <a
                    href={`tel:${proposal.jobId?.contactNumber}`}
                    className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    📞 Contact Client:{" "}
                    {proposal.jobId?.contactNumber}
                  </a>
                </div>
              )}

              {/* PENDING */}
              {proposal.status === "pending" && (
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-yellow-800 font-semibold">
                    ⏳ Waiting for client response...
                  </p>
                </div>
              )}

              {/* REJECTED */}
              {proposal.status === "rejected" && (
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <p className="text-red-800 font-semibold">
                    ❌ Proposal was not accepted
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyProposals;
