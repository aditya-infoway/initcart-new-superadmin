import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input } from "@/components/ui";
import { MasterServerTable } from "@/components/shared/MasterServerTable";
import { apiError, EMPTY_PAGINATION, PaginationInfo } from "../../master/shared/refundUtils";
import { getColumns } from "./columns";
import {
  fmt,
  mapApiProfitOrderRow,
  ORDERS_URL,
  PageStats,
  PROFIT_URL,
  ProfitData,
  ProfitOrderRow,
  STATS_URL,
  STATUS_FILTERS,
} from "./data";
import { ProfitReportModal } from "./ProfitReportModal";

type Accent = "primary" | "info" | "warning" | "success" | "error";

const ACCENTS: Record<Accent, { card: string; pill: string; sub: string; glow: string }> = {
  primary: {
    card: "border-primary-200/70 bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20 dark:border-primary-500/20 dark:bg-primary-500/15 dark:text-primary-100",
    pill: "bg-white/18 text-white dark:bg-primary-500/20 dark:text-primary-100",
    sub: "text-white/75 dark:text-primary-200/80",
    glow: "bg-white/12 dark:bg-primary-400/10",
  },
  info: {
    card: "border-sky-200/70 bg-linear-to-br from-sky-400 to-sky-500 text-white shadow-sky-500/20 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-100",
    pill: "bg-white/18 text-white dark:bg-sky-500/20 dark:text-sky-100",
    sub: "text-white/75 dark:text-sky-200/80",
    glow: "bg-white/12 dark:bg-sky-400/10",
  },
  warning: {
    card: "border-amber-200/70 bg-linear-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/20 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-100",
    pill: "bg-white/18 text-white dark:bg-amber-500/20 dark:text-amber-100",
    sub: "text-white/75 dark:text-amber-200/80",
    glow: "bg-white/12 dark:bg-amber-400/10",
  },
  success: {
    card: "border-emerald-200/70 bg-linear-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-500/20 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-100",
    pill: "bg-white/18 text-white dark:bg-emerald-500/20 dark:text-emerald-100",
    sub: "text-white/75 dark:text-emerald-200/80",
    glow: "bg-white/12 dark:bg-emerald-400/10",
  },
  error: {
    card: "border-rose-200/70 bg-linear-to-br from-rose-400 to-rose-500 text-white shadow-rose-500/20 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-100",
    pill: "bg-white/18 text-white dark:bg-rose-500/20 dark:text-rose-100",
    sub: "text-white/75 dark:text-rose-200/80",
    glow: "bg-white/12 dark:bg-rose-400/10",
  },
};

function StatCard({
  title,
  value,
  subtext,
  accent,
}: {
  title: string;
  value: string | number;
  subtext: string;
  accent: Accent;
}) {
  const theme = ACCENTS[accent];
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg dark:shadow-none ${theme.card}`}>
      <div className={`absolute -right-5 -top-5 size-20 rounded-full blur-2xl ${theme.glow}`} />
      <div className={`absolute -bottom-8 right-6 size-16 rounded-full ${theme.glow}`} />
      <div className="relative z-1">
        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${theme.pill}`}>
          {title}
        </div>
        <div className="mt-4 text-2xl font-semibold leading-none">{value}</div>
        <div className={`mt-2 text-xs font-medium ${theme.sub}`}>{subtext}</div>
      </div>
    </div>
  );
}

export default function OrderProfitReportPage() {
  const [pageStats, setPageStats] = useState<PageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [orders, setOrders] = useState<ProfitOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportOrder, setReportOrder] = useState("");
  const [report, setReport] = useState<ProfitData | null>(null);

  const ordersReq = useRef(0);
  const reportReq = useRef(0);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await Get(STATS_URL, {}, false);
      setPageStats(res.data);
    } catch {
      /* cards stay empty */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const id = ++ordersReq.current;
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (statusFilter) params.order_status = statusFilter;
      if (search) params.search = search;

      const res = await Get(ORDERS_URL, params, false);
      if (id !== ordersReq.current) return;

      const raw = Array.isArray(res.data) ? res.data : res.data?.results || res.data?.data || [];
      const count = res.data?.count ?? raw.length;

      setOrders(raw.map(mapApiProfitOrderRow));
      setPagination({
        count,
        total_pages: Math.max(1, Math.ceil(count / pageSize)),
        current_page: page,
        page_size: pageSize,
        has_next: page * pageSize < count,
        has_previous: page > 1,
      });
    } catch (e: any) {
      if (id !== ordersReq.current) return;
      toasterrormsg(apiError(e, "Something went wrong while fetching orders."));
    } finally {
      if (id === ordersReq.current) setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const changeFilter = (api: string) => {
    setStatusFilter(api);
    setPage(1);
  };

  const openReport = async (row: ProfitOrderRow) => {
    const id = ++reportReq.current;
    setReportOrder(row.orderId);
    setReportOpen(true);
    setReportLoading(true);
    setReportError(null);
    setReport(null);
    try {
      const res = await Get(`${PROFIT_URL}${row.orderId}/`, {}, false);
      if (id !== reportReq.current) return;
      setReport(res.data);
    } catch (e: any) {
      if (id !== reportReq.current) return;
      setReportError(e?.response?.data?.error || apiError(e, "Failed to load profit report."));
    } finally {
      if (id === reportReq.current) setReportLoading(false);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchOrders();
  };

  const columns = getColumns({
    pageIndex: page - 1,
    pageSize,
    onOpenReport: openReport,
  });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: orders,
    columns,
    state: { pagination: paginationState },
    enableSorting: false, // server-side list, no client sorting
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(paginationState) : updater;
      if (next.pageSize !== pageSize) { setPageSize(next.pageSize); setPage(1); }
      else setPage(next.pageIndex + 1);
    },
    manualPagination: true,
    pageCount: pagination.total_pages,
    getCoreRowModel: getCoreRowModel(),
  });

  const cs = pageStats?.stats;
  const oc = pageStats?.order_counts;
  const rc = pageStats?.refund_counts;
  const dash = statsLoading;

  const countChips = oc
    ? [
        `All Orders: ${oc.total}`,
        `Agent Orders: ${oc.agent_orders}`,
        `Direct Sales: ${oc.direct_orders}`,
        `Distributed: ${oc.distributed}`,
        `Pending: ${oc.pending}`,
      ]
    : [];

  return (
    <Page title="Order Profit Report">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">Order Profit Report</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                Click Report on any order to view its profit distribution.
              </p>
            </div>
            <Button color="primary" variant="outlined" onClick={refreshAll} disabled={loading}>
              <span className="flex items-center gap-2">
                <ArrowPathIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </span>
            </Button>
          </Card>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 px-(--margin-x) sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Platform Profit"
            value={dash ? "..." : fmt(cs?.total_platform_profit || 0)}
            subtext="From delivered orders"
            accent="primary"
          />
          <StatCard
            title="Total Agents Paid"
            value={dash ? "..." : fmt(cs?.total_agents_paid || 0)}
            subtext={dash ? "" : `MLM ${fmt(cs?.breakdown_agents.mlm || 0)} (net of reversals)`}
            accent="info"
          />
          <StatCard
            title="Total Company Profit"
            value={dash ? "..." : fmt(cs?.total_company_profit || 0)}
            subtext="Configured + All undistributed"
            accent="warning"
          />
          <StatCard
            title="Commission Status"
            value={dash ? "..." : `${oc?.distributed || 0} Distributed`}
            subtext={dash ? "" : `${oc?.pending || 0} pending · ${oc?.direct_orders || 0} direct`}
            accent="success"
          />
          <StatCard
            title="Total Refunded"
            value={dash ? "..." : fmt(cs?.total_refunded_amount || 0)}
            subtext={dash ? "" : `${rc?.processed || 0} processed · ${rc?.pending || 0} pending · ${rc?.failed || 0} failed`}
            accent="error"
          />
        </div>

        {/* Order counts */}
        {countChips.length > 0 && (
          <div className="flex flex-wrap gap-2 px-(--margin-x) text-xs">
            {countChips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700 dark:bg-dark-600 dark:text-dark-100"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Filters + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-(--margin-x)">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.label}
                color={statusFilter === f.api ? "primary" : "neutral"}
                variant={statusFilter === f.api ? "filled" : "soft"}
                className="h-9 rounded-lg px-4 text-sm"
                onClick={() => changeFilter(f.api)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="w-full md:w-80">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order ID, customer..."
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
            emptyMessage={loading ? "Loading orders..." : "No orders found."}
          />
        </div>
      </div>

      <ProfitReportModal
        isOpen={reportOpen}
        close={() => setReportOpen(false)}
        loading={reportLoading}
        error={reportError}
        orderNumber={reportOrder}
        data={report}
      />
    </Page>
  );
}