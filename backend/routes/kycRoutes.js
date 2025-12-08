// backend/routes/kycRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // your multer instance
const { getDashboard, uploadDocument, photoMatchStep } = require('../controllers/kycController');

// TEMP DEBUG ROUTE - call this to inspect what multer saved and where
router.post('/upload-debug', upload.single('document'), (req, res) => {
  console.log('=== UPLOAD DEBUG ===');
  console.log('process.cwd() =', process.cwd());
  console.log('__dirname =', __dirname);
  console.log('uploads resolved =>', require('path').resolve(__dirname, '..', 'uploads'));
  console.log('req.file =', req.file);
  console.log('fs.existsSync(req.file?.path) =>', require('fs').existsSync(req.file?.path || ''));
  try {
    console.log('uploads dir listing =>', require('fs').readdirSync(require('path').resolve(__dirname, '..', 'uploads')));
  } catch (e) {
    console.warn('readdirSync failed:', e.message);
  }

  res.json({
    ok: true,
    file: req.file ? { originalname: req.file.originalname, filename: req.file.filename, size: req.file.size, path: req.file.path } : null,
    body: req.body
  });
});

// REAL ROUTES (multer must run before controller)
router.get('/dashboard', auth, getDashboard);
router.post('/upload', auth, upload.single('document'), uploadDocument);
router.post('/photo-match', auth, photoMatchStep);

module.exports = router;
