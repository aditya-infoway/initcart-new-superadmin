import { ArrowLeftIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
// ❌ import { useNavigate } from "react-router-dom";  (hata do)

import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { MasterServerTable } from "@/components/shared/MasterServerTable";
import { getColumns } from "./columns";
import { ReturnActionModal } from "./ReturnActionModal";
import { ReturnImagesModal } from "./ReturnImagesModal";
import {
  BASE,
  EMPTY_STATS,
  PaginationInfo,
  ReturnItem,
  ReturnStats,
} from "./types";

const errMsg = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

export default function AdminReturnRequestsPage() {


  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("re_requested");
  const [stats, setStats] = useState<ReturnStats>(EMPTY_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0, total_pages: 1, current_page: 1, page_size: 15, has_next: false, has_previous: false,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // approve / reject modal
  const [actionOpen, setActionOpen] = useState(false);
  const [actionItem, setActionItem] = useState<ReturnItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // images modal
  const [imagesItem, setImagesItem] = useState<ReturnItem | null>(null);
  const [imagesOpen, setImagesOpen] = useState(false);

  // ignore responses of older requests (fast tab / page switching)
  const requestId = useRef(0);

  const fetchReturns = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const params: Record<string, unknown> = {
          status: activeTab,
          page,
          page_size: pageSize,
        };
        if (search) params.search = search;

        const res = await Get(BASE, params, false);
        if (id !== requestId.current) return;
        if (res.data.success) {
          setReturns(res.data.data);
          setPagination(res.data.pagination);
          setStats(res.data.stats || EMPTY_STATS);
        }
      } catch (error: any) {
        if (id !== requestId.current) return;
        toasterrormsg(errMsg(error, "Failed to fetch returns"));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [activeTab, page, pageSize, search],
  );

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const changeTab = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  /* ---------------- handlers ---------------- */

  const openAction = (item: ReturnItem, action: "approve" | "reject") => {
    setActionItem(item);
    setActionType(action);
    setRemarks("");
    setActionOpen(true);
  };

  const closeAction = () => {
    if (actionLoading) return;
    setActionOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!actionItem) return;
    setActionLoading(true);
    try {
      const res = await Post(
        `${BASE}${actionItem.id}/action/`,
        { action: actionType, remarks: remarks || "" },
        false,
      );
      if (res.data.success) {
        toastsuccessmsg(res.data.message || "Done");
        setActionOpen(false);
        fetchReturns(true);
      }
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Action failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const openImages = (item: ReturnItem) => {
    if (!item.images || item.images.length === 0) {
      toasterrormsg("Customer did not upload any images.");
      return;
    }
    setImagesItem(item);
    setImagesOpen(true);
  };

  /* ---------------- table ---------------- */

  // Not memoized on purpose: handlers always need the latest state.
  const columns = getColumns({ onAction: openAction, onViewImages: openImages });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: returns,
    columns,
    state: { pagination: paginationState },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(paginationState) : updater;
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize);
        setPage(1);
      } else {
        setPage(next.pageIndex + 1);
      }
    },  
    manualPagination: true, // server-side pagination
    pageCount: pagination.total_pages,
    getCoreRowModel: getCoreRowModel(),
  });

  const approved = stats.vendor_approved + stats.admin_approved;
  const rejected = stats.vendor_rejected + stats.admin_rejected;

  const TABS = [
    { key: "re_requested", label: "Needs Your Action", count: stats.re_requested },
    { key: "requested", label: "With Vendor", count: stats.requested },
    { key: "all", label: "All", count: stats.total },
  ];

  const statCards = [
    { label: "Total Returns", value: stats.total, color: "text-gray-800 dark:text-dark-50" },
    { label: "With Vendor", value: stats.requested, color: "text-warning" },
    { label: "Needs Your Action", value: stats.re_requested, color: "text-info" },
    { label: "Approved", value: approved, color: "text-success" },
    { label: "Rejected", value: rejected, color: "text-error" },
  ];

  return (
    <Page title="Return Requests">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex items-center gap-3">
<Button
  variant="soft"
  className="h-9 gap-1.5 rounded-lg px-3 text-sm"
  onClick={() => window.history.back()}
>
  <ArrowLeftIcon className="size-4" />
  Back
</Button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                Return Requests (Admin)
              </h1>
            </div>
            <Button
              color="primary"
              variant="soft"
              className="h-9 gap-1.5 rounded-lg px-3 text-sm"
              onClick={() => fetchReturns()}
              disabled={loading}
            >
              <ArrowPathIcon className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 px-(--margin-x) md:grid-cols-5">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700"
            >
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-dark-300">
                {c.label}
              </p>
              <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-(--margin-x)">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Button
                key={t.key}
                color={activeTab === t.key ? "primary" : "neutral"}
                variant={activeTab === t.key ? "filled" : "soft"}
                className="h-9 rounded-lg px-4 text-sm"
                onClick={() => changeTab(t.key)}
              >
                {t.label} ({t.count})
              </Button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Return ID, Order, Product, Vendor, Customer…"
              prefix={<MagnifyingGlassIcon className="size-4.5" />}
            />
          </div>
        </div>

        {/* Table */}
        <div className={loading ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
<MasterServerTable
  table={table}
  columnCount={columns.length}
  totalCount={pagination.count}
  emptyMessage={
    loading
      ? "Loading return requests..."
      : search
        ? "No return requests match your search."
        : "No return requests found."
  }
/>
        </div>
      </div>

      <ReturnActionModal
        isOpen={actionOpen}
        item={actionItem}
        action={actionType}
        remarks={remarks}
        setRemarks={setRemarks}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onClose={closeAction}
      />

      <ReturnImagesModal
        isOpen={imagesOpen}
        close={() => setImagesOpen(false)}
        item={imagesItem}
      />
    </Page>
  );
}