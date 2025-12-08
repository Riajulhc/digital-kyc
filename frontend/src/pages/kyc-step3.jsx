// src/pages/kyc-step3.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiUploadCloudLine, RiArrowRightLine, RiArrowLeftLine } from "react-icons/ri";
import { motion } from "framer-motion";
import API from "../services/api";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const STEP2_STORAGE = "dk_kyc_step2_v2"; // if step2 saved details here

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function KYCStep3() {
  const navigate = useNavigate();

  // Try to load selected types/numbers from step2 if present
  const step2 = (() => {
    try {
      return JSON.parse(localStorage.getItem(STEP2_STORAGE) || "{}");
    } catch {
      return {};
    }
  })();

  // address proof UI state
  const [addrType, setAddrType] = useState(step2.addrType || "Aadhaar");
  const [addrNumber, setAddrNumber] = useState(step2.addrNumber || "");
  const [addrFile, setAddrFile] = useState(null);

  // identity proof UI state
  const [idType, setIdType] = useState(step2.idType || "Aadhaar");
  const [idNumber, setIdNumber] = useState(step2.idNumber || "");
  const [idFile, setIdFile] = useState(null);

  // attempt info returned by server (optional)
  const [attemptsLeftAddr, setAttemptsLeftAddr] = useState(null);
  const [attemptsLeftId, setAttemptsLeftId] = useState(null);

  // UI state
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progressPct, setProgressPct] = useState(0); // total progress shown
  const addrInputRef = useRef(null);
  const idInputRef = useRef(null);

  useEffect(() => {
    // keep types/numbers in sync with localStorage (so user can go back)
    const payload = { addrType, addrNumber, idType, idNumber };
    try {
      localStorage.setItem(STEP2_STORAGE, JSON.stringify(payload));
    } catch {}
  }, [addrType, addrNumber, idType, idNumber]);

  // Helpers
  const validateFile = (f) => {
    if (!f) return "No file selected";
    if (!ACCEPTED_TYPES.includes(f.type)) return "Unsupported file type. Use JPG/PNG/PDF.";
    if (f.size > MAX_SIZE_BYTES) return `File too large. Max ${formatBytes(MAX_SIZE_BYTES)} allowed.`;
    return null;
  };

  const onChooseFile = (file, which) => {
    setError("");
    if (!file) {
      if (which === "addr") setAddrFile(null);
      else setIdFile(null);
      return;
    }
    const v = validateFile(file);
    if (v) return setError(v);
    // store File object for upload
    if (which === "addr") setAddrFile(file);
    else setIdFile(file);
  };

  // drag/drop handlers
  const handleDrop = (e, which) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) onChooseFile(f, which);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // perform single file upload (field name 'document'), used twice
  async function uploadSingleFile(file, docKind, setAttemptsLeftCallback, onProgressOnce) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", docKind); // server can use this to tag

    const res = await API.post("/kyc/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        // reported percent for this file is 0-100; we map it through caller
        if (evt.total) {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          onProgressOnce(pct);
        }
      },
    });
    // server is expected to return attemptsLeft optionally
    if (res?.data?.attemptsLeft !== undefined && setAttemptsLeftCallback) {
      setAttemptsLeftCallback(res.data.attemptsLeft);
    }
    return res.data;
  }

  const handleUploadAll = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!addrFile) return setError("Please select/upload your address proof file.");
    if (!idFile) return setError("Please select/upload your identity proof file.");

    setUploading(true);
    setProgressPct(0);

    try {
      // upload address (first) - map per-file progress into first half of overall (0-50%)
      await uploadSingleFile(
        addrFile,
        `address:${addrType}:${addrNumber || ""}`,
        setAttemptsLeftAddr,
        (filePct) => {
          // filePct: 0-100 -> overall 0-50
          setProgressPct(Math.round((filePct * 0.5)));
        }
      );

      // small pause to ensure UI shows 50%
      setProgressPct(50);

      // upload identity (second) - map per-file progress into second half (50-100)
      await uploadSingleFile(
        idFile,
        `identity:${idType}:${idNumber || ""}`,
        setAttemptsLeftId,
        (filePct) => {
          // filePct 0-100 -> overall 50-100
          setProgressPct(50 + Math.round((filePct * 0.5)));
        }
      );

      setProgressPct(100);

      // success -> navigate forward
      navigate("/kyc-step4");
    } catch (err) {
      // if server error includes message property, show it
      const msg = err?.response?.data?.message || err?.message || "Upload failed. Try again.";
      setError(msg);
      setProgressPct(0);
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => navigate("/kyc-step2");

  // small display helpers
  const fileInfo = (f) => {
    if (!f) return null;
    // f might be a File object (when chosen) or an object saved earlier (name,size)
    const name = f.name || f.filename || "file";
    const size = f.size || f.length || 0;
    return (
      <div className="mt-2 text-sm text-slate-700">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-slate-400">{formatBytes(size)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.form
        onSubmit={handleUploadAll}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
        aria-labelledby="kyc-step3-title"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-slate-500">
              Step <span className="font-semibold">3</span> of <span className="font-semibold">5</span>
            </div>
            <h2 id="kyc-step3-title" className="text-2xl font-extrabold text-slate-800">
              Upload your documents
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload Address Proof and Identity Proof. Max {formatBytes(MAX_SIZE_BYTES)} each.
            </p>
          </div>

          <div className="w-40">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-2 text-right">Progress: {progressPct}%</div>
          </div>
        </div>

        {/* Address Proof */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Address Proof</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Document type</label>
              <select value={addrType} onChange={(e) => setAddrType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option>Aadhaar</option>
                <option>Voter ID</option>
                <option>Passport</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Document number</label>
              <input
                value={addrNumber}
                onChange={(e) => setAddrNumber(e.target.value)}
                placeholder="Document number"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div
            onDrop={(e) => handleDrop(e, "addr")}
            onDragOver={handleDragOver}
            className="mt-4 border-2 border-dashed rounded-xl p-4 cursor-pointer bg-white"
            onClick={() => document.getElementById("addr-file-input")?.click()}
          >
            <input
              id="addr-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => onChooseFile(e.target.files?.[0] || null, "addr")}
            />
            <div className="flex items-center gap-3">
              <RiUploadCloudLine className="text-2xl text-blue-600" />
              <div>
                <div className="font-medium text-slate-700">{addrFile ? "File selected" : "Click or drag file here to upload address proof"}</div>
                <div className="text-xs text-slate-400">Accepted: JPG, PNG, PDF · Max {formatBytes(MAX_SIZE_BYTES)}</div>
                {fileInfo(addrFile)}
                {attemptsLeftAddr !== null && <div className="text-xs mt-1 text-amber-700">Attempts left: {attemptsLeftAddr}</div>}
              </div>
            </div>
          </div>
        </section>

        {/* Identity Proof */}
        <section className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Identity Proof</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Document type</label>
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option>Aadhaar</option>
                <option>PAN</option>
                <option>Passport</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Document number</label>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Document number"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div
            onDrop={(e) => handleDrop(e, "id")}
            onDragOver={handleDragOver}
            className="mt-4 border-2 border-dashed rounded-xl p-4 cursor-pointer bg-white"
            onClick={() => document.getElementById("id-file-input")?.click()}
          >
            <input
              id="id-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => onChooseFile(e.target.files?.[0] || null, "id")}
            />
            <div className="flex items-center gap-3">
              <RiUploadCloudLine className="text-2xl text-blue-600" />
              <div>
                <div className="font-medium text-slate-700">{idFile ? "File selected" : "Click or drag file here to upload identity proof"}</div>
                <div className="text-xs text-slate-400">Accepted: JPG, PNG, PDF · Max {formatBytes(MAX_SIZE_BYTES)}</div>
                {fileInfo(idFile)}
                {attemptsLeftId !== null && <div className="text-xs mt-1 text-amber-700">Attempts left: {attemptsLeftId}</div>}
              </div>
            </div>
          </div>
        </section>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <RiArrowLeftLine /> Back
          </button>

          <button
            type="submit"
            disabled={uploading}
            className="ml-auto inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-700 text-white font-medium shadow hover:opacity-95"
          >
            {uploading ? `Uploading ${progressPct}%` : "Upload & Next"} <RiArrowRightLine />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Tip: For Aadhaar, use a clear photo showing all corners. For PAN, a scanned PDF or clear photo works best.
        </p>
      </motion.form>
    </div>
  );
}
