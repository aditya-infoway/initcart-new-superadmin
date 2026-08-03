// Import Dependencies
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card, Button, Badge } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import {
  MlmOverviewData,
  AgentSummaryRow,
  Transaction,
  money,
  fmtDate,
  LEVEL_COLORS,
} from "./data";
import { AgentCommissionModal } from "./AgentCommissionModal";

// ----------------------------------------------------------------------

type TabKey = "overview" | "agents" | "pos" | "society";

// ── tiny helpers ────────────────────────────────────────────────────────────

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 dark:bg-dark-600 ${className ?? ""}`}
    />
  );
}

// ── Stat card (top row) ──────────────────────────────────────────────────────
interface TopCardProps {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  loading: boolean;
}
function TopCard({ label, value, Icon, gradient, loading }: TopCardProps) {
  return (
    <Card
      skin="none"
      className={`group relative overflow-hidden bg-linear-to-br ${gradient} p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 size-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</p>
          {loading ? (
            <Skel className="mt-2 h-7 w-24 bg-white/20" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          )}
        </div>
        <span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm">
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}

// ── Transaction table (POS / Society tabs) ───────────────────────────────────
function TxTable({ rows }: { rows: Transaction[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const l = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.order.toLowerCase().includes(l) ||
        r.agent_name.toLowerCase().includes(l),
    );
  }, [rows, q]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order or agent..."
          className="h-9 w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-500">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-dark-700">
            <tr>
              {["#", "AGENT", "ORDER", "TYPE", "AMOUNT", "DATE"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold text-gray-600 dark:text-dark-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No transactions.
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => {
                const typeLabel =
                  tx.type === "pos_profit"
                    ? "POS Profit"
                    : tx.type === "service_profit"
                    ? "Society Profit"
                    : "MLM Commission";
                const typeBg =
                  tx.type === "pos_profit"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : tx.type === "service_profit"
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
                return (
                  <tr
                    key={tx.id}
                    className="border-t border-gray-100 bg-white transition-colors hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700"
                  >
                    <td className="px-4 py-3 font-medium text-primary-600 dark:text-primary-400">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-dark-100">
                        {tx.agent_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-400">
                        {tx.username}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary-600 dark:text-primary-400">
                      {tx.order}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${typeBg}`}
                      >
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-success">
                      {money(tx.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-dark-300">
                      {fmtDate(tx.date)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Agents tab table ─────────────────────────────────────────────────────────
function AgentsTable({
  rows,
  onView,
}: {
  rows: AgentSummaryRow[];
  onView: (row: AgentSummaryRow) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const l = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.agent_name.toLowerCase().includes(l) ||
        r.username.toLowerCase().includes(l),
    );
  }, [rows, q]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search agents..."
          className="h-9 w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-500">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-dark-700">
            <tr>
              {[
                "AGENT",
                "TYPE",
                "MLM COMMISSION",
                "POS/SOCIETY",
                "TOTAL EARNINGS",
                "TXNS",
                "ACTION",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold text-gray-600 dark:text-dark-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No agents.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const typeColor =
                  row.agent_type === "pos"
                    ? "primary"
                    : row.agent_type === "society"
                    ? "success"
                    : row.agent_type === "normal"
                    ? "info"
                    : "neutral";
                const posSociety = (row.pos_profit ?? 0) + (row.society_profit ?? 0);
                return (
                  <tr
                    key={row.agent_id ?? row.username}
                    className="border-t border-gray-100 bg-white transition-colors hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-dark-100">
                        {row.agent_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-400">
                        @{row.username}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={typeColor as any} variant="soft">
                        {row.agent_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">
                      {money(row.upline)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400">
                      {money(posSociety)}
                    </td>
                    <td className="px-4 py-3 font-bold text-success">
                      {money(row.total)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-dark-200">
                      {row.tx_count}
                    </td>
                    <td className="px-4 py-3">
                      {row.agent_id != null ? (
                        <Button
                          color="primary"
                          variant="outlined"
                          className="gap-1.5 px-2 py-1 text-xs"
                          onClick={() => onView(row)}
                        >
                          View
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data }: { data: MlmOverviewData }) {
  const { level_breakdown } = data;
  const maxTotal = Math.max(...level_breakdown.map((l) => l.total), 1);

  return (
    <div className="space-y-5">
      {/* Level breakdown bars */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-500 dark:bg-dark-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-dark-100">
          MLM Level Breakdown
        </h3>
        <div className="space-y-3">
          {level_breakdown.map((lvl) => {
            const pct = (lvl.total / maxTotal) * 100;
            const color = LEVEL_COLORS[(lvl.level - 1) % LEVEL_COLORS.length];
            return (
              <div key={lvl.level}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      Level {lvl.level}
                    </span>
                    <span className="text-gray-500 dark:text-dark-300">
                      {lvl.count} transactions
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-dark-100">
                    {money(lvl.total)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-600">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CommissionReportsPage() {
  const [raw, setRaw] = useState<MlmOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Commission modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentSummaryRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await Get("mlm/admin/mlm-overview/", {}, false)) as any;
      setRaw(res?.data ?? res);
    } catch {
      toasterrormsg("Failed to load MLM overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = raw?.summary;
  const config = raw?.config;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "agents", label: "Agents", count: raw?.agents_summary?.length },
    { key: "pos", label: "POS Profit", count: raw?.pos_transactions?.length },
    {
      key: "society",
      label: "Society Profit",
      count: raw?.society_transactions?.length,
    },
  ];

  // Profit split bar segments
  const splitSegments = config
    ? [
        { label: `POS ${config.pos_percentage}%`, pct: config.pos_percentage, color: "bg-purple-500" },
        { label: `Society ${config.service_percentage}%`, pct: config.service_percentage, color: "bg-teal-500" },
        { label: `MLM ${config.mlm_percentage}%`, pct: config.mlm_percentage, color: "bg-indigo-500" },
        { label: `Company ${config.company_percentage}%`, pct: config.company_percentage, color: "bg-amber-500" },
      ]
    : [];

  return (
    <Page title="MLM Commission Report">
      <div className="transition-content w-full space-y-5 pb-8 px-(--margin-x) pt-5">

        {/* Page header + Refresh */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-dark-50">
              MLM Commission Overview
            </h1>
            <p className="mt-0.5 text-sm text-primary-500">
              All agents' earnings, company profit &amp; distribution
            </p>
          </div>
          <Button
            variant="outlined"
            className="h-9 gap-2 rounded-md px-3 text-sm"
            onClick={fetchData}
            disabled={loading}
          >
            <ArrowPathIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── Top 4 stat cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TopCard
            label="Total Platform Profit"
            value={loading ? "…" : money(summary?.total_platform_profit ?? 0)}
            Icon={BanknotesIcon}
            gradient="from-emerald-400 to-teal-600"
            loading={loading}
          />
          <TopCard
            label="Paid to Agents"
            value={loading ? "…" : money(summary?.total_paid_to_agents ?? 0)}
            Icon={UsersIcon}
            gradient="from-blue-500 to-indigo-600"
            loading={loading}
          />
          <TopCard
            label="MLM Commission Paid"
            value={loading ? "…" : money(summary?.total_upline_commission ?? 0)}
            Icon={ChartBarIcon}
            gradient="from-violet-500 to-purple-600"
            loading={loading}
          />
          <TopCard
            label="POS + Society Paid"
            value={
              loading
                ? "…"
                : money(
                    (summary?.total_pos_profit ?? 0) +
                      (summary?.total_society_profit ?? 0),
                  )
            }
            Icon={BuildingLibraryIcon}
            gradient="from-amber-400 to-orange-500"
            loading={loading}
          />
        </section>

        {/* ── Company Profit Breakdown ── */}
        <Card className="p-5" skin="shadow">
          <div className="mb-4 flex items-center gap-2">
            <BuildingLibraryIcon className="size-5 text-primary-500" />
            <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
              Company Profit Breakdown
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Skel key={n} className="h-20" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Configured share */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-750">
                  <p className="text-xs text-gray-500 dark:text-dark-300">
                    Configured Company Share ({config?.company_percentage ?? 0}%)
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-800 dark:text-dark-50">
                    {money(summary?.configured_company_profit ?? 0)}
                  </p>
                </div>

                {/* Undistributed */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Undistributed MLM (Chain Gaps)
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                    {money(summary?.undistributed_mlm ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-amber-500/70">
                    MLM pool unused when chain is short
                  </p>
                </div>

                {/* Total company profit */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    Total Company Profit
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary-700 dark:text-primary-300">
                    {money(summary?.total_company_profit ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-primary-500/70">
                    = Configured + Undistributed
                  </p>
                </div>
              </div>

              {/* Profit split bar */}
              {splitSegments.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-dark-300">
                    Profit Split Configuration
                  </p>
                  <div className="flex h-8 w-full overflow-hidden rounded-xl">
                    {splitSegments.map((seg) => (
                      <div
                        key={seg.label}
                        className={`${seg.color} flex items-center justify-center text-xs font-bold text-white`}
                        style={{ width: `${seg.pct}%` }}
                        title={seg.label}
                      >
                        {seg.pct >= 10 ? seg.label : ""}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {splitSegments.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-dark-200">
                        <span className={`size-2.5 rounded-full ${seg.color}`} />
                        {seg.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* ── Tabbed section ── */}
        <Card className="p-0" skin="shadow">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-200 px-5 dark:border-dark-500">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-100"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      activeTab === tab.key
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-600 dark:bg-dark-600 dark:text-dark-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <Skel key={n} className="h-12" />
                ))}
              </div>
            ) : !raw ? null : (
              <>
                {activeTab === "overview" && <OverviewTab data={raw} />}
                {activeTab === "agents" && (
                  <AgentsTable
                    rows={raw.agents_summary}
                    onView={(row) => {
                      setSelectedAgent(row);
                      setModalOpen(true);
                    }}
                  />
                )}
                {activeTab === "pos" && (
                  <TxTable rows={raw.pos_transactions} />
                )}
                {activeTab === "society" && (
                  <TxTable rows={raw.society_transactions} />
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Agent Commission Detail Modal */}
      <AgentCommissionModal
        isOpen={modalOpen}
        close={() => { setModalOpen(false); setSelectedAgent(null); }}
        agentId={selectedAgent?.agent_id ?? null}
        agentName={selectedAgent?.agent_name ?? ""}
      />
    </Page>
  );
}
