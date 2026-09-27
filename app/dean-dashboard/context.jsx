'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DeanContext = createContext(null);

export function DeanProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(() => {
    setLoading(true);
    fetch('/api/dean/portal', { credentials: 'include' })
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
    <DeanContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </DeanContext.Provider>
  );
}

export function useDean() {
  const ctx = useContext(DeanContext);
  if (!ctx) throw new Error('useDean must be used within DeanProvider');
  return ctx;
}
