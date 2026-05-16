-- Migration 003: process_events
-- Tracks every Human and Robot step in HCM processes.
-- Run after 001_initial_schema.sql and 002_functions_and_rpc.sql

CREATE TABLE IF NOT EXISTS process_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id   UUID        NOT NULL,
    process_type VARCHAR(20) NOT NULL CHECK (process_type IN ('onboarding', 'payroll')),
    step_code    VARCHAR(50) NOT NULL,
    path_type    VARCHAR(10) NOT NULL CHECK (path_type IN ('human', 'robot')),
    status       VARCHAR(30) NOT NULL DEFAULT 'running'
                             CHECK (status IN ('running', 'success', 'failed', 'waiting_approval')),
    message      TEXT,
    payload      JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  process_events           IS 'Audit trail for every Human and Robot step.';
COMMENT ON COLUMN process_events.path_type IS 'human = HR action required | robot = fully automated by n8n';
COMMENT ON COLUMN process_events.step_code IS 'e.g. I-04, I-05, I-07, II-01, II-04';
COMMENT ON COLUMN process_events.status    IS 'running | success | failed | waiting_approval';

CREATE INDEX idx_pe_process_id ON process_events(process_id);
CREATE INDEX idx_pe_step_code  ON process_events(step_code);
CREATE INDEX idx_pe_created_at ON process_events(created_at DESC);
CREATE INDEX idx_pe_path_type  ON process_events(path_type);

-- RLS: anon key (frontend) can read. service_role (n8n) bypasses RLS automatically.
ALTER TABLE process_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_process_events"
    ON process_events FOR SELECT TO anon
    USING (true);

CREATE POLICY "authenticated_read_process_events"
    ON process_events FOR SELECT TO authenticated
    USING (true);
