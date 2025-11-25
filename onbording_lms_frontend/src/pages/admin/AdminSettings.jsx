import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/adminSettings';
import AdminGate from '../../components/AdminGate.jsx';

const ocean = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  surface: '#ffffff',
  background: '#f9fafb',
  text: '#111827',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(() => getSettings());
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || 'Onboarding LMS');
  const [theme, setTheme] = useState(settings.theme || 'light');
  const [features, setFeatures] = useState(settings.features || {});

  useEffect(() => {
    // Apply theme to document body for visual feedback within app
    document.body.style.backgroundColor = theme === 'dark' ? '#0b1220' : ocean.background;
    document.body.style.color = theme === 'dark' ? '#e5e7eb' : ocean.text;
  }, [theme]);

  const onToggleFeature = (k) => {
    setFeatures((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const onSave = (e) => {
    e.preventDefault();
    const next = updateSettings({ siteTitle, theme, features });
    setSettings(next);
    alert('Settings saved.');
  };

  return (
    <AdminGate>
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: ocean.surface, borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
          <h2 style={{ marginTop: 0, color: ocean.text }}>Admin Settings</h2>
          <form onSubmit={onSave} aria-label="Settings form">
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                <span>Site Title</span>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  aria-label="Site Title"
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </label>
              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <legend>Theme</legend>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                    aria-label="Light theme"
                  />
                  <span style={{ marginLeft: 6 }}>Light</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                    aria-label="Dark theme"
                  />
                  <span style={{ marginLeft: 6 }}>Dark</span>
                </label>
              </fieldset>
              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <legend>Feature Flags</legend>
                {Object.keys(features).length === 0 ? (
                  <p style={{ color: '#6b7280' }}>No feature flags configured.</p>
                ) : (
                  Object.keys(features).map((k) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!features[k]}
                        onChange={() => onToggleFeature(k)}
                        aria-label={`Toggle ${k}`}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{k}</span>
                    </label>
                  ))
                )}
              </fieldset>
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit" style={{ background: ocean.primary, color: 'white', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminGate>
  );
}
