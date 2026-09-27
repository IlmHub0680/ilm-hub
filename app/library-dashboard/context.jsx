'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LibraryDashContext = createContext(null);

export function LibraryDashProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [portalRes, reservationsRes] = await Promise.all([
        fetch('/api/library/portal', { credentials: 'include' }),
        fetch('/api/library/reservations', { credentials: 'include' }),
      ]);
      const data = await portalRes.json();
      const reservationsData = await reservationsRes.json();

      if (portalRes.ok) {
        setItems(data.items || []);
        setLoans(data.loans || []);
        setStudents(data.students || []);
      } else {
        setError(data.error || 'Failed to load library data.');
      }

      if (reservationsRes.ok) {
        setReservations(reservationsData.data || []);
      }
    } catch (err) {
      setError('An error occurred while loading library data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <LibraryDashContext.Provider value={{ items, loans, students, reservations, loading, error, refetch }}>
      {children}
    </LibraryDashContext.Provider>
  );
}

export function useLibraryDash() {
  const ctx = useContext(LibraryDashContext);
  if (!ctx) throw new Error('useLibraryDash must be used within LibraryDashProvider');
  return ctx;
}
