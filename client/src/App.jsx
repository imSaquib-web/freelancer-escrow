// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Components/Navigation";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Home from "./Pages/Home";

// Client
import ClientDashboard from "./Components/Client/ClientDashboard";
import PostJob from "./Components/Client/PostJob";
import ViewProposals from "./Components/Client/ViewProposal";
import CreateEscrow from "./Components/Client/CreateEscrow";
import ReleasePayment from "./Components/Client/ReleasePayment";
import DisputesPage from "./Components/Client/Dispute";

// Freelancer
import FreelancerDashboard from "./Components/Freelancer/FreelancerDashboard";
import BrowseJobs from "./Components/Freelancer/BrowseJob";
import SubmitProposal from "./Components/Freelancer/SubmitProposal";
import MyProposals from "./Components/Freelancer/MyProposals";

// Admin
import AdminDashboard from "./Components/Admin/AdminDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client Routes - Protected */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute
              element={<ClientDashboard />}
              requiredRole="client"
            />
          }
        />
        <Route
          path="/client/post-job"
          element={
            <ProtectedRoute element={<PostJob />} requiredRole="client" />
          }
        />
        <Route
          path="/client/proposals/:jobId"
          element={
            <ProtectedRoute element={<ViewProposals />} requiredRole="client" />
          }
        />
        <Route
          path="/client/escrow/:jobId"
          element={
            <ProtectedRoute element={<CreateEscrow />} requiredRole="client" />
          }
        />
        <Route
          path="/client/release-payment/:jobId"
          element={
            <ProtectedRoute
              element={<ReleasePayment />}
              requiredRole="client"
            />
          }
        />
        <Route
          path="/client/disputes"
          element={
            <ProtectedRoute element={<DisputesPage />} requiredRole="client" />
          }
        />

        {/* Freelancer Routes - Protected */}
        <Route
          path="/freelancer/dashboard"
          element={
            <ProtectedRoute
              element={<FreelancerDashboard />}
              requiredRole="freelancer"
            />
          }
        />
        <Route
          path="/freelancer/browse-jobs"
          element={
            <ProtectedRoute
              element={<BrowseJobs />}
              requiredRole="freelancer"
            />
          }
        />
        <Route
          path="/freelancer/proposal/:jobId"
          element={
            <ProtectedRoute
              element={<SubmitProposal />}
              requiredRole="freelancer"
            />
          }
        />
        <Route
          path="/freelancer/my-proposals"
          element={
            <ProtectedRoute
              element={<MyProposals />}
              requiredRole="freelancer"
            />
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
