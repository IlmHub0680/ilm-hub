'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ExamsContext = createContext(null);

export function ExamsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [appeals, setAppeals] = useState([]);
  const [loadingAppeals, setLoadingAppeals] = useState(true);

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const [message, setMessage] = useState('');

  const refetchOverview = useCallback(() => {
    setLoading(true);
    fetch('/api/examinations/portal', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load data.');
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetchExams = useCallback(() => {
    setLoadingExams(true);
    fetch('/api/examinations/exams', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load exams.');
        setExams(result.exams || []);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoadingExams(false));
  }, []);

  const refetchAppeals = useCallback(() => {
    setLoadingAppeals(true);
    fetch('/api/examinations/appeals', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load appeals.');
        setAppeals(result.appeals || []);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoadingAppeals(false));
  }, []);

  const refetchResults = useCallback(() => {
    setLoadingResults(true);
    fetch('/api/examinations/results', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load result verification data.');
        setResults(result.results || []);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoadingResults(false));
  }, []);

  useEffect(() => {
    refetchOverview();
    refetchExams();
    refetchAppeals();
    refetchResults();
  }, [refetchOverview, refetchExams, refetchAppeals, refetchResults]);

  return (
    <ExamsContext.Provider
      value={{
        data, loading, error,
        exams, loadingExams, refetchExams,
        appeals, loadingAppeals, refetchAppeals,
        results, loadingResults, refetchResults,
        refetchOverview,
        message, setMessage,
      }}
    >
      {children}
    </ExamsContext.Provider>
  );
}

export function useExams() {
  const ctx = useContext(ExamsContext);
  if (!ctx) throw new Error('useExams must be used within ExamsProvider');
  return ctx;
}
