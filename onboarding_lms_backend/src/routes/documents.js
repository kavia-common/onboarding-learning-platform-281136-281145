import express from 'express';
import { pool } from '../db/client.js';
import { asyncHandler } from '../middleware/errors.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const documentsRouter = express.Router();

/**
 * GET /documents
 * Returns list of documents with metadata
 */
documentsRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (_req, res) => {
    const result = await pool.query('SELECT key, name, version, content_url FROM documents ORDER BY name ASC');
    res.json(result.rows);
  })
);

/**
 * POST /acknowledgements
 * Body: { userId?, documents: [{ key, signatureName, acceptedAt, name? }] }
 * If auth is present, uses req.user.id; otherwise uses provided userId (for mock/testing).
 */
documentsRouter.post(
  '/acknowledgements',
  validate({
    documents: { type: 'array', required: true }
  }),
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const isAuthed = authHeader.startsWith('Bearer ');
    let userId = null;
    if (isAuthed) {
      // run auth middleware quickly by invoking it inline
      let done = false;
      await new Promise((resolve) => {
        // eslint-disable-next-line consistent-return
        authMiddleware(req, res, () => {
          done = true;
          resolve();
        });
      });
      if (!done) return; // auth middleware already responded
      userId = req.user.id;
    } else {
      userId = req.body.userId || null;
    }

    const docs = Array.isArray(req.body.documents) ? req.body.documents : [];
    if (!docs.length) return res.status(400).json({ error: 'ValidationError', details: ['documents cannot be empty'] });

    // validate doc entries
    for (const d of docs) {
      if (!d.key || !d.signatureName || !d.acceptedAt) {
        return res.status(400).json({ error: 'ValidationError', details: ['each document requires key, signatureName, acceptedAt'] });
      }
    }

    // if userId still null, create a mock user for testing purposes
    if (!userId) {
      const email = `mock_${Date.now()}@example.com`;
      const insertUser = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id',
        [email, 'pbkdf2$mock$hash', email]
      );
      userId = insertUser.rows[0].id;
    }

    // Ensure documents exist
    const keys = docs.map((d) => d.key);
    const existing = await pool.query('SELECT key FROM documents WHERE key = ANY($1)', [keys]);
    const existingSet = new Set(existing.rows.map((r) => r.key));
    const missing = keys.filter((k) => !existingSet.has(k));
    if (missing.length) {
      return res.status(400).json({ error: 'UnknownDocuments', details: missing });
    }

    // Insert acknowledgements
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const d of docs) {
        await client.query(
          'INSERT INTO acknowledgements (user_id, document_key, signature_name, accepted_at) VALUES ($1,$2,$3,$4)',
          [userId, d.key, d.signatureName, d.acceptedAt]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.status(201).json({ ok: true, userId });
  })
);
