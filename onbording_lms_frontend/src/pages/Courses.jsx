import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

/**
 * PUBLIC_INTERFACE
 * Courses
 * Lists mock courses and filters by category via query string (?cat=...).
 */
export default function Courses() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat') || 'all';

  const courses = useMemo(() => ([
    { id: 'coc', title: 'Code of Conduct', category: 'policy', summary: 'Understand DT3 standards.', to: '/courses/coc' },
    { id: 'nda', title: 'NDA Basics', category: 'security', summary: 'Confidentiality essentials.', to: '/courses/nda' },
    { id: 'offer', title: 'Offer Letter Overview', category: 'onboarding', summary: 'Learn your terms.', to: '/courses/offer' },
  ]), []);

  const filtered = courses.filter(c => cat === 'all' ? true : c.category === cat);

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <Sidebar />
        <section>
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <h1 style={{ marginTop: 0 }}>Courses</h1>
            <div style={{ color: 'var(--text-secondary)' }}>Category: <strong>{cat}</strong></div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(course => (
              <article key={course.id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
                <h3 style={{ margin: 0 }}>{course.title}</h3>
                <div style={{ color: 'var(--text-secondary)' }}>{course.summary}</div>
                <div>
                  <Link className="btn" to={course.to}>Open</Link>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="card" style={{ padding: 16, color: 'var(--text-secondary)' }}>
                No courses in this category.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
