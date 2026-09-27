'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AcademicsContext = createContext(null);

export function AcademicsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/portal', { credentials: 'include' });

      if (res.status === 401) {
        setError('Please sign in to view your academic information.');
        return;
      }

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Unable to load your academic information.');
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error('Academics data load error:', err);
      setError('Unable to load your academic information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AcademicsContext.Provider value={{ data, loading, error, reload: load }}>
      {children}
    </AcademicsContext.Provider>
  );
}

export function useAcademics() {
  const ctx = useContext(AcademicsContext);

  if (!ctx) {
    throw new Error('useAcademics must be used within AcademicsProvider');
  }

  return ctx;
}
