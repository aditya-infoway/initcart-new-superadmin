// Import Dependencies
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  HomeModernIcon,
  StarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

// Local Imports
import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input, Button, Card } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { getRealEstateColumns } from "./columns";
import { mapApiToProperty, RealEstateProperty } from "./data";

// ----------------------------------------------------------------------

const LIST_API = "services/real-estate/admin/properties/";

const STATUS_OPTIONS = [
  { id: "all", label: "All Status" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const TRANSACTION_OPTIONS = [
  { id: "all", label: "All Transactions" },
  { id: "sale", label: "Sale" },
  { id: "rent", label: "Rent" },
];

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "error" | "info";
}) {
  const iconWrapperCls = {
    primary: "bg-primary/10 dark:bg-primary/15",
    success: "bg-success/10 dark:bg-success/15",
    warning: "bg-warning/10 dark:bg-warning/15",
    error:   "bg-error/10 dark:bg-error/15",
    info:    "bg-info/10 dark:bg-info/15",
  }[color];

  const iconCls = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error:   "text-error",
    info:    "text-info",
  }[color];

  const borderCls = {
    primary: "border-t-primary",
    success: "border-t-success",
    warning: "border-t-warning",
    error:   "border-t-error",
    info:    "border-t-info",
  }[color];

  return (
    <Card className={`overflow-hidden border-t-4 ${borderCls} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400">
            {label}
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconWrapperCls}`}>
          <Icon className={`size-6 ${iconCls}`} />
        </div>
      </div>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function RealEstateListPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTransaction, setFilterTransaction] = useState("all");
  const [filterPropertyType, setFilterPropertyType] = useState("all");
  const [subcategories, setSubcategories] = useState<
    { id: string; label: string }[]
  >([{ id: "all", label: "All Types" }]);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await Get(LIST_API, {}, false)) as any;
      const body = res?.data ?? res;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.results)
          ? body.results
          : [];
      setData(rows.map(mapApiToProperty));
    } catch {
      toasterrormsg("Failed to fetch real estate properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch subcategories for property type filter ──
  const fetchSubcategories = useCallback(async () => {
    try {
      const res = (await Get(
        "services/service-subcategories/active_by_service/",
        { service: "Real-Estate" },
        false,
      )) as any;
      const body = res?.data ?? res;
      const results: any[] = Array.isArray(body?.results)
        ? body.results
        : Array.isArray(body)
          ? body
          : [];
      setSubcategories([
        { id: "all", label: "All Types" },
        ...results.map((s: any) => ({
          id: s.id,
          label:
            s.subcategory_name.charAt(0).toUpperCase() +
            s.subcategory_name.slice(1),
        })),
      ]);
    } catch {
      // silently fail — filter just shows All Types
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSubcategories();
  }, [fetchData, fetchSubcategories]);

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total: data.length,
      pending: data.filter((d) => d.status === "pending").length,
      approved: data.filter((d) => d.status === "approved").length,
      rejected: data.filter((d) => d.status === "rejected").length,
      featured: data.filter((d) => d.is_featured).length,
    }),
    [data],
  );

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    return data.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterTransaction !== "all" && p.transaction_type !== filterTransaction)
        return false;
      if (filterPropertyType !== "all" && p.property_type !== filterPropertyType)
        return false;
      return true;
    });
  }, [data, filterStatus, filterTransaction, filterPropertyType]);

  // ── Navigate to detail ──
  const onView = useCallback(
    (property: RealEstateProperty) => {
      navigate(
        `/service-approvals/real-estate/detail/real-estate/property/${property.id}`,
      );
    },
    [navigate],
  );

  // ── Table ──
  const columns = getRealEstateColumns(onView);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    getRowId: (row) => String(row.id),
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Page title="Real Estate Properties">
      <div className="transition-content w-full pb-8">

        {/* ── Top bar ── */}
        <div className="px-(--margin-x) pb-5 pt-6">
          {/* Back */}
          <Button
            variant="outlined"
            className="mb-5 gap-2"
            onClick={() =>
              navigate("/service-approvals/approval-requests")
            }
          >
            <ArrowLeftIcon className="size-4" />
            Back to Service Categories
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Real Estate Properties
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                Manage and approve property listings from vendors
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outlined"
                color="warning"
                className="gap-2 text-sm"
                onClick={() => setFilterStatus("pending")}
              >
                <ClockIcon className="size-4" />
                Pending ({stats.pending})
              </Button>
              <Button
                variant="outlined"
                className="gap-2 text-sm"
                onClick={fetchData}
              >
                <ArrowPathIcon className="size-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="px-(--margin-x) pb-6">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Total Properties"
              value={stats.total}
              icon={HomeModernIcon}
              color="primary"
            />
            <StatCard
              label="Pending Approval"
              value={stats.pending}
              icon={ClockIcon}
              color="warning"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={CheckCircleIcon}
              color="success"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={XCircleIcon}
              color="error"
            />
            <StatCard
              label="Featured"
              value={stats.featured}
              icon={StarIcon}
              color="info"
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="px-(--margin-x) pb-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-500 dark:bg-dark-700">
            <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100">
              Filter Properties
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </p>
                <Listbox
                  data={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((o) => o.id === filterStatus) ||
                    STATUS_OPTIONS[0]
                  }
                  onChange={(item: any) =>
                    setFilterStatus(item?.id ?? "all")
                  }
                  displayField="label"
                  placeholder="All Status"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Property Type
                </p>
                <Listbox
                  data={subcategories}
                  value={
                    subcategories.find(
                      (o) => o.id === filterPropertyType,
                    ) || subcategories[0]
                  }
                  onChange={(item: any) =>
                    setFilterPropertyType(item?.id ?? "all")
                  }
                  displayField="label"
                  placeholder="All Types"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Transaction Type
                </p>
                <Listbox
                  data={TRANSACTION_OPTIONS}
                  value={
                    TRANSACTION_OPTIONS.find(
                      (o) => o.id === filterTransaction,
                    ) || TRANSACTION_OPTIONS[0]
                  }
                  onChange={(item: any) =>
                    setFilterTransaction(item?.id ?? "all")
                  }
                  displayField="label"
                  placeholder="All Transactions"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Search
                </p>
                <Input
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search by title, city, or vendor..."
                  classNames={{ input: "h-[38px] text-sm" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Table header ── */}
        <div className="px-(--margin-x) pb-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-dark-100">
            Properties ({filteredData.length})
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-400">
            Showing {filteredData.length} of {data.length} properties
          </p>
        </div>

        {/* ── Table ── */}
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading properties..." : "No properties found."
          }
        />

        {/* ── Footer ── */}
        <div className="px-(--margin-x) pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-dark-400">
          <span>Total {data.length} properties found</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-success" />
              Approved: {stats.approved}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-warning" />
              Pending: {stats.pending}
            </span>
            <span>Last updated: {timeStr}</span>
          </span>
        </div>
      </div>
    </Page>
  );
}
