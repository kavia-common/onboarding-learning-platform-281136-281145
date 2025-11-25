import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';

function getAuthToken() {
  try {
    const raw = window.localStorage.getItem('lms_auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.token || '';
  } catch {
    return '';
  }
}

const mockCourses = [
  { id: 'course-1', title: 'Welcome to the Company', description: 'Start here to learn the essentials.' },
  { id: 'course-2', title: 'Security Basics', description: 'Keep data safe with best practices.' },
  { id: 'course-3', title: 'Code of Conduct Training', description: 'Understand our professional expectations.' },
];

const CoursesContext = createContext(null);

// PUBLIC_INTERFACE
export function CoursesProvider({ children }) {
  /** Provide course catalog sourced from backend or mock */
  const [courses, setCourses] = useState(mockCourses);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!API_BASE) return;
      try {
        const headers = {};
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/courses`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data)) setCourses(data);
      } catch {
        // ignore and keep mock
      }
    }
    load();
    return ()=> { active = false; };
  }, []);

  const getCourse = React.useCallback((id) => courses.find(c => String(c.id) === String(id)), [courses]);

  const value = useMemo(()=>({ courses, getCourse }), [courses, getCourse]);

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}

// PUBLIC_INTERFACE
export function useCourses() {
  /** Access courses context */
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider');
  return ctx;
}
