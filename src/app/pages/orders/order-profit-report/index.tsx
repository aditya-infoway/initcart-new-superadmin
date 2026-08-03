import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { getColumns } from "./columns";
import {
  createProfitStats,
  mapApiProfitOrderRow,
  mapApiProfitReport,
  ProfitOrderRow,
  ProfitReportDetail,
  profitStatusTabs,
} from "./data";
import { ProfitReportModal } from "./ProfitReportModal";

function StatCard({
  title,
  value,
  subtext,
  accent,
}: {
  title: string;
  value: string | number;
  subtext: string;
  accent: "primary" | "info" | "warning" | "success";
}) {
  const theme = {
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
        <div className={`mt-2 text-xs font-medium ${theme.sub}`}>{subtext}</div>
      </div>
    </div>
  );
}

export default function OrderProfitReportPage() {
  const [data, setData] = useState<ProfitOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof profitStatusTabs)[number]["key"]>("all");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<ProfitReportDetail | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/superadmin/orders/?page=1&page_size=15", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiProfitOrderRow));
    } catch {
      toasterrormsg("Something went wrong while fetching order profit rows.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (activeTab !== "all" && item.status !== activeTab) return false;
      return true;
    });
  }, [activeTab, data]);

  const stats = useMemo(() => createProfitStats(data), [data]);

  const openReport = async (row: ProfitOrderRow) => {
    setReportOpen(true);
    setReportLoading(true);
    setReport(null);
    try {
      const response = await Get(`ecommerce/admin/order-profit/${row.orderId}/`, {}, false);
      setReport(mapApiProfitReport(response.data));
    } catch {
      toasterrormsg("Failed to load profit report.");
    } finally {
      setReportLoading(false);
    }
  };

  const columns = getColumns({ onOpenReport: openReport });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Order Profit Report">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                  Order Profit Report
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  Click any row to view profit distribution.
                </p>
              </div>
              <Button color="primary" variant="outlined" onClick={fetchOrders}>
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="size-4" />
                  Refresh
                </span>
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Platform Profit" value={`₹${stats.totalPlatformProfit.toFixed(2)}`} subtext="From delivered orders" accent="primary" />
            <StatCard title="Total Agents Paid" value={`₹${stats.totalAgentsPaid.toFixed(2)}`} subtext={`MLM ₹${stats.totalAgentsPaid.toFixed(2)}`} accent="info" />
            <StatCard title="Total Company Profit" value={`₹${stats.totalCompanyProfit.toFixed(2)}`} subtext="Configured + All undistributed" accent="warning" />
            <StatCard title="Commission Status" value={`${stats.distributedOrders} Distributed`} subtext={`${stats.pendingOrders} pending · ${stats.directSales} direct`} accent="success" />
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600 dark:text-dark-200">
                <span>All Orders: {stats.totalOrders}</span>
                <span>Agent Orders: {stats.agentOrders}</span>
                <span>Direct Sales: {stats.directSales}</span>
                <span>Distributed: {stats.distributedOrders}</span>
                <span>Pending: {stats.pendingOrders}</span>
              </div>
              <div className="min-w-[18rem] max-w-full sm:min-w-88">
                <Input
                  label="Search"
                  value={globalFilter}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4" />}
                  placeholder="Search order ID, customer..."
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {profitStatusTabs.map((tab) => {
                const count = tab.key === "all" ? data.length : data.filter((row) => row.status === tab.key).length;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-300"
                        : "border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200 dark:hover:text-primary-300"
                    }`}
                  >
                    {tab.label} {count ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading order profit report..." : "No profit report rows found."}
        />
      </div>

      <ProfitReportModal
        isOpen={reportOpen}
        close={() => setReportOpen(false)}
        loading={reportLoading}
        report={report}
      />
    </Page>
  );
}
