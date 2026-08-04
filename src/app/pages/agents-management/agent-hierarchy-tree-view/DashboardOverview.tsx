// src/pages/agent-hierarchy/DashboardOverview.tsx
import {
  Activity,
  Award,
  Crown,
  DollarSign,
  Network,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

// Local Imports
import { Button } from "@/components/ui";
import { DashboardStats } from "./types";
import { StatCard } from "./StatsCard";
import { DonutChart } from "./Donutcard";
import { CHART_COLOR_VAR, getAgentTypeMeta } from "./helpers";

// Same visual language as the Section wrapper in AgentViewModal.tsx
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="dark:border-dark-500 dark:bg-dark-800 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <h4 className="text-primary-600 dark:text-primary-400 mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" />
        {title}
      </h4>
      {children}
    </section>
  );
}

const TYPE_PALETTE = ["primary", "success", "info", "secondary", "warning", "error"] as const;

export function DashboardOverview({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="dark:border-dark-500 dark:bg-dark-700 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 shadow-sm">
        <div className="text-center">
          <div className="border-primary/20 border-t-primary mx-auto size-14 animate-spin rounded-full border-4" />
          <p className="mt-4 font-semibold text-gray-700 dark:text-dark-100">
            Loading network overview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark:border-dark-500 dark:bg-dark-700 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Activity className="text-error mx-auto mb-4 size-10" />
        <p className="mb-6 text-gray-600 dark:text-dark-200">{error}</p>
        <Button color="primary" variant="filled" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { label: "Active", value: stats.active_agents, colorVar: CHART_COLOR_VAR.primary },
    { label: "Inactive", value: stats.inactive_agents, colorVar: CHART_COLOR_VAR.neutral },
  ];

  const typeData = stats.by_type.map((t, i) => ({
    label: t.label,
    value: t.count,
    colorVar: CHART_COLOR_VAR[TYPE_PALETTE[i % TYPE_PALETTE.length]],
  }));

  return (
    <div>
      <style>{`
        @keyframes agentHierarchyFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Intro banner */}
      <div className="px-(--margin-x) pt-4">
        
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          <Network className="size-6" />
        </div>
        <div>
          <h2 className="text-base font-bold">Network Overview</h2>


        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Agents" value={stats.total_agents} color="primary" delay={0} />
        <StatCard icon={UserCheck} label="Active Agents" value={stats.active_agents} color="success" delay={80} />
        <StatCard icon={UserX} label="Inactive Agents" value={stats.inactive_agents} color="neutral" delay={160} />
        <StatCard icon={DollarSign} label="Network Sales" value={Math.round(stats.total_sales)} prefix="₹" color="success" delay={240} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Crown} label="Top-Level Agents" value={stats.top_level_agents} color="secondary" delay={320} />
        <StatCard icon={Award} label="Agent Types" value={stats.by_type.length} color="info" delay={400} />
        <StatCard icon={TrendingUp} label="Total Users" value={stats.total_users} color="primary" delay={480} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Agent Status Breakdown" icon={UserCheck}>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <DonutChart data={statusData} centerLabel="Total" centerValue={stats.total_agents} />
            <div className="space-y-3">
              {statusData.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: d.colorVar }} />
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-100">{d.label}</span>
                  <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Agent Type Distribution" icon={Award}>
          {typeData.length > 0 ? (
            <div className="flex flex-wrap items-center justify-around gap-6">
              <DonutChart data={typeData} centerLabel="Types" centerValue={typeData.length} />
              <div className="space-y-3">
                {typeData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: d.colorVar }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-100">{d.label}</span>
                    <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-dark-300">
              No agent type data yet.
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}

// re-export for convenience where only the type meta is needed
export { getAgentTypeMeta };