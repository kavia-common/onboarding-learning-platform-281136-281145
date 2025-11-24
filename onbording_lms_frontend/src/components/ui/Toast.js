import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Simple toast provider with success/error/info variants */
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, type: t.type || 'info', message: t.message || '' };
    setToasts((prev)=> [...prev, toast]);
    setTimeout(()=> {
      setToasts((prev)=> prev.filter(x=>x.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(()=>({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" style={{ position:'fixed', right: 16, bottom: 16, display:'grid', gap: 8 }}>
        {toasts.map(t=>(
          <div key={t.id} role="status" className="card" style={{
            padding: '10px 12px',
            borderLeft: `4px solid ${t.type === 'success' ? '#10B981' : t.type === 'error' ? '#EF4444' : '#2563EB'}`,
            minWidth: 220,
            background: 'var(--bg-secondary)'
          }}>
            <strong style={{ textTransform: 'capitalize' }}>{t.type}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Access toast push() function */
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
