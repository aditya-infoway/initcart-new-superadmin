// src/pages/agent-hierarchy/SuperAdminAgentHierarchy.tsx
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUp,
  Award,
  DollarSign,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { Get } from "@/ApiHelper";

import {
  DashboardStats,
  DisplayNode,
  DownlineResponse,
  HierarchyMode,
  SearchResult,
  UplineTreeResponse,
  ViewMode,
} from "./types";
import { AVATAR_SOLID_CLASS, buildDisplayTree, getAgentTypeMeta } from "./helpers";
import { DashboardOverview } from "./DashboardOverview";
import { DownlineListView, DownlineTreeNode } from "./DownlineHierarchyViews";
import { UplineListView, UplineTreeNode } from "./UplineHierarchyViews";
import { StatCard } from "./StatsCard";

export default function SuperAdminAgentHierarchy() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>("downline");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [downlineData, setDownlineData] = useState<DownlineResponse | null>(null);
  const [uplineData, setUplineData] = useState<UplineTreeResponse | null>(null);
  const [displayRoot, setDisplayRoot] = useState<DisplayNode | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const response = (await Get("mlm/admin/dashboard-stats/", {}, false)) as any;
      const body = response?.data ?? response;
      setDashboardStats(body);
    } catch (err: any) {
      setStatsError(err?.response?.data?.detail || "Failed to load network overview.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      setSearching(true);
      setSearchError(null);
      setSearchResults(null);
      const response = (await Get("mlm/admin/agent-search/", { q }, false)) as any;
      const body = response?.data ?? response;
      const results: SearchResult[] = body?.results || [];
      if (results.length === 1) {
        selectAgent(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      setSearchError(err?.response?.data?.detail || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const selectAgent = async (user: SearchResult) => {
    setSelectedUser(user);
    setSearchResults(null);
    setHierarchyMode("downline");
    setViewMode("tree");
    await Promise.all([fetchDownline(user.id), fetchUpline(user.id)]);
  };

  const fetchDownline = async (userId: number) => {
    try {
      setLoadingData(true);
      setDataError(null);
      const response = (await Get("mlm/admin/hierarchy/downline/", { user_id: userId }, false)) as any;
      const body = response?.data ?? response;
      setDownlineData(body);
    } catch (err: any) {
      setDataError(err?.response?.data?.detail || "Failed to fetch downline hierarchy");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUpline = async (userId: number) => {
    try {
      const response = (await Get("mlm/admin/hierarchy/upline-tree/", { user_id: userId }, false)) as any;
      const body = response?.data ?? response;
      setUplineData(body);
      setDisplayRoot(buildDisplayTree(body));
    } catch (err) {
      console.error("Failed to fetch upline hierarchy", err);
    }
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setDownlineData(null);
    setUplineData(null);
    setDisplayRoot(null);
    setDataError(null);
    fetchDashboardStats();
  };

  const selectedMeta = getAgentTypeMeta(selectedUser?.agent?.agent_type);

  return (
    <Page title="Agent Network Lookup">
      <div className="transition-content w-full pb-5">
        {/* Top description row — matches AgentsManagementPage pattern: margin-x applied ONCE here */}
        <div className="px-(--margin-x) pb-2 pt-4">
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Search any agent to view their full upline and downline network.
          </p>
        </div>

        <div className="px-(--margin-x) space-y-6">
          {/* Header / search card */}
          <div className="dark:border-dark-500 dark:bg-dark-700 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Plain title — no background color, no gradient */}
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="dark:text-dark-200 size-6 text-gray-700" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    Agent Network Lookup
                  </h1>
                  <p className="dark:text-dark-300 mt-0.5 text-sm text-gray-500">
                    Search any agent to view their full upline and downline
                  </p>
                </div>
              </div>
            </div>

            <div className="dark:border-dark-500 dark:bg-dark-800 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative max-w-xl flex-1">
                  <Search className="dark:text-dark-300 absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runSearch();
                    }}
                    placeholder="Search agent by mobile number or email..."
                    className="focus:ring-primary/50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <Button
                  color="primary"
                  variant="filled"
                  onClick={runSearch}
                  disabled={searching || !query.trim()}
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
                {selectedUser && (
                  <Button color="neutral" variant="soft" onClick={clearSelection}>
                    <X className="size-4" />
                    Clear
                  </Button>
                )}
              </div>

              {searchError && <p className="text-error mt-2 text-sm">{searchError}</p>}

              {searchResults && (
                <div className="mt-4">
                  {searchResults.length === 0 ? (
                    <p className="dark:text-dark-300 text-sm text-gray-500">No agent found for "{query}".</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="dark:text-dark-300 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {searchResults.length} match{searchResults.length > 1 ? "es" : ""} found — pick one
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {searchResults.map((user) => {
                          const meta = getAgentTypeMeta(user.agent?.agent_type);
                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectAgent(user)}
                              className="hover:border-primary/50 dark:border-dark-500 dark:bg-dark-700 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:shadow-sm"
                            >
                              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${AVATAR_SOLID_CLASS[meta.color]}`}>
                                {(user.full_name || user.username).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                  {user.full_name || user.username}
                                </p>
                                <p className="dark:text-dark-300 truncate text-xs text-gray-500">
                                  {user.phone || user.email || user.username}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!selectedUser && !searchResults && (
            <DashboardOverview
              stats={dashboardStats}
              loading={loadingStats}
              error={statsError}
              onRetry={fetchDashboardStats}
            />
          )}

          {selectedUser && (
            <>
              <div className="dark:border-dark-500 dark:bg-dark-700 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${AVATAR_SOLID_CLASS[selectedMeta.color]}`}>
                  {(selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedUser.full_name || selectedUser.username}
                  </p>
                  <p className="dark:text-dark-300 text-xs text-gray-500">
                    {selectedUser.phone || selectedUser.email || selectedUser.username}
                  </p>
                </div>
                {selectedUser.agent?.referral_code && (
                  <span className="text-secondary bg-secondary/10 ml-auto rounded border px-2.5 py-1 font-mono text-xs font-bold">
                    {selectedUser.agent.referral_code}
                  </span>
                )}
              </div>

              {loadingData ? (
                <div className="dark:border-dark-500 dark:bg-dark-700 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 shadow-sm">
                  <div className="text-center">
                    <div className="border-primary/20 border-t-primary mx-auto size-14 animate-spin rounded-full border-4" />
                    <p className="mt-4 font-semibold text-gray-700 dark:text-dark-100">Loading network...</p>
                  </div>
                </div>
              ) : dataError ? (
                <div className="dark:border-dark-500 dark:bg-dark-700 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                  <Activity className="text-error mx-auto mb-4 size-10" />
                  <p className="mb-6 text-gray-600 dark:text-dark-200">{dataError}</p>
                  <Button color="primary" variant="filled" onClick={() => fetchDownline(selectedUser.id)}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={Users} label="Total Downline" value={downlineData?.total_downline ?? 0} color="primary" />
                    <StatCard icon={ArrowUp} label="Total Upline" value={uplineData?.upline_count ?? 0} color="warning" />
                    <StatCard
                      icon={Award}
                      label="Max Levels"
                      value={downlineData?.max_depth ?? uplineData?.max_levels ?? 0}
                      color="secondary"
                    />
                    <StatCard
                      icon={DollarSign}
                      label="Agent Sales"
                      value={Math.round(Number(downlineData?.root.agent?.total_sales ?? 0))}
                      prefix="₹"
                      color="success"
                    />
                  </div>

                  <div className="dark:border-dark-500 dark:bg-dark-700 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="dark:border-dark-500 dark:bg-dark-800/60 flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          color={hierarchyMode === "downline" ? "primary" : "neutral"}
                          variant={hierarchyMode === "downline" ? "filled" : "soft"}
                          onClick={() => setHierarchyMode("downline")}
                        >
                          <Users className="size-3.5" />
                          Downline
                        </Button>
                        <Button
                          color={hierarchyMode === "upline" ? "primary" : "neutral"}
                          variant={hierarchyMode === "upline" ? "filled" : "soft"}
                          onClick={() => setHierarchyMode("upline")}
                        >
                          <ArrowUp className="size-3.5" />
                          Upline
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {(["tree", "list"] as const).map((mode) => (
                          <Button
                            key={mode}
                            color={viewMode === mode ? "primary" : "neutral"}
                            variant={viewMode === mode ? "filled" : "soft"}
                            onClick={() => setViewMode(mode)}
                          >
                            {mode === "tree" ? "Tree View" : "List View"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      {hierarchyMode === "downline" &&
                        downlineData &&
                        (downlineData.total_downline > 0 ? (
                          viewMode === "tree" ? (
                            <div className="overflow-x-auto pb-6">
                              <div className="flex min-w-fit justify-center">
                                <DownlineTreeNode node={downlineData.root} isRoot />
                              </div>
                            </div>
                          ) : (
                            <DownlineListView data={downlineData} />
                          )
                        ) : (
                          <div className="py-12 text-center">
                            <Users className="dark:text-dark-400 mx-auto mb-4 size-12 text-gray-400" />
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">No Downline Members</h3>
                            <p className="dark:text-dark-300 text-gray-600">This agent hasn't built a network yet.</p>
                          </div>
                        ))}

                      {hierarchyMode === "upline" &&
                        uplineData &&
                        displayRoot &&
                        (uplineData.upline_count > 0 ? (
                          viewMode === "tree" ? (
                            <div className="overflow-x-auto overflow-y-hidden pb-6">
                              <div className="flex min-w-fit justify-center">
                                <UplineTreeNode node={displayRoot} isRoot />
                              </div>
                            </div>
                          ) : (
                            <UplineListView data={uplineData} displayRoot={displayRoot} />
                          )
                        ) : (
                          <div className="py-12 text-center">
                            <div className="dark:bg-dark-600 mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gray-100">
                              <ArrowUp className="dark:text-dark-300 size-12 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">No Upline Found</h3>
                            <p className="dark:text-dark-300 text-gray-600">
                              This agent is at the top of the chain — no referrer is linked to their account.
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Page>
  );
}