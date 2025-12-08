// src/pages/kyc-step5.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiDownloadCloudLine, RiCheckLine, RiArrowRightLine } from "react-icons/ri";
import jsPDF from "jspdf";
import HDFCLogoUrl from "../assets/hdfc.png"; // ensure this file exists
import { setToken as setApiToken } from "../services/api";

/**
 * Helper: convert remote/local URL to dataURL (base64)
 */
async function urlToDataUrl(url) {
  if (!url) return null;
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = (e) => reject(e);
      fr.readAsDataURL(blob);
    });
  } catch (err) {
    // if fetch fails (CORS, local file), return null
    return null;
  }
}

const maskDocumentNumber = (num) => {
  if (!num) return "—";
  const s = String(num);
  // keep last 4 digits
  return s.replace(/\d(?=\d{4})/g, "*");
};

const maskAccount = (acc) => {
  if (!acc) return "Not assigned";
  const s = String(acc).replace(/\s+/g, "");
  if (s.length <= 4) return "****";
  return `XXXX-XXXX-${s.slice(-4)}`;
};

export default function KYCStep5() {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState(null);
  const [doc, setDoc] = useState(null); // { docType, docNumber, dataUrl (passport/photo) }
  const [loading, setLoading] = useState(false);

  // Load stored data (from previous steps or localStorage)
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("kycPersonal") || "null");
      const d = JSON.parse(localStorage.getItem("kycDocument") || "null");
      // Some flows store passport image data URL separately:
      const passportDataUrl = localStorage.getItem("kycPassportDataUrl") || (d && d.passportDataUrl) || null;

      // normalize
      const docObj = d
        ? { docType: d.docType || d.type || "—", docNumber: d.docNumber || d.number || "—", dataUrl: passportDataUrl }
        : passportDataUrl
        ? { docType: "Passport Photo", docNumber: "—", dataUrl: passportDataUrl }
        : null;

      setPersonal(p);
      setDoc(docObj);
    } catch {
      setPersonal(null);
      setDoc(null);
    }
  }, []);

  // finalize and persist Completed KYC info
  const finalizeAndPersist = (extra = {}) => {
    const nowIso = new Date().toISOString();
    const nowReadable = new Date().toLocaleString();

    const name = (personal && (personal.fullName || personal.name)) || localStorage.getItem("userName") || "Customer";
    const email = (personal && personal.email) || localStorage.getItem("userEmail") || "";
    const mobile = (personal && personal.mobile) || localStorage.getItem("userMobile") || "";
    const kycId = localStorage.getItem("userKycId") || `KYC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const accountNo = localStorage.getItem("userAccountNo") || `AC${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const payload = {
      fullName: name,
      email,
      mobile,
      kycId,
      accountNo,
      status: "Completed",
      submittedAt: nowIso,
      submittedAtReadable: nowReadable,
      docType: doc?.docType || "—",
      docNumber: doc?.docNumber || "—",
      ...extra,
    };

    // persist to localStorage so dashboard reads it
    localStorage.setItem("userName", payload.fullName);
    localStorage.setItem("userEmail", payload.email);
    localStorage.setItem("userMobile", payload.mobile);
    localStorage.setItem("userKycId", payload.kycId);
    localStorage.setItem("userAccountNo", payload.accountNo);
    localStorage.setItem("userKycStatus", payload.status);
    localStorage.setItem("kycCompleteResponse", JSON.stringify(payload));

    return payload;
  };

  // Generate a polished PDF that matches your screenshot style
  const generatePdfAndDownload = async () => {
    if (loading) return;
    setLoading(true);

    // Persist completed data
    const confirm = finalizeAndPersist();

    try {
      // build PDF
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 40;
      let y = margin;

      // load images (logo + passport) as data URLs (if possible)
      const logoData = await urlToDataUrl(HDFCLogoUrl).catch(() => null);
      const passportData = (doc && doc.dataUrl) ? doc.dataUrl : (localStorage.getItem("kycPassportDataUrl") || null);

      // Header container (rounded, light border)
      pdf.setDrawColor(230);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, y, pageW - margin * 2, 70, 8, 8, "S");
      // logo top-left inside header
      if (logoData) {
        try {
          const imgW = 72;
          const imgH = 24;
          pdf.addImage(logoData, "PNG", margin + 12, y + 14, imgW, imgH);
        } catch (e) {
          /* ignore */
        }
      }
      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(20, 33, 61);
      pdf.text("Digital KYC", margin + 12 + 80, y + 28); // to right of logo
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("KYC Confirmation", margin + 12 + 80, y + 48);

      y += 90;

      // Blue Congratulations banner box
      pdf.setFillColor(232, 246, 255);
      pdf.rect(margin, y, pageW - margin * 2, 56, "F");
      pdf.setFontSize(16);
      pdf.setTextColor(6, 66, 156);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Congratulations, ${confirm.fullName}!`, margin + 16, y + 24);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60);
      pdf.text("Your KYC submission is received and recorded. Keep this confirmation for your records.", margin + 16, y + 42);

      y += 80;

      // Info table box
      pdf.setDrawColor(230);
      pdf.roundedRect(margin, y, pageW - margin * 2, 160, 6, 6, "S");
      const colA = margin + 18;
      const colB = pageW - margin - 220;

      pdf.setFontSize(11);
      pdf.setTextColor(30);
      // Row helper
      const row = (label, value, yy) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(label, colA, yy);
        pdf.setFont("helvetica", "normal");
        pdf.text(String(value), colB, yy);
      };

      let rowY = y + 28;
      row("Applicant:", confirm.fullName || "—", rowY);

      rowY += 22;
      row("KYC ID:", confirm.kycId || "N/A", rowY);

      rowY += 22;
      row("Account No:", maskAccount(confirm.accountNo), rowY);

      rowY += 22;
      row("Status:", "Completed", rowY);

      rowY += 22;
      row("Submitted at:", confirm.submittedAtReadable || new Date(confirm.submittedAt).toLocaleString(), rowY);

      rowY += 22;
      row("Document:", `${confirm.docType} / ${maskDocumentNumber(confirm.docNumber)}`, rowY);

      y += 180;

      // Important box (light background) + passport thumb (left)
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(margin, y, pageW - margin * 2, 110, 6, 6, "F");
      pdf.setDrawColor(230);
      pdf.roundedRect(margin, y, pageW - margin * 2, 110, 6, 6, "S");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Important", margin + 16, y + 20);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const infoText = "Please retain this confirmation. Full document numbers were submitted to the server securely and are masked here for privacy.";
      const infoX = margin + 16;
      const infoY = y + 36;
      const infoWidth = pageW - margin * 2 - 150;
      pdf.setTextColor(80);
      pdf.text(pdf.splitTextToSize(infoText, infoWidth), infoX, infoY);

      // passport photo on right if present
      if (passportData) {
        try {
          const thumbW = 70;
          const thumbH = 90;
          const imgX = pageW - margin - thumbW - 16;
          const imgY = y + 12;
          pdf.addImage(passportData, "JPEG", imgX, imgY, thumbW, thumbH);
        } catch (e) {
          // ignore image errors
        }
      }

      // Footer small
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text("Generated by HDFC Digital KYC System.", margin + 10, pdf.internal.pageSize.getHeight() - 28);

      // Download
      const fname = `KYC-confirmation-${(confirm.fullName || "customer").replace(/\s+/g, "_")}.pdf`;
      pdf.save(fname);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    // ensure token header exists if saved
    const token = localStorage.getItem("token");
    if (token) {
      try { setApiToken(token); } catch {}
    }
    // navigate robustly
    try {
      navigate("/dashboard", { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== "/dashboard") window.location.href = "/dashboard";
      }, 100);
    } catch {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-green-50 p-4 inline-flex items-center justify-center">
            <RiCheckLine className="text-green-600" size={36} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold mb-2">KYC Submitted</h2>
        <p className="text-gray-600 mb-6">Thanks {personal?.fullName || personal?.name || "Customer"} — your KYC is submitted.</p>

        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={generatePdfAndDownload}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-3 bg-blue-700 text-white rounded-lg shadow ${loading ? "opacity-70" : ""}`}
          >
            <RiDownloadCloudLine /> {loading ? "Preparing..." : "Download Confirmation"}
          </button>

          <button
            onClick={goToDashboard}
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow"
          >
            Go to Dashboard <RiArrowRightLine />
          </button>
        </div>

        <div className="text-sm text-gray-400">Profile {personal ? "available" : "not available"} — KYC status: <strong>Completed</strong></div>
      </div>
    </div>
  );
}
