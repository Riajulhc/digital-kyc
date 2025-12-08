import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { RiUserAddLine, RiLoader4Line } from "react-icons/ri";

export default function Register() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successKycId, setSuccessKycId] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    setErrMsg("");
    if (!email.trim() || !mobile.trim() || !password.trim()) {
      setErrMsg("All fields are required.");
      return false;
    }
    // simple email/mobile checks
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setErrMsg("Please enter a valid email address.");
      return false;
    }
    const mobileRe = /^[6-9]\d{9}$/; // Indian 10-digit mobile pattern
    if (!mobileRe.test(mobile)) {
      setErrMsg("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (password.length < 6) {
      setErrMsg("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrMsg("");
      const res = await API.post("/auth/register", { email, mobile, password });

      // show success inline and allow user to continue to login
      const kycId = res?.data?.kycId || null;
      setSuccessKycId(kycId);
      // small delay so user sees confirmation then redirect if they choose
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrMsg(err?.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.form
        onSubmit={handleRegister}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        aria-labelledby="register-title"
      >
        <h1 id="register-title" className="text-2xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
          <RiUserAddLine /> Create account
        </h1>
        <p className="text-sm text-slate-500 mb-4">Register to start your KYC journey — we'll create a KYC ID for you.</p>

        {errMsg && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-100 text-sm">
            {errMsg}
          </div>
        )}

        {successKycId ? (
          <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-100 text-green-700">
            <div className="font-medium">Registration successful!</div>
            <div className="text-sm mt-1">Your KYC ID: <span className="font-semibold">{successKycId}</span></div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-700 text-white text-sm"
              >
                Proceed to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="block mb-3">
              <span className="text-sm text-slate-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm text-slate-600">Mobile</span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile"
                className="mt-1 w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-slate-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
                className="mt-1 w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <div className="text-xs text-slate-400 mt-2">Minimum 6 characters.</div>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-700 text-white font-medium shadow hover:opacity-95"
              >
                {loading ? <span className="flex items-center gap-2"><RiLoader4Line className="animate-spin" /> Registering...</span> : "Register"}
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-slate-400 mt-4 text-center">
          By registering you agree to our Terms & Privacy Policy.
        </p>
      </motion.form>
    </div>
  );
}
