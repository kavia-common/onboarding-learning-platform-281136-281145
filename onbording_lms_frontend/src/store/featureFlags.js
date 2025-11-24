import React, { createContext, useContext, useMemo } from 'react';

const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
const parsed = (() => {
  try {
    if (!raw) return {};
    // allow both JSON and comma-separated list e.g. "onboarding,courses"
    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return Object.fromEntries(data.map(k => [String(k), true]));
      }
      return data || {};
    } else {
      return Object.fromEntries(raw.split(',').map(k => [k.trim(), true]));
    }
  } catch {
    return {};
  }
})();

const FeatureFlagsContext = createContext({ flags: {} });

// PUBLIC_INTERFACE
export function FeatureFlagsProvider({ children }) {
  /** Provides parsed feature flags to components */
  const value = useMemo(()=>({ flags: { onboarding: true, ...parsed } }), []);
  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useFeatureFlags() {
  /** Access feature flags */
  return useContext(FeatureFlagsContext);
}
