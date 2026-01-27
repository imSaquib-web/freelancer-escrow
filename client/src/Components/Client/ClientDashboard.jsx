// src/pages/Client/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const ClientDashboard = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [allJobsRes, myJobsRes] = await Promise.all([
        Api.get("/job"),
        Api.get("/job/my"),
      ]);

      setAllJobs(allJobsRes.data);
      setMyJobs(myJobsRes.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading jobs...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <button
          onClick={() => navigate("/client/post-job")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Post New Job
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* TABS */}
      <div className="flex gap-6 mb-6 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 font-semibold ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Open Jobs ({allJobs.length})
        </button>

        <button
          onClick={() => setActiveTab("my")}
          className={`pb-2 font-semibold ${
            activeTab === "my"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          📋 My Jobs ({myJobs.length})
        </button>
      </div>

      {/* ALL JOBS */}
      {activeTab === "all" && (
        <div className="grid gap-4">
          {allJobs.length === 0 ? (
            <p className="text-gray-600 text-center py-10">
              No open jobs available
            </p>
          ) : (
            allJobs.map((job) => (
              <div
                key={job._id}
                className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold">{job.title}</h3>
                <p className="text-gray-600 mt-2">{job.description}</p>

                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-lg font-semibold">₹{job.budget}</p>
                    <p className="text-sm text-green-600 font-semibold">
                      ✅ Open
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/client/proposals/${job._id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    View Proposals
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MY JOBS */}
      {activeTab === "my" && (
        <div className="grid gap-4">
          {myJobs.length === 0 ? (
            <p className="text-gray-600 text-center py-10">
              You haven’t posted any jobs yet
            </p>
          ) : (
            myJobs.map((job) => (
              <MyJobCard key={job._id} job={job} navigate={navigate} />
            ))
          )}
        </div>
      )}
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
