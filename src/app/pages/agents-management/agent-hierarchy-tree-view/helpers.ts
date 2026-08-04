// src/pages/agent-hierarchy/helpers.ts
import { useEffect, useRef, useState } from "react";
import { DisplayNode, RawSibling, UplineTreeResponse } from "./types";

// ----------------------------------------------------------------------
// Agent-type -> theme color mapping.
// Uses the SAME color tokens as your existing Badge usage (columns.tsx
// TYPE_META / AgentViewModal status badges) instead of hardcoded gradients,
// so this page stays in sync with the rest of the theme automatically.
// ----------------------------------------------------------------------

export type ThemeColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export const AGENT_TYPE_META: Record<string, { color: ThemeColor; label: string }> = {
  normal: { color: "info", label: "Normal" },
  pos: { color: "primary", label: "POS" },
  society: { color: "success", label: "Society" },
  master: { color: "primary", label: "Master" },
  senior: { color: "secondary", label: "Senior" },
  junior: { color: "info", label: "Junior" },
};

export function getAgentTypeMeta(type?: string) {
  if (!type) return { color: "neutral" as ThemeColor, label: "—" };
  return AGENT_TYPE_META[type.toLowerCase()] ?? { color: "neutral" as ThemeColor, label: type };
}

// Avatar-ring background per color token — mirrors the `bg-primary/10 text-primary`
// pattern already used in AgentViewModal's DetailItem icon circle.
export const AVATAR_BG_CLASS: Record<ThemeColor, string> = {
  primary: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-light",
  secondary: "bg-secondary/10 text-secondary dark:bg-secondary/15 dark:text-secondary-light",
  info: "bg-info/10 text-info dark:bg-info/15 dark:text-info-light",
  success: "bg-success/10 text-success dark:bg-success/15 dark:text-success-light",
  warning: "bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning-light",
  error: "bg-error/10 text-error dark:bg-error/15 dark:text-error-light",
  neutral: "bg-gray-200 text-gray-600 dark:bg-dark-500 dark:text-dark-200",
};

// Solid avatar background (initial-letter avatar) per color token.
export const AVATAR_SOLID_CLASS: Record<ThemeColor, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  error: "bg-error text-white",
  neutral: "bg-gray-400 text-white dark:bg-dark-400",
};

// CSS custom properties driving the donut chart strokes — same tokens Tailux
// exposes for its color utilities (--color-primary etc). Adjust the fallback
// hex values here if your tailwind.config uses different ones.
export const CHART_COLOR_VAR: Record<ThemeColor, string> = {
  primary: "var(--color-primary, #2563eb)",
  secondary: "var(--color-secondary, #7c3aed)",
  info: "var(--color-info, #0891b2)",
  success: "var(--color-success, #0d9488)",
  warning: "var(--color-warning, #d97706)",
  error: "var(--color-error, #dc2626)",
  neutral: "var(--color-gray-300, #cbd5e1)",
};

// ----------------------------------------------------------------------
// Tree utilities (unchanged logic — pure data shaping)
// ----------------------------------------------------------------------

export function buildParentMap(
  node: { id: number; children: any[] },
  parentId: number | null = null,
): Map<number, number | null> {
  const map = new Map<number, number | null>();
  map.set(node.id, parentId);
  node.children.forEach((child: any) => {
    const childMap = buildParentMap(child, node.id);
    childMap.forEach((value, key) => map.set(key, value));
  });
  return map;
}

export function buildDisplayTree(data: UplineTreeResponse): DisplayNode {
  const { root, upline_tree } = data;

  if (upline_tree.length === 0) {
    return {
      id: root.id,
      full_name: root.full_name,
      username: root.username,
      email: root.email,
      phone: root.phone || "",
      depth: 0,
      agent: root.agent,
      children: [],
      isDirectPath: true,
      isSelf: true,
    };
  }

  const sibToLeaf = (sib: RawSibling, displayDepth: number): DisplayNode => ({
    id: sib.id,
    full_name: sib.full_name,
    username: sib.username,
    email: sib.email,
    phone: sib.phone || "",
    depth: displayDepth,
    agent: sib.id === root.id ? root.agent : sib.agent,
    children: [],
    isDirectPath: sib.is_direct_parent,
    isSelf: sib.id === root.id,
  });

  const buildNode = (levelIndex: number, displayDepth: number): DisplayNode => {
    const lvl = upline_tree[levelIndex];
    let children: DisplayNode[];

    if (levelIndex === 0) {
      children = lvl.siblings.map((sib) => sibToLeaf(sib, displayDepth + 1));
    } else {
      children = lvl.siblings.map((sib) => {
        if (sib.is_direct_parent) {
          return buildNode(levelIndex - 1, displayDepth + 1);
        }
        return sibToLeaf(sib, displayDepth + 1);
      });
    }

    return {
      id: lvl.id,
      full_name: lvl.full_name,
      username: lvl.username,
      email: lvl.email,
      phone: lvl.phone || "",
      depth: lvl.level,
      agent: lvl.agent,
      children,
      isDirectPath: true,
    };
  };

  return buildNode(upline_tree.length - 1, 1);
}

// Animated count-up used by StatCard.
export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}