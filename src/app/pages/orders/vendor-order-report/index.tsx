// pages/ecommerce/admin/reports/AllVendorsOrderReport.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Get, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/master/shared/MasterToolbar";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";

import { getColumns } from "./columns";
import {
  AdminOrderReportRow,
  DEFAULT_PAGE_SIZE,
  Pagination,
  csvCell,
  daysAgoStr,
  escapeHtml,
  formatCurrency,
  formatDateTime,
  orderAgeLabel,
  todayStr,
} from "./data";

const statusOptions = [
  { id: "", label: "All Statuses" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refunded", label: "Refunded" },
];

interface Filters {
  dateFrom: string;
  dateTo: string;
  search: string;
  status: string;
}

const defaultFilters = (): Filters => ({
  dateFrom: daysAgoStr(180),
  dateTo: todayStr(),
  search: "",
  status: "",
});

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

export default function AllVendorsOrderReport() {
  const [data, setData] = useState<AdminOrderReportRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Server-side pagination (same as old software: 15 per page)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // `filters` = what is typed in the panel, `applied` = what the API uses.
  // Dates apply immediately (like old software); search/status apply on
  // "Apply Filters" or Enter.
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(filters);

  const reqIdRef = useRef(0);
  const today = todayStr();

  const resetToFirstPage = () =>
    setPaginationState((p) => ({ ...p, pageIndex: 0 }));

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    const reqId = ++reqIdRef.current; // ignore out-of-order responses
    setLoading(true);
    try {
      const params: Record<string, any> = {
        date_from: applied.dateFrom,
        date_to: applied.dateTo,
        page: paginationState.pageIndex + 1,
        page_size: paginationState.pageSize,
      };
      if (applied.search) params.search = applied.search;
      if (applied.status) params.status = applied.status;

      const res = (await Get("ecommerce/admin/order-report/", params, false)) as any;
      if (reqId !== reqIdRef.current) return;

      const body = res?.data ?? res;
      if (body?.success) {
        setData(body.data || []);
        setPagination(body.pagination || null);
      } else {
        setData([]);
        setPagination(null);
      }
    } catch (error: any) {
      if (reqId !== reqIdRef.current) return;
      toasterrormsg(error?.response?.data?.message || "Failed to load order report");
      setData([]);
      setPagination(null);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  }, [applied, paginationState.pageIndex, paginationState.pageSize]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ── Filter handlers ────────────────────────────────────────────────────
  const handleDateChange = (key: "dateFrom" | "dateTo", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setApplied((prev) => ({ ...prev, [key]: value }));
    resetToFirstPage();
  };

  const handleFilterChange = (key: "search" | "status", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setApplied({ ...filters }); // new object => always triggers a fetch
    resetToFirstPage();
  };

  const handleResetFilters = () => {
    const fresh = defaultFilters();
    setFilters(fresh);
    setApplied(fresh);
    resetToFirstPage();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleApplyFilters();
  };

  // ── Totals (current page, same as old software) ────────────────────────
  const totals = useMemo(
    () =>
      data.reduce(
        (acc, row) => ({
          order_amount: acc.order_amount + (row.order_amount || 0),
          platform_charge: acc.platform_charge + (row.platform_charge || 0),
          received_amount: acc.received_amount + (row.received_amount || 0),
        }),
        { order_amount: 0, platform_charge: 0, received_amount: 0 },
      ),
    [data],
  );

  // ── Exports (current page) ─────────────────────────────────────────────
  const handleExportCSV = () => {
    if (data.length === 0) {
      toasterrormsg("No data available to export");
      return;
    }

    const headers = [
      "SR", "Order ID", "Order Time", "Order Status", "Vendor", "Vendor Email",
      "Customer Name", "Mobile", "City", "Email", "Payment Mode",
      "Order Amount", "Platform Charge", "Received Amount", "Order Age (Days)",
    ];

    const rows = data.map((r) => [
      r.sr_no, r.order_number, formatDateTime(r.order_time), r.order_status,
      r.vendor_name, r.vendor_email, r.customer_name, r.customer_phone,
      r.customer_city || "", r.customer_email || "", r.payment_mode,
      r.order_amount, r.platform_charge, r.received_amount, r.order_age_days,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all_vendors_order_report_${applied.dateFrom}_to_${applied.dateTo}_page${paginationState.pageIndex + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toastsuccessmsg("CSV exported successfully!");
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      toasterrormsg("No data available to export");
      return;
    }

    const printContent = `
      <html>
        <head><title>Order Report</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #f3f4f6; padding: 6px; border: 1px solid #ddd; text-align: left; }
          td { padding: 5px; border: 1px solid #ddd; }
          h1 { text-align: center; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .box { background: #f9fafb; padding: 10px; border-radius: 4px; flex: 1; }
          tfoot td { background: #f9fafb; font-weight: bold; }
        </style>
        </head>
        <body>
          <h1>All Vendors Order Report</h1>
          <p>Date Range: ${escapeHtml(applied.dateFrom)} to ${escapeHtml(applied.dateTo)} (page ${paginationState.pageIndex + 1})</p>
          <div class="summary">
            <div class="box"><strong>Total Orders:</strong> ${pagination?.count ?? data.length}</div>
            <div class="box"><strong>Amount (page):</strong> ${escapeHtml(formatCurrency(totals.order_amount))}</div>
            <div class="box"><strong>Received (page):</strong> ${escapeHtml(formatCurrency(totals.received_amount))}</div>
          </div>
          <table>
            <thead><tr>
              <th>SR</th><th>Order ID</th><th>Time</th><th>Status</th>
              <th>Vendor</th><th>Customer</th><th>Mobile</th><th>City</th><th>Payment</th>
              <th>Amount</th><th>Charge</th><th>Received</th><th>Age</th>
            </tr></thead>
            <tbody>
              ${data.map((row) => `
                <tr>
                  <td>${escapeHtml(row.sr_no)}</td>
                  <td>${escapeHtml(row.order_number)}</td>
                  <td>${escapeHtml(formatDateTime(row.order_time))}</td>
                  <td>${escapeHtml(row.order_status)}</td>
                  <td>${escapeHtml(row.vendor_name)}<br/><small>${escapeHtml(row.vendor_email)}</small></td>
                  <td>${escapeHtml(row.customer_name)}</td>
                  <td>${escapeHtml(row.customer_phone)}</td>
                  <td>${escapeHtml(row.customer_city || "-")}</td>
                  <td>${row.payment_mode === "razorpay" ? "Online" : "COD"}</td>
                  <td>${escapeHtml(formatCurrency(row.order_amount))}</td>
                  <td>-${escapeHtml(formatCurrency(row.platform_charge))}</td>
                  <td>${escapeHtml(formatCurrency(row.received_amount))}</td>
                  <td>${escapeHtml(orderAgeLabel(row.order_age_days))}</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="9" style="text-align:right">Page Total:</td>
                <td>${escapeHtml(formatCurrency(totals.order_amount))}</td>
                <td>-${escapeHtml(formatCurrency(totals.platform_charge))}</td>
                <td>${escapeHtml(formatCurrency(totals.received_amount))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.focus();
      win.print();
    } else {
      toasterrormsg("Please allow popups for PDF export");
    }
  };

  // ── Table ──────────────────────────────────────────────────────────────
  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination: paginationState },
    onSortingChange: setSorting,
    onPaginationChange: setPaginationState,
    manualPagination: true,
    autoResetPageIndex: false,
    pageCount: pagination?.total_pages ?? 1,
    getRowId: (row) => `${row.order_id}-${row.vendor_id}`,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // NOTE: plain JSX (not inner components). An inner `const FilterPanel = () => ...`
  // is a new component type on every render, so inputs remount and lose focus.
  const filterPanel = (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Start Date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleDateChange("dateFrom", e.target.value)}
          max={filters.dateTo}
          className="w-full"
        />
        <Input
          label="End Date"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleDateChange("dateTo", e.target.value)}
          min={filters.dateFrom}
          max={today}
          className="w-full"
        />
        <Input
          label="Search"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Vendor, vendor email, order ID, customer name/phone/email..."
          className="w-full"
        />
        <Listbox
          label="Order Status"
          data={statusOptions}
          value={statusOptions.find((s) => s.id === filters.status) || statusOptions[0]}
          onChange={(item: { id: string }) => handleFilterChange("status", item.id)}
          displayField="label"
          placeholder="All Statuses"
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outlined" onClick={handleResetFilters}>Reset</Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );

  const summaryCards = (
    <div className="mt-5 grid gap-4 px-(--margin-x) pt-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Orders (All Pages)"
        value={pagination?.count ?? 0}
        accent="primary"
      />
      <StatCard
        title="Order Amount (This Page)"
        value={formatCurrency(totals.order_amount)}
        accent="info"
      />
      <StatCard
        title="Platform Charge (This Page)"
        value={`-${formatCurrency(totals.platform_charge)}`}
        accent="error"
      />
      <StatCard
        title="Received Amount (This Page)"
        value={formatCurrency(totals.received_amount)}
        accent="success"
      />
    </div>
  );

  return (
    <Page title="All Vendors Order Report">
      <div className="w-full max-w-full overflow-hidden pb-5">
        <MasterToolbar
          title="All Vendors — Order Report"
          searchPlaceholder="Search this page..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={handleExportCSV}
          onExportPdf={handleExportPDF}
          filterPanel={filterPanel}
        />

        {summaryCards}

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading orders..." : "No orders found for this date range."
          }
        />
      </div>
    </Page>
  );
}