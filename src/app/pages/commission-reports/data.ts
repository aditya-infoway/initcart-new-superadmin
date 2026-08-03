// ── MLM Commission Overview – TypeScript types ──────────────────────────────

export interface MlmConfig {
  pos_percentage: number;
  service_percentage: number;
  mlm_percentage: number;
  company_percentage: number;
}

export interface MlmSummary {
  total_platform_profit: number;
  total_paid_to_agents: number;
  total_upline_commission: number;
  total_pos_profit: number;
  total_society_profit: number;
  configured_company_profit: number;
  undistributed_mlm: number;
  total_company_profit: number;
  total_agents_paid: number;
  total_transactions: number;
}

export interface LevelBreakdown {
  level: number;
  total: number;
  count: number;
}

export interface AgentSummaryRow {
  agent_id: number | null;
  agent_name: string;
  agent_type: string;
  username: string;
  upline: number;
  pos_profit: number;
  society_profit: number;
  total: number;
  tx_count: number;
}

export interface Transaction {
  id: number;
  agent_name: string;
  agent_type: string;
  username: string;
  order: string;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
}

export interface MlmOverviewData {
  config: MlmConfig;
  summary: MlmSummary;
  level_breakdown: LevelBreakdown[];
  agents_summary: AgentSummaryRow[];
  upline_transactions: Transaction[];
  pos_transactions: Transaction[];
  society_transactions: Transaction[];
}

// ── Agent Commission Detail (per-agent modal) ────────────────────────────────

export interface AgentCommissionLevel {
  level: number;
  total: number;
  count: number;
}

export interface AgentCommissionTx {
  id: number;
  order: string;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
  agent_name?: string;
}

export interface AgentCommissionDetail {
  agent_id: number;
  agent_name: string;
  agent_type: string;
  username: string;
  total_earnings: number;
  upline: number;
  pos_profit: number;
  society_profit: number;
  total_sales: number;
  tx_count: number;
  level_breakdown: AgentCommissionLevel[];
  transactions: AgentCommissionTx[];
  pos_transactions: AgentCommissionTx[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function money(val: number | null | undefined): string {
  const n = Number(val ?? 0);
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-IN", { month: "short" });
  const yr = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ampm = Number(hh) >= 12 ? "pm" : "am";
  const h12 = String(Number(hh) % 12 || 12).padStart(2, "0");
  return `${day} ${mon} ${yr}, ${h12}:${mm} ${ampm}`;
}

export const LEVEL_COLORS: string[] = [
  "#4f46e5", // L1 indigo
  "#7c3aed", // L2 violet
  "#a21caf", // L3 purple
  "#db2777", // L4 pink
  "#0891b2", // L5 cyan
  "#059669", // L6 emerald
];
