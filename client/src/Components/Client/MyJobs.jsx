// src/Components/Client/MyJobs.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

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

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await Api.get("/job/my");
      setMyJobs(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading jobs...</div>;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = myJobs.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(myJobs.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
        <p className="text-gray-600">Manage your posted jobs</p>
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
      )}

      <div className="grid gap-4 mb-6">
        {myJobs.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            You haven't posted any jobs yet
          </p>
        ) : (
          paginatedJobs.map((job) => (
            <MyJobCard key={job._id} job={job} navigate={navigate} />
          ))
        )}
      </div>

      {/* PAGINATION */}
      {myJobs.length > itemsPerPage && (
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
                  ? "bg-purple-600 text-white"
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

export default MyJobs;
