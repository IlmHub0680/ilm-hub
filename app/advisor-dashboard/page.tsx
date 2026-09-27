"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";

type Advisee = {
  id: string;
  name: string;
  email: string;
  studentNo: string;
  programme: string | null;
  lastMessageAt: string | null;
};

type Message = {
  id: string;
  senderRole: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

type SelfReported = {
  islamicStudiesBackground: string | null;
  pathwayPreference: string | null;
  quranReadingSelf: string | null;
  quranTajweedSelf: string | null;
  quranHifzSelf: string | null;
  quranRecitationSelf: string | null;
  arabicReadingSelf: string | null;
  arabicWritingSelf: string | null;
  arabicGrammarSelf: string | null;
  arabicVocabularySelf: string | null;
  arabicConversationSelf: string | null;
  quranicArabicSelf: string | null;
} | null;

type PlacementAssessment = {
  id: string;
  status: string;
  quranReadingLevel: string | null;
  quranTajweedLevel: string | null;
  quranHifzLevel: string | null;
  quranRecitationLevel: string | null;
  arabicReadingLevel: string | null;
  arabicWritingLevel: string | null;
  arabicGrammarLevel: string | null;
  arabicVocabularyLevel: string | null;
  arabicConversationLevel: string | null;
  quranicArabicLevel: string | null;
  recommendedPathway: string | null;
  recommendedProgramId: string | null;
  assessorNote: string | null;
} | null;

type PlacementStudent = {
  id: string;
  name: string;
  email: string;
  studentNo: string;
  status: string;
  programme: string | null;
  department: string | null;
  placementAssessment: PlacementAssessment;
  selfReported: SelfReported;
};

type ProgramOption = { id: string; name: string };

const PATHWAY_OPTIONS = [
  'Foundation Learner Programme',
  'Intermediate Learner Programme',
  'Advanced Islamic Studies',
  'Diploma in Islamic Studies',
  'Specialized Certificate Programs',
];

const SELF_LEVEL_OPTIONS = [
  { value: '', label: 'Not assessed' },
  { value: 'NONE', label: 'None' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'PROFICIENT', label: 'Proficient' },
];

const SELF_LEVEL_LABELS: Record<string, string> = {
  NONE: 'None', BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', PROFICIENT: 'Proficient',
};

const PLACEMENT_FIELDS: Array<{ key: string; label: string; selfKey: string }> = [
  { key: 'quranReadingLevel', label: "Qur'an Reading", selfKey: 'quranReadingSelf' },
  { key: 'quranTajweedLevel', label: 'Tajweed', selfKey: 'quranTajweedSelf' },
  { key: 'quranHifzLevel', label: 'Hifz', selfKey: 'quranHifzSelf' },
  { key: 'quranRecitationLevel', label: 'Recitation', selfKey: 'quranRecitationSelf' },
  { key: 'arabicReadingLevel', label: 'Arabic Reading', selfKey: 'arabicReadingSelf' },
  { key: 'arabicWritingLevel', label: 'Arabic Writing', selfKey: 'arabicWritingSelf' },
  { key: 'arabicGrammarLevel', label: 'Arabic Grammar', selfKey: 'arabicGrammarSelf' },
  { key: 'arabicVocabularyLevel', label: 'Arabic Vocabulary', selfKey: 'arabicVocabularySelf' },
  { key: 'arabicConversationLevel', label: 'Arabic Conversation', selfKey: 'arabicConversationSelf' },
  { key: 'quranicArabicLevel', label: "Qur'anic Arabic", selfKey: 'quranicArabicSelf' },
];

const NAV_ITEMS = [
  { id: "advisees", label: "Advisees & Messages", icon: "🧭" },
  { id: "placement", label: "Placement", icon: "🧩" },
];

export default function AdvisorDashboard() {
  const [activeTab, setActiveTab] = useState("advisees");

  const [advisees, setAdvisees] = useState<Advisee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [placementStudents, setPlacementStudents] = useState<PlacementStudent[]>([]);
  const [placementLoading, setPlacementLoading] = useState(true);
  const [placementError, setPlacementError] = useState("");
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [placementDraft, setPlacementDraft] = useState<Record<string, string>>({});
  const [savingPlacement, setSavingPlacement] = useState(false);
  const [placementMessage, setPlacementMessage] = useState("");
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);

  const fetchPlacementQueue = () => {
    setPlacementLoading(true);
    fetch("/api/advisor/placement", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load the placement queue.");
        setPlacementStudents(result.students || []);
      })
      .catch((err) => setPlacementError(err.message))
      .finally(() => setPlacementLoading(false));
  };

  useEffect(() => {
    fetchPlacementQueue();
    fetch("/api/academic/programs?type=programs")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setProgramOptions((result.data || []).map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, []);

  const openPlacement = (student: PlacementStudent) => {
    setSelectedPlacementId(student.id);
    setPlacementMessage("");
    const existing = student.placementAssessment;
    const draft: Record<string, string> = {
      recommendedPathway: existing?.recommendedPathway || student.selfReported?.pathwayPreference || '',
      recommendedProgramId: existing?.recommendedProgramId || '',
      assessorNote: existing?.assessorNote || '',
    };
    for (const f of PLACEMENT_FIELDS) {
      draft[f.key] = (existing as any)?.[f.key] || '';
    }
    setPlacementDraft(draft);
  };

  const savePlacement = async (status: string) => {
    if (!selectedPlacementId) return;
    setSavingPlacement(true);
    setPlacementMessage("");
    try {
      const res = await fetch(`/api/advisor/placement/${selectedPlacementId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...placementDraft, status }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to save.");
      setPlacementMessage(status === "COMPLETED" ? "Placement completed — the student is now Active." : "Draft saved.");
      fetchPlacementQueue();
    } catch (err: any) {
      setPlacementMessage(err.message || "Failed to save.");
    } finally {
      setSavingPlacement(false);
    }
  };

  const selectedPlacementStudent = placementStudents.find((s) => s.id === selectedPlacementId) || null;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const fetchAdvisees = () => {
    setLoading(true);
    fetch("/api/advisor/portal", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load advisees.");
        setAdvisees(result.advisees || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdvisees();
  }, []);

  const openThread = (id: string) => {
    setSelectedId(id);
    setLoadingMessages(true);
    fetch(`/api/advisor/messages?studentId=${id}`, { credentials: "include" })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load messages.");
        setMessages(result.messages || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMessages(false));
  };

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/advisor/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedId, message: draft.trim() }),
      });
      const result = await res.json();
      if (res.ok) {
        setDraft("");
        openThread(selectedId);
      } else {
        setError(result.error || "Failed to send message.");
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setSending(false);
    }
  };

  const selectedAdvisee = advisees.find((a) => a.id === selectedId) || null;

  return (
    <DashboardShell
      brandSub="Academic Advising"
      brandIcon="🧭"
      navItems={NAV_ITEMS}
      activeId={activeTab}
      onSelect={setActiveTab}
      title="Academic Advising"
      subtitle={activeTab === "placement" ? "Placement assessments for newly admitted students (Academy Pathways §8)." : "Your assigned advisees and messages."}
    >
    {activeTab === "advisees" && (
      <>
      {loading && <div className="ih-card">Loading…</div>}
      {error && (
        <div className="ih-card" style={{ background: "var(--danger-tint)", color: "var(--danger)", border: "1px solid var(--danger)", marginBottom: 20 }}>
          {error}
        </div>
      )}

      {!loading && advisees.length === 0 && (
        <div className="ih-card" style={{ color: "var(--ink-soft)" }}>
          No students are currently assigned to you as advisees.
        </div>
      )}

      {advisees.length > 0 && (
        <section id="advisees" style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) 1fr", gap: 20, alignItems: "start" }}>
          <div className="ih-card" style={{ padding: 16 }}>
            <h3 style={{ margin: "4px 8px 12px", fontSize: 16 }}>Advisees</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {advisees.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openThread(a.id)}
                  style={{
                    textAlign: "left",
                    background: selectedId === a.id ? "var(--brand-tint)" : "transparent",
                    color: "var(--ink)",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{a.studentNo} · {a.programme || "No programme"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="ih-card" style={{ minHeight: 300 }}>
            {!selectedAdvisee && (
              <p style={{ color: "var(--ink-soft)" }}>Select an advisee to view your message thread.</p>
            )}

            {selectedAdvisee && (
              <>
                <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>
                  {selectedAdvisee.name} <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 14 }}>({selectedAdvisee.studentNo})</span>
                </h3>

                {loadingMessages && <p>Loading messages…</p>}

                {!loadingMessages && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, maxHeight: 360, overflowY: "auto" }}>
                    {messages.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No messages yet.</p>}
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: m.senderRole === "ADVISOR" ? "flex-end" : "flex-start",
                          background: m.senderRole === "ADVISOR" ? "var(--brand)" : "var(--brand-tint)",
                          color: m.senderRole === "ADVISOR" ? "var(--on-accent)" : "var(--ink)",
                          borderRadius: 10,
                          padding: "8px 12px",
                          maxWidth: "70%",
                          fontSize: 14,
                        }}
                      >
                        {m.message}
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Write a reply…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 6, padding: "9px 11px", fontSize: 13.5, background: "var(--surface)", color: "var(--ink)" }}
                  />
                  <button onClick={handleSend} disabled={sending || !draft.trim()} className="ih-btn ih-btn-primary">
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
      </>
    )}

    {activeTab === "placement" && (
      <section style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 20, alignItems: "start" }}>
        <div className="ih-card" style={{ padding: 16 }}>
          <h3 style={{ margin: "4px 8px 12px", fontSize: 16 }}>Awaiting Placement</h3>

          {placementLoading && <p style={{ padding: "0 8px", color: "var(--ink-soft)" }}>Loading…</p>}
          {placementError && <p style={{ padding: "0 8px", color: "var(--danger)" }}>{placementError}</p>}
          {!placementLoading && placementStudents.length === 0 && (
            <p style={{ padding: "0 8px", color: "var(--ink-soft)" }}>No students currently need placement.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {placementStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => openPlacement(s)}
                style={{
                  textAlign: "left",
                  background: selectedPlacementId === s.id ? "var(--brand-tint)" : "transparent",
                  color: "var(--ink)",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  {s.studentNo} · {s.placementAssessment?.status ? s.placementAssessment.status.replace(/_/g, " ") : "Not started"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="ih-card" style={{ minHeight: 300, padding: 20 }}>
          {!selectedPlacementStudent && (
            <p style={{ color: "var(--ink-soft)" }}>Select a student to record their placement assessment.</p>
          )}

          {selectedPlacementStudent && (
            <>
              <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>
                {selectedPlacementStudent.name}{" "}
                <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 14 }}>({selectedPlacementStudent.studentNo})</span>
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-soft)" }}>
                {selectedPlacementStudent.email}
                {selectedPlacementStudent.selfReported?.islamicStudiesBackground
                  ? ` — "${selectedPlacementStudent.selfReported.islamicStudiesBackground}"`
                  : ""}
              </p>

              {placementMessage && (
                <div className="ih-card" style={{ padding: "8px 12px", marginBottom: 14, fontSize: 13 }}>{placementMessage}</div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {PLACEMENT_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      {f.label}
                      {selectedPlacementStudent.selfReported && (selectedPlacementStudent.selfReported as any)[f.selfKey] && (
                        <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                          {" "}(self: {SELF_LEVEL_LABELS[(selectedPlacementStudent.selfReported as any)[f.selfKey]] || "—"})
                        </span>
                      )}
                    </label>
                    <select
                      value={placementDraft[f.key] || ""}
                      onChange={(e) => setPlacementDraft({ ...placementDraft, [f.key]: e.target.value })}
                      style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 9px", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }}
                    >
                      {SELF_LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Recommended Pathway</label>
                  <select
                    value={placementDraft.recommendedPathway || ""}
                    onChange={(e) => setPlacementDraft({ ...placementDraft, recommendedPathway: e.target.value })}
                    style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 9px", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }}
                  >
                    <option value="">Not decided yet</option>
                    {PATHWAY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Recommended Programme</label>
                  <select
                    value={placementDraft.recommendedProgramId || ""}
                    onChange={(e) => setPlacementDraft({ ...placementDraft, recommendedProgramId: e.target.value })}
                    style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 9px", fontSize: 13, background: "var(--surface)", color: "var(--ink)" }}
                  >
                    <option value="">Not decided yet</option>
                    {programOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Assessor Note</label>
                <textarea
                  rows={3}
                  value={placementDraft.assessorNote || ""}
                  onChange={(e) => setPlacementDraft({ ...placementDraft, assessorNote: e.target.value })}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "var(--surface)", color: "var(--ink)", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => savePlacement("IN_PROGRESS")} disabled={savingPlacement} className="ih-btn ih-btn-secondary">
                  Save Draft
                </button>
                <button onClick={() => savePlacement("COMPLETED")} disabled={savingPlacement} className="ih-btn ih-btn-primary">
                  Complete Placement
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    )}
    </DashboardShell>
  );
}
