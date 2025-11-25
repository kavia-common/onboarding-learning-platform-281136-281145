import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { listCategories } from '../../services/courses';

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Course categories sidebar from local service.
 */
export default function Sidebar() {
  const cats = useMemo(() => listCategories(), []);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';

  return (
    <aside aria-label="Course categories" className="card" style={{ padding: 16, position: 'sticky', top: 64, alignSelf: 'start' }}>
      <h3 style={{ marginTop: 0 }}>Categories</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {cats.map((cat) => {
          const to = cat === 'all' ? `/courses${q ? `?q=${encodeURIComponent(q)}` : ''}` : `/courses?cat=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
          const label = cat === 'all' ? 'All Courses' : (cat.charAt(0).toUpperCase() + cat.slice(1));
          return (
            <li key={cat}>
              <NavLink
                to={to}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '8px 10px',
                  borderRadius: 8,
                  color: isActive ? '#111827' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(245,158,11,0.10)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
