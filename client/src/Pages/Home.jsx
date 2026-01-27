// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Freelancer Payments with Escrow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with talented freelancers and manage payments safely
          </p>
        </div>

        {!user ? (
          <div className="flex justify-center gap-4">
            {/*If user is not login show this buttons*/}
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {/* If user is logged in then check user is freelancer or clien as per this show data */}
            {user.role === "client" && (
              <button
                onClick={() => navigate("/client/dashboard")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Client Dashboard
              </button>
            )}
            {user.role === "freelancer" && (
              <button
                onClick={() => navigate("/freelancer/dashboard")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Freelancer Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
