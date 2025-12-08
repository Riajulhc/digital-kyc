// src/components/Layout.jsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RiUser3Line, RiLogoutBoxRLine } from "react-icons/ri";

export default function Layout() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-hdfc-gray">

      {/* Top blue strip – HDFC identity */}
      <div className="h-2 bg-hdfc-blue"></div>

      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Left Section */}
          <div className="flex items-center gap-3">
            <div className="hdfc-logo-box text-2xl font-extrabold select-none">
              HDFC
            </div>
            <div>
              <div className="text-xs text-gray-500">Digital Banking</div>
              <div className="text-lg font-semibold text-gray-800">KYC Portal</div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-hdfc-blue font-medium"
            >
              Home
            </Link>

            {token && (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-hdfc-blue font-medium"
              >
                Dashboard
              </Link>
            )}

            {!token ? (
              <div className="flex items-center gap-3">
                <Link className="btn-hdfc-outline" to="/login">Login</Link>
                <Link className="btn-hdfc" to="/register">Register</Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 btn-hdfc-outline"
              >
                <RiLogoutBoxRLine size={18} /> Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hdfc-footer">
        © {new Date().getFullYear()} HDFC Bank — Digital KYC Portal. All rights reserved.
      </footer>
    </div>
  );
}
