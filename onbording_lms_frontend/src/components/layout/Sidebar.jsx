import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Course categories sidebar. Basic mock categories for now.
 */
export default function Sidebar() {
  const categories = [
    { id: 'all', name: 'All Courses', to: '/courses' },
    { id: 'onboarding', name: 'Onboarding', to: '/courses?cat=onboarding' },
    { id: 'policy', name: 'Policies', to: '/courses?cat=policy' },
    { id: 'security', name: 'Security', to: '/courses?cat=security' },
  ];
  return (
    <aside role="complementary" aria-label="Course categories" className="card" style={{ padding: 16, position: 'sticky', top: 64, alignSelf: 'start' }}>
      <h3 style={{ marginTop: 0 }}>Categories</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {categories.map(cat => (
          <li key={cat.id}>
            <NavLink to={cat.to} style={({ isActive }) => ({
              display: 'block',
              padding: '8px 10px',
              borderRadius: 8,
              color: isActive ? '#111827' : 'var(--text-secondary)',
              background: isActive ? 'rgba(245,158,11,0.10)' : 'transparent',
              textDecoration: 'none'
            })}>
              {cat.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
