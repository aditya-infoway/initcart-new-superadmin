import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToPdf } from "../../accounting-master/shared/export";
import { MasterTable } from "../../master/shared/MasterTable";
import { getColumns } from "./columns";
import {
  createEmptyOrderStats,
  getOrderStatusLabel,
  mapApiOrderRow,
  mapDashboardStats,
  orderExportColumns,
  orderStatusTabs,
  OrderRow,
  OrderStats,
  OrderStatusTab,
} from "./data";
import { OrderPdfModal } from "./OrderPdfModal";

// API page size matches the backend default (10 per page)
const PAGE_SIZE = 10;

// Map internal tab keys → API order_status values
const API_STATUS_MAP: Partial<Record<OrderStatusTab, string>> = {
  pending:          "pending",
  confirmed:        "confirmed",
  packaging:        "processing",
  out_for_delivery: "shipped",
  delivered:        "delivered",
  canceled:         "cancelled",
  returned:         "refunded",
  failed:           "failed to deliver",
};

function StatCard({ title, value, accent = "primary" }: { title: string; value: string | number; accent?: "primary" | "warning" | "info" | "success" | "error" | "secondary" }) {
  const theme = {
    primary: {
      card: "border-primary-200/70 bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20 dark:border-primary-500/20 dark:bg-primary-500/15 dark:text-primary-100",
      pill: "bg-white/18 text-white dark:bg-primary-500/20 dark:text-primary-100",
      sub: "text-white/75 dark:text-primary-200/80",
      glow: "bg-white/12 dark:bg-primary-400/10",
    },
    warning: {
      card: "border-amber-200/70 bg-linear-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/20 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-100",
      pill: "bg-white/18 text-white dark:bg-amber-500/20 dark:text-amber-100",
      sub: "text-white/75 dark:text-amber-200/80",
      glow: "bg-white/12 dark:bg-amber-400/10",
    },
    info: {
      card: "border-sky-200/70 bg-linear-to-br from-sky-400 to-sky-500 text-white shadow-sky-500/20 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-100",
      pill: "bg-white/18 text-white dark:bg-sky-500/20 dark:text-sky-100",
      sub: "text-white/75 dark:text-sky-200/80",
      glow: "bg-white/12 dark:bg-sky-400/10",
    },
    success: {
      card: "border-emerald-200/70 bg-linear-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-500/20 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-100",
      pill: "bg-white/18 text-white dark:bg-emerald-500/20 dark:text-emerald-100",
      sub: "text-white/75 dark:text-emerald-200/80",
      glow: "bg-white/12 dark:bg-emerald-400/10",
    },
    error: {
      card: "border-red-200/70 bg-linear-to-br from-red-400 to-red-500 text-white shadow-red-500/20 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-100",
      pill: "bg-white/18 text-white dark:bg-red-500/20 dark:text-red-100",
      sub: "text-white/75 dark:text-red-200/80",
      glow: "bg-white/12 dark:bg-red-400/10",
    },
    secondary: {
      card: "border-indigo-200/70 bg-linear-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/20 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-100",
      pill: "bg-white/18 text-white dark:bg-indigo-500/20 dark:text-indigo-100",
      sub: "text-white/75 dark:text-indigo-200/80",
      glow: "bg-white/12 dark:bg-indigo-400/10",
    },
  }[accent];

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg dark:shadow-none ${theme.card}`}>
      <div className={`absolute -right-5 -top-5 size-20 rounded-full blur-2xl ${theme.glow}`} />
      <div className={`absolute -bottom-8 right-6 size-16 rounded-full ${theme.glow}`} />

      <div className="relative z-1">
        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${theme.pill}`}>
          {title}
        </div>
        <div className="mt-4 text-3xl font-semibold leading-none">{value}</div>
        <div className={`mt-2 text-xs font-medium ${theme.sub}`}>Live order insights</div>
      </div>
    </div>
  );
}

export default function AllOrdersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OrderRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<OrderStats>(createEmptyOrderStats());
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("all");
  const [pdfOrder, setPdfOrder] = useState<OrderRow | null>(null);
  // Server-side pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await Get("ecommerce/superadmin/orders/dashboard_stats/", {}, false);
      setStats(mapDashboardStats(response.data));
    } catch {
      toasterrormsg("Failed to load order dashboard stats.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (
    status: OrderStatusTab,
    pageIndex: number,
  ) => {
    setLoading(true);
    try {
      const page = pageIndex + 1; // API is 1-indexed
      let url = `ecommerce/superadmin/orders/?page=${page}`;
      if (status !== "all") {
        const apiStatus = API_STATUS_MAP[status] ?? status;
        url += `&order_status=${encodeURIComponent(apiStatus)}`;
      }

      const response = await Get(url, {}, false);
      const body = response.data;

      // Paginated response: { count, next, previous, results }
      const rows = Array.isArray(body?.results)
        ? body.results
        : Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
            ? body.data
            : [];

      setTotalCount(body?.count ?? rows.length);
      setData(rows.map(mapApiOrderRow));
    } catch {
      toasterrormsg("Something went wrong while fetching orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats once on mount
  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // Single effect — fetches orders whenever tab OR page changes
  useEffect(() => {
    void fetchOrders(activeTab, pagination.pageIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.pageIndex]);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: OrderStatusTab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const refreshAll = () => {
    void fetchStats();
    void fetchOrders(activeTab, pagination.pageIndex);
  };

  // Total pages for the current filter
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  const columns = getColumns({
    onView: (order) => navigate(`/orders/all-orders/${order.orderId}`),
    onOpenPdf: (order) => setPdfOrder(order),
    onMail: (order) => {
      const subject = encodeURIComponent(`Invoice for ${order.orderId}`);
      const body = encodeURIComponent(`Hello ${order.customerName},\n\nPlease find the invoice details for order ${order.orderId}.`);
      window.open(`mailto:${order.customerEmail}?subject=${subject}&body=${body}`, "_self");
    },
  });

  const table = useReactTable({
    data,
    columns,
    // Server-side pagination — tell tanstack the total page count
    pageCount,
    manualPagination: true,
    state: { sorting, rowSelection, globalFilter, pagination },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDownloadPdf = (order: OrderRow) => {
    exportToPdf(
      [order],
      orderExportColumns as never,
      `Invoice - ${order.orderId}`,
      `invoice-${order.orderId}`,
    );
    setPdfOrder(null);
  };

  return (
    <Page title="All Orders">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                  All Orders
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  Manage and track all customer orders.
                </p>
              </div>
              <Button color="primary" variant="outlined" onClick={refreshAll}>
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="size-4" />
                  Refresh
                </span>
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            <StatCard title="Total Orders" value={statsLoading ? "..." : stats.totalOrders} accent="primary" />
            <StatCard title="Pending" value={statsLoading ? "..." : stats.counts.pending} accent="warning" />
            <StatCard title="Confirmed" value={statsLoading ? "..." : stats.counts.confirmed} accent="info" />
            <StatCard title="Packaging" value={statsLoading ? "..." : stats.counts.packaging} accent="secondary" />
            <StatCard title="Out for Delivery" value={statsLoading ? "..." : stats.counts.out_for_delivery} accent="primary" />
            <StatCard title="Delivered" value={statsLoading ? "..." : stats.counts.delivered} accent="success" />
            <StatCard title="Canceled" value={statsLoading ? "..." : stats.counts.canceled} accent="error" />
            <StatCard title="Returned" value={statsLoading ? "..." : stats.counts.returned} accent="warning" />
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Order List
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  Showing {data.length} of {totalCount} orders
                </p>
              </div>
              <div className="min-w-[18rem] max-w-full sm:min-w-[22rem]">
                <Input
                  label="Search"
                  value={globalFilter}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4" />}
                  placeholder="Search orders by ID, customer, store..."
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {orderStatusTabs.map((tab) => {
                const count = tab.key === "all" ? stats.totalOrders : stats.counts[tab.key];
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-300"
                        : "border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200 dark:hover:text-primary-300"
                    }`}
                  >
                    {tab.label} ({count ?? 0})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading orders..." : `No ${getOrderStatusLabel(activeTab).toLowerCase()} found.`}        />
      </div>

      <OrderPdfModal
        isOpen={Boolean(pdfOrder)}
        close={() => setPdfOrder(null)}
        order={pdfOrder}
        onDownload={handleDownloadPdf}
      />
    </Page>
  );
}
