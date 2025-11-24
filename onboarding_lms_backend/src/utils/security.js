import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * PUBLIC_INTERFACE
 * hashPassword
 * Uses pbkdf2 for password hashing
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

/**
 * PUBLIC_INTERFACE
 * verifyPassword
 * Verifies a password against stored pbkdf2 hash
 */
export function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored).split('$');
    if (scheme !== 'pbkdf2' || !salt || !hash) return false;
    const calc = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calc, 'hex'));
  } catch {
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * signJwt
 * Signs a JWT with sub, email and name
 */
export function signJwt(user) {
  const payload = { sub: user.id, email: user.email, name: user.name || user.email };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
}
