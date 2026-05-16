export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  N8N_APPLY_WEBHOOK: import.meta.env.VITE_N8N_APPLY_WEBHOOK as string | undefined,
  N8N_DECISION_WEBHOOK: import.meta.env.VITE_N8N_DECISION_WEBHOOK as string | undefined,
};

export const hasSupabase = Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
export const hasApplyWebhook = Boolean(ENV.N8N_APPLY_WEBHOOK);
export const hasDecisionWebhook = Boolean(ENV.N8N_DECISION_WEBHOOK);
