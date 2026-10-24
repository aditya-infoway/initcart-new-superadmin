import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Delete,
  Get,
  Post,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper"; // adjust path to your api helper file
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { MasterTable } from "../../master/shared/MasterTable";
import { getColumns } from "./columns";
import { useConfirm } from "./ConfirmDialog";
import { TopSellerViewModal } from "./TopSellerViewModal";
import {
  ALLOWED_TYPES,
  BASE,
  MAX_MB,
  PaginationInfo,
  TopSellerRow,
  TopSellerStats,
} from "./types";

const FILTERS = ["all", "pending", "live", "hidden", "rejected"];

const errMsg = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

export default function TopSellerManagementPage() {
  const { confirm, confirmDialog } = useConfirm();

  const [rows, setRows] = useState<TopSellerRow[]>([]);
  const [stats, setStats] = useState<TopSellerStats>({
    total: 0, pending: 0, approved: 0, live: 0, hidden: 0, rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0, total_pages: 1, current_page: 1, page_size: 10, has_next: false, has_previous: false,
  });

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [active, setActive] = useState<TopSellerRow | null>(null);
  const [remarks, setRemarks] = useState("");
  const [showOnApprove, setShowOnApprove] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // silent = refresh without the loading state
  const fetchRows = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await Get(BASE, {
          status: statusFilter,
          search,
          page,
          page_size: pageSize,
        });
        if (res.data.success) {
          setRows(res.data.data);
          setStats(res.data.stats);
          setPagination(res.data.pagination);
        }
      } catch (error: any) {
        // requested page no longer exists (e.g. last item of last page removed)
        if (error.response?.status === 404 && page > 1) {
          setPage(1);
          return;
        }
        toasterrormsg("Failed to load top seller requests");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, page, pageSize],
  );

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  /* ---------------- modal handlers ---------------- */

  const openDetail = async (item: TopSellerRow) => {
    setModalOpen(true);
    setModalLoading(true);
    setRemarks("");
    setShowOnApprove(true);
    try {
      const res = await Get(`${BASE}${item.id}/`);
      if (res.data.success) setActive(res.data.data);
    } catch {
      toasterrormsg("Failed to load request details");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setActive(null);
  };

  // keep table row and modal in sync after a banner change
  const applyBannerUpdate = (updated: TopSellerRow) => {
    setActive(updated);
    setRows((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...r, banner_url: updated.banner_url, banner_uploaded_by: updated.banner_uploaded_by }
          : r,
      ),
    );
  };

  const handleBannerPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !active) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toasterrormsg("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toasterrormsg(`Banner must be smaller than ${MAX_MB} MB.`);
      return;
    }

    setBannerLoading(true);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const res = await Post(`${BASE}${active.id}/banner/`, formData, true); // true = multipart
      if (res.data.success) {
        applyBannerUpdate(res.data.data);
        toastsuccessmsg("Banner updated");
      }
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Failed to upload banner"));
    } finally {
      setBannerLoading(false);
    }
  };

  const handleBannerRemove = async () => {
    if (!active) return;
    const ok = await confirm({
      title: "Remove banner?",
      text: "The store logo will be shown in the slider instead.",
      confirmText: "Yes, Remove",
      color: "error",
    });
    if (!ok) return;

    setBannerLoading(true);
    try {
      const res = await Delete(`${BASE}${active.id}/banner/`, {});
      if (res.data.success) {
        applyBannerUpdate(res.data.data);
        toastsuccessmsg("Banner removed");
      }
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Failed to remove banner"));
    } finally {
      setBannerLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!active) return;
    const ok = await confirm({
      title: "Approve as Top Seller?",
      text: showOnApprove
        ? `${active.vendor_name} will appear on the website immediately${active.banner_url ? " with the current banner" : ""}.`
        : `${active.vendor_name} will be approved but stay hidden until you turn it on.`,
      confirmText: "Approve",
      color: "primary",
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await Post(`${BASE}${active.id}/approve/`, {
        remarks,
        is_active: showOnApprove,
      });
      if (res.data.success) {
        toastsuccessmsg("Approved");
        closeModal();
        fetchRows(true);
      }
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Approval failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!active) return;
    if (!remarks.trim()) {
      toasterrormsg("Please add remarks so the vendor knows why.");
      return;
    }
    const ok = await confirm({
      title: "Reject Request?",
      text: "The vendor will see your remarks and can send a new request later.",
      confirmText: "Reject",
      color: "error",
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await Post(`${BASE}${active.id}/reject/`, { remarks });
      if (res.data.success) {
        toastsuccessmsg("Rejected");
        closeModal();
        fetchRows(true);
      }
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Rejection failed"));
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- table handlers ---------------- */

  const handleToggle = async (item: TopSellerRow) => {
    // optimistic update
    setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, is_active: !r.is_active } : r)));
    try {
      await Post(`${BASE}${item.id}/toggle/`, {});
      fetchRows(true); // refresh stats + current page
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Failed to update"));
      fetchRows(true);
    }
  };

  const handleOrderSave = async (item: TopSellerRow, input: HTMLInputElement) => {
    const num = parseInt(input.value, 10);

    if (isNaN(num) || num < 0) {
      input.value = String(item.display_order);
      return;
    }
    if (num === item.display_order) return;

    try {
      await Post(`${BASE}${item.id}/order/`, { display_order: num });
      setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, display_order: num } : r)));
      toastsuccessmsg("Order updated");
    } catch (error: any) {
      input.value = String(item.display_order);
      toasterrormsg(errMsg(error, "Cannot set this order"));
    }
  };

  const handleRemove = async (item: TopSellerRow) => {
    const ok = await confirm({
      title: "Remove from Top Sellers?",
      text: `${item.vendor_name} will be removed completely. The vendor can send a new request later.`,
      confirmText: "Yes, Remove",
      color: "error",
    });
    if (!ok) return;
    try {
      await Delete(`${BASE}${item.id}/`, {});
      toastsuccessmsg("Removed");
      fetchRows(true);
    } catch (error: any) {
      toasterrormsg(errMsg(error, "Failed to remove"));
    }
  };

  /* ---------------- table ---------------- */

  // Not memoized on purpose: handlers always need the latest filters/page.
  const columns = getColumns({
    pageIndex: pagination.current_page - 1,
    pageSize,
    onView: openDetail,
    onRemove: handleRemove,
    onToggle: handleToggle,
    onOrderSave: handleOrderSave,
  });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: paginationState },
    onSortingChange: setSorting,
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
    getSortedRowModel: getSortedRowModel(),
  });

  const statCards = [
    { key: "all", label: "Total Requests", value: stats.total, color: "text-gray-800 dark:text-dark-50" },
    { key: "pending", label: "Pending", value: stats.pending, color: "text-warning" },
    { key: "live", label: "Live on Website", value: stats.live, color: "text-success" },
    { key: "hidden", label: "Approved (Hidden)", value: stats.hidden, color: "text-info" },
    { key: "rejected", label: "Rejected", value: stats.rejected, color: "text-error" },
  ];

  return (
    <Page title="Top Sellers Management">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
              Top Sellers Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              Review vendor requests and control who appears in the homepage Top Sellers slider.
            </p>
          </div>
        </div>

        {/* Stat cards (clickable filters) */}
        <div className="grid grid-cols-2 gap-3 px-(--margin-x) md:grid-cols-5">
          {statCards.map((c) => (
            <button
              key={c.key}
              onClick={() => changeFilter(c.key)}
              className={`rounded-2xl border bg-white p-4 text-center transition hover:shadow-md dark:bg-dark-700 ${
                statusFilter === c.key
                  ? "border-primary-500 ring-1 ring-primary-500"
                  : "border-gray-200 dark:border-dark-500"
              }`}
            >
              <p className="mb-1 text-xs text-gray-500 dark:text-dark-300">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </button>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-(--margin-x)">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((s) => (
              <Button
                key={s}
                color={statusFilter === s ? "primary" : "neutral"}
                variant={statusFilter === s ? "filled" : "soft"}
                className="h-9 rounded-lg px-4 text-sm capitalize"
                onClick={() => changeFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search vendor or request ID..."
              prefix={<MagnifyingGlassIcon className="size-4.5" />}
            />
          </div>
        </div>

        {/* Table */}
        <div className={loading ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
          <MasterTable
            table={table}
            columnCount={columns.length}
            emptyMessage="No requests found."
          />
        </div>
      </div>

      <TopSellerViewModal
        isOpen={modalOpen}
        close={closeModal}
        loading={modalLoading}
        active={active}
        remarks={remarks}
        setRemarks={setRemarks}
        showOnApprove={showOnApprove}
        setShowOnApprove={setShowOnApprove}
        actionLoading={actionLoading}
        bannerLoading={bannerLoading}
        bannerInputRef={bannerInputRef}
        onBannerPick={handleBannerPick}
        onBannerRemove={handleBannerRemove}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleActive={async () => {
          if (!active) return;
          await handleToggle(active);
          setActive({ ...active, is_active: !active.is_active });
        }}
      />

      {confirmDialog}
    </Page>
  );
}