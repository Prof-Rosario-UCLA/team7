import express from 'express';
import bcrypt from 'bcrypt';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
const { User } = db;

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  console.log('📨 Signup request received with payload:', { email, name });

  try {
    const hashed = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed');

    const user = await User.create({ email, password: hashed, name });
    console.log('✅ User created with ID:', user.id);

    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    console.error('❌ Signup error:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Email already in use' });
    } else {
      res.status(500).json({ message: 'Signup error', error: err.message });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to true in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

export default router;
