// src/pages/login.jsx
import React, { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLoginBoxLine,
  RiAccountBoxLine,
  RiMailLine,
} from "react-icons/ri";

export default function Login() {
  // mode: "kyc" or "email"
  const [mode, setMode] = useState("kyc");
  const [kycId, setKycId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const redirectFrom = location.state?.from?.pathname || null;

  const validate = () => {
    setErrMsg("");
    if (mode === "kyc") {
      if (!kycId.trim()) {
        setErrMsg("Please enter your KYC ID.");
        return false;
      }
    } else {
      // email mode
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRe.test(email.trim())) {
        setErrMsg("Please enter a valid email address.");
        return false;
      }
    }
    if (!password.trim()) {
      setErrMsg("Please enter your password.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrMsg("");

    try {
      // choose payload depending on mode
      const payload = mode === "kyc" ? { kycId: kycId.trim(), password } : { email: email.trim(), password };

      const res = await API.post("/auth/login", payload);

      const token = res?.data?.token;
      const role = res?.data?.role;
      let user = res?.data?.user || null;

      // If backend doesn't return user, attempt /auth/me
      if (!user && token) {
        try {
          const meRes = await API.get("/auth/me");
          user = meRes?.data || null;
        } catch (err) {
          // ignore; continue
        }
      }

      // Persist auth in context
      login(token, role, user || {});

      // Decide next route
      let nextRoute = "/dashboard";
      if (redirectFrom) {
        nextRoute = redirectFrom;
      } else if (user) {
        const kycStatus = user.kycStatus ?? user.kyc_status ?? user.isKycComplete ?? user.kyc_completed;
        if (
          kycStatus === false ||
          kycStatus === "PENDING" ||
          kycStatus === "INCOMPLETE" ||
          kycStatus === "NOT_SUBMITTED" ||
          kycStatus === undefined
        ) {
          nextRoute = "/kyc-step1";
        } else if (typeof kycStatus === "string" && kycStatus.toLowerCase() === "verified") {
          nextRoute = "/dashboard";
        } else if (kycStatus === true) {
          nextRoute = "/dashboard";
        } else {
          nextRoute = "/kyc-step1";
        }
      } else {
        nextRoute = "/kyc-step1";
      }

      navigate(nextRoute, { replace: true });
    } catch (err) {
      console.error("Login API error:", err);
      console.error("err.response:", err.response);
      setErrMsg(err.response?.data?.message || err.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-3xl font-extrabold text-center text-slate-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-sm text-slate-500 mb-6">Sign in using your credentials</p>

        {/* Mode toggle */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setMode("kyc")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${mode === "kyc" ? "bg-blue-700 text-white" : "bg-slate-50 text-slate-700"}`}
            aria-pressed={mode === "kyc"}
          >
            <span className="inline-flex items-center gap-2"><RiAccountBoxLine /> KYC ID</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("email")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${mode === "email" ? "bg-blue-700 text-white" : "bg-slate-50 text-slate-700"}`}
            aria-pressed={mode === "email"}
          >
            <span className="inline-flex items-center gap-2"><RiMailLine /> Email</span>
          </button>
        </div>

        {/* Error */}
        {errMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
            {errMsg}
          </div>
        )}

        {/* Identifier input */}
        {mode === "kyc" ? (
          <label className="block mb-3">
            <span className="text-sm text-slate-600">KYC ID</span>
            <input
              type="text"
              placeholder="Enter your KYC ID"
              value={kycId}
              onChange={(e) => setKycId(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              inputMode="text"
              autoComplete="username"
            />
          </label>
        ) : (
          <label className="block mb-3">
            <span className="text-sm text-slate-600">Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              inputMode="email"
              autoComplete="email"
            />
          </label>
        )}

        {/* Password */}
        <label className="block mb-4">
          <span className="text-sm text-slate-600">Password</span>
          <div className="mt-1 relative flex items-center">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
            </button>
          </div>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2"
        >
          {loading ? "Authenticating..." : "Login"} <RiLoginBoxLine size={18} />
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          By logging in, you agree to our Terms & Privacy Policy.
        </p>
      </motion.form>
    </div>
  );
}
