import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./supabase";
import { mockCandidates, mockEvents, mockPositions, processIdForCandidate } from "./mock-data";
import type { Candidate, DataSource, Position, ProcessEvent } from "@/types/hcm";

interface Sourced<T> {
  data: T;
  source: DataSource;
}

async function fetchCandidates(): Promise<Sourced<Candidate[]>> {
  const sb = getSupabase();
  if (!sb) return { data: mockCandidates, source: "mock" };
  try {
    const { data, error } = await sb
      .from("candidates")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const mapped: Candidate[] = (data || []).map((c: any) => ({
      ...c,
      full_name: c.full_name ?? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
      score: c.score ?? c.qualification_score ?? 0,
      position_title: c.position_title ?? "—",
      last_step: c.last_step ?? c.status ?? "—",
      last_path: c.last_path ?? "robot",
    }));
    return { data: mapped, source: "live" };
  } catch {
    return { data: mockCandidates, source: "mock" };
  }
}

async function fetchPositions(): Promise<Sourced<Position[]>> {
  const sb = getSupabase();
  if (!sb) return { data: mockPositions, source: "mock" };
  try {
    const { data, error } = await sb.from("positions").select("*").order("position_title");
    if (error) throw error;
    return { data: (data || []) as Position[], source: "live" };
  } catch {
    return { data: mockPositions, source: "mock" };
  }
}

async function fetchEvents(processId?: string): Promise<Sourced<ProcessEvent[]>> {
  const sb = getSupabase();
  if (!sb) {
    const filtered = processId ? mockEvents.filter((e) => e.process_id === processId) : mockEvents;
    return { data: [...filtered].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)), source: "mock" };
  }
  try {
    let q = sb.from("process_events").select("*").order("created_at", { ascending: true });
    if (processId) q = q.eq("process_id", processId);
    const { data, error } = await q;
    if (error) throw error;
    return { data: (data || []) as ProcessEvent[], source: "live" };
  } catch {
    const filtered = processId ? mockEvents.filter((e) => e.process_id === processId) : mockEvents;
    return { data: [...filtered].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)), source: "mock" };
  }
}

export function useCandidates() {
  return useQuery({ queryKey: ["candidates"], queryFn: fetchCandidates, refetchInterval: 15_000 });
}

export function usePositions() {
  return useQuery({ queryKey: ["positions"], queryFn: fetchPositions });
}

export function useAllEvents() {
  return useQuery({ queryKey: ["events"], queryFn: () => fetchEvents(), refetchInterval: 10_000 });
}

export function useProcessEvents(processId: string) {
  return useQuery({
    queryKey: ["events", processId],
    queryFn: () => fetchEvents(processId),
    refetchInterval: 5_000,
    enabled: !!processId,
  });
}

export function useCandidate(id: string) {
  const { data } = useCandidates();
  return data?.data.find((c) => c.id === id);
}

export { processIdForCandidate };

// --- Mock injection (when webhooks unreachable) ---
const injected: ProcessEvent[] = [];

export function injectMockEvent(ev: ProcessEvent) {
  injected.push(ev);
  mockEvents.push(ev);
}

// --- Mutations ---
import { ENV } from "./env";
import { toast } from "sonner";

async function postWithTimeout(url: string, body: unknown, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json().catch(() => ({}));
  } finally {
    clearTimeout(id);
  }
}

export function useApplyMutation() {
  return useMutation({
    mutationFn: async (payload: { full_name: string; email: string; position_id: string; cv_url?: string; cover_letter?: string }) => {
      if (!ENV.N8N_APPLY_WEBHOOK) {
        // Mock
        const newId = `cand-${Math.random().toString(36).slice(2, 8)}`;
        const pos = mockPositions.find((p) => p.id === payload.position_id);
        mockCandidates.unshift({
          id: newId,
          full_name: payload.full_name,
          email: payload.email,
          position_id: payload.position_id,
          position_title: pos?.title,
          score: Math.round(60 + Math.random() * 35),
          status: "scoring",
          last_step: "application_received",
          last_path: "robot",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        injectMockEvent({
          id: `${newId}-ev-0`,
          process_id: processIdForCandidate(newId),
          process_type: "onboarding",
          candidate_id: newId,
          step_code: "application_received",
          path_type: "robot",
          status: "success",
          message: "Bewerbung über Portal eingegangen (Mock)",
          payload: null,
          created_at: new Date().toISOString(),
        });
        return { mock: true, candidate_id: newId };
      }
      const nameParts = payload.full_name.trim().split(/\s+/);
      const firstName = nameParts[0] ?? "Unbekannt";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      return postWithTimeout(ENV.N8N_APPLY_WEBHOOK, {
        firstName,
        lastName,
        email: payload.email,
        positionId: payload.position_id,
        coverLetter: payload.cover_letter ?? "",
        cvUrl: payload.cv_url ?? "",
      });
    },
    onError: (e: any) => {
      toast.error("Apply-Webhook nicht erreichbar", { description: e?.message ?? "Mock-Modus aktiv" });
    },
  });
}

export function useDecisionMutation(candidateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { decision: "interview" | "hire" | "reject"; note?: string }) => {
      const body = { candidate_id: candidateId, ...input };
      if (!ENV.N8N_DECISION_WEBHOOK) {
        // mock event
        injectMockEvent({
          id: `${candidateId}-dec-${Date.now()}`,
          process_id: processIdForCandidate(candidateId),
          process_type: "onboarding",
          candidate_id: candidateId,
          step_code: `decision_${input.decision}`,
          path_type: "human",
          status: "success",
          message: `HR hat ${input.decision} entschieden${input.note ? " (Notiz hinterlegt)" : ""}`,
          payload: input,
          created_at: new Date().toISOString(),
        });
        // robot follow-up
        setTimeout(() => {
          injectMockEvent({
            id: `${candidateId}-mail-${Date.now()}`,
            process_id: processIdForCandidate(candidateId),
            process_type: "onboarding",
            candidate_id: candidateId,
            step_code: "email_sent",
            path_type: "robot",
            status: "success",
            message:
              input.decision === "hire"
                ? "Welcome-Mail gesendet"
                : input.decision === "reject"
                  ? "Absage-Mail gesendet"
                  : "Interview-Einladung gesendet",
            payload: { template: input.decision },
            created_at: new Date().toISOString(),
          });
          qc.invalidateQueries({ queryKey: ["events"] });
        }, 1200);
        // update candidate
        const cand = mockCandidates.find((c) => c.id === candidateId);
        if (cand) {
          cand.status =
            input.decision === "hire" ? "hired" : input.decision === "reject" ? "rejected" : "interview";
          cand.last_step = `decision_${input.decision}`;
          cand.last_path = "human";
          cand.updated_at = new Date().toISOString();
        }
        return { mock: true };
      }
      return postWithTimeout(ENV.N8N_DECISION_WEBHOOK, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: any) => {
      toast.error("Decision-Webhook nicht erreichbar", { description: e?.message ?? "Mock-Modus aktiv" });
    },
  });
}
