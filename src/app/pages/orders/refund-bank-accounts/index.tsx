import { ArrowLeftIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import { Delete, Get, Patch, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { ConfirmModal, type ConfirmMessages } from "@/components/shared/ConfirmModal";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input } from "@/components/ui";
import { MasterServerTable } from "@/components/shared/MasterServerTable";
import { useNavigate } from "react-router";
import {
  apiError, EMPTY_PAGINATION, formatCurrency, PaginationInfo, REFUND_ROUTES,
} from "../../master/shared/refundUtils";
import { AccountDrawer } from "./AccountDrawer";
import { getColumns } from "./columns";
import { LedgerModal } from "./LedgerModal";
import {
  Account, AccountFormValues, AccountStats, BASE, EMPTY_ACCOUNT_STATS,
} from "./types";

export default function RefundBankAccountsPage() {
    const navigate = useNavigate(); 
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AccountStats>(EMPTY_ACCOUNT_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerId, setLedgerId] = useState<number | null>(null);

  // delete confirm
  const [deleteItem, setDeleteItem] = useState<Account | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const requestId = useRef(0);

  const fetchAccounts = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      try {
        const params: Record<string, unknown> = { page, page_size: pageSize };
        if (search) params.search = search;
        const r = await Get(BASE, params, false);
        if (id !== requestId.current) return;
        if (r.data.success) {
          setAccounts(r.data.data);
          setPagination(r.data.pagination);
          setStats(r.data.stats || EMPTY_ACCOUNT_STATS);
        }
      } catch (e: any) {
        if (id !== requestId.current) return;
        toasterrormsg(apiError(e, "Failed to load bank accounts"));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [page, pageSize, search],
  );

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ---------------- handlers ---------------- */

  const handleSave = async (values: AccountFormValues, id?: number) => {
    const payload = {
      ...values,
      account_number: values.account_number.replace(/\s/g, ""),
      ifsc_code: values.ifsc_code.trim().toUpperCase(),
      opening_balance: Number(values.opening_balance).toFixed(2),
    };
    try {
      const r = id ? await Patch(`${BASE}${id}/`, payload, false) : await Post(BASE, payload, false);
      if (r.data.success) {
        toastsuccessmsg(r.data.message || (id ? "Account updated." : "Account created."));
        fetchAccounts(true);
      }
    } catch (error: any) {
      if (!error?.response?.data?.errors) toasterrormsg(apiError(error, "Failed to save"));
      throw error; // drawer stays open and shows field errors
    }
  };

  const handleToggle = async (a: Account) => {
    try {
      await Patch(`${BASE}${a.id}/`, { is_active: !a.is_active }, false);
      toastsuccessmsg(a.is_active ? "Account deactivated." : "Account activated.");
      fetchAccounts(true);
    } catch (e: any) {
      toasterrormsg(apiError(e, "Failed to update"));
    }
  };

  const openDelete = (a: Account) => {
    setDeleteItem(a);
    setDeleteSuccess(false);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const r = await Delete(`${BASE}${deleteItem.id}/`, {}, false);
      if (r.data.success) {
        setDeleteSuccess(true);
        fetchAccounts(true);
      }
    } catch (e: any) {
      setDeleteOpen(false);
      toasterrormsg(apiError(e, "Cannot delete this account"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteMessages: ConfirmMessages = {
    pending: {
      description: `Are you sure you want to delete "${deleteItem?.account_name ?? ""}"? Once deleted, it cannot be restored.`,
    },
    success: { title: "Bank Account Deleted" },
  };

  /* ---------------- table ---------------- */

  const columns = getColumns({
    onLedger: (a) => { setLedgerId(a.id); setLedgerOpen(true); },
    onEdit: (a) => { setEditing(a); setDrawerOpen(true); },
    onToggle: handleToggle,
    onDelete: openDelete,
  });

  const paginationState: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data: accounts,
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

  const statCards = [
    { label: "Accounts", value: String(stats.total), color: "text-gray-800 dark:text-dark-50" },
    { label: "Active", value: String(stats.active), color: "text-success" },
    { label: "Inactive", value: String(stats.inactive), color: "text-gray-500 dark:text-dark-300" },
    { label: "Total Refunded", value: formatCurrency(stats.total_paid), color: "text-primary-600 dark:text-primary-300" },
  ];

  return (
    <Page title="Refund Bank Accounts">
      <div className="transition-content w-full space-y-5 pb-5">
        {/* Header */}
        <div className="px-(--margin-x) pt-5">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Button variant="soft" className="h-9 gap-1.5 rounded-lg px-3 text-sm" onClick={() => window.history.back()}>
                <ArrowLeftIcon className="size-4" /> Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">Refund Bank Accounts</h1>
            </div>
            <div className="flex flex-wrap gap-2">
<Button variant="soft" className="h-9 rounded-lg px-3 text-sm" onClick={() => navigate(REFUND_ROUTES.codRefunds)}>
  COD Refunds
</Button>
              <Button color="primary" className="h-9 gap-1.5 rounded-lg px-3 text-sm" onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                <PlusIcon className="size-4" /> Add Bank Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-(--margin-x) md:grid-cols-4">
          {statCards.map((c) => (
            <Card key={c.label} className="p-4">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-dark-300">{c.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{c.value}</p>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="px-(--margin-x)">
          <div className="w-full md:w-96">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by account name, bank, account number…"
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
            emptyMessage={loading ? "Loading bank accounts..." : search ? "No bank accounts match your search." : "No bank accounts yet. Click Add Bank Account."}
          />
        </div>
      </div>

      <AccountDrawer isOpen={drawerOpen} close={() => setDrawerOpen(false)} account={editing} onSave={handleSave} />
      <LedgerModal isOpen={ledgerOpen} close={() => setLedgerOpen(false)} accountId={ledgerId} />
      <ConfirmModal
        show={deleteOpen}
        onClose={closeDelete}
        messages={deleteMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={deleteSuccess ? "success" : "pending"}
      />
    </Page>
  );
}