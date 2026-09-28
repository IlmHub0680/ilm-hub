'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const QAContext = createContext(null);

export function QAProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const refetchOverview = useCallback(() => {
    setLoading(true);
    fetch('/api/qa/portal', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load QA data.');
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetchReviews = useCallback(() => {
    setLoadingReviews(true);
    fetch('/api/qa/reviews', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load reviews.');
        setReviews(result.reviews || []);
      })
      .catch((err) => setReviewsError(err.message))
      .finally(() => setLoadingReviews(false));
  }, []);

  useEffect(() => {
    refetchOverview();
    refetchReviews();
  }, [refetchOverview, refetchReviews]);

  return (
    <QAContext.Provider
      value={{ data, loading, error, reviews, loadingReviews, reviewsError, refetchOverview, refetchReviews }}
    >
      {children}
    </QAContext.Provider>
  );
}

export function useQA() {
  const ctx = useContext(QAContext);
  if (!ctx) throw new Error('useQA must be used within QAProvider');
  return ctx;
}
