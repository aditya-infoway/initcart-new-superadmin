import {
  ArrowLeftIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import { Get, Post, toasterrormsg } from "@/ApiHelper";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input } from "@/components/ui";
import { MasterServerTable } from "@/components/shared/MasterServerTable";
import { getColumns } from "./columns";
import {
  BASE,
  EMPTY_STATS,
  formatCurrency,
  PaginationInfo,
  RefundItem,
  RefundStats,
} from "./types";

const errMsg = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState<RefundStats>(EMPTY_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0, total_pages: 1, current_page: 1, page_size: 10, has_next: false, has_previous: false,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // process refund confirm modal
  const [confirmItem, setConfirmItem] = useState<RefundItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [successText, setSuccessText] = useState("Refund Processed");

  // ignore responses of older requests (fast tab / page switching)
  const requestId = useRef(0);

  const fetchRefunds = useCallback(
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
          setRefunds(res.data.data);
          setPagination(res.data.pagination);
          setStats(res.data.stats || EMPTY_STATS);
        }
      } catch (error: any) {
        if (id !== requestId.current) return;
        toasterrormsg(errMsg(error, "Failed to fetch refunds"));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [activeTab, page, pageSize, search],
  );

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

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

  /* ---------------- process refund ---------------- */

  const openConfirm = (item: RefundItem) => {
    setConfirmItem(item);
    setConfirmSuccess(false);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmSuccess(false);
  };

  const handleProcess = async () => {
    if (!confirmItem) return;
    setConfirmLoading(true);
    try {
      const res = await Post(`${BASE}${confirmItem.id}/process/`, {}, false);
      if (res.data.success) {
        setSuccessText(res.data.message || "Refund Processed");
        setConfirmSuccess(true);
      } else {
        setConfirmOpen(false);
        toasterrormsg(
          res.data.message ||
            "Razorpay could not process this refund. Check details and retry.",
        );
      }
    } catch (error: any) {
      setConfirmOpen(false);
      toasterrormsg(errMsg(error, "Something went wrong while processing the refund"));
    } finally {
      setConfirmLoading(false);
      fetchRefunds(true); // refresh list + stats in every case
    }
  };

  const confirmMessages: ConfirmMessages = {
    pending: {
      description: confirmItem
        ? `This will call Razorpay and refund ${formatCurrency(confirmItem.refund_amount)} to the customer for order ${confirmItem.order_number}.`
        : "",
    },
    success: { title: successText },
  };

  /* ---------------- table ---------------- */

  // Not memoized on purpose: handlers always need the latest state.
  const columns = getColumns({ onProcess: openConfirm });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: refunds,
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

  const TABS = [
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "failed", label: "Failed", count: stats.failed },
    { key: "processed", label: "Processed", count: stats.processed },
    { key: "all", label: "All", count: stats.total },
  ];

  const statCards = [
    { label: "Total Refunds", value: stats.total, sub: stats.total_amount, color: "text-gray-800 dark:text-dark-50" },
    { label: "Pending", value: stats.pending, sub: stats.pending_amount, color: "text-warning" },
    { label: "Processed", value: stats.processed, sub: stats.processed_amount, color: "text-success" },
    { label: "Failed", value: stats.failed, sub: stats.failed_amount, color: "text-error" },
  ];

  return (
    <Page title="Customer Refunds">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
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
                Customer Refunds (Online Orders)
              </h1>
            </div>
            <Button
              color="primary"
              variant="soft"
              className="h-9 gap-1.5 rounded-lg px-3 text-sm"
              onClick={() => fetchRefunds()}
              disabled={loading}
            >
              <ArrowPathIcon className="size-4" />
              Refresh
            </Button>
          </Card>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 px-(--margin-x) md:grid-cols-4">
          {statCards.map((c) => (
            <Card key={c.label} className="p-4">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-dark-300">
                {c.label}
              </p>
              <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{c.value}</p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">
                {formatCurrency(c.sub)}
              </p>
            </Card>
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

          <div className="w-full md:w-96">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Refund ID, Return ID, Order, Product, Vendor, Customer…"
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
                ? "Loading refunds..."
                : search
                  ? "No refunds match your search."
                  : "No refunds found."
            }
          />
        </div>
      </div>

      <ConfirmModal
        show={confirmOpen}
        onClose={closeConfirm}
        messages={confirmMessages}
        onOk={handleProcess}
        confirmLoading={confirmLoading}
        state={confirmSuccess ? "success" : "pending"}
      />
    </Page>
  );
}