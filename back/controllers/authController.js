import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { generateSecret, generateURI, verify } from 'otplib';
import { User } from '../models/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const APP_NAME = 'Budgeting';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    totpEnabled: Boolean(user.totp_enabled),
  };
}

function signToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

function signTempToken(userId) {
  return jwt.sign({ id: userId, purpose: '2fa' }, JWT_SECRET, { expiresIn: '5m' });
}

function verifyTempToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.purpose !== '2fa' || !payload.id) {
    throw new Error('invalid verification token');
  }
  return payload.id;
}

async function verifyTotpCode(secret, code) {
  const token = String(code || '').trim();
  if (!/^\d{6}$/.test(token)) {
    return false;
  }
  const result = await verify({ secret, token });
  return Boolean(result.valid);
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

    if (user.totp_enabled && user.totp_secret) {
      return res.json({
        success: true,
        data: {
          requires2fa: true,
          tempToken: signTempToken(user.id),
        },
      });
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

export async function verifyLogin2fa(req, res) {
  try {
    const tempToken = String(req.body.temp_token || '');
    const code = String(req.body.code || '').trim();

    if (!tempToken || !code) {
      return res.status(400).json({ success: false, message: 'temp_token and code are required' });
    }

    const userId = verifyTempToken(tempToken);
    const user = await User.unscoped().findByPk(userId);

    if (!user || !user.totp_enabled || !user.totp_secret) {
      return res.status(401).json({ success: false, message: 'two-step verification is not enabled' });
    }

    const valid = await verifyTotpCode(user.totp_secret, code);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'invalid verification code' });
    }

    res.json({
      success: true,
      data: {
        token: signToken(user),
        user: publicUser(user),
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'invalid verification token' });
  }
}

export async function me(req, res) {
  res.json({ success: true, data: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  try {
    const user = await User.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hasName = req.body.name !== undefined;
    const hasEmail = req.body.email !== undefined;
    const newPassword = String(req.body.new_password || '');
    const currentPassword = String(req.body.current_password || '');

    if (hasName) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ success: false, message: 'name is required' });
      }
      user.name = name;
    }

    if (hasEmail) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!email || !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ success: false, message: 'valid email is required' });
      }
      if (email !== user.email) {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'email is already registered' });
        }
        user.email = email;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'current password is required' });
      }
      const matches = await bcrypt.compare(currentPassword, user.password_hash);
      if (!matches) {
        return res.status(400).json({ success: false, message: 'current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'password must be at least 6 characters' });
      }
      user.password_hash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'email is already registered' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function setup2fa(req, res) {
  try {
    const user = await User.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.totp_enabled) {
      return res.status(400).json({ success: false, message: 'two-step verification is already enabled' });
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: APP_NAME,
      label: user.email,
      secret,
    });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    user.totp_secret = secret;
    user.totp_enabled = false;
    await user.save();

    res.json({
      success: true,
      data: {
        secret,
        otpauthUrl,
        qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function enable2fa(req, res) {
  try {
    const user = await User.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.totp_secret) {
      return res.status(400).json({ success: false, message: 'start two-step verification setup first' });
    }
    if (user.totp_enabled) {
      return res.status(400).json({ success: false, message: 'two-step verification is already enabled' });
    }

    const valid = await verifyTotpCode(user.totp_secret, req.body.code);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'invalid verification code' });
    }

    user.totp_enabled = true;
    await user.save();

    res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function disable2fa(req, res) {
  try {
    const user = await User.unscoped().findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({ success: false, message: 'two-step verification is not enabled' });
    }

    const password = String(req.body.password || '');
    const code = String(req.body.code || '').trim();

    if (!password) {
      return res.status(400).json({ success: false, message: 'password is required' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'current password is incorrect' });
    }

    const valid = await verifyTotpCode(user.totp_secret, code);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'invalid verification code' });
    }

    user.totp_secret = null;
    user.totp_enabled = false;
    await user.save();

    res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
