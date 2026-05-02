// src/Components/Client/MyDisputes.jsx
import React, { useState, useEffect } from "react";
import Api from "../../Services/Api";
import { useAuth } from "../../Context/AuthContext";

const MyDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await Api.get("/disputes/my-disputes");
      setDisputes(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch disputes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading disputes...</div>;

  const myDisputes = disputes.filter((d) => d.clientId._id === user?._id);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedDisputes = myDisputes.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(myDisputes.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Disputes</h1>
        <p className="text-gray-600">Track and manage your disputes</p>
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
      )}

      {/* OPEN DISPUTES ALERT */}
      {myDisputes.filter((d) => d.status === "open").length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <p className="font-bold text-red-800 text-lg">
            ⚠️ You have {myDisputes.filter((d) => d.status === "open").length}{" "}
            open dispute
            {myDisputes.filter((d) => d.status === "open").length > 1
              ? "s"
              : ""}
          </p>
          <p className="text-red-700 text-sm mt-1">
            Please review and take necessary action
          </p>
        </div>
      )}

      <div className="grid gap-4 mb-6">
        {myDisputes.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            You haven't filed any disputes yet
          </p>
        ) : (
          paginatedDisputes.map((dispute) => (
            <div
              key={dispute._id}
              className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Dispute #{dispute._id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Against: {dispute.freelancerId.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    dispute.status === "open"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {dispute.status === "open" ? "🔴 Open" : "✅ Resolved"}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Your Complaint:</strong>
                </p>
                <p className="text-gray-700">{dispute.reason}</p>
              </div>

              {dispute.freelancerResponse && (
                <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    Freelancer's Response:
                  </p>
                  <p className="text-gray-700">{dispute.freelancerResponse}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-lg font-bold">₹{dispute.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Job</p>
                  <p className="text-sm font-semibold">
                    {dispute.jobId?.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filed</p>
                  <p className="text-sm font-semibold">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {dispute.status === "resolved" && (
                <div className="mt-4 p-4 bg-purple-50 rounded border border-purple-200">
                  <p className="font-semibold text-purple-800 mb-2">
                    Admin Decision:
                  </p>
                  <p className="text-gray-700">
                    {dispute.resolution === "refund_client"
                      ? "💰 You have been refunded"
                      : dispute.resolution === "pay_freelancer"
                        ? "✅ Freelancer was paid"
                        : "🤝 Amount split 50-50"}
                  </p>
                </div>
              )}

              {dispute.status === "open" && !dispute.freelancerResponse && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    ⏳ Awaiting freelancer's response...
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {myDisputes.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded ${
                currentPage === page
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDisputes;
