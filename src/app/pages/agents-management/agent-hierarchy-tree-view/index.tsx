// Import Dependencies
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useCallback, useEffect, useState } from "react";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";

// ----------------------------------------------------------------------

interface ByType {
  type: string;
  label: string;
  count: number;
}

interface DashboardStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_sales: number;
  total_users: number;
  top_level_agents: number;
  by_type: ByType[];
}

// ---- Colour palette ----
const STAT_CARDS = [
  {
    key: "total_agents" as const,
    label: "Total Agents",
    Icon: UsersIcon,
    gradient: "from-blue-500 to-indigo-600",
    ring: "bg-white/20",
  },
  {
    key: "active_agents" as const,
    label: "Active Agents",
    Icon: CheckCircleIcon,
    gradient: "from-emerald-400 to-teal-500",
    ring: "bg-white/20",
  },
  {
    key: "inactive_agents" as const,
    label: "Inactive Agents",
    Icon: XCircleIcon,
    gradient: "from-rose-400 to-pink-600",
    ring: "bg-white/20",
  },
  {
    key: "total_sales" as const,
    label: "Total Sales",
    Icon: CurrencyRupeeIcon,
    gradient: "from-amber-400 to-orange-500",
    ring: "bg-white/20",
    isCurrency: true,
  },
  {
    key: "total_users" as const,
    label: "Total Users",
    Icon: UserGroupIcon,
    gradient: "from-purple-500 to-violet-600",
    ring: "bg-white/20",
  },
  {
    key: "top_level_agents" as const,
    label: "Top-Level Agents",
    Icon: StarIcon,
    gradient: "from-cyan-400 to-sky-500",
    ring: "bg-white/20",
  },
] as const;

// Donut colours to match the screenshot
const STATUS_COLORS = ["#4f46e5", "#d1d5db"]; // active=indigo, inactive=gray
const TYPE_COLORS   = ["#4f46e5", "#8b5cf6", "#06b6d4", "#a78bfa"];

function formatValue(val: number, isCurrency?: boolean) {
  if (isCurrency) {
    if (val >= 1_00_000)
      return `₹${(val / 1_00_000).toFixed(2)}L`;
    if (val >= 1_000)
      return `₹${(val / 1_000).toFixed(1)}k`;
    return `₹${val.toFixed(0)}`;
  }
  return String(val);
}

// ---- Donut chart config factory ----
function donutOptions(
  labels: string[],
  colors: string[],
  centerLabel: string,
  centerValue: string | number,
): ApexOptions {
  return {
    chart: {
      type: "donut",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      animations: { enabled: true, speed: 600 },
    },
    colors,
    labels,
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 3, colors: ["transparent"] },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              color: "#6b7280",
              offsetY: 22,
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              offsetY: -16,
              formatter: () => String(centerValue),
            },
            total: {
              show: true,
              label: centerLabel,
              fontSize: "12px",
              color: "#6b7280",
              formatter: () => String(centerValue),
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      fillSeriesColor: false,
      y: { formatter: (val) => String(val) },
    },
    states: {
      hover: { filter: { type: "darken" } },
    },
  };
}

// ---- Loading skeleton ----
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-dark-600 ${className ?? ""}`} />
  );
}

// ---- Main page ----
export default function AgentHierarchyTreeViewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await Get("mlm/admin/dashboard-stats/", {}, false)) as any;
      const body: DashboardStats = res?.data ?? res;
      setStats(body);
    } catch (e) {
      console.error(e);
      toasterrormsg("Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ---- Derived chart data ----
  const statusSeries = stats
    ? [stats.active_agents, stats.inactive_agents]
    : [0, 0];

  const typeSeries  = stats?.by_type?.map((t) => t.count) ?? [];
  const typeLabels  = stats?.by_type?.map((t) => t.label) ?? [];
  const typeColors  = TYPE_COLORS.slice(0, typeSeries.length);

  return (
    <Page title="Agent Dashboard">
      <div className="transition-content w-full space-y-6 pb-8 px-(--margin-x) pt-5">

        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
            MLM Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-dark-50">
            Agent Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
            Live overview of your agent network performance.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {STAT_CARDS.map((card) => {
            const raw = stats ? (stats[card.key] as number) : null;
            const display = raw !== null ? formatValue(raw, (card as any).isCurrency) : null;
            return (
              <Card
                key={card.key}
                skin="none"
                className={`group relative overflow-hidden bg-linear-to-br ${card.gradient} p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                {/* decorative circle */}
                <div className="pointer-events-none absolute -right-5 -top-5 z-0 size-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/75">{card.label}</p>
                    {loading || display === null ? (
                      <Skeleton className="mt-2 h-8 w-20" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold tracking-tight">{display}</p>
                    )}
                  </div>
                  <span className="grid size-11 place-items-center rounded-xl border border-white/20 bg-white/15 shadow-sm backdrop-blur-sm">
                    <card.Icon className="size-5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </section>

        {/* ── Donut charts ── */}
        <section className="grid gap-5 lg:grid-cols-2">

          {/* Agent Status Breakdown */}
          <Card className="p-5 sm:p-6" skin="shadow">
            <div className="mb-1 flex items-center gap-2">
              <UsersIcon className="size-5 text-primary-500" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
                Agent Status Breakdown
              </h2>
            </div>
            <p className="mb-5 text-xs text-gray-500 dark:text-dark-300">
              Active vs inactive agents at a glance
            </p>

            {loading ? (
              <div className="flex items-center gap-8 py-4">
                <Skeleton className="mx-auto size-48 rounded-full" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
                <Chart
                  type="donut"
                  width={200}
                  height={200}
                  series={statusSeries}
                  options={donutOptions(
                    ["Active", "Inactive"],
                    STATUS_COLORS,
                    "TOTAL",
                    stats?.total_agents ?? 0,
                  )}
                />
                {/* Legend */}
                <div className="space-y-3">
                  {[
                    { label: "Active",   value: stats?.active_agents ?? 0,   color: STATUS_COLORS[0] },
                    { label: "Inactive", value: stats?.inactive_agents ?? 0, color: STATUS_COLORS[1] },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="w-20 text-sm text-gray-600 dark:text-dark-200">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Agent Type Distribution */}
          <Card className="p-5 sm:p-6" skin="shadow">
            <div className="mb-1 flex items-center gap-2">
              <StarIcon className="size-5 text-primary-500" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-dark-100">
                Agent Type Distribution
              </h2>
            </div>
            <p className="mb-5 text-xs text-gray-500 dark:text-dark-300">
              Breakdown by agent type
            </p>

            {loading ? (
              <div className="flex items-center gap-8 py-4">
                <Skeleton className="mx-auto size-48 rounded-full" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
                <Chart
                  type="donut"
                  width={200}
                  height={200}
                  series={typeSeries}
                  options={donutOptions(
                    typeLabels,
                    typeColors,
                    "TYPES",
                    stats?.by_type?.length ?? 0,
                  )}
                />
                {/* Legend */}
                <div className="space-y-3">
                  {(stats?.by_type ?? []).map((item, i) => (
                    <div key={item.type} className="flex items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: typeColors[i] ?? "#9ca3af" }}
                      />
                      <span className="w-28 truncate text-sm text-gray-600 dark:text-dark-200">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* ── Summary breakdown row ── */}
        {!loading && stats && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(stats.by_type ?? []).map((item, i) => {
              const pct = stats.total_agents > 0
                ? ((item.count / stats.total_agents) * 100).toFixed(1)
                : "0.0";
              const color = typeColors[i] ?? "#9ca3af";
              return (
                <Card key={item.type} className="p-4" skin="shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-dark-200">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 dark:text-dark-300">
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-dark-50">
                    {item.count}
                  </p>
                  {/* mini progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-600">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </Card>
              );
            })}
          </section>
        )}

      </div>
    </Page>
  );
}
