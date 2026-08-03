// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

// Local Imports
import { Button } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { LEVEL_COLORS, money, fmtDate } from "./data";

// ----------------------------------------------------------------------
// API response shape for mlm/admin/agent-commission/{id}/
// ----------------------------------------------------------------------
interface ApiAgentInfo {
  id: number;
  full_name: string;
  agent_type: string;
  status: string;
  is_active: boolean;
  total_sales: number;
  minimum_required?: number;
}

interface ApiSummary {
  total_earnings: number;
  total_mlm: number;
  total_pos_profit: number;
  total_society_profit: number;
  mlm_count: number;
}

interface ApiLevelBreakdown {
  level: number;
  total: number;
  count: number;
}

interface ApiTransaction {
  id: number;
  order: string;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
}

interface AgentCommissionApiResponse {
  agent: ApiAgentInfo;
  summary: ApiSummary;
  level_breakdown: ApiLevelBreakdown[];
  mlm_transactions: ApiTransaction[];
  pos_transactions: ApiTransaction[];
  society_transactions: ApiTransaction[];
}

// ----------------------------------------------------------------------

interface AgentCommissionModalProps {
  isOpen: boolean;
  close: () => void;
  agentId: number | null;
  agentName: string;
}

// ── Stat mini-card ────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-750">
      <p className="text-xs text-gray-500 dark:text-dark-300">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-dark-50">{value}</p>
    </div>
  );
}

// ── Level row ─────────────────────────────────────────────────────────────────
function LevelRow({ item }: { item: ApiLevelBreakdown }) {
  const color = LEVEL_COLORS[(item.level - 1) % LEVEL_COLORS.length];
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 dark:border-dark-600 dark:bg-dark-750">
      <span
        className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        Level {item.level}
      </span>
      <span className="text-sm font-semibold text-gray-800 dark:text-dark-100">
        {money(item.total)}{" "}
        <span className="font-normal text-gray-400 dark:text-dark-300">
          ({item.count} txns)
        </span>
      </span>
    </div>
  );
}

// ── Transaction table ─────────────────────────────────────────────────────────
function TxTable({ rows }: { rows: ApiTransaction[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const lower = q.toLowerCase();
    return rows.filter((r) => r.order.toLowerCase().includes(lower));
  }, [rows, q]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order..."
          className="h-9 w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-500">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-dark-700">
            <tr>
              {["#", "ORDER", "LEVEL", "TYPE", "AMOUNT", "DATE"].map((h) => (
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
                <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-dark-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => {
                const levelColor =
                  tx.level > 0
                    ? LEVEL_COLORS[(tx.level - 1) % LEVEL_COLORS.length]
                    : "#6b7280";

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
                    <td className="px-4 py-3 font-medium text-primary-600 dark:text-primary-400">
                      {tx.order}
                    </td>
                    <td className="px-4 py-3">
                      {tx.level > 0 ? (
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold text-white"
                          style={{ backgroundColor: levelColor }}
                        >
                          L{tx.level}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${typeBg}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-success">
                      {money(tx.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-dark-300">
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

// ── Modal ─────────────────────────────────────────────────────────────────────
export function AgentCommissionModal({
  isOpen,
  close,
  agentId,
  agentName,
}: AgentCommissionModalProps) {
  const [data, setData] = useState<AgentCommissionApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState<"mlm" | "pos" | "society">("mlm");

  const fetchDetail = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setData(null);
    try {
      const res = (await Get(`mlm/admin/agent-commission/${agentId}/`, {}, false)) as any;
      const body: AgentCommissionApiResponse = res?.data ?? res;
      setData(body);
    } catch {
      toasterrormsg("Failed to load commission detail.");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (isOpen && agentId) {
      setSubTab("mlm");
      fetchDetail();
    }
  }, [isOpen, agentId, fetchDetail]);

  // ── Derived values from the actual API shape ──
  const summary = data?.summary;
  const agent   = data?.agent;
  const levels  = data?.level_breakdown ?? [];
  const mlmTxns = data?.mlm_transactions ?? [];
  const posTxns = data?.pos_transactions ?? [];
  const socTxns = data?.society_transactions ?? [];

  const posSociety = (summary?.total_pos_profit ?? 0) + (summary?.total_society_profit ?? 0);

  const subTabs = [
    { key: "mlm" as const,     label: "MLM Commission", count: mlmTxns.length },
    { key: "pos" as const,     label: "POS Profit",     count: posTxns.length },
    { key: "society" as const, label: "Society Profit", count: socTxns.length },
  ];

  const activeTxns =
    subTab === "mlm" ? mlmTxns : subTab === "pos" ? posTxns : socTxns;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-120" onClose={close}>
        {/* Backdrop */}
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {agentName} — Commission Detail
                </h3>
                <Button onClick={close} variant="flat" isIcon className="size-8 rounded-full">
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              {/* Body */}
              <div className="max-h-[80vh] space-y-5 overflow-y-auto px-5 py-5">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-dark-600"
                      />
                    ))}
                  </div>
                ) : !data ? null : (
                  <>
                    {/* ── Summary stat cards ── */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <StatCard
                        label="Total Earnings"
                        value={money(summary?.total_earnings ?? 0)}
                      />
                      <StatCard
                        label="MLM Commission"
                        value={money(summary?.total_mlm ?? 0)}
                      />
                      <StatCard
                        label="POS / Society"
                        value={money(posSociety)}
                      />
                      <StatCard
                        label="Total Sales"
                        value={money(agent?.total_sales ?? 0)}
                      />
                    </div>

                    {/* ── Level breakdown ── */}
                    {levels.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-dark-100">
                          MLM Level Breakdown
                        </h4>
                        <div className="space-y-2">
                          {levels.map((lvl) => (
                            <LevelRow key={lvl.level} item={lvl} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Sub-tabs ── */}
                    <div>
                      <div className="flex gap-1 border-b border-gray-200 dark:border-dark-500">
                        {subTabs.map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setSubTab(t.key)}
                            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                              subTab === t.key
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-300"
                            }`}
                          >
                            {t.label}
                            {t.count > 0 && (
                              <span
                                className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-xs font-bold ${
                                  subTab === t.key
                                    ? "bg-primary text-white"
                                    : "bg-gray-200 text-gray-600 dark:bg-dark-600 dark:text-dark-200"
                                }`}
                              >
                                {t.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="pt-4">
                        <TxTable rows={activeTxns} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button color="primary" onClick={close}>
                  Close
                </Button>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
