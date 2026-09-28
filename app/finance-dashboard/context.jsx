'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/finance/portal', { credentials: 'include' });
      const data = await res.json();

      if (res.ok) {
        setStudents(data.students || []);
        setTerms(data.terms || []);
      } else {
        setError(data.error || 'Failed to load finance data.');
      }
    } catch (err) {
      setError('An error occurred while loading finance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <FinanceContext.Provider value={{ students, terms, loading, error, refetch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
