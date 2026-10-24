import { ArrowLeftIcon, ArrowPathIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input } from "@/components/ui";
import { MasterServerTable } from "@/components/shared/MasterServerTable";
import {
  apiError, EMPTY_PAGINATION, formatCurrency, PaginationInfo, REFUND_ROUTES,
} from "../../master/shared/refundUtils";
import { getColumns } from "./columns";
import { PayRefundDrawer } from "./PayRefundDrawer";
import { PaymentInfoModal } from "./PaymentInfoModal";
import { CodRefundItem, CodStats, EMPTY_COD_STATS, LIST_URL } from "./types";

export default function AdminCodRefundsPage() {
    const navigate = useNavigate();
  const [refunds, setRefunds] = useState<CodRefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState<CodStats>(EMPTY_COD_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [payOpen, setPayOpen] = useState(false);
  const [preselectId, setPreselectId] = useState("");
  const [viewItem, setViewItem] = useState<CodRefundItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const requestId = useRef(0);

  const fetchRefunds = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const params: Record<string, unknown> = { type: "cod", status: activeTab, page, page_size: pageSize };
        if (search) params.search = search;
        const r = await Get(LIST_URL, params, false);
        if (id !== requestId.current) return;
        if (r.data.success) {
          setRefunds(r.data.data);
          setPagination(r.data.pagination);
          setStats({ ...EMPTY_COD_STATS, ...(r.data.stats || {}) });
        }
      } catch (e: any) {
        if (id !== requestId.current) return;
        toasterrormsg(apiError(e, "Failed to fetch COD refunds"));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [activeTab, page, pageSize, search],
  );

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const changeTab = (key: string) => { setActiveTab(key); setPage(1); };

  const openPay = (item?: CodRefundItem) => {
    setPreselectId(item ? String(item.id) : "");
    setPayOpen(true);
  };

  const columns = getColumns({
    onPay: openPay,
    onView: (item) => { setViewItem(item); setViewOpen(true); },
  });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: refunds,
    columns,
    state: { pagination: paginationState },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(paginationState) : updater;
      if (next.pageSize !== pageSize) { setPageSize(next.pageSize); setPage(1); }
      else setPage(next.pageIndex + 1);
    },
    manualPagination: true,
    pageCount: pagination.total_pages,
    getCoreRowModel: getCoreRowModel(),
  });

  const TABS = [
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "processed", label: "Paid", count: stats.processed },
    { key: "all", label: "All", count: stats.total },
  ];

  const statCards = [
    { label: "Total COD Refunds", value: stats.total, sub: stats.total_amount, color: "text-gray-800 dark:text-dark-50" },
    { label: "Pending", value: stats.pending, sub: stats.pending_amount, color: "text-warning" },
    { label: "Paid", value: stats.processed, sub: stats.processed_amount, color: "text-success" },
  ];

  return (
    <Page title="COD Refunds">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Button variant="soft" className="h-9 gap-1.5 rounded-lg px-3 text-sm" onClick={() => window.history.back()}>
                <ArrowLeftIcon className="size-4" /> Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                COD Refunds (Pay to Customer Bank)
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
<Button variant="soft" className="h-9 rounded-lg px-3 text-sm" onClick={() => navigate(REFUND_ROUTES.bankAccounts)}>
  Refund Bank Accounts
</Button>
              <Button color="primary" variant="soft" className="h-9 gap-1.5 rounded-lg px-3 text-sm" onClick={() => fetchRefunds()} disabled={loading}>
                <ArrowPathIcon className="size-4" /> Refresh
              </Button>
              <Button color="primary" className="h-9 gap-1.5 rounded-lg px-3 text-sm" onClick={() => openPay()}>
                <PlusIcon className="size-4" /> Pay COD Refund
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-(--margin-x) md:grid-cols-3">
          {statCards.map((c) => (
            <Card key={c.label} className="p-4">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-dark-300">{c.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{c.value}</p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">{formatCurrency(c.sub)}</p>
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
              placeholder="Search by Refund ID, Voucher, Order, Product, Vendor, Customer, Bank…"
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
            emptyMessage={loading ? "Loading COD refunds..." : search ? "No COD refunds match your search." : "No COD refunds found."}
          />
        </div>
      </div>

      <PayRefundDrawer
        isOpen={payOpen}
        close={() => setPayOpen(false)}
        preselectId={preselectId}
        onPaid={() => fetchRefunds(true)}
      />
      <PaymentInfoModal isOpen={viewOpen} close={() => setViewOpen(false)} item={viewItem} />
    </Page>
  );
}