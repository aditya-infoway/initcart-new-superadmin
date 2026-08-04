// src/pages/agent-hierarchy/StatCard.tsx
import { ThemeColor, AVATAR_BG_CLASS, useCountUp } from "./helpers";

export function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  color: ThemeColor;
  delay?: number;
}) {
  const animated = useCountUp(value);
  return (
    <div
      className="dark:border-dark-500 dark:bg-dark-700 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
      style={{ animation: `agentHierarchyFadeIn 0.5s ease-out ${delay}ms both` }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${AVATAR_BG_CLASS[color]}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="dark:text-dark-300 text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {prefix}
            {animated.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}