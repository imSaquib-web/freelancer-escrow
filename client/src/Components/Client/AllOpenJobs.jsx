// src/Components/Client/AllOpenJobs.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const AllOpenJobs = () => {
  const [jobs, setJobs] = useState([]);
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
      const response = await Api.get("/job");
      setJobs(response.data.filter((job) => job.status === "open"));
      setError("");
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading jobs...</div>;

  const openJobs = jobs;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = openJobs.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(openJobs.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Open Jobs</h1>
        <p className="text-gray-600">Browse and manage all available jobs</p>
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
      )}

      <div className="grid gap-4 mb-6">
        {openJobs.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No open jobs available
          </p>
        ) : (
          paginatedJobs.map((job) => (
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

      {/* PAGINATION */}
      {openJobs.length > itemsPerPage && (
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
                  ? "bg-blue-600 text-white"
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

export default AllOpenJobs;
