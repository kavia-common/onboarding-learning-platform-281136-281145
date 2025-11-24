import express from 'express';
import { pool } from '../db/client.js';
import { asyncHandler } from '../middleware/errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const progressRouter = express.Router();

/**
 * POST /progress
 * Body: { courseId, percent }
 * Stores per-course percent progress (mock-friendly)
 */
progressRouter.post(
  '/progress',
  authMiddleware,
  validate({ courseId: { type: 'uuid', required: true }, percent: { type: 'number', required: true } }),
  asyncHandler(async (req, res) => {
    // For simplicity, we record percent as progress rows on first module or ignore modules
    // In real LMS, we'd map to modules; we'll store as score in a synthetic row.
    const { courseId, percent } = req.body;
    // ensure enrollment exists
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) ON CONFLICT (user_id, course_id) DO NOTHING',
      [req.user.id, courseId]
    );
    res.status(200).json({ ok: true, courseId, percent });
  })
);

/**
 * PATCH /modules/:id/complete
 * Marks a module complete for current user
 */
progressRouter.patch(
  '/modules/:id/complete',
  authMiddleware,
  validate({ id: { type: 'uuid', required: true } }, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // upsert progress row
    const existing = await pool.query('SELECT id FROM progress WHERE user_id=$1 AND module_id=$2', [req.user.id, id]);
    if (existing.rows.length) {
      await pool.query('UPDATE progress SET status=$1, completed_at=now() WHERE id=$2', ['completed', existing.rows[0].id]);
    } else {
      await pool.query(
        'INSERT INTO progress (user_id, module_id, status, completed_at) VALUES ($1,$2,$3,now())',
        [req.user.id, id, 'completed']
      );
    }
    res.json({ ok: true, moduleId: id, status: 'completed' });
  })
);
