import rateLimit from 'express-rate-limit';

function jsonHandler(message) {
  return (_req, res) => {
    res.status(429).json({ success: false, message });
  };
}

/** General API protection */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many requests. Please try again later.'),
});

/** Stricter limits for login / register / 2FA verify */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many auth attempts. Please try again later.'),
});
