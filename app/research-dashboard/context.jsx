'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ResearchContext = createContext(null);

export function ResearchProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposalsError, setProposalsError] = useState('');

  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [publicationsError, setPublicationsError] = useState('');

  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  const [supervisions, setSupervisions] = useState([]);
  const [loadingSupervisions, setLoadingSupervisions] = useState(true);

  const [grants, setGrants] = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(true);

  const [integrityCases, setIntegrityCases] = useState([]);
  const [loadingIntegrityCases, setLoadingIntegrityCases] = useState(true);
  const [integrityCasesError, setIntegrityCasesError] = useState('');

  const [staffOptions, setStaffOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const refetchOverview = useCallback(() => {
    setLoading(true);
    fetch('/api/research/portal', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load Research data.');
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetchProjects = useCallback(() => {
    setLoadingProjects(true);
    fetch('/api/research/projects', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load projects.');
        setProjects(result.data || []);
      })
      .catch((err) => setProjectsError(err.message))
      .finally(() => setLoadingProjects(false));
  }, []);

  const refetchProposals = useCallback(() => {
    setLoadingProposals(true);
    fetch('/api/research/proposals', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load proposals.');
        setProposals(result.data || []);
      })
      .catch((err) => setProposalsError(err.message))
      .finally(() => setLoadingProposals(false));
  }, []);

  const refetchPublications = useCallback(() => {
    setLoadingPublications(true);
    fetch('/api/research/publications', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load publications.');
        setPublications(result.data || []);
      })
      .catch((err) => setPublicationsError(err.message))
      .finally(() => setLoadingPublications(false));
  }, []);

  const refetchPartners = useCallback(() => {
    setLoadingPartners(true);
    fetch('/api/research/collaboration/partners', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setPartners(result.data || []);
      })
      .finally(() => setLoadingPartners(false));
  }, []);

  const refetchSupervisions = useCallback(() => {
    setLoadingSupervisions(true);
    fetch('/api/research/supervision', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setSupervisions(result.data || []);
      })
      .finally(() => setLoadingSupervisions(false));
  }, []);

  const refetchGrants = useCallback(() => {
    setLoadingGrants(true);
    fetch('/api/research/grants', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setGrants(result.data || []);
      })
      .finally(() => setLoadingGrants(false));
  }, []);

  const refetchIntegrityCases = useCallback(() => {
    setLoadingIntegrityCases(true);
    fetch('/api/research/integrity', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load integrity cases.');
        setIntegrityCases(result.data || []);
      })
      .catch((err) => setIntegrityCasesError(err.message))
      .finally(() => setLoadingIntegrityCases(false));
  }, []);

  const refetchOptions = useCallback(() => {
    fetch('/api/research/staff', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setStaffOptions(result.data || []);
      })
      .catch(() => {});
    fetch('/api/research/students', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setStudentOptions(result.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refetchOverview();
    refetchProjects();
    refetchProposals();
    refetchPublications();
    refetchPartners();
    refetchSupervisions();
    refetchGrants();
    refetchIntegrityCases();
    refetchOptions();
  }, [
    refetchOverview,
    refetchProjects,
    refetchProposals,
    refetchPublications,
    refetchPartners,
    refetchSupervisions,
    refetchGrants,
    refetchIntegrityCases,
    refetchOptions,
  ]);

  return (
    <ResearchContext.Provider
      value={{
        data, loading, error, refetchOverview,
        projects, loadingProjects, projectsError, refetchProjects,
        proposals, loadingProposals, proposalsError, refetchProposals,
        publications, loadingPublications, publicationsError, refetchPublications,
        partners, loadingPartners, refetchPartners,
        supervisions, loadingSupervisions, refetchSupervisions,
        grants, loadingGrants, refetchGrants,
        integrityCases, loadingIntegrityCases, integrityCasesError, refetchIntegrityCases,
        staffOptions, studentOptions,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const ctx = useContext(ResearchContext);
  if (!ctx) throw new Error('useResearch must be used within ResearchProvider');
  return ctx;
}
