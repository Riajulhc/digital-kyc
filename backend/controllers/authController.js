// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // Sequelize Op for OR queries
const User = require('../models/User');
const KYCApplication = require('../models/KYCApplication');
const generateKYCID = require('../utils/generateKYCID');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1d';

function sanitizeUser(userInstance) {
  if (!userInstance) return null;
  const u = typeof userInstance.toJSON === 'function' ? userInstance.toJSON() : { ...userInstance };
  delete u.password;
  return u;
}

exports.register = async (req, res) => {
  const { email, mobile, password } = req.body;
  try {
    if (!email || !mobile || !password) {
      return res.status(400).json({ message: 'email, mobile and password are required' });
    }

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { mobile }] }
    });

    if (existing) {
      return res.status(409).json({ message: 'User with this email or mobile already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const kycId = generateKYCID();

    const user = await User.create({ email, mobile, password: hashed, kycId });
    await KYCApplication.create({ userId: user.id });

    return res.status(201).json({ message: 'User registered', kycId });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    // DEBUG: log incoming payload to server console to verify what's coming from frontend
    console.log('Login payload:', req.body);

    const { kycId, email, password } = req.body;

    if (!password || (!kycId && !email)) {
      return res.status(400).json({ message: 'Provide password and either kycId or email' });
    }

    // Build where array only with defined values
    const whereArr = [];
    if (kycId && typeof kycId === 'string') whereArr.push({ kycId });
    if (email && typeof email === 'string') whereArr.push({ email: email.toLowerCase() });

    if (whereArr.length === 0) {
      return res.status(400).json({ message: 'kycId or email is required' });
    }

    const user = await User.findOne({ where: { [Op.or]: whereArr } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, kycId: user.kycId }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN
    });

    return res.json({ token, role: user.role, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
