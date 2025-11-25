import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Dashboard
 * Simple landing dashboard with quick links.
 */
export default function Dashboard() {
  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Welcome</h2>
          <p>Start with your onboarding tasks and documents.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link className="btn" to="/documents">Documents</Link>

            <Link className="btn" to="/profile">Profile</Link>
          </div>
        </section>
        <section className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Getting Started</h3>
          <ol style={{ paddingLeft: 18 }}>
            <li>Review the Code of Conduct and sign.</li>
            <li>Fill out and acknowledge the NDA agreement.</li>
            <li>Read and sign the Offer Letter.</li>
          </ol>
          <div style={{ marginTop: 8 }}>
            <Link className="btn" to="/documents">Open Documents</Link>
          </div>
        </section>
      </div>
      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
