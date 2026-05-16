export type PathType = "human" | "robot";

export type ProcessStatus =
  | "pending"
  | "running"
  | "waiting_approval"
  | "success"
  | "failed";

export type CandidateStatus =
  | "new"
  | "scoring"
  | "awaiting_review"
  | "interview"
  | "hired"
  | "rejected"
  | "onboarding";

export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  position_id: string;
  position_title?: string;
  score: number;
  status: CandidateStatus;
  last_step?: string;
  last_path?: PathType;
  created_at: string;
  updated_at: string;
}

export interface ProcessEvent {
  id: string;
  process_id: string;
  process_type: "onboarding" | "payroll";
  candidate_id?: string;
  step_code: string;
  path_type: PathType;
  status: ProcessStatus;
  message: string;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export type DataSource = "live" | "mock";
