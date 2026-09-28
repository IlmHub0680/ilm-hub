'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecordsContext = createContext(null);

export function RecordsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');

  const [courseRequests, setCourseRequests] = useState([]);
  const [loadingCourseRequests, setLoadingCourseRequests] = useState(true);
  const [courseRequestsError, setCourseRequestsError] = useState('');

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [calendars, setCalendars] = useState([]);
  const [loadingCalendars, setLoadingCalendars] = useState(true);
  const [calendarsError, setCalendarsError] = useState('');

  const [message, setMessage] = useState('');

  const refetchOverview = useCallback(() => {
    setLoading(true);
    fetch('/api/records/portal', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load data.');
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetchRequests = useCallback(() => {
    setLoadingRequests(true);
    fetch('/api/records/requests', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load requests.');
        setRequests(result.requests || []);
      })
      .catch((err) => setRequestsError(err.message))
      .finally(() => setLoadingRequests(false));
  }, []);

  const refetchCourseRequests = useCallback(() => {
    setLoadingCourseRequests(true);
    fetch('/api/records/course-requests', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load course add/drop requests.');
        setCourseRequests(result.requests || []);
      })
      .catch((err) => setCourseRequestsError(err.message))
      .finally(() => setLoadingCourseRequests(false));
  }, []);

  const refetchPrograms = useCallback(() => {
    setLoadingPrograms(true);
    fetch('/api/records/auto-assign', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load programmes.');
        setPrograms(result.programs || []);
      })
      .catch(() => {})
      .finally(() => setLoadingPrograms(false));
  }, []);

  const refetchCalendars = useCallback(() => {
    setLoadingCalendars(true);
    fetch('/api/records/academic-calendar', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load academic calendars.');
        setCalendars(result.calendars || []);
      })
      .catch((err) => setCalendarsError(err.message))
      .finally(() => setLoadingCalendars(false));
  }, []);

  useEffect(() => {
    refetchOverview();
    refetchRequests();
    refetchCourseRequests();
    refetchPrograms();
    refetchCalendars();
  }, [refetchOverview, refetchRequests, refetchCourseRequests, refetchPrograms, refetchCalendars]);

  return (
    <RecordsContext.Provider
      value={{
        data, loading, error, refetchOverview,
        requests, loadingRequests, requestsError, refetchRequests,
        courseRequests, loadingCourseRequests, courseRequestsError, refetchCourseRequests,
        programs, loadingPrograms, refetchPrograms,
        calendars, loadingCalendars, calendarsError, refetchCalendars,
        message, setMessage,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider');
  return ctx;
}
