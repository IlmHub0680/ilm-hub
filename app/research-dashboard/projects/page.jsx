'use client';
import { useState } from 'react';
import { useResearch } from '../context';

const STATUS_BADGE = {
    PROPOSED: 'ih-b-neutral',
    UNDER_REVIEW: 'ih-b-info',
    APPROVED: 'ih-b-info',
    ACTIVE: 'ih-b-success',
    COMPLETED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
    SUSPENDED: 'ih-b-warning',
};

const STATUSES = ['PROPOSED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'SUSPENDED'];

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function ResearchProjectsPage() {
    const { projects, loadingProjects, projectsError, refetchProjects, refetchOverview, staffOptions, data } = useResearch();
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [draft, setDraft] = useState({ title: '', description: '', principalInvestigatorId: '', areaId: '' });
    const [milestoneDraft, setMilestoneDraft] = useState({ title: '', dueDate: '' });
    const [teamDraft, setTeamDraft] = useState({ staffId: '', externalName: '', externalAffiliation: '', externalEmail: '', role: 'RESEARCHER' });
    const [busyId, setBusyId] = useState(null);

    const handleCreate = async () => {
        if (!draft.title.trim() || !draft.description.trim() || !draft.principalInvestigatorId) {
            setMessage('Title, description and a Principal Investigator are required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/projects', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: draft.title,
                    description: draft.description,
                    principalInvestigatorId: draft.principalInvestigatorId,
                    areaId: draft.areaId || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Research project created.');
                setDraft({ title: '', description: '', principalInvestigatorId: '', areaId: '' });
                refetchProjects();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to create project.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/research/projects/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                refetchProjects();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to update status.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleAddMilestone = async (projectId) => {
        if (!milestoneDraft.title.trim()) return;
        setBusyId(projectId);
        try {
            const res = await fetch(`/api/research/projects/${projectId}/milestones`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: milestoneDraft.title, dueDate: milestoneDraft.dueDate || undefined }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMilestoneDraft({ title: '', dueDate: '' });
                refetchProjects();
            } else {
                setMessage(result.error || 'Failed to add milestone.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleToggleMilestone = async (projectId, milestoneId, isCompleted) => {
        setBusyId(projectId);
        try {
            const res = await fetch(`/api/research/projects/${projectId}/milestones`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ milestoneId, isCompleted }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                refetchProjects();
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleAddTeamMember = async (projectId) => {
        if (!teamDraft.staffId && !teamDraft.externalName.trim()) {
            setMessage('Select a staff member or enter an external collaborator name.');
            return;
        }
        setBusyId(projectId);
        try {
            const res = await fetch(`/api/research/projects/${projectId}/team`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamDraft),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setTeamDraft({ staffId: '', externalName: '', externalAffiliation: '', externalEmail: '', role: 'RESEARCHER' });
                refetchProjects();
            } else {
                setMessage(result.error || 'Failed to add team member.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleRemoveTeamMember = async (projectId, memberId) => {
        setBusyId(projectId);
        try {
            await fetch(`/api/research/projects/${projectId}/team?memberId=${memberId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            refetchProjects();
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}

            <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>New Research Project</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input style={fieldStyle} type="text" placeholder="Project title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <textarea style={{ ...fieldStyle, minHeight: 70 }} placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                    <select style={fieldStyle} value={draft.principalInvestigatorId} onChange={(e) => setDraft({ ...draft, principalInvestigatorId: e.target.value })}>
                        <option value="">Select Principal Investigator</option>
                        {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}{s.position ? ` (${s.position})` : ''}</option>)}
                    </select>
                    <select style={fieldStyle} value={draft.areaId} onChange={(e) => setDraft({ ...draft, areaId: e.target.value })}>
                        <option value="">No research area</option>
                        {(data?.areas || []).map((a) => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
                    </select>
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Projects</h3>
                {loadingProjects && <p>Loading...</p>}
                {projectsError && <p style={{ color: 'var(--danger)' }}>{projectsError}</p>}
                {!loadingProjects && projects.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No research projects yet.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {projects.map((p) => (
                        <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        PI: {p.principalInvestigatorName}{p.areaName ? ` · ${p.areaName}` : ''} · {p.milestoneCount ?? 0} milestone(s) · {p.teamCount ?? 0} team member(s)
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span className={`ih-badge ${STATUS_BADGE[p.status] || 'ih-b-neutral'}`}>{p.status.replace(/_/g, ' ')}</span>
                                    <select
                                        value={p.status}
                                        disabled={busyId === p.id}
                                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                        style={{ ...fieldStyle, width: 'auto', padding: '5px 8px', fontSize: 12.5 }}
                                    >
                                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                    </select>
                                    <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5, padding: '5px 10px' }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                                        {expandedId === p.id ? 'Hide' : 'Manage'}
                                    </button>
                                </div>
                            </div>

                            {expandedId === p.id && (
                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Milestones</h4>
                                        {(p.milestones || []).map((m) => (
                                            <label key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                                                <input type="checkbox" checked={m.isCompleted} onChange={(e) => handleToggleMilestone(p.id, m.id, e.target.checked)} />
                                                <span style={{ textDecoration: m.isCompleted ? 'line-through' : 'none' }}>{m.title}{m.dueDate ? ` (due ${new Date(m.dueDate).toLocaleDateString()})` : ''}</span>
                                            </label>
                                        ))}
                                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                            <input style={{ ...fieldStyle, fontSize: 12.5 }} type="text" placeholder="New milestone" value={milestoneDraft.title} onChange={(e) => setMilestoneDraft({ ...milestoneDraft, title: e.target.value })} />
                                            <input style={{ ...fieldStyle, fontSize: 12.5, width: 140 }} type="date" value={milestoneDraft.dueDate} onChange={(e) => setMilestoneDraft({ ...milestoneDraft, dueDate: e.target.value })} />
                                            <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5 }} onClick={() => handleAddMilestone(p.id)} disabled={busyId === p.id}>Add</button>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Team</h4>
                                        {(p.teamMembers || []).map((t) => (
                                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                                <span>{t.staffName || t.externalName} <span style={{ color: 'var(--ink-soft)' }}>({t.role.replace(/_/g, ' ')})</span></span>
                                                <button onClick={() => handleRemoveTeamMember(p.id, t.id)} disabled={busyId === p.id} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                                            <select style={{ ...fieldStyle, fontSize: 12.5 }} value={teamDraft.staffId} onChange={(e) => setTeamDraft({ ...teamDraft, staffId: e.target.value, externalName: '' })}>
                                                <option value="">Internal staff member...</option>
                                                {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <input style={{ ...fieldStyle, fontSize: 12.5 }} type="text" placeholder="...or external collaborator name" value={teamDraft.externalName} onChange={(e) => setTeamDraft({ ...teamDraft, externalName: e.target.value, staffId: '' })} />
                                            <select style={{ ...fieldStyle, fontSize: 12.5 }} value={teamDraft.role} onChange={(e) => setTeamDraft({ ...teamDraft, role: e.target.value })}>
                                                <option value="PRINCIPAL_INVESTIGATOR">Principal Investigator</option>
                                                <option value="CO_INVESTIGATOR">Co-Investigator</option>
                                                <option value="RESEARCHER">Researcher</option>
                                                <option value="RESEARCH_ASSISTANT">Research Assistant</option>
                                                <option value="EXTERNAL_COLLABORATOR">External Collaborator</option>
                                            </select>
                                            <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5 }} onClick={() => handleAddTeamMember(p.id)} disabled={busyId === p.id}>Add to Team</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
