const STORAGE_KEY = 'lms_module_completion_v1';

/**
 * Local mock course catalog with categories and modules.
 */
const mockCourses = [
  {
    id: 'coc',
    title: 'Code of Conduct',
    category: 'policy',
    summary: 'Understand DT3 standards.',
    modules: [
      { id: 'intro', title: 'Introduction', duration: 5 },
      { id: 'principles', title: 'Core Principles', duration: 12 },
      { id: 'quiz', title: 'Knowledge Check', duration: 4 },
    ],
  },
  {
    id: 'nda',
    title: 'NDA Basics',
    category: 'security',
    summary: 'Confidentiality essentials.',
    modules: [
      { id: 'overview', title: 'NDA Overview', duration: 6 },
      { id: 'scenarios', title: 'Do/Don\'t Scenarios', duration: 10 },
      { id: 'ack', title: 'Acknowledgement', duration: 3 },
    ],
  },
  {
    id: 'offer',
    title: 'Offer Letter Overview',
    category: 'onboarding',
    summary: 'Learn your terms.',
    modules: [
      { id: 'terms', title: 'Key Terms', duration: 7 },
      { id: 'benefits', title: 'Benefits Overview', duration: 9 },
      { id: 'nextsteps', title: 'Next Steps', duration: 4 },
    ],
  },
];

/**
 * Load completion map from localStorage.
 * Shape: { [courseId]: { [moduleId]: true } }
 */
function loadCompletion() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletion(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function listCategories() {
  /** Returns unique category list including 'all'. */
  const cats = Array.from(new Set(mockCourses.map((c) => c.category)));
  return ['all', ...cats];
}

// PUBLIC_INTERFACE
export function listCourses({ category = 'all', search = '' } = {}) {
  /** Returns filtered courses by category and text search on title/summary. */
  const q = String(search || '').toLowerCase().trim();
  const filtered = mockCourses.filter((c) => (category === 'all' ? true : c.category === category));
  if (!q) return filtered;
  return filtered.filter((c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));
}

// PUBLIC_INTERFACE
export function getCourseById(id) {
  /** Returns a course by id or null. */
  return mockCourses.find((c) => String(c.id) === String(id)) || null;
}

// PUBLIC_INTERFACE
export function getCourseProgressPercent(courseId) {
  /** Computes course progress percent based on completed modules in localStorage. */
  const course = getCourseById(courseId);
  if (!course) return 0;
  const completion = loadCompletion();
  const forCourse = completion[courseId] || {};
  const total = course.modules.length || 1;
  const done = Object.keys(forCourse).length;
  return Math.round((done / total) * 100);
}

// PUBLIC_INTERFACE
export function setModuleComplete(courseId, moduleId, complete) {
  /** Mark or unmark a module as complete in localStorage. Returns new percent. */
  const completion = loadCompletion();
  const map = completion[courseId] || {};
  if (complete) {
    map[moduleId] = true;
  } else {
    delete map[moduleId];
  }
  completion[courseId] = map;
  saveCompletion(completion);
  return getCourseProgressPercent(courseId);
}

// PUBLIC_INTERFACE
export function isModuleComplete(courseId, moduleId) {
  /** Returns true if module is marked complete. */
  const completion = loadCompletion();
  return Boolean(completion?.[courseId]?.[moduleId]);
}
