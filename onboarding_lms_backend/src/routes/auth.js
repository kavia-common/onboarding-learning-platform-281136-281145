import express from 'express';
import { pool } from '../db/client.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { hashPassword, verifyPassword, signJwt } from '../utils/security.js';

export const authRouter = express.Router();

/**
 * POST /auth/register
 * Body: { email, password, name? }
 * Returns: { token, user }
 */
authRouter.post(
  '/register',
  validate({ email: { type: 'email', required: true }, password: { type: 'string', required: true } }),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'EmailExists' });
    const password_hash = hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name, created_at',
      [email, password_hash, name || email]
    );
    const user = result.rows[0];
    const token = signJwt(user);
    res.status(201).json({ token, user });
  })
);

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
authRouter.post(
  '/login',
  validate({ email: { type: 'email', required: true }, password: { type: 'string', required: true } }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'InvalidCredentials' });
    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'InvalidCredentials' });
    }
    const token = signJwt(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  })
);

/**
 * GET /me
 * Authorization: Bearer token
 * Returns: { user }
 */
authRouter.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.user;
  const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id=$1', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'UserNotFound' });
  res.json({ user: result.rows[0] });
}));
