import express from 'express';
import { pool } from '../db/client.js';
import { asyncHandler } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';

export const coursesRouter = express.Router();

/**
 * GET /catalog
 * Returns list of courses (id, title, description, category)
 */
coursesRouter.get(
  '/catalog',
  asyncHandler(async (_req, res) => {
    const result = await pool.query('SELECT id, title, description, category FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  })
);

/**
 * GET /courses
 * Alias to catalog for frontend convenience
 */
coursesRouter.get(
  '/courses',
  asyncHandler(async (_req, res) => {
    const result = await pool.query('SELECT id, title, description, category FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  })
);

/**
 * GET /courses/:id
 * Returns a single course with modules
 */
coursesRouter.get(
  '/courses/:id',
  validate({ id: { type: 'uuid', required: true } }, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await pool.query('SELECT id, title, description, category FROM courses WHERE id=$1', [id]);
    if (!course.rows.length) return res.status(404).json({ error: 'CourseNotFound' });
    const modules = await pool.query(
      'SELECT id, course_id, title, type, content_url, order_index FROM modules WHERE course_id=$1 ORDER BY order_index ASC',
      [id]
    );
    res.json({ ...course.rows[0], modules: modules.rows });
  })
);

/**
 * GET /courses/:id/modules
 * Returns modules for the course
 */
coursesRouter.get(
  '/courses/:id/modules',
  validate({ id: { type: 'uuid', required: true } }, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const modules = await pool.query(
      'SELECT id, course_id, title, type, content_url, order_index FROM modules WHERE course_id=$1 ORDER BY order_index ASC',
      [id]
    );
    res.json(modules.rows);
  })
);
