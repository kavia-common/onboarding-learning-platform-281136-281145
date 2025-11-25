//
// LocalStorage-backed admin documents service.
// Stores metadata only: { id, title, category, description, link }
//
const STORAGE_KEY = 'admin_documents_v1';

function seedIfEmpty() {
  const data = window.localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const seed = [
      {
        id: 'd-1',
        title: 'Code of Conduct',
        category: 'HR',
        description: 'Company policies and conduct expectations.',
        // Example: could be a public asset or external URL. Replace with your own file path.
        link: '/documents/code_of_conduct',
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

function writeAll(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// PUBLIC_INTERFACE
export function listDocuments() {
  /** List all document metadata. */
  return readAll();
}

// PUBLIC_INTERFACE
export function getDocumentById(id) {
  /** Get a single document metadata by id. */
  return readAll().find((d) => d.id === id) || null;
}

 // PUBLIC_INTERFACE
export function upsertDocument(doc) {
  /**
   * Create or update document metadata.
   * Minimal validation - requires title and link.
   * Ensures a stable id (d-<timestamp>) when creating.
   * The 'link' field should be a URL (http/https) or a local/public path (e.g., /assets/file.pdf).
   */
  const items = readAll();
  if (!doc.title || !doc.link) {
    const err = new Error('Title and Link are required.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (!doc.id) {
    const newDoc = {
      id: `d-${Date.now()}`,
      title: doc.title.trim(),
      category: (doc.category || '').trim(),
      description: (doc.description || '').trim(),
      link: doc.link.trim(),
    };
    items.push(newDoc);
    writeAll(items);
    return newDoc;
  } else {
    const idx = items.findIndex((d) => d.id === doc.id);
    if (idx === -1) {
      const err = new Error('Document not found.');
      err.code = 'NOT_FOUND';
      throw err;
    }
    items[idx] = {
      ...items[idx],
      title: doc.title?.trim() ?? items[idx].title,
      category: doc.category?.trim() ?? items[idx].category,
      description: doc.description?.trim() ?? items[idx].description,
      link: doc.link?.trim() ?? items[idx].link,
    };
    writeAll(items);
    return items[idx];
  }
}

// PUBLIC_INTERFACE
export function deleteDocument(id) {
  /** Delete document by id. */
  const items = readAll();
  const filtered = items.filter((d) => d.id !== id);
  writeAll(filtered);
  return true;
}
