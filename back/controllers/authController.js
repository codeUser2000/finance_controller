import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' },
  );
}

export async function register(req, res) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    if (!email || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: 'valid email is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'password must be at least 6 characters' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'email is already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });

    res.status(201).json({
      success: true,
      data: {
        token: signToken(user),
        user: publicUser(user),
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'email is already registered' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function login(req, res) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'invalid email or password' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        token: signToken(user),
        user: publicUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function me(req, res) {
  res.json({ success: true, data: publicUser(req.user) });
}
