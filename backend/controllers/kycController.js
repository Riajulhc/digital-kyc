// backend/controllers/kycController.js
const fs = require('fs');
const path = require('path');
const KYCApplication = require('../models/KYCApplication');
const Document = require('../models/Document');
const Attempt = require('../models/Attempt');
const simulateMatch = require('../utils/photoMatchSimulator');

/**
 * Helper: safely unlink a file (no throw)
 */
async function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (e) {
    console.warn('safeUnlink failed:', e.message);
  }
}

/**
 * GET /api/kyc/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: missing user' });
    }

    const kyc = await KYCApplication.findOne({ where: { userId: req.user.id } });
    if (!kyc) return res.json({ message: 'No KYC application found', kyc: null });

    return res.json(kyc);
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/kyc/upload
 * Expects multer middleware upload.single('document') to have run.
 */
exports.uploadDocument = async (req, res) => {
  try {
    // Validate auth
    if (!req.user || !req.user.id) {
      if (req.file && req.file.path) await safeUnlink(req.file.path);
      return res.status(401).json({ message: 'Unauthorized: missing user' });
    }

    // Validate multer produced a file
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded. Ensure form field name is "document".' });
    }

    // Validate doc type
    const { type } = req.body;
    if (!type) {
      await safeUnlink(req.file.path);
      return res.status(400).json({ message: 'Document type is required' });
    }

    // Find KYC application for user (do not assume req.user.KYCApplication exists)
    const kycApp = await KYCApplication.findOne({ where: { userId: req.user.id } });
    if (!kycApp) {
      await safeUnlink(req.file.path);
      return res.status(400).json({ message: 'KYC application not found for user' });
    }

    const kycId = kycApp.id;

    // Attempt tracking
    let attempt = await Attempt.findOne({ where: { kycId, step: 3 } });
    if (!attempt) attempt = await Attempt.create({ kycId, step: 3, count: 0 });

    if (attempt.count >= 3) {
      await KYCApplication.update({ status: 'Rejected', failureReason: 'Max attempts reached' }, { where: { id: kycId } });
      await safeUnlink(req.file.path);
      return res.status(400).json({ message: 'Max attempts reached. KYC Rejected' });
    }

    // increment and save
    attempt.count += 1;
    await attempt.save();

    // Create Document record (adjust fields for your model if needed)
    const doc = await Document.create({
      kycId,
      type,
      filePath: req.file.filename || req.file.path,
      isValidated: true
    });

    return res.json({ message: 'Document uploaded', attemptsLeft: 3 - attempt.count, documentId: doc.id });
  } catch (err) {
    console.error('uploadDocument error:', err);
    // on any server error, remove the uploaded file to avoid orphan files
    if (req.file && req.file.path) await safeUnlink(req.file.path);
    return res.status(500).json({ message: 'Server error during upload', error: err.message });
  }
};

/**
 * POST /api/kyc/photo-match
 */
exports.photoMatchStep = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: missing user' });
    }

    const kycApp = await KYCApplication.findOne({ where: { userId: req.user.id } });
    if (!kycApp) {
      return res.status(400).json({ message: 'KYC application not found for user' });
    }

    const kycId = kycApp.id;
    const match = simulateMatch();

    if (match < 60) {
      await KYCApplication.update({ status: 'Rejected', failureReason: 'Photo mismatch < 60%' }, { where: { id: kycId } });
      return res.status(400).json({ message: 'Photo match failed', match });
    }

    await KYCApplication.update({ status: 'Verified' }, { where: { id: kycId } });
    return res.json({ message: 'Photo match success', match });
  } catch (err) {
    console.error('photoMatchStep error:', err);
    return res.status(500).json({ message: 'Server error during photo match', error: err.message });
  }
};
