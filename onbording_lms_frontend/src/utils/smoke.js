/* Simple frontend smoke check for backend health */
(async () => {
  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  const health = process.env.REACT_APP_HEALTHCHECK_PATH || '/healthz';
  try {
    const res = await fetch(`${base}${health}`);
    console.log('Frontend smoke health:', res.status);
    if (!res.ok) process.exit(1);
  } catch (e) {
    console.error('Frontend smoke failed:', e.message);
    process.exit(1);
  }
})();
