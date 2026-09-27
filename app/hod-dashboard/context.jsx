'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const HODContext = createContext(null);

export function HODProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(() => {
    setLoading(true);
    fetch('/api/hod/portal', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load data.');
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <HODContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </HODContext.Provider>
  );
}

export function useHOD() {
  const ctx = useContext(HODContext);
  if (!ctx) throw new Error('useHOD must be used within HODProvider');
  return ctx;
}
