// Import Dependencies
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

// Local Imports
import { Delete, Get, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/master/shared/MasterToolbar";
import { AgentDrawer } from "./AgentDrawer";
import { AgentViewModal } from "./AgentViewModal";
import { getColumns } from "./columns";
import {
  Agent,
  AGENT_STATUS_OPTIONS,
  AGENT_TYPE_OPTIONS,
  AgentStatus,
  AgentType,
  emptyAgent,
  mapApiToAgent,
} from "./data";

// ----------------------------------------------------------------------

const LIST_API = "mlm/agents";
const DELETE_API = "mlm/agents";

export default function AgentsManagementPage() {
  const [data, setData] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);

  // View modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Agent | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<AgentType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<AgentStatus | "all">("all");
  const [filterCity, setFilterCity] = useState<string>("all");

  // ---- Data fetching ----

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await Get(`${LIST_API}/`, {}, false)) as any;
      const body = response?.data ?? response;
      const rows: any[] = Array.isArray(body?.results)
        ? body.results
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.data?.results)
        ? body.data.results
        : Array.isArray(body)
        ? body
        : [];
      setData(rows.map(mapApiToAgent));
    } catch (e) {
      console.error(e);
      toasterrormsg("Failed to fetch agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // ---- Derived data ----

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => { const v = (a.city || "").trim(); if (v) set.add(v); });
    return [{ label: "All Cities", value: "all" }].concat(
      Array.from(set).sort((a, b) => a.localeCompare(b)).map((c) => ({ label: c, value: c })),
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterType !== "all" && item.agentType !== filterType) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterCity !== "all" && (item.city || "") !== filterCity) return false;
      return true;
    });
  }, [data, filterType, filterStatus, filterCity]);

  // ---- Actions (passed via table meta) ----

  const onView = useCallback((agent: Agent) => {
    setViewing(agent);
    setViewOpen(true);
  }, []);

  const onEdit = useCallback((agent: Agent) => {
    setEditing(agent);
    setDrawerOpen(true);
  }, []);

  // deleteRow is called by AgentRowActions — it triggers the ConfirmModal inside that component
  const deleteRow = useCallback(async (row: { original: Agent }) => {
    const agent = row.original;
    try {
      await Delete(`${DELETE_API}/${agent.id}/`, {}, false);
      toastsuccessmsg("Agent deleted successfully.");
      setData((prev) => prev.filter((a) => a.id !== agent.id));
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Failed to delete agent.";
      toasterrormsg(message);
      console.error(e);
    }
  }, []);

  // ---- Table ----

  const columns = getColumns();

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    meta: {
      onView,
      onEdit,
      deleteRow,
    },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ---- Filter option lists ----

  const allTypeOptions = useMemo(() => [
    { id: "all", label: "All Types" },
    ...AGENT_TYPE_OPTIONS.map((o) => ({
      id: o.value,
      label: o.value === "normal" ? "Normal Agent" : o.value === "pos" ? "POS Agent" : "Society Agent",
    })),
  ], []);

  const allStatusOptions = useMemo(() => [
    { id: "all", label: "All Statuses" },
    ...AGENT_STATUS_OPTIONS.map((o) => ({ id: o.value, label: o.label })),
  ], []);

  const cityFilterOptions = useMemo(() => [
    { id: "all", label: "All Cities" },
    ...cityOptions.filter((c) => c.value !== "all").map((c) => ({ id: c.value, label: c.label })),
  ], [cityOptions]);

  // ---- Render ----

  return (
    <Page title="Agents Management">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pb-2 pt-4">
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Showing {filteredData.length} agent{filteredData.length === 1 ? "" : "s"}
          </p>
        </div>

        <MasterToolbar
          title="Agents Management"
          createLabel="Add Agent"
          searchPlaceholder="Search agents..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyAgent);
            setDrawerOpen(true);
          }}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
              <Listbox
                label="Agent Type"
                data={allTypeOptions}
                placeholder="Filter by agent type"
                value={allTypeOptions.find((o) => o.id === filterType) || allTypeOptions[0]}
                onChange={(item: any) => setFilterType((item?.id as AgentType | "all") ?? "all")}
                displayField="label"
              />
              <Listbox
                label="Status"
                data={allStatusOptions}
                placeholder="Filter by status"
                value={allStatusOptions.find((o) => o.id === filterStatus) || allStatusOptions[0]}
                onChange={(item: any) => setFilterStatus((item?.id as AgentStatus | "all") ?? "all")}
                displayField="label"
              />
              <Listbox
                label="City"
                data={cityFilterOptions}
                placeholder="Filter by city"
                value={cityFilterOptions.find((c) => c.id === filterCity) || cityFilterOptions[0]}
                onChange={(item: any) => setFilterCity(String(item?.id ?? "all"))}
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading agents..."
              : "No agents found. Click + Add Agent to create one."
          }
        />
      </div>

      <AgentDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        agent={editing}
        onSaved={fetchAgents}
      />

      <AgentViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        agent={viewing}
      />
    </Page>
  );
}
