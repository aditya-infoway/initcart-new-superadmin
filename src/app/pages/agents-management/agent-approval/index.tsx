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
import { Get, Patch, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/master/shared/MasterToolbar";
import { AgentDetailModal } from "./AgentDetailModal";
import { ApprovalConfirmModal } from "./ApprovalConfirmModal";
import { getApprovalColumns } from "./columns";
import {
  ApprovalAgent,
  ApprovalStatus,
  mapApiToApprovalAgent,
} from "./data";

// ----------------------------------------------------------------------

const LIST_API = "mlm/agents";

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function AgentApprovalPage() {
  const [data, setData] = useState<ApprovalAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | "all">("pending");

  // Detail modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<ApprovalAgent | null>(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [confirmAgent, setConfirmAgent] = useState<ApprovalAgent | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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
      setData(rows.map(mapApiToApprovalAgent));
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

  // ---- Filtered data ----

  const filteredData = useMemo(() => {
    if (filterStatus === "all") return data;
    return data.filter((a) => a.status === filterStatus);
  }, [data, filterStatus]);

  // ---- Actions ----

  const onView = useCallback((agent: ApprovalAgent) => {
    setViewing(agent);
    setViewOpen(true);
  }, []);

  const approveRow = useCallback((agent: ApprovalAgent) => {
    setConfirmAgent(agent);
    setConfirmAction("approve");
    setConfirmOpen(true);
  }, []);

  const rejectRow = useCallback((agent: ApprovalAgent) => {
    setConfirmAgent(agent);
    setConfirmAction("reject");
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmAgent || !confirmAction) return;
    setConfirmLoading(true);
    try {
      const newStatus = confirmAction === "approve" ? "approved" : "rejected";
      await Patch(`${LIST_API}/${confirmAgent.id}/`, { status: newStatus }, false);
      toastsuccessmsg(
        confirmAction === "approve"
          ? "Agent approved successfully."
          : "Agent rejected successfully.",
      );
      setData((prev) =>
        prev.map((a) =>
          a.id === confirmAgent.id ? { ...a, status: newStatus as ApprovalStatus } : a,
        ),
      );
      setConfirmOpen(false);
      setConfirmAgent(null);
      setConfirmAction(null);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Action failed. Please try again.";
      toasterrormsg(message);
      console.error(e);
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmAgent, confirmAction]);

  // ---- Table ----

  const columns = getApprovalColumns();

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    meta: {
      onView,
      approveRow,
      rejectRow,
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

  // ---- Counts for badge display ----

  const pendingCount = useMemo(
    () => data.filter((a) => a.status === "pending").length,
    [data],
  );

  // ---- Render ----

  return (
    <Page title="Agent Approval">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pb-2 pt-4 flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Showing {filteredData.length} agent{filteredData.length === 1 ? "" : "s"}
          </p>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning ring-1 ring-inset ring-warning/20">
              {pendingCount} pending
            </span>
          )}
        </div>

        <MasterToolbar
          title="Agent Approval"
          searchPlaceholder="Search agents..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
              <Listbox
                label="Status"
                data={STATUS_OPTIONS}
                placeholder="Filter by status"
                value={
                  STATUS_OPTIONS.find((o) => o.id === filterStatus) ||
                  STATUS_OPTIONS[0]
                }
                onChange={(item: any) =>
                  setFilterStatus((item?.id as ApprovalStatus | "all") ?? "all")
                }
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
              : filterStatus === "pending"
              ? "No pending approval requests."
              : "No agents found."
          }
        />
      </div>

      {/* Detail modal */}
      <AgentDetailModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        agent={viewing}
      />

      {/* Approve / Reject confirm modal */}
      <ApprovalConfirmModal
        isOpen={confirmOpen}
        action={confirmAction}
        agentName={confirmAgent?.fullName ?? ""}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onClose={() => {
          if (!confirmLoading) {
            setConfirmOpen(false);
            setConfirmAgent(null);
            setConfirmAction(null);
          }
        }}
      />
    </Page>
  );
}
