//
// LocalStorage-backed admin users service.
// Stores and retrieves admin user data with unique email validation.
// Schema: { id, name, email, role: 'admin'|'user', status: 'active'|'disabled' }
//
const STORAGE_KEY = 'admin_users_v1';

// Seed with an initial admin if empty
function seedIfEmpty() {
  const data = window.localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const seed = [
      {
        id: 'u-1',
        name: 'System Admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}

function readAll() {
  seedIfEmpty();
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(users) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// PUBLIC_INTERFACE
export function listUsers() {
  /** List all users from localStorage. */
  return readAll();
}

// PUBLIC_INTERFACE
export function getUserById(id) {
  /** Get a single user by id. */
  return readAll().find((u) => u.id === id) || null;
}

// PUBLIC_INTERFACE
export function upsertUser(user) {
  /**
   * Create or update a user.
   * Validates unique email (case-insensitive) across different IDs.
   */
  const users = readAll();
  const normalizedEmail = (user.email || '').trim().toLowerCase();

  const duplicate = users.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail && u.id !== user.id
  );
  if (duplicate) {
    const err = new Error('Email must be unique.');
    err.code = 'EMAIL_NOT_UNIQUE';
    throw err;
  }

  if (!user.id) {
    // create
    const newUser = {
      id: `u-${Date.now()}`,
      name: user.name?.trim() || '',
      email: normalizedEmail,
      role: user.role === 'admin' ? 'admin' : 'user',
      status: user.status === 'disabled' ? 'disabled' : 'active',
    };
    users.push(newUser);
    writeAll(users);
    return newUser;
  } else {
    // update
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) {
      const err = new Error('User not found.');
      err.code = 'NOT_FOUND';
      throw err;
    }
    users[idx] = {
      ...users[idx],
      name: user.name?.trim() ?? users[idx].name,
      email: normalizedEmail || users[idx].email,
      role: user.role === 'admin' ? 'admin' : 'user',
      status: user.status === 'disabled' ? 'disabled' : 'active',
    };
    writeAll(users);
    return users[idx];
  }
}

// PUBLIC_INTERFACE
export function deleteUser(id) {
  /** Delete a user by id. */
  const users = readAll();
  const filtered = users.filter((u) => u.id !== id);
  writeAll(filtered);
  return true;
}
