import React from 'react';
import { Link, useParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * CourseDetail
 * Placeholder module list for a selected course.
 */
export default function CourseDetail() {
  const { courseId } = useParams();

  const modules = [
    { id: 'm1', title: 'Introduction', duration: '5 min' },
    { id: 'm2', title: 'Key Concepts', duration: '10 min' },
    { id: 'm3', title: 'Knowledge Check', duration: '3 min' },
  ];

  return (
    <main style={{ padding: 20 }}>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h1 style={{ marginTop: 0, textTransform: 'capitalize' }}>{courseId} Course</h1>
        <div style={{ color: 'var(--text-secondary)' }}>This is a placeholder course detail page.</div>
      </div>
      <section className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,0.6))' }}>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Module</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: 12 }}>{m.title}</td>
                <td style={{ padding: 12 }}>{m.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div style={{ marginTop: 12 }}>
        <Link className="btn" to="/courses">Back to Courses</Link>
      </div>
      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
}
