import React, { useState, useEffect } from "react";
import Api from "../../Services/Api";
import { useAuth } from "../../Context/AuthContext";

const FreelancerDispute = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyDisputes();
  }, []);

  const fetchMyDisputes = async () => {
    try {
      setLoading(true);
      const response = await Api.get("/disputes/my-disputes");
      setDisputes(response.data);
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (disputeId) => {
    if (!responseText.trim()) {
      alert("Please enter your response");
      return;
    }

    try {
      setSubmitting(true);
      await Api.patch(`/disputes/${disputeId}/response`, {
        response: responseText,
      });

      alert("✅ Your response has been submitted to the admin!");
      setResponseText("");
      setRespondingTo(null);
      fetchMyDisputes();
    } catch (err) {
      console.error("Error submitting response:", err.response || err);
      alert(
        `Failed to submit response: ${
          err.response?.data?.msg || err.response?.data?.error || err.message
        }`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const myDisputes = disputes.filter((d) => d.freelancerId._id === user?._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">⚖️ Disputes Filed Against You</h1>

      {myDisputes.length === 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ No disputes filed against you!
        </div>
      ) : (
        <div className="space-y-6">
          {myDisputes.map((dispute) => (
            <div
              key={dispute._id}
              className="border rounded-lg p-6 bg-white shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">
                  Dispute #{dispute._id.substring(0, 8)}
                </h3>
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

              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Dispute Filed By:</strong> {dispute.clientId.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Amount:</strong> ₹{dispute.amount}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Job:</strong> {dispute.jobId?.title}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
                <p className="font-semibold text-red-800 mb-2">
                  Their Complaint:
                </p>
                <p className="text-gray-700">{dispute.reason}</p>
              </div>

              {dispute.freelancerResponse && (
                <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
                  <p className="font-semibold text-blue-800 mb-2">
                    Your Response:
                  </p>
                  <p className="text-gray-700">{dispute.freelancerResponse}</p>
                </div>
              )}

              {dispute.status === "open" && !dispute.freelancerResponse && (
                <>
                  {respondingTo === dispute._id ? (
                    <div className="bg-gray-50 p-4 rounded">
                      <label className="block text-sm font-semibold mb-2">
                        Your Response to This Dispute:
                      </label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Explain your side of the story here. Be professional and clear..."
                        className="w-full p-2 border rounded h-24 mb-3"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddResponse(dispute._id)}
                          disabled={submitting}
                          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Response"}
                        </button>
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText("");
                          }}
                          className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(dispute._id)}
                      className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 font-semibold"
                    >
                      📝 Provide Your Response
                    </button>
                  )}
                </>
              )}

              {dispute.status === "resolved" && (
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-2">
                    Resolution:
                  </p>
                  <p className="text-gray-700">
                    <strong>Decision:</strong>{" "}
                    {dispute.resolution === "refund_client"
                      ? "💰 Client Refunded"
                      : dispute.resolution === "pay_freelancer"
                        ? "✅ You Got Paid"
                        : "🤝 Split 50-50"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerDispute;
