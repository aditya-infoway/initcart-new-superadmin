// pages/ecommerce/admin/reports/AllVendorsOrderReport.tsx

import { useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FaFileDownload } from "react-icons/fa";

import { Get, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/master/shared/MasterToolbar";

import { getColumns } from "./columns";
import {
  AdminOrderReportRow,
  formatCurrency,
  formatDateTime,
} from "./data";

const statusOptions = [
  { id: '', label: 'All Statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunded', label: 'Refunded' },
];

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
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 180);
  const dateFrom = fromDate.toISOString().split('T')[0];
  
  const [filters, setFilters] = useState({
    dateFrom: dateFrom,
    dateTo: today,
    search: '',
    status: '',
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        page: 1,
        page_size: 9999,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const response = await Get("ecommerce/admin/order-report/", params, false);
      
      if (response.data?.success) {
        setData(response.data.data || []);
      } else {
        setData([]);
      }
    } catch (error: any) {
      toasterrormsg(error?.response?.data?.message || "Failed to load order report");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.dateFrom, filters.dateTo]);

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: dateFrom,
      dateTo: today,
      search: '',
      status: '',
    });
    setTimeout(fetchReport, 100);
  };

  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({
        order_amount: acc.order_amount + row.order_amount,
        platform_charge: acc.platform_charge + row.platform_charge,
        received_amount: acc.received_amount + row.received_amount,
      }),
      { order_amount: 0, platform_charge: 0, received_amount: 0 }
    );
  }, [data]);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toasterrormsg("No data available to export");
      return;
    }

    const headers = [
      "SR No,Order ID,Order Time,Order Status,Vendor,Vendor Email,Customer,Mobile,Payment Mode,Order Amount,Platform Charge,Received Amount,Order Age"
    ];

    const csvRows = data.map((row) => [
      row.sr_no,
      row.order_number,
      row.order_time,
      row.order_status,
      row.vendor_name,
      row.vendor_email,
      row.customer_name,
      row.customer_phone,
      row.payment_mode,
      row.order_amount,
      row.platform_charge,
      row.received_amount,
      row.order_age_days,
    ].join(','));

    const csvContent = [...headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `order_report_${filters.dateFrom}_to_${filters.dateTo}.csv`;
    link.click();
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
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 8px; border: 1px solid #ddd; text-align: left; }
          td { padding: 6px; border: 1px solid #ddd; }
          h1 { text-align: center; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .box { background: #f9fafb; padding: 10px; border-radius: 4px; flex: 1; }
        </style>
        </head>
        <body>
          <h1>All Vendors Order Report</h1>
          <p>Date Range: ${filters.dateFrom} to ${filters.dateTo}</p>
          <div class="summary">
            <div class="box"><strong>Total Orders:</strong> ${data.length}</div>
            <div class="box"><strong>Total Amount:</strong> ${formatCurrency(totals.order_amount)}</div>
            <div class="box"><strong>Total Received:</strong> ${formatCurrency(totals.received_amount)}</div>
          </div>
          <table>
            <thead><tr>
              <th>SR</th><th>Order ID</th><th>Time</th><th>Status</th>
              <th>Vendor</th><th>Customer</th><th>Payment</th>
              <th>Amount</th><th>Charge</th><th>Received</th><th>Age</th>
            </tr></thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${row.sr_no}</td>
                  <td>${row.order_number}</td>
                  <td>${formatDateTime(row.order_time)}</td>
                  <td>${row.order_status}</td>
                  <td>${row.vendor_name}</td>
                  <td>${row.customer_name}</td>
                  <td>${row.payment_mode === 'razorpay' ? 'Online' : 'COD'}</td>
                  <td>${formatCurrency(row.order_amount)}</td>
                  <td>-${formatCurrency(row.platform_charge)}</td>
                  <td>${formatCurrency(row.received_amount)}</td>
                  <td>${row.order_age_days} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    } else {
      toasterrormsg("Please allow popups for PDF export");
    }
  };

  const columns = getColumns();

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const FilterPanel = () => (
    <div className="w-full space-y-4 overflow-hidden">
     <div className="grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          max={filters.dateTo}
          className="w-full"
        />
        <Input
          label="End Date"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          min={filters.dateFrom}
          max={today}
          className="w-full"
        />
        <Input
          label="Search"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search orders, vendors..."
          className="w-full"
        />
        <Listbox
          label="Order Status"
          data={statusOptions}
          value={statusOptions.find((s) => s.id === filters.status) || statusOptions[0]}
          onChange={(item) => handleFilterChange('status', item.id)}
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

const SummaryCards = () => (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 px-(--margin-x) pt-4 xl:grid-cols-4">

        <StatCard
            title="Total Orders"
            value={data.length}
            accent="primary"
        />

        <StatCard
            title="Order Amount"
            value={formatCurrency(totals.order_amount)}
            accent="info"
        />

        <StatCard
            title="Platform Charge"
            value={formatCurrency(totals.platform_charge)}
            accent="error"
        />

        <StatCard
            title="Received Amount"
            value={formatCurrency(totals.received_amount)}
            accent="success"
        />

    </div>
);

  return (
<Page title="All Vendors Order Report">
  <div className="w-full max-w-full overflow-hidden pb-5">
        <MasterToolbar
          title="Order Report"
          searchPlaceholder="Search orders, vendors..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={handleExportCSV}
          onExportPdf={handleExportPDF}
          filterPanel={<FilterPanel />}
        />

        <SummaryCards />


          <MasterTable
            table={table}
            columnCount={columns.length}
            emptyMessage={loading ? "Loading orders..." : "No orders found for the selected date range."}
          />

      </div>
    </Page>
  );
}