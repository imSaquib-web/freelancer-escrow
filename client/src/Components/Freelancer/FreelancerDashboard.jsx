// src/pages/Freelancer/FreelancerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";
import { useAuth } from "../../Context/AuthContext";

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProposals: 0,
    acceptedProposals: 0,
    completedJobs: 0,
    earnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // here all stats has been prepared here
      const userResponse = await Api.get("/users/me");

      const proposalsRes = await Api.get("/proposals/my");
      const myProposals = proposalsRes.data;

      const totalProposalCount = myProposals.length;
      const acceptedCount = myProposals.filter(
        (p) => p.status === "accepted",
      ).length;
      const completedCount = myProposals.filter(
        (p) => p.status === "completed",
      ).length;

      setStats({
        //here all the stats has been set to the setStats
        totalProposals: totalProposalCount,
        acceptedProposals: acceptedCount,
        completedJobs: completedCount,
        earnings: userResponse.data.walletBalance || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-600">
          Manage your freelance projects and earnings
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total Proposals</p>
          <p className="text-4xl font-bold text-blue-600">
            {stats.totalProposals}
          </p>
          <p className="text-xs text-gray-500 mt-2">Bids submitted</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Accepted</p>
          <p className="text-4xl font-bold text-green-600">
            {stats.acceptedProposals}
          </p>
          <p className="text-xs text-gray-500 mt-2">Winning bids</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Completed</p>
          <p className="text-4xl font-bold text-purple-600">
            {stats.completedJobs}
          </p>
          <p className="text-xs text-gray-500 mt-2">Finished projects</p>
        </div>

        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Wallet Balance</p>
          <p className="text-4xl font-bold text-yellow-600">
            ₹{stats.earnings}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total earnings</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Browse Jobs</h3>
          <p className="text-gray-600 text-sm mb-4">
            Find new freelance projects to bid on
          </p>
          <button
          //this btn take to the all jobs
            onClick={() => navigate("/freelancer/browse-jobs")}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Browse Now
          </button>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">My Proposals</h3>
          <p className="text-gray-600 text-sm mb-4">
            Track your submitted bids and their status
          </p>
          <button
          // this btn takes to my proposal
            onClick={() => navigate("/freelancer/my-proposals")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
          >
            View Proposals
          </button>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-4">👤</div>
          <h3 className="text-xl font-bold mb-2">Profile</h3>
          <p className="text-gray-600 text-sm mb-4">
            Update your profile and skills
          </p>
          <button
          //this heads to the profil edit which is not ready yet
            onClick={() => navigate("/freelancer/profile")}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">
          💡 Getting Started Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Complete your profile with skills and experience</li>
          <li>
            ✅ Submit quality proposals that show you understand the project
          </li>
          <li>✅ Once accepted, deliver high-quality work on time</li>
          <li>✅ Build your reputation and earn more on future projects</li>
        </ul>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
