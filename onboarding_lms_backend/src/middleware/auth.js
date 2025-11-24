import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * PUBLIC_INTERFACE
 * authMiddleware
 * Express middleware to verify Bearer JWT and attach req.user
 */
export function authMiddleware(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.substring(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, name: payload.name || payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * PUBLIC_INTERFACE
 * optionalAuth
 * Allows missing token; when present and valid sets req.user
 */
export function optionalAuth(req, _res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.substring(7) : null;
    if (!token) return next();
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, name: payload.name || payload.email };
    next();
  } catch {
    // ignore token errors for optional middleware
    next();
  }
}
