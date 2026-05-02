// src/pages/Client/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";
import { useAuth } from "../../Context/AuthContext";

const ClientDashboard = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({
    totalJobsPosted: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [allJobsRes, myJobsRes, disputesRes, usersRes] = await Promise.all([
        Api.get("/job"),
        Api.get("/job/my"),
        Api.get("/disputes/my-disputes"),
        Api.get("/users/me"),
      ]);

      const allJobsData = allJobsRes.data;
      const myJobsData = myJobsRes.data;
      const disputesData = disputesRes.data || [];

      setAllJobs(allJobsData);
      setMyJobs(myJobsData);
      setDisputes(disputesData);

      // Calculate stats
      const totalSpentAmount = myJobsData.reduce(
        (sum, job) => sum + (job.budget || 0),
        0,
      );
      const activeJobsCount = myJobsData.filter(
        (job) => job.status === "active" || job.status === "in_progress",
      ).length;
      const completedJobsCount = myJobsData.filter(
        (job) => job.status === "completed",
      ).length;

      setStats({
        totalJobsPosted: myJobsData.length,
        activeJobs: activeJobsCount,
        completedJobs: completedJobsCount,
        totalSpent: totalSpentAmount,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-600">
          Manage your jobs, proposals, and disputes
        </p>
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
      )}

      {/* DISPUTE ALERT */}
      {disputes.filter(
        (d) => d.clientId._id === user?._id && d.status === "open",
      ).length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-red-800 text-lg">
                ⚠️ You have{" "}
                {
                  disputes.filter(
                    (d) => d.clientId._id === user?._id && d.status === "open",
                  ).length
                }{" "}
                open dispute
                {disputes.filter(
                  (d) => d.clientId._id === user?._id && d.status === "open",
                ).length > 1
                  ? "s"
                  : ""}
              </p>
              <p className="text-red-700 text-sm mt-1">
                Please review and take necessary action
              </p>
            </div>
            <button
              onClick={() => navigate("/client/my-disputes")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold whitespace-nowrap ml-4"
            >
              View Now
            </button>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total Jobs Posted</p>
          <p className="text-4xl font-bold text-blue-600">
            {stats.totalJobsPosted}
          </p>
          <p className="text-xs text-gray-500 mt-2">All projects</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Active Jobs</p>
          <p className="text-4xl font-bold text-green-600">
            {stats.activeJobs}
          </p>
          <p className="text-xs text-gray-500 mt-2">In progress</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Completed</p>
          <p className="text-4xl font-bold text-purple-600">
            {stats.completedJobs}
          </p>
          <p className="text-xs text-gray-500 mt-2">Finished projects</p>
        </div>

        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Total Spent</p>
          <p className="text-4xl font-bold text-yellow-600">
            ₹{stats.totalSpent}
          </p>
          <p className="text-xs text-gray-500 mt-2">Budget used</p>
        </div>
      </div>

      {/* QUICK ACCESS SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* RECENT PROPOSALS */}
        <div className="border rounded-lg p-6 bg-white shadow-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📋 My Proposals
          </h3>
          {myJobs.length === 0 ? (
            <p className="text-gray-600 text-sm">No proposals yet</p>
          ) : (
            <div className="space-y-3">
              {myJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="p-3 bg-gray-50 rounded border-l-4 border-blue-400"
                >
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">₹{job.budget}</p>
                </div>
              ))}
              <button
                onClick={() => navigate("/client/my-jobs")}
                className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold text-sm"
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* RECENT DISPUTES */}
        <div className="border rounded-lg p-6 bg-white shadow-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⚖️ My Disputes
          </h3>
          {disputes.filter((d) => d.clientId._id === user?._id).length === 0 ? (
            <p className="text-gray-600 text-sm">No disputes</p>
          ) : (
            <div className="space-y-3">
              {disputes
                .filter((d) => d.clientId._id === user?._id)
                .slice(0, 3)
                .map((dispute) => (
                  <div
                    key={dispute._id}
                    className={`p-3 rounded border-l-4 ${dispute.status === "open" ? "bg-red-50 border-red-400" : "bg-green-50 border-green-400"}`}
                  >
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      Dispute #{dispute._id.substring(0, 6)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ₹{dispute.amount}
                    </p>
                    <span
                      className={`inline-block text-xs font-semibold mt-2 px-2 py-1 rounded ${dispute.status === "open" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                    >
                      {dispute.status === "open" ? "Open" : "Resolved"}
                    </span>
                  </div>
                ))}
              <button
                onClick={() => navigate("/client/my-disputes")}
                className="w-full mt-3 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 font-semibold text-sm"
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* POST NEW JOB */}
        <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md flex flex-col justify-center items-center text-center">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-xl font-bold mb-2">Post a New Job</h3>
          <p className="text-gray-600 text-sm mb-4">
            Find the perfect freelancer for your next project
          </p>
          <button
            onClick={() => navigate("/client/post-job")}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            + Post Job
          </button>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="space-y-4">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">
            📊 Dashboard Overview
          </h3>
          <p className="text-blue-800 text-sm">
            You have posted <strong>{stats.totalJobsPosted}</strong> jobs, with{" "}
            <strong>{stats.activeJobs}</strong> currently active.
            <br />
            You have{" "}
            <strong>
              {disputes.filter((d) => d.clientId._id === user?._id).length}
            </strong>{" "}
            disputes on record. You've spent a total of{" "}
            <strong>₹{stats.totalSpent}</strong> on projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/client/all-jobs")}
            className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">🔓</div>
            <h4 className="font-bold mb-2">Browse Available Jobs</h4>
            <p className="text-sm text-gray-600 mb-4">
              See what other clients are hiring for
            </p>
            <span className="text-lg font-bold text-blue-600">
              {allJobs.filter((j) => j.status === "open").length} Jobs Available
            </span>
          </button>

          <button
            onClick={() => navigate("/client/my-jobs")}
            className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">📋</div>
            <h4 className="font-bold mb-2">View Your Jobs</h4>
            <p className="text-sm text-gray-600 mb-4">
              Manage your posted jobs
            </p>
            <span className="text-lg font-bold text-purple-600">
              {myJobs.length} Your Jobs
            </span>
          </button>

          <button
            onClick={() => navigate("/client/my-disputes")}
            className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">⚖️</div>
            <h4 className="font-bold mb-2">View Disputes</h4>
            <p className="text-sm text-gray-600 mb-4">
              Track all your disputes
            </p>
            <span className="text-lg font-bold text-red-600">
              {disputes.filter((d) => d.clientId._id === user?._id).length}{" "}
              Disputes
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const MyJobCard = ({ job, navigate }) => {
  const [escrow, setEscrow] = useState(null);
  const [loadingEscrow, setLoadingEscrow] = useState(true);

  useEffect(() => {
    fetchEscrow();
  }, [job._id]);

  const fetchEscrow = async () => {
    try {
      const res = await Api.get(`/escrow/job/${job._id}`);
      setEscrow(res.data);
    } catch (err) {
      // 404 means no escrow yet, that's okay
      if (err.response?.status !== 404) {
        console.error("Escrow fetch error:", err);
      }
      setEscrow(null);
    } finally {
      setLoadingEscrow(false);
    }
  };

  const isCompleted = job.status === "completed";
  const isReleased = escrow?.released === true;

  return (
    <div className="border rounded-lg p-6 bg-gray-50 shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-gray-600 mt-2">{job.description}</p>
        </div>
        <span className="px-3 py-1 rounded text-sm font-semibold bg-gray-200">
          {job.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Budget</p>
          <p className="text-lg font-bold">₹{job.budget}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-semibold capitalize">{job.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Posted</p>
          <p className="text-sm font-semibold">
            {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ESCROW + PAYMENT */}
      {loadingEscrow ? (
        <p className="text-sm text-gray-500 mt-4">Loading escrow...</p>
      ) : escrow && escrow.funded && !isCompleted && !isReleased ? (
        <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded">
          <p className="text-sm mb-3">
            Escrow funded. You can release payment.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/client/release-payment/${job._id}`)}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              💰 Release Payment
            </button>

            {escrow.freelancerId && (
              <a
                href={`tel:${job.contactNumber}`}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-center"
              >
                📞 Contact Freelancer
              </a>
            )}
          </div>
        </div>
      ) : escrow && (isCompleted || isReleased) ? (
        <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-400 rounded">
          <p className="text-sm font-semibold text-blue-800">
            ✅ Job Completed / Payment Handled
          </p>
        </div>
      ) : escrow ? (
        <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">⏳ Escrow not funded yet</p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            No escrow created for this job yet
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
