import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

/**
 * PUBLIC_INTERFACE
 * Navbar
 * Top navigation bar with Ocean Professional theme. Shows Admin when current user is admin
 * via role or local override. Reflects auth state and provides links to core pages.
 */
export default function Navbar() {
  const { user, currentUserIsAdmin } = useAuth();
  const isAdmin = Boolean(user?.role === 'admin' || currentUserIsAdmin === true);

  const linkStyle = ({ isActive }) => ({
    padding: '8px 10px',
    color: isActive ? '#111827' : 'var(--text-secondary)',
    textDecoration: 'none',
    borderRadius: 8,
    background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
    transition: 'background 160ms ease',
  });

  return (
    <header id="app-navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.03)',
    }}>
      <nav aria-label="Main navigation" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        maxWidth: 1280,
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Onboarding LMS
          </Link>
          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>

            <NavLink to="/documents" style={linkStyle}>Documents</NavLink>
            <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
            {/* Admin link behavior:
               - If admin: go to /admin
               - If not admin: go to /admin/login
            */}
            <NavLink to={isAdmin ? "/admin" : "/admin/login"} style={linkStyle}>Admin</NavLink>

          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user.email}</span>
              <Link className="btn" to="/logout" style={{ textDecoration: 'none' }}>Logout</Link>
            </>
          ) : (
            <>
              <Link className="btn" to="/login" style={{ textDecoration: 'none' }}>Login</Link>
              <Link className="btn" to="/register" style={{ textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
