import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { RiErrorWarningLine, RiCheckboxCircleLine, RiLoader4Line } from "react-icons/ri";

export default function Result() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/kyc/dashboard")
      .then((res) => {
        setKyc(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to fetch KYC result.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    if (!status) return "text-slate-500";
    if (status.toLowerCase() === "verified") return "text-green-600";
    if (status.toLowerCase() === "failed") return "text-red-600";
    return "text-blue-600"; // Pending / Under Review
  };

  const getStatusIcon = (status) => {
    if (!status) return <RiLoader4Line className="text-slate-400 text-3xl animate-spin" />;
    if (status.toLowerCase() === "verified")
      return <RiCheckboxCircleLine className="text-green-600 text-5xl" />;
    if (status.toLowerCase() === "failed")
      return <RiErrorWarningLine className="text-red-600 text-5xl" />;
    return <RiLoader4Line className="text-blue-600 text-5xl animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <h1 className="text-2xl font-extrabold text-slate-800 mb-4">KYC Result</h1>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-10">
            <RiLoader4Line className="text-blue-600 text-4xl animate-spin" />
            <p className="text-sm text-slate-500">Fetching KYC status...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
            <h2 className="font-semibold mb-1">Unable to load KYC status</h2>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Data */}
        {!loading && kyc && !error && (
          <div className="flex flex-col items-center gap-4 text-center">
            {getStatusIcon(kyc.status)}

            <div>
              <p className={`text-lg font-semibold ${getStatusColor(kyc.status)}`}>
                {kyc.status || "—"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your verification result from our KYC system.
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-left">
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <span className={getStatusColor(kyc.status)}>
                  {kyc.status || "—"}
                </span>
              </p>

              <p className="mt-2 text-sm">
                <strong>Failure Reason:</strong>{" "}
                <span className="text-slate-700">
                  {kyc.failureReason || "N/A"}
                </span>
              </p>

              <p className="mt-2 text-xs text-slate-400">
                If your verification has failed, please upload your documents again or contact support.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
