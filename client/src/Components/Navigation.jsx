// src/components/Navigation.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            💼 Freelancer Escrow
          </Link>

          <div className="flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Login
                </Link>
                <Link to="/register" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-blue-100 text-xs">{user.role}</p>
                </div>

                {user.role === "client" && (
                  <div className="flex gap-4">
                    <Link to="/client/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      Dashboard
                    </Link>
                    <Link to="/client/post-job" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      Post Job
                    </Link>
                    {/* <Link to="/client/disputes" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      Disputes
                    </Link> */}
                  </div>
                )}

                {user.role === "freelancer" && (
                  <div className="flex gap-4">
                    <Link to="/freelancer/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      Dashboard
                    </Link>
                    <Link to="/freelancer/browse-jobs" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      Browse Jobs
                    </Link>
                    <Link to="/freelancer/my-proposals" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      My Proposals
                    </Link>
                  </div>
                )}

                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded text-sm">
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;