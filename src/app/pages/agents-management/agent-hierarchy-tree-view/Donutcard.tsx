// src/pages/agent-hierarchy/DonutChart.tsx
import { useEffect, useState } from "react";

export interface DonutSlice {
  label: string;
  value: number;
  colorVar: string; // e.g. CHART_COLOR_VAR.primary
}

export function DonutChart({
  data,
  size = 180,
  strokeWidth = 22,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-gray-100 dark:stroke-dark-600"
          strokeWidth={strokeWidth}
        />
        {total > 0 &&
          data.map((d, i) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const offset = circumference - (animated ? dash : 0);
            const rotation = (cumulative / total) * 360;
            cumulative += d.value;
            return (
              <circle
                key={d.label + i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={d.colorVar}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${center}px ${center}px`,
                  transition: `stroke-dashoffset 1s ease-out ${i * 120}ms`,
                }}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {centerValue ?? total}
        </span>
        {centerLabel && (
          <span className="dark:text-dark-300 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}