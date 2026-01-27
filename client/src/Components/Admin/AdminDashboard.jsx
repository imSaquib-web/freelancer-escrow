// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Api from "../../Services/Api";

const AdminDashboard = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

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

      await Api.patch(`/disputes/resolve/${disputeId}`, { decision });

      alert(`✅ Dispute resolved with: ${decision}`);
      fetchDisputes();
    } catch (err) {
      console.error("Dispute resolution error:", err.response || err);
      alert(
        `Failed to resolve dispute: ${
          err.response?.data?.msg ||
          err.response?.data?.error ||
          err.message
        }`
      );
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🔧 Admin Dashboard</h1>

      <div className="space-y-4">
        {disputes
          .filter((d) => d.status === "open")
          .map((dispute) => (
            <div
              key={dispute._id}
              className="border rounded-lg p-6 bg-white shadow"
            >
              <h3 className="text-xl font-bold mb-2">
                Dispute #{dispute._id}
              </h3>

              <p className="text-gray-600 mb-4">{dispute.reason}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Freelancer</p>
                  <p className="font-semibold">
                    {dispute.freelancerId?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-lg">
                    ₹{dispute.escrowId?.amount}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleResolveDispute(dispute._id, "refund_client")
                  }
                  disabled={resolving === dispute._id}
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  💰 Refund Client
                </button>

                <button
                  onClick={() =>
                    handleResolveDispute(dispute._id, "pay_freelancer")
                  }
                  disabled={resolving === dispute._id}
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  ✅ Pay Freelancer
                </button>

                <button
                  onClick={() =>
                    handleResolveDispute(dispute._id, "split")
                  }
                  disabled={resolving === dispute._id}
                  className="flex-1 bg-purple-600 text-white py-2 rounded"
                >
                  ⚖️ Split 50-50
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
