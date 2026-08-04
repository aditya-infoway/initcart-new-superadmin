// src/pages/agent-hierarchy/DownlineHierarchyViews.tsx
import { useState } from "react";
import { ChevronDown, Filter, MinusCircle, PlusCircle, Search, Users } from "lucide-react";

// Local Imports
import { Badge } from "@/components/ui";
import { DownlineResponse, DownlineTreeNodeData } from "./types";
import { AVATAR_SOLID_CLASS, buildParentMap, getAgentTypeMeta } from "./helpers";

// ────────────────────────────────────────────────────────────
// Tree view
// ────────────────────────────────────────────────────────────

export function DownlineTreeNode({ node, isRoot = false }: { node: DownlineTreeNodeData; isRoot?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const displayName = node.full_name || node.username;
  const meta = getAgentTypeMeta(node.agent?.agent_type);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`relative w-72 rounded-2xl border-2 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
            ${
              isRoot
                ? "border-primary/40 from-primary/5 dark:from-primary/10 bg-gradient-to-br to-transparent"
                : node.agent?.is_active
                ? "border-success/30 hover:border-success dark:bg-dark-700 bg-white"
                : "dark:border-dark-500 dark:bg-dark-800/60 border-gray-200 bg-gray-50/80"
            }`}
        >
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm ${AVATAR_SOLID_CLASS[meta.color]}`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold leading-tight text-gray-900 dark:text-white">{displayName}</h3>
                <p className="dark:text-dark-300 truncate text-xs text-gray-500">
                  {node.email || node.phone || node.username}
                </p>
              </div>
            </div>
            <Badge color={isRoot ? "primary" : "secondary"} variant="soft">
              L{node.depth}
            </Badge>
          </div>

          <div
            className={`h-1 ${
              node.agent?.is_active ? "bg-success" : isRoot ? "bg-primary" : "bg-gray-300 dark:bg-dark-500"
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
                  <span className="font-bold">{node.downline_count}</span> downline
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
                <span className="dark:text-dark-400 text-xs italic text-gray-400">No children</span>
              )}
            </div>
          </div>
        </div>

        {!isRoot && (
          <div
            className={`dark:border-dark-700 absolute -left-1.5 -top-1.5 size-3.5 rounded-full border-2 border-white shadow ${
              node.agent?.is_active ? "bg-success animate-pulse" : "bg-gray-400 dark:bg-dark-400"
            }`}
          />
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
                  <DownlineTreeNode node={child} />
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

export function DownlineListView({ data }: { data: DownlineResponse }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([data.root.id]));
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const parentMap = buildParentMap(data.root as any);

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

  const shouldShow = (node: DownlineTreeNodeData): boolean => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const name = (node.full_name || node.username).toLowerCase();
      const contact = (node.email || node.phone || node.username).toLowerCase();
      if (!name.includes(q) && !contact.includes(q) && !node.agent?.referral_code?.toLowerCase().includes(q))
        return false;
    }
    if (filterStatus === "active" && !node.agent?.is_active) return false;
    if (filterStatus === "inactive" && node.agent?.is_active) return false;
    return true;
  };

  const renderNode = (node: DownlineTreeNodeData, depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const visible = shouldShow(node);

    if (!visible && !hasChildren) return rows;

    const displayName = node.full_name || node.username;
    const contactInfo = node.email || node.phone || node.username;
    const meta = getAgentTypeMeta(node.agent?.agent_type);

    if (visible) {
      rows.push(
        <tr
          key={node.id}
          className={`dark:hover:bg-dark-600 transition-colors hover:bg-gray-50 ${
            depth === 0 ? "bg-primary/5 dark:bg-primary/10" : ""
          }`}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleRow(node.id)}
                  className="dark:hover:bg-dark-500 rounded-lg p-1 hover:bg-gray-200"
                >
                  <ChevronDown
                    className={`dark:text-dark-200 size-4 text-gray-600 transition-transform ${
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
                    depth === 0 ? AVATAR_SOLID_CLASS.primary : AVATAR_SOLID_CLASS.secondary
                  }`}
                >
                  {depth}
                </span>
              </span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${AVATAR_SOLID_CLASS[meta.color]}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {depth > 0 && (
                  <div
                    className={`dark:border-dark-700 absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white ${
                      node.agent?.is_active ? "bg-success" : "bg-gray-400 dark:bg-dark-400"
                    }`}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                  {depth === 0 && (
                    <Badge color="primary" variant="soft">
                      Selected agent
                    </Badge>
                  )}
                </div>
                <p className="dark:text-dark-300 truncate text-xs text-gray-500">{contactInfo}</p>
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
            {depth === 0 ? (
              <Badge color="primary" variant="soft">
                Root
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
              {node.downline_count}
            </span>
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
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="dark:text-dark-300 absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, contact or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-primary/50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="dark:text-dark-300 size-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="focus:ring-primary/50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="dark:text-dark-200 mb-4 flex items-center gap-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          <span className="font-semibold text-gray-900 dark:text-white">{data.total_downline}</span> Total Members
        </span>
        <span className="size-1 rounded-full bg-gray-300 dark:bg-dark-500" />
        <span>
          <span className="font-semibold text-gray-900 dark:text-white">{data.max_depth}</span> Levels Deep
        </span>
      </div>

      <div className="dark:border-dark-500 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="dark:border-dark-500 dark:bg-dark-800 border-b-2 border-gray-200 bg-gray-50">
              {["Level", "Member", "Type", "Sales", "Status", "Downline"].map((h) => (
                <th
                  key={h}
                  className="dark:text-dark-300 px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="dark:divide-dark-600 divide-y divide-gray-100">{renderNode(data.root)}</tbody>
        </table>
      </div>

      {data.total_downline === 0 && (
        <div className="py-12 text-center">
          <Users className="dark:text-dark-400 mx-auto mb-4 size-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">No Downline Members</h3>
          <p className="dark:text-dark-300 text-sm text-gray-500">This agent has not built a downline yet</p>
        </div>
      )}
    </div>
  );
}