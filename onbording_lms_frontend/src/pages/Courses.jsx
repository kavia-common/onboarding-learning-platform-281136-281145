import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { listCourses } from '../services/courses';

/**
 * PUBLIC_INTERFACE
 * Courses
 * Lists mock courses and filters by category via query string (?cat=...).
 * Adds a search bar for title/summary search.
 */
export default function Courses() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat') || 'all';
  const qParam = params.get('q') || '';
  const [q, setQ] = useState(qParam);

  const courses = useMemo(() => listCourses({ category: cat, search: qParam }), [cat, qParam]);

  const onSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(location.search);
    if (q) next.set('q', q);
    else next.delete('q');
    navigate(`/courses?${next.toString()}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <Sidebar />
        <section>
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <h1 style={{ marginTop: 0 }}>Courses</h1>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>Category: <strong>{cat}</strong></div>
              <form onSubmit={onSearch} role="search" aria-label="Search courses" style={{ display: 'flex', gap: 8 }}>
                <input
                  type="search"
                  placeholder="Search courses"
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  aria-label="Search courses by title or summary"
                  style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border-color)', minWidth: 220 }}
                />
                <button className="btn" type="submit">Search</button>
              </form>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {courses.map(course => (
              <article key={course.id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
                <h3 style={{ margin: 0 }}>{course.title}</h3>
                <div style={{ color: 'var(--text-secondary)' }}>{course.summary}</div>
                <div>
                  <Link className="btn" to={`/courses/${course.id}`}>Open</Link>
                </div>
              </article>
            ))}
            {courses.length === 0 && (
              <div className="card" style={{ padding: 16, color: 'var(--text-secondary)' }}>
                No courses match your filters.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
