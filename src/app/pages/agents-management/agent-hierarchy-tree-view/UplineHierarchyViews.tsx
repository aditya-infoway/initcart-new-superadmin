// src/pages/agent-hierarchy/UplineHierarchyViews.tsx
import { useState } from "react";
import { ArrowUp, ChevronDown, DollarSign, Filter, MinusCircle, PlusCircle, Search, Users } from "lucide-react";

// Local Imports
import { Badge } from "@/components/ui";
import { DisplayNode, UplineTreeResponse } from "./types";
import { AVATAR_SOLID_CLASS, buildParentMap, getAgentTypeMeta } from "./helpers";

// ────────────────────────────────────────────────────────────
// Tree view
// ────────────────────────────────────────────────────────────

export function UplineTreeNode({ node, isRoot = false }: { node: DisplayNode; isRoot?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelf = !!node.isSelf;
  const meta = getAgentTypeMeta(node.agent?.agent_type);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`relative w-72 rounded-2xl border-2 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
            ${
              isSelf
                ? "border-primary/40 from-primary/5 dark:from-primary/10 bg-gradient-to-br to-transparent"
                : isRoot
                ? "border-secondary/40 from-secondary/5 dark:from-secondary/10 bg-gradient-to-br to-transparent"
                : node.isDirectPath
                ? "border-info/40 dark:bg-dark-700 bg-white hover:border-info"
                : node.agent?.is_active
                ? "border-success/30 dark:bg-dark-700 bg-white hover:border-success"
                : "dark:border-dark-500 dark:bg-dark-800/60 border-gray-200 bg-gray-50/80"
            }`}
        >
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm ${
                  isSelf ? AVATAR_SOLID_CLASS.primary : AVATAR_SOLID_CLASS[meta.color]
                }`}
              >
                {node.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="flex items-center gap-1 truncate text-sm font-bold leading-tight text-gray-900 dark:text-white">
                  {node.full_name}
                  {isSelf && (
                    <Badge color="primary" variant="soft">
                      Selected agent
                    </Badge>
                  )}
                </h3>
                <p className="dark:text-dark-300 truncate text-xs text-gray-500">
                  {node.email || node.phone || node.username}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`h-1 ${
              isSelf ? "bg-primary" : node.agent?.is_active ? "bg-success" : "bg-gray-300 dark:bg-dark-500"
            }`}
          />

          <div className="space-y-1.5 p-3 pt-2">
            {node.agent ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="dark:text-dark-300 text-xs text-gray-500">Agent Type</span>
                  <Badge color={meta.color} variant="soft">
                    {meta.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="dark:text-dark-300 text-xs text-gray-500">Total Sales</span>
                  <span className="text-success text-xs font-bold">
                    ₹{node.agent.total_sales.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="dark:text-dark-300 text-xs text-gray-500">Status</span>
                  <Badge color={node.agent.is_active ? "success" : "neutral"} variant="soft">
                    {node.agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {node.agent.referral_code && (
                  <div className="flex items-center justify-between">
                    <span className="dark:text-dark-300 text-xs text-gray-500">Referral Code</span>
                    <span className="text-secondary bg-secondary/10 rounded px-2 py-0.5 font-mono text-xs font-bold">
                      {node.agent.referral_code}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-2 text-center">
                <span className="dark:text-dark-400 text-xs italic text-gray-400">Not an agent yet</span>
              </div>
            )}
          </div>

          <div className="px-3 pb-3 pt-1">
            <div className="dark:border-dark-500 flex items-center justify-between border-t border-gray-200 pt-2">
              <div className="flex items-center gap-1.5">
                <Users className="dark:text-dark-300 size-3.5 text-gray-500" />
                <span className="dark:text-dark-200 text-xs text-gray-600">
                  <span className="font-bold">{node.children.length}</span> {isSelf ? "co-referrals" : "members"}
                </span>
              </div>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="dark:bg-dark-600 dark:hover:bg-dark-500 flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 transition-colors hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <>
                      <MinusCircle className="text-primary size-3.5" />
                      <span className="text-primary text-xs font-medium">Hide</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="text-primary size-3.5" />
                      <span className="text-primary text-xs font-medium">Show</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="dark:text-dark-400 text-xs italic text-gray-400">
                  {isSelf ? "Top of chain" : "No members"}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isRoot && (
          <div
            className={`dark:border-dark-700 absolute -left-1.5 -top-1.5 size-3.5 rounded-full border-2 border-white shadow ${
              isSelf ? "bg-primary animate-pulse" : node.agent?.is_active ? "bg-success animate-pulse" : "bg-gray-400 dark:bg-dark-400"
            }`}
          />
        )}
        {!isRoot && !isSelf && node.isDirectPath && (
          <div className="bg-info dark:border-dark-700 absolute -right-1.5 -top-1.5 size-3.5 rounded-full border-2 border-white shadow" />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="from-primary/60 to-primary/30 h-8 w-0.5 bg-gradient-to-b" />
          <div className="relative">
            {node.children.length > 1 && (
              <div
                className="from-primary/30 via-primary/50 to-primary/30 absolute top-0 h-0.5 bg-gradient-to-r"
                style={{
                  left: `${100 / (node.children.length * 2)}%`,
                  right: `${100 / (node.children.length * 2)}%`,
                }}
              />
            )}
            <div className="flex justify-center gap-6 pt-8">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="from-primary/30 to-primary/50 -mt-8 h-8 w-0.5 bg-gradient-to-b" />
                  <UplineTreeNode node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// List view
// ────────────────────────────────────────────────────────────

export function UplineListView({ data, displayRoot }: { data: UplineTreeResponse; displayRoot: DisplayNode }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([displayRoot.id]));
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const parentMap = buildParentMap(displayRoot);

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      const collapse = (nodeId: number) => {
        next.delete(nodeId);
        parentMap.forEach((pId, cId) => {
          if (pId === nodeId) collapse(cId);
        });
      };
      collapse(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const shouldShowNode = (node: DisplayNode): boolean => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matches =
        node.full_name?.toLowerCase().includes(q) ||
        node.username?.toLowerCase().includes(q) ||
        node.email?.toLowerCase().includes(q) ||
        node.agent?.referral_code?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filterStatus === "active" && !node.agent?.is_active) return false;
    if (filterStatus === "inactive" && node.agent?.is_active) return false;
    return true;
  };

  const renderNode = (node: DisplayNode, depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const isVisible = shouldShowNode(node);

    if (!isVisible && !hasChildren) return rows;

    const meta = getAgentTypeMeta(node.agent?.agent_type);

    if (isVisible) {
      rows.push(
        <tr
          key={node.id}
          className={`dark:hover:bg-dark-600 transition-colors hover:bg-gray-50
            ${node.isSelf ? "bg-primary/5 dark:bg-primary/10" : ""}
            ${node.isDirectPath && !node.isSelf ? "bg-info/5 dark:bg-info/10" : ""}`}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleRow(node.id)}
                  className="dark:hover:bg-dark-500 rounded-lg p-1 transition-transform hover:scale-110 hover:bg-gray-200"
                >
                  <ChevronDown
                    className={`dark:text-dark-200 size-4 text-gray-600 transition-transform duration-200 ${
                      isExpanded ? "" : "-rotate-90"
                    }`}
                  />
                </button>
              ) : (
                <div className="w-6" />
              )}
              <span style={{ marginLeft: `${depth * 20}px` }}>
                <span
                  className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                    node.isSelf ? AVATAR_SOLID_CLASS.primary : AVATAR_SOLID_CLASS.secondary
                  }`}
                >
                  {node.isSelf ? "S" : ""}
                </span>
              </span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                    node.isSelf ? AVATAR_SOLID_CLASS.primary : AVATAR_SOLID_CLASS[meta.color]
                  }`}
                >
                  {node.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                {!node.isSelf && (
                  <div
                    className={`dark:border-dark-700 absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white ${
                      node.agent?.is_active ? "bg-success" : "bg-gray-400 dark:bg-dark-400"
                    }`}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                    {node.full_name}
                  </p>
                  {node.isSelf && (
                    <Badge color="primary" variant="soft">
                      Selected agent
                    </Badge>
                  )}
                  {node.isDirectPath && !node.isSelf && (
                    <Badge color="info" variant="soft">
                      Direct Upline
                    </Badge>
                  )}
                </div>
                <div className="dark:text-dark-300 flex items-center gap-2 text-xs text-gray-500">
                  <span>{node.phone || node.username}</span>
                  {node.email && (
                    <>
                      <span>•</span>
                      <span className="truncate">{node.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            {node.agent ? (
              <Badge color={meta.color} variant="soft">
                {meta.label}
              </Badge>
            ) : (
              <span className="dark:text-dark-400 text-xs italic text-gray-400">Not an agent</span>
            )}
          </td>
          <td className="px-4 py-3 text-right">
            <span className="text-success text-sm font-bold">
              ₹{node.agent?.total_sales?.toLocaleString("en-IN") || "0"}
            </span>
          </td>
          <td className="px-4 py-3 text-center">
            {node.isSelf ? (
              <Badge color="primary" variant="soft">
                Selected
              </Badge>
            ) : (
              <Badge color={node.agent?.is_active ? "success" : "neutral"} variant="soft">
                {node.agent?.is_active ? "Active" : "Inactive"}
              </Badge>
            )}
          </td>
          <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-100">
              <Users className="dark:text-dark-300 size-3.5 text-gray-500" />
              {node.children.length}
            </span>
          </td>
          <td className="px-4 py-3">
            {node.agent?.referral_code ? (
              <span className="text-secondary bg-secondary/10 rounded border border-transparent px-2.5 py-1 font-mono text-xs font-bold">
                {node.agent.referral_code}
              </span>
            ) : (
              <span className="dark:text-dark-400 text-xs text-gray-400">-</span>
            )}
          </td>
        </tr>,
      );
    }

    if (isExpanded && hasChildren) {
      node.children.forEach((child) => rows.push(...renderNode(child, depth + 1)));
    }
    return rows;
  };

  return (
    <div>
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="dark:text-dark-300 absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, email or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary/50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="dark:text-dark-300 size-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="focus:ring-primary/50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dark:text-dark-200 mb-4 flex items-center gap-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          <span className="font-semibold text-gray-900 dark:text-white">{data.upline_count}</span> Total Upline
        </span>
        <span className="size-1 rounded-full bg-gray-300 dark:bg-dark-500" />
        <span className="flex items-center gap-1.5">
          <ArrowUp className="size-4" />
          <span className="font-semibold text-gray-900 dark:text-white">{data.max_levels}</span> Levels
        </span>
        <span className="size-1 rounded-full bg-gray-300 dark:bg-dark-500" />
        <span className="flex items-center gap-1.5">
          <DollarSign className="size-4" />
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{data.root.agent?.total_sales?.toLocaleString("en-IN") || "0"}
          </span>{" "}
          Selected Agent's Sales
        </span>
      </div>

      <div className="dark:border-dark-500 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="dark:border-dark-500 dark:bg-dark-800 border-b-2 border-gray-200 bg-gray-50">
              <th className="dark:text-dark-300 w-12 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Level
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Member Details
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Agent Type
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Total Sales
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Members
              </th>
              <th className="dark:text-dark-300 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Referral Code
              </th>
            </tr>
          </thead>
          <tbody className="dark:divide-dark-600 divide-y divide-gray-100">{renderNode(displayRoot)}</tbody>
        </table>
      </div>

      {data.upline_count === 0 && (
        <div className="py-12 text-center">
          <div className="dark:bg-dark-600 mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gray-100">
            <ArrowUp className="dark:text-dark-300 size-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">No Upline Found</h3>
          <p className="dark:text-dark-300 text-sm text-gray-500">
            This agent is at the top of the chain — no referrer linked.
          </p>
        </div>
      )}
    </div>
  );
}