// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists (same folder multer uses)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log('[server] creating uploads dir:', UPLOAD_DIR);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} else {
  console.log('[server] uploads dir exists:', UPLOAD_DIR);
}

// Serve uploads from absolute path so path resolution is consistent
app.use('/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
