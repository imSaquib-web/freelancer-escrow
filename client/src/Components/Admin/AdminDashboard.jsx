// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Api from "../../Services/Api";

const AdminDashboard = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await Api.get("/disputes");
      setDisputes(response.data);
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId, decision) => {
    try {
      setResolving(disputeId);

      await Api.patch(`/disputes/${disputeId}/resolve`, {
        resolution: decision,
      });

      alert(`✅ Dispute resolved with: ${decision}`);
      fetchDisputes();
    } catch (err) {
      console.error("Dispute resolution error:", err.response || err);
      alert(
        `Failed to resolve dispute: ${
          err.response?.data?.msg || err.response?.data?.error || err.message
        }`,
      );
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🔧 Admin Dashboard - Dispute Management</h1>

      {disputes.length === 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ No open disputes at the moment!
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-800">
              <strong>Total Open Disputes:</strong> {disputes.filter((d) => d.status === "open").length}
            </p>
          </div>
          {disputes
            .filter((d) => d.status === "open")
            .map((dispute) => (
              <div
                key={dispute._id}
                className="border rounded-lg p-6 bg-white shadow-lg hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      Dispute #{dispute._id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Job: {dispute.jobId?.title || "N/A"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                    🔴 Open
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Client:</strong>
                    </p>
                    <p className="font-semibold">{dispute.clientId?.name}</p>
                    <p className="text-xs text-gray-600">{dispute.clientId?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Freelancer:</strong>
                    </p>
                    <p className="font-semibold">{dispute.freelancerId?.name}</p>
                    <p className="text-xs text-gray-600">{dispute.freelancerId?.email}</p>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-red-50 rounded border border-red-200">
                  <p className="font-semibold text-red-800 mb-2">
                    Client's Complaint:
                  </p>
                  <p className="text-gray-700">{dispute.reason}</p>
                </div>

                {dispute.freelancerResponse ? (
                  <div className="mb-4 p-4 bg-green-50 rounded border border-green-200">
                    <p className="font-semibold text-green-800 mb-2">
                      ✅ Freelancer's Response:
                    </p>
                    <p className="text-gray-700">{dispute.freelancerResponse}</p>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800">
                      ⏳ Freelancer has NOT responded yet
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Amount in Dispute</p>
                    <p className="text-2xl font-bold text-orange-600">₹{dispute.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filed On</p>
                    <p className="text-sm font-semibold">
                      {new Date(dispute.createdAt).toLocaleDateString()} {new Date(dispute.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveDispute(dispute._id, "refund_client")}
                    disabled={resolving === dispute._id}
                    className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                    title="Refund the money to the client"
                  >
                    💰 Refund Client
                  </button>

                  <button
                    onClick={() => handleResolveDispute(dispute._id, "pay_freelancer")}
                    disabled={resolving === dispute._id}
                    className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                    title="Give the money to the freelancer"
                  >
                    ✅ Pay Freelancer
                  </button>

                  <button
                    onClick={() => handleResolveDispute(dispute._id, "split")}
                    disabled={resolving === dispute._id}
                    className="flex-1 bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:opacity-50 font-semibold transition"
                    title="Split the money 50-50"
                  >
                    🤝 Split 50-50
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
