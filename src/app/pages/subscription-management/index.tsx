import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Delete, Get, Patch, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { MasterTable } from "../master/shared/MasterTable";
import { MasterToolbar } from "../master/shared/MasterToolbar";
import { getColumns } from "./columns";
import {
  buildSubscriptionPayload,
  createSubscriptionStats,
  formatCurrency,
  mapApiSubscriptionPlan,
  SubscriptionFormValues,
  SubscriptionPlan,
} from "./data";
import { SubscriptionDrawer } from "./SubscriptionDrawer";

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
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
      </div>
    </div>
  );
}

export default function SubscriptionManagementPage() {
  const [data, setData] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/subscriptions/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiSubscriptionPlan));
    } catch {
      toasterrormsg("Something went wrong while fetching subscriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => createSubscriptionStats(data), [data]);

  const handleSave = async (values: SubscriptionFormValues, planId?: string) => {
    const payload = buildSubscriptionPayload(values);
    try {
      if (planId) {
        await Put(`ecommerce/subscriptions/${planId}/`, payload, false);
        toastsuccessmsg("Subscription updated successfully.");
      } else {
        await Post("ecommerce/subscriptions/", payload, false);
        toastsuccessmsg("Subscription created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while saving subscription.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    try {
      await Delete(`ecommerce/subscriptions/${plan.id}/`, {}, false);
      toastsuccessmsg("Subscription deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== plan.id));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while deleting subscription.";
      toasterrormsg(message);
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlan, checked: boolean) => {
    try {
      await Patch(`ecommerce/subscriptions/${plan.id}/`, { is_active: checked }, false);
      setData((prev) => prev.map((item) => (item.id === plan.id ? { ...item, isActive: checked } : item)));
      toastsuccessmsg(`Subscription ${checked ? "activated" : "deactivated"} successfully.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Failed to update subscription status.";
      toasterrormsg(message);
    }
  };

  const columns = getColumns({
    onEdit: (row) => {
      setEditing(row);
      setDrawerOpen(true);
    },
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const serviceTypeOptions = useMemo(
    () => Array.from(new Set(data.map((item) => item.serviceType).filter(Boolean))).map((label) => ({ id: label, label })),
    [data],
  );

  const subscriptionTypeOptions = useMemo(
    () => Array.from(new Set(data.map((item) => item.subscriptionType).filter(Boolean))).map((label) => ({ id: label, label })),
    [data],
  );

  return (
    <Page title="Subscription Management">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
              Subscription Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              Create and manage subscription plans for different service types
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Subscriptions" value={stats.totalSubscriptions} accent="primary" />
            <StatCard title="Active Plans" value={stats.activePlans} accent="success" />
            <StatCard title="Service Types" value={stats.serviceTypes} accent="info" />
            <StatCard title="Avg. Amount" value={formatCurrency(stats.averageAmount)} accent="warning" />
          </div>
        </div>

        <MasterToolbar
          title="Subscription Plans"
          createLabel="Add New Subscription"
          searchPlaceholder="Search subscriptions..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading subscriptions..." : "No subscription plans found."}
        />
      </div>

      <SubscriptionDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        plan={editing}
        serviceTypeOptions={serviceTypeOptions}
        subscriptionTypeOptions={subscriptionTypeOptions}
        onSave={handleSave}
      />
    </Page>
  );
}
