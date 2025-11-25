import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCourseById, getCourseProgressPercent, isModuleComplete, setModuleComplete } from '../services/courses';

/**
 * PUBLIC_INTERFACE
 * CourseDetail
 * Course modules with completion checkboxes and computed progress.
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const course = useMemo(() => getCourseById(courseId), [courseId]);
  const [progress, setProgress] = useState(getCourseProgressPercent(courseId));

  if (!course) {
    return (
      <main style={{ padding: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>Course not found</h1>
          <div style={{ color: 'var(--error)' }}>We couldn't find the requested course.</div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn" to="/courses">Back to Courses</Link>
          </div>
        </div>
      </main>
    );
  }

  const onToggle = (modId) => (e) => {
    const next = setModuleComplete(courseId, modId, e.target.checked);
    setProgress(next);
  };

  return (
    <main style={{ padding: 20 }}>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h1 style={{ marginTop: 0 }}>{course.title}</h1>
        <div style={{ color: 'var(--text-secondary)' }}>{course.summary}</div>
        <div aria-label="Progress" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Progress: {progress}%</div>
          <div aria-hidden="true" style={{ height: 10, background: 'rgba(37,99,235,0.15)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#2563EB', transition: 'width 200ms ease' }} />
          </div>
        </div>
      </div>
      <section className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,0.6))' }}>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Complete</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Module</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid var(--border-color)' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {course.modules.map((m) => {
              const checked = isModuleComplete(courseId, m.id);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 12 }}>
                    <input
                      type="checkbox"
                      aria-label={`Mark ${m.title} complete`}
                      checked={checked}
                      onChange={onToggle(m.id)}
                    />
                  </td>
                  <td style={{ padding: 12 }}>{m.title}</td>
                  <td style={{ padding: 12 }}>{m.duration} min</td>
                </tr>
              );
            })}
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
