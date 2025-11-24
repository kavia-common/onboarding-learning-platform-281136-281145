export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * PUBLIC_INTERFACE
 * notFound
 * 404 handler
 */
export function notFound(_req, res) {
  res.status(404).json({ error: 'NotFound' });
}

/**
 * PUBLIC_INTERFACE
 * errorHandler
 * Centralized error handler with logging
 */
export function errorHandler(err, req, res, _next) {
  req.log?.error({ err }, 'Unhandled error');
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(500).json({ error: 'InternalServerError' });
}
