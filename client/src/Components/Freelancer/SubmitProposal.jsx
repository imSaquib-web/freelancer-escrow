// src/pages/Freelancer/SubmitProposal.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const SubmitProposal = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    //fetching the job
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      // Get all jobs and find this one
      const response = await Api.get("/job");
      const foundJob = response.data.find((j) => j._id === jobId);

      if (foundJob) {
        setJob(foundJob);
      } else {
        setError("Job not found");
      }
    } catch (err) {
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !message || !deliveryTime) {
      setError("Please fill in all fields");
      return;
    }

    if (amount <= 0) {
      setError("Bid amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      //creating proposal 
      await Api.post(`/proposals/${jobId}`, {
        amount: parseInt(amount),
        message,
        deliveryTime: parseInt(deliveryTime),
      });

      alert("✅ Proposal submitted successfully!");
      navigate("/freelancer/my-proposals");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-800 p-6 rounded">
          <p className="font-bold mb-2">❌ Job Not Found</p>
          <p className="text-sm mb-4">
            This job may have been deleted or is no longer available.
          </p>
          <button
            onClick={() => navigate("/freelancer/browse-jobs")}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Browse Other Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Submit Your Proposal</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Job Details */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-2xl font-bold mb-4">{job.title}</h2>

          <p className="text-gray-600 mb-4">{job.description}</p>

          <div className="space-y-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-semibold">{job.clientId?.name || "Unknown"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Budget Range</p>
              <p className="font-semibold text-lg text-green-600">
                ₹{job.budget}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="font-semibold">{job.deadline}</p>
            </div>

          </div>
        </div>

        {/* Proposal Form */}
        <form
          onSubmit={handleSubmit}
          className="border rounded-lg p-6 bg-white shadow"
        >
          <h3 className="text-xl font-bold mb-6">Your Proposal</h3>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Bid Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Bid Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="1"
                />
              </div>
              {amount && job.budget && (
                <p
                  className={`text-xs mt-2 ${
                    parseInt(amount) <= job.budget
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {parseInt(amount) <= job.budget
                    ? `✅ Within budget (Client budget: ₹${job.budget})`
                    : `⚠️ Above budget (Client budget: ₹${job.budget})`}
                </p>
              )}
            </div>

            {/* Delivery Timeline */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Delivery Timeline
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select timeline</option>
                <option value="3 days">3 Days</option>
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
              </select>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Letter
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Explain why you're the best fit for this project..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold text-lg transition"
            >
              {submitting ? "Submitting..." : "✅ Submit Proposal"}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/freelancer/browse-jobs")}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 font-semibold"
            >
              Back to Browse
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 Proposal Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Be competitive but fair - research similar projects</li>
              <li>
                • Write a personalized message showing you understand the work
              </li>
              <li>• Highlight relevant experience and skills</li>
              <li>• Be realistic about delivery timeline</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProposal;
