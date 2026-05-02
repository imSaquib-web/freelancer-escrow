// src/pages/Freelancer/BrowseJobs.jsx (UPDATED)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Fetch only OPEN jobs (posted by other clients)
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

  if (loading) {
    //if loading accurs show this
    return <div className="text-center py-10">Loading available jobs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Available Jobs</h1>
      <p className="text-gray-600 mb-6">Browse and bid on freelance projects</p>

      {error && (
        // is there is a error print here
        <div className="bg-red-50 text-red-800 p-4 rounded mb-6">{error}</div>
      )}

      <div className="grid gap-4 mb-6">
        {/* if there is no jobs show this  */}
        {jobs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No jobs available at the moment</p>
          </div>
        ) : (
          // if there is a job show here
          (() => {
            const startIdx = (currentPage - 1) * itemsPerPage;
            const paginatedJobs = jobs.slice(startIdx, startIdx + itemsPerPage);
            return paginatedJobs.map((job) => (
              <div
                key={job._id}
                className="border rounded-lg p-6 bg-white shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Posted by:{" "}
                      <span className="font-semibold">
                        {job.clientId?.name}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">{job.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{job.budget}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold">{job.deadline}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/freelancer/proposal/${job._id}`)}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
                >
                  Submit Proposal
                </button>
              </div>
            ));
          })()
        )}
      </div>

      {/* PAGINATION */}
      {jobs.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            ← Previous
          </button>
          {Array.from(
            { length: Math.ceil(jobs.length / itemsPerPage) },
            (_, i) => i + 1,
          ).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage(
                Math.min(
                  Math.ceil(jobs.length / itemsPerPage),
                  currentPage + 1,
                ),
              )
            }
            disabled={currentPage === Math.ceil(jobs.length / itemsPerPage)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
