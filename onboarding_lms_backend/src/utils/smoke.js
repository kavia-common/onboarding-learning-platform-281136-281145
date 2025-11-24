import { config } from '../config/index.js';

const base = process.env.API_BASE || `http://localhost:${config.PORT}`;
const healthPath = process.env.HEALTHCHECK_PATH || config.HEALTHCHECK_PATH || '/healthz';

async function get(path) {
  const res = await fetch(`${base}${path}`);
  return { status: res.status, body: await res.text() };
}

async function post(path, body, headers = { 'Content-Type': 'application/json' }) {
  const res = await fetch(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, body: await res.text(), headers: res.headers };
}

(async () => {
  try {
    const health = await get(healthPath);
    console.log('HEALTH', health.status);

    const catalog = await get('/catalog');
    console.log('CATALOG', catalog.status);

    const reg = await post('/auth/register', { email: `test_${Date.now()}@ex.com`, password: 'pass1234' });
    console.log('REGISTER', reg.status);

    const login = await post('/auth/login', { email: `test_${Date.now()}@ex.com`, password: 'pass1234' });
    console.log('LOGIN(expected fail)', login.status);

    const docs = await get('/documents');
    console.log('DOCUMENTS', docs.status);
  } catch (e) {
    console.error('Smoke error', e);
    process.exit(1);
  }
})();
