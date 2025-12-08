// src/pages/kyc-step2.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiArrowRightLine, RiArrowLeftLine } from "react-icons/ri";

const STORAGE = "dk_kyc_step2_v2";

export default function KYCStep2() {
  const navigate = useNavigate();

  // Address proof
  const [addrType, setAddrType] = useState("Aadhaar Card");
  const [addrNumber, setAddrNumber] = useState("");

  // Identity proof
  const [idType, setIdType] = useState("PAN Card");
  const [idNumber, setIdNumber] = useState("");

  const [error, setError] = useState("");
  const progress = 40; // Step 2 of 5 => 40%

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      if (saved.addrType) setAddrType(saved.addrType);
      if (saved.addrNumber) setAddrNumber(saved.addrNumber);
      if (saved.idType) setIdType(saved.idType);
      if (saved.idNumber) setIdNumber(saved.idNumber);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify({ addrType, addrNumber, idType, idNumber })
      );
    } catch {}
  }, [addrType, addrNumber, idType, idNumber]);

  // Basic validators depending on selected type
  const validate = () => {
    setError("");

    // Address proof validation
    if (!addrNumber.trim()) {
      setError("Please enter the address proof document number.");
      return false;
    }
    if (addrType === "Aadhaar Card" && !/^\d{12}$/.test(addrNumber)) {
      setError("Aadhaar must be exactly 12 digits.");
      return false;
    }
    if (
      addrType === "Passport" &&
      !/^[A-Za-z0-9]{5,20}$/.test(addrNumber)
    ) {
      setError("Passport number looks invalid.");
      return false;
    }
    // Voter ID - rudimentary (alphanumeric 6-20)
    if (addrType === "Voter ID" && !/^[A-Za-z0-9]{6,20}$/.test(addrNumber)) {
      setError("Voter ID looks invalid.");
      return false;
    }

    // Identity proof validation
    if (!idNumber.trim()) {
      setError("Please enter the identity proof document number.");
      return false;
    }
    if (
      idType === "PAN Card" &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(idNumber)
    ) {
      setError("PAN format invalid (expected AAAAA9999A).");
      return false;
    }
    if (idType === "Aadhaar Card" && !/^\d{12}$/.test(idNumber)) {
      setError("Aadhaar must be exactly 12 digits.");
      return false;
    }
    if (idType === "Passport" && !/^[A-Za-z0-9]{5,20}$/.test(idNumber)) {
      setError("Passport number looks invalid.");
      return false;
    }

    return true;
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    navigate("/kyc-step3");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white">
      <motion.form
        onSubmit={handleNext}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-slate-500">Step 2 of 5</div>
            <h2 className="text-2xl font-extrabold text-slate-800">Enter document details</h2>
            <p className="text-sm text-slate-500 mt-1">
              Provide one Address Proof and one Identity Proof. Aadhaar + PAN are required for digital accounts.
            </p>
          </div>

          <div className="w-36 text-right">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-slate-400">Progress: {progress}%</div>
          </div>
        </div>

        {/* Address Proof */}
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-700 mb-2">Address proof</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={addrType}
              onChange={(e) => setAddrType(e.target.value)}
              className="col-span-1 border rounded px-3 py-2"
            >
              <option>Aadhaar Card</option>
              <option>Voter ID</option>
              <option>Passport</option>
            </select>

            <input
              value={addrNumber}
              onChange={(e) => setAddrNumber(e.target.value)}
              placeholder={
                addrType === "Aadhaar Card"
                  ? "Enter 12-digit Aadhaar"
                  : addrType === "Voter ID"
                  ? "Enter Voter ID"
                  : "Enter Passport number"
              }
              className="md:col-span-2 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Identity Proof */}
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-700 mb-2">Identity proof</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="col-span-1 border rounded px-3 py-2"
            >
              <option>PAN Card</option>
              <option>Aadhaar Card</option>
              <option>Passport</option>
            </select>

            <input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder={
                idType === "PAN Card"
                  ? "Enter PAN (e.g. AAAAA9999A)"
                  : idType === "Aadhaar Card"
                  ? "Enter 12-digit Aadhaar"
                  : "Enter Passport number"
              }
              className="md:col-span-2 border rounded px-3 py-2"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/kyc-step1")}
            className="px-4 py-2 rounded border bg-white"
          >
            <RiArrowLeftLine /> Back
          </button>

          <button type="submit" className="ml-auto px-6 py-3 bg-blue-700 text-white rounded inline-flex items-center gap-2">
            Next <RiArrowRightLine />
          </button>
        </div>
      </motion.form>
    </div>
  );
}
