import type { Candidate, Position, ProcessEvent } from "@/types/hcm";

export const mockPositions: Position[] = [
  { id: "pos-1", title: "Senior Frontend Engineer", department: "Engineering", location: "Berlin" },
  { id: "pos-2", title: "Payroll Specialist", department: "People Ops", location: "Munich" },
  { id: "pos-3", title: "Product Designer", department: "Design", location: "Remote (EU)" },
  { id: "pos-4", title: "Data Analyst", department: "Analytics", location: "Hamburg" },
];

const now = Date.now();
const t = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

export const mockCandidates: Candidate[] = [
  {
    id: "cand-001",
    full_name: "Lena Hofmann",
    email: "lena.hofmann@example.com",
    position_id: "pos-1",
    position_title: "Senior Frontend Engineer",
    score: 92,
    status: "awaiting_review",
    last_step: "score_computed",
    last_path: "robot",
    created_at: t(120),
    updated_at: t(8),
  },
  {
    id: "cand-002",
    full_name: "Marco Bianchi",
    email: "marco.bianchi@example.com",
    position_id: "pos-3",
    position_title: "Product Designer",
    score: 78,
    status: "interview",
    last_step: "interview_scheduled",
    last_path: "robot",
    created_at: t(2400),
    updated_at: t(45),
  },
  {
    id: "cand-003",
    full_name: "Sara Yilmaz",
    email: "sara.yilmaz@example.com",
    position_id: "pos-2",
    position_title: "Payroll Specialist",
    score: 88,
    status: "hired",
    last_step: "welcome_email_sent",
    last_path: "robot",
    created_at: t(4320),
    updated_at: t(180),
  },
  {
    id: "cand-004",
    full_name: "Jonas Weber",
    email: "jonas.weber@example.com",
    position_id: "pos-4",
    position_title: "Data Analyst",
    score: 54,
    status: "rejected",
    last_step: "rejection_email_sent",
    last_path: "robot",
    created_at: t(7200),
    updated_at: t(600),
  },
  {
    id: "cand-005",
    full_name: "Aiko Tanaka",
    email: "aiko.tanaka@example.com",
    position_id: "pos-1",
    position_title: "Senior Frontend Engineer",
    score: 81,
    status: "awaiting_review",
    last_step: "score_computed",
    last_path: "robot",
    created_at: t(60),
    updated_at: t(12),
  },
  {
    id: "cand-006",
    full_name: "Pavel Novak",
    email: "pavel.novak@example.com",
    position_id: "pos-2",
    position_title: "Payroll Specialist",
    score: 71,
    status: "scoring",
    last_step: "scoring_started",
    last_path: "robot",
    created_at: t(15),
    updated_at: t(3),
  },
];

function eventsFor(candidateId: string, processId: string, scenario: "awaiting" | "hired" | "rejected" | "interview" | "scoring"): ProcessEvent[] {
  const base = [
    { step_code: "application_received", path: "robot" as const, status: "success" as const, message: "Bewerbung über Portal eingegangen", minsAgo: 120 },
    { step_code: "intake_validated", path: "robot" as const, status: "success" as const, message: "Pflichtfelder validiert, Duplikat-Check OK", minsAgo: 118 },
    { step_code: "cv_parsed", path: "robot" as const, status: "success" as const, message: "CV mit n8n geparsed", minsAgo: 115 },
    { step_code: "score_computed", path: "robot" as const, status: "success" as const, message: "Match-Score berechnet", minsAgo: 110, payload: { score: 92 } },
  ];

  const ev: ProcessEvent[] = base.map((e, i) => ({
    id: `${candidateId}-ev-${i}`,
    process_id: processId,
    process_type: "onboarding",
    candidate_id: candidateId,
    step_code: e.step_code,
    path_type: e.path,
    status: e.status,
    message: e.message,
    payload: e.payload ?? null,
    created_at: t(e.minsAgo),
  }));

  if (scenario === "scoring") {
    ev[ev.length - 1].status = "running";
    return ev.slice(0, -1).concat({
      ...ev[ev.length - 1],
      status: "running",
      message: "Match-Score wird berechnet …",
    });
  }

  ev.push({
    id: `${candidateId}-ev-await`,
    process_id: processId,
    process_type: "onboarding",
    candidate_id: candidateId,
    step_code: "awaiting_hr_review",
    path_type: "human",
    status: scenario === "awaiting" ? "waiting_approval" : "success",
    message: "HR-Entscheidung erforderlich (Interview / Hire / Reject)",
    payload: null,
    created_at: t(100),
  });

  if (scenario === "awaiting") return ev;

  if (scenario === "interview") {
    ev.push({
      id: `${candidateId}-ev-int`,
      process_id: processId,
      process_type: "onboarding",
      candidate_id: candidateId,
      step_code: "decision_interview",
      path_type: "human",
      status: "success",
      message: "HR hat Interview ausgewählt",
      payload: { decision: "interview" },
      created_at: t(90),
    });
    ev.push({
      id: `${candidateId}-ev-int2`,
      process_id: processId,
      process_type: "onboarding",
      candidate_id: candidateId,
      step_code: "interview_scheduled",
      path_type: "robot",
      status: "success",
      message: "Interview-Slot in Kalender gebucht",
      payload: { slot: "2026-05-20 14:00 CET" },
      created_at: t(88),
    });
    ev.push({
      id: `${candidateId}-ev-int3`,
      process_id: processId,
      process_type: "onboarding",
      candidate_id: candidateId,
      step_code: "email_sent",
      path_type: "robot",
      status: "success",
      message: "Einladungs-Mail gesendet",
      payload: { to: "marco.bianchi@example.com", template: "interview_invite" },
      created_at: t(87),
    });
    return ev;
  }

  if (scenario === "hired") {
    ev.push(
      {
        id: `${candidateId}-ev-h1`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "decision_hire",
        path_type: "human",
        status: "success",
        message: "HR hat Hire entschieden",
        payload: { decision: "hire" },
        created_at: t(80),
      },
      {
        id: `${candidateId}-ev-h2`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "contract_generated",
        path_type: "robot",
        status: "success",
        message: "Arbeitsvertrag aus Template generiert",
        payload: null,
        created_at: t(75),
      },
      {
        id: `${candidateId}-ev-h3`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "email_sent",
        path_type: "robot",
        status: "success",
        message: "Welcome-Mail mit Vertrag gesendet",
        payload: { to: "sara.yilmaz@example.com", template: "welcome" },
        created_at: t(74),
      },
      {
        id: `${candidateId}-ev-h4`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "account_provisioned",
        path_type: "robot",
        status: "success",
        message: "Employee-Account angelegt, Payroll-Stammdaten erstellt",
        payload: null,
        created_at: t(72),
      },
    );
    return ev;
  }

  if (scenario === "rejected") {
    ev.push(
      {
        id: `${candidateId}-ev-r1`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "decision_reject",
        path_type: "human",
        status: "success",
        message: "HR hat Reject entschieden",
        payload: { decision: "reject", note: "Profil passt nicht zur Seniorität" },
        created_at: t(620),
      },
      {
        id: `${candidateId}-ev-r2`,
        process_id: processId,
        process_type: "onboarding",
        candidate_id: candidateId,
        step_code: "rejection_email_sent",
        path_type: "robot",
        status: "success",
        message: "Absage-Mail freundlich gesendet",
        payload: { to: "jonas.weber@example.com", template: "rejection" },
        created_at: t(610),
      },
    );
  }

  return ev;
}

export const mockEvents: ProcessEvent[] = [
  ...eventsFor("cand-001", "proc-cand-001", "awaiting"),
  ...eventsFor("cand-002", "proc-cand-002", "interview"),
  ...eventsFor("cand-003", "proc-cand-003", "hired"),
  ...eventsFor("cand-004", "proc-cand-004", "rejected"),
  ...eventsFor("cand-005", "proc-cand-005", "awaiting"),
  ...eventsFor("cand-006", "proc-cand-006", "scoring"),
];

export function processIdForCandidate(candidateId: string) {
  return `proc-${candidateId}`;
}
