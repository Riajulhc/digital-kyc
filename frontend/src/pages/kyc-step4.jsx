// src/pages/kyc-step4.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiCheckLine,
  RiEditLine,
  RiFileUploadLine,
  RiArrowLeftLine,
  RiArrowRightLine,
} from "react-icons/ri";
import API from "../services/api";

function maskDocNumber(num) {
  if (!num) return "";
  const s = String(num);
  if (s.length <= 4) return "****";
  const last4 = s.slice(-4);
  return `${"*".repeat(Math.max(0, s.length - 4))}${last4}`;
}

export default function KYCStep4() {
  const navigate = useNavigate();

  const [personal, setPersonal] = useState(null);
  const [document, setDocument] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null); // server upload info if any
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("kycPersonal") || "null");
      const d = JSON.parse(localStorage.getItem("kycDocument") || "null");
      const ph = localStorage.getItem("kycPhoto") || null;
      const up = JSON.parse(localStorage.getItem("kycUploadResponse") || "null");

      setPersonal(p);
      setDocument(d);
      setPhotoPreview(ph);
      setUploadInfo(up);
    } catch (e) {
      console.warn("Failed to load saved KYC data:", e);
    }
  }, []);

  const handleEditPersonal = () => navigate("/kyc-step1");
  const handleEditDocument = () => navigate("/kyc-step2");
  const handleChangeUpload = () => navigate("/kyc-step3");
  const handleBack = () => navigate("/kyc-step3");

  const handleConfirm = async () => {
    setError("");
    // basic validation
    if (!personal) return setError("Personal details missing. Please fill Step 1.");
    if (!document) return setError("Document details missing. Please fill Step 2.");
    if (!uploadInfo && !photoPreview) return setError("Uploaded file missing. Please complete Step 3.");

    setSubmitting(true);
    try {
      // Try to call backend finalize endpoint if exists
      // Expected endpoint: POST /api/kyc/complete  with payload { personal, document, uploadInfo }
      // If you don't have this endpoint, it will fall back to navigate to step5.
      const payload = {
        personal,
        document,
        uploadInfo,
      };

      // Only call if API configured (catch errors)
      try {
        const res = await API.post("/kyc/complete", payload);
        // optionally backend returns updated application or user profile
        // store response for step5 if needed
        localStorage.setItem("kycCompleteResponse", JSON.stringify(res.data || {}));
      } catch (apiErr) {
        // Not fatal — we still allow navigation to step5
        console.warn("kyc/complete returned error or not available:", apiErr?.response?.data || apiErr.message);
      }

      navigate("/kyc-step5");
    } catch (err) {
      setError(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm text-slate-500">Step 4 of 5</div>
            <h1 className="text-2xl font-extrabold mt-2 text-slate-800">Review & confirm your details</h1>
            <p className="text-sm text-slate-500 mt-2">Please verify the details below before submission. You can edit any item if something looks wrong.</p>
          </div>

          <div className="w-40">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: "80%" }} />
            </div>
            <div className="text-xs text-slate-400 mt-2 text-right">Progress: 80%</div>
          </div>
        </div>

        {/* Personal Details Card */}
        <div className="border border-slate-100 rounded-lg p-4 mb-4 bg-slate-50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold">Personal details</div>
              {personal ? (
                <div className="flex items-center text-green-600 gap-1 text-sm">
                  <RiCheckLine /> <span>Completed</span>
                </div>
              ) : (
                <div className="text-sm text-amber-600">Missing</div>
              )}
            </div>

            {personal ? (
              <div className="mt-3 text-sm text-slate-700 space-y-1">
                <div><strong>Name:</strong> {personal.fullName}</div>
                <div><strong>DOB:</strong> {personal.dob}</div>
                <div><strong>Father's Name:</strong> {personal.fatherName}</div>
                <div><strong>Address:</strong> {personal.address}, {personal.city} {personal.pincode}</div>
                <div><strong>Gender:</strong> {personal.gender || "-"}</div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No personal details found. Please complete Step 1.</div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={handleEditPersonal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <RiEditLine /> Edit
            </button>

            {/* show photo if present */}
            {photoPreview ? (
              <img src={photoPreview} alt="passport" className="w-20 h-24 object-cover rounded-md border" />
            ) : (
              <div className="w-20 h-24 bg-slate-100 rounded-md border flex items-center justify-center text-sm text-slate-500">No photo</div>
            )}
          </div>
        </div>

        {/* Document Card */}
        <div className="border border-slate-100 rounded-lg p-4 mb-4 bg-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold">Selected document</div>
              {document ? (
                <div className="flex items-center text-green-600 gap-1 text-sm">
                  <RiCheckLine /> <span>Selected</span>
                </div>
              ) : (
                <div className="text-sm text-amber-600">Missing</div>
              )}
            </div>

            {document ? (
              <div className="mt-3 text-sm text-slate-700">
                <div className="font-medium">{document.docType}</div>
                <div className="text-xs text-slate-400">This is the document type you chose in Step 2.</div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No document selected.</div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <button onClick={handleEditDocument} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
              <RiEditLine /> Edit
            </button>
          </div>
        </div>

        {/* Document Number Card */}
        <div className="border border-slate-100 rounded-lg p-4 mb-4 bg-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold">Document number</div>
              {document?.docNumber ? (
                <div className="flex items-center text-green-600 gap-1 text-sm">
                  <RiCheckLine /> <span>Provided</span>
                </div>
              ) : (
                <div className="text-sm text-amber-600">Missing</div>
              )}
            </div>

            {document?.docNumber ? (
              <div className="mt-3 text-sm text-slate-700">
                <div className="font-medium">{maskDocNumber(document.docNumber)}</div>
                <div className="text-xs text-slate-400">Masked in UI for privacy. Full value is submitted to verification service.</div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No document number provided.</div>
            )}
          </div>

          <div>
            <button onClick={handleEditDocument} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
              <RiEditLine /> Edit
            </button>
          </div>
        </div>

        {/* Uploaded File Card */}
        <div className="border border-slate-100 rounded-lg p-4 mb-6 bg-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold">Uploaded file</div>
              {uploadInfo || photoPreview ? (
                <div className="flex items-center text-green-600 gap-1 text-sm">
                  <RiCheckLine /> <span>Uploaded</span>
                </div>
              ) : (
                <div className="text-sm text-amber-600">Missing</div>
              )}
            </div>

            <div className="mt-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <RiFileUploadLine className="text-blue-600" />
                <div>{uploadInfo?.fileName || (personal ? "Passport Photo" : "No file")}</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">The file you uploaded in Step 3 will be used to verify the document.</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button onClick={handleChangeUpload} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
              Change
            </button>

            {uploadInfo?.filePath ? (
              <a
                href={uploadInfo.filePath}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-700"
              >
                View uploaded file
              </a>
            ) : null}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <RiArrowLeftLine /> Back
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {submitting ? "Submitting..." : "Confirm"} <RiArrowRightLine />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
