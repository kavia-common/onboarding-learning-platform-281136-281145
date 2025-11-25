import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Attach dev helpers for admin toggling (window.setAdminEmail, etc.)
import './dev/setAdmin';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
