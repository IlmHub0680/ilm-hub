'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ICTContext = createContext(null);

export function ICTProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ict/portal', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        setError(data.error || 'Failed to load tickets.');
      }
    } catch {
      setError('An error occurred while loading tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <ICTContext.Provider value={{ tickets, loading, error, refetch }}>
      {children}
    </ICTContext.Provider>
  );
}

export function useICT() {
  const ctx = useContext(ICTContext);
  if (!ctx) throw new Error('useICT must be used within ICTProvider');
  return ctx;
}
