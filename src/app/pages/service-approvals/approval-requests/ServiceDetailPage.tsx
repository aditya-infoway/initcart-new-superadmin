// Import Dependencies
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

// Local Imports
import { Get, Patch, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { getServiceApprovalColumns } from "./columns";
import { RejectConfirmModal } from "./RejectConfirmModal";
import { ServiceViewModal } from "./ServiceViewModal";
import RealEstateListPage from "../real-estate/RealEstateListPage";
import {
  ServiceApproval,
  ServiceStatus,
  mapApiToServiceApproval,
} from "./data";

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { id: "all", label: "All Status" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  { id: "gym", label: "Gym" },
  { id: "salon", label: "Salon" },
  { id: "restaurant", label: "Restaurant" },
  { id: "professional", label: "Professional" },
  { id: "travel_agency", label: "Travel Agency" },
  { id: "tech_industry", label: "Tech Industry" },
];

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "error";
}) {
  const borderCls = { primary: "border-t-primary", success: "border-t-success", warning: "border-t-warning", error: "border-t-error" }[color];
  const iconWrapperCls = { primary: "bg-primary/10 dark:bg-primary/15", success: "bg-success/10 dark:bg-success/15", warning: "bg-warning/10 dark:bg-warning/15", error: "bg-error/10 dark:bg-error/15" }[color];
  const iconCls = { primary: "text-primary", success: "text-success", warning: "text-warning", error: "text-error" }[color];

  return (
    <Card className={`overflow-hidden border-t-4 ${borderCls} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-dark-400">{label}</p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500 dark:text-dark-300">{sub}</p>}
        </div>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconWrapperCls}`}>
          <Icon className={`size-6 ${iconCls}`} />
        </div>
      </div>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const navigate = useNavigate();
  const { categoryGroup } = useParams<{ categoryGroup: string }>();

  const isRealEstate = categoryGroup === "real-estate";

  // Real Estate has its own dedicated page
  if (isRealEstate) return <RealEstateListPage />;

  const [data, setData] = useState<ServiceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<ServiceApproval | null>(null);

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectService, setRejectService] = useState<ServiceApproval | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    if (isRealEstate) {
      // Real Estate has no API yet — show empty
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = (await Get("gym-approval-filter/", {}, false)) as any;
      const body = res?.data ?? res;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.results)
          ? body.results
          : Array.isArray(body?.data)
            ? body.data
            : [];
      setData(rows.map(mapApiToServiceApproval));
    } catch {
      toasterrormsg("Failed to fetch service approvals.");
    } finally {
      setLoading(false);
    }
  }, [isRealEstate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total: data.length,
      approved: data.filter((d) => d.status === "approved").length,
      pending: data.filter((d) => d.status === "pending").length,
      rejected: data.filter((d) => d.status === "rejected").length,
    }),
    [data],
  );

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterCategory !== "all") {
        const cat = item.category.toLowerCase();
        const sel = filterCategory.toLowerCase();
        if (sel === "tech_industry" && (cat === "tech" || cat === "tech_industry"))
          return true;
        if (cat !== sel) return false;
      }
      return true;
    });
  }, [data, filterStatus, filterCategory]);

  // ── Actions ──
  const onView = useCallback((service: ServiceApproval) => {
    setViewing(service);
    setViewOpen(true);
  }, []);

  const rejectRow = useCallback((service: ServiceApproval) => {
    setRejectService(service);
    setRejectOpen(true);
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectService) return;
    setRejectLoading(true);
    try {
      await Patch(
        `gym-service-approve/${rejectService.id}/`,
        { status: "rejected", subcategory: rejectService.subcategory },
        false,
      );
      toastsuccessmsg("Service rejected successfully.");
      setData((prev) =>
        prev.map((s) =>
          s.uid === rejectService.uid ? { ...s, status: "rejected" } : s,
        ),
      );
      setRejectOpen(false);
      setRejectService(null);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Failed to reject service.";
      toasterrormsg(msg);
    } finally {
      setRejectLoading(false);
    }
  }, [rejectService]);

  // ── Table ──
  const columns = getServiceApprovalColumns();

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.uid,
    meta: { onView, rejectRow } as any,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageTitle = isRealEstate
    ? "Real Estate"
    : "Gym & Salon & Tech Industrial Services & Travel Agency";

  const PageIcon = isRealEstate ? HomeModernIcon : BriefcaseIcon;

  return (
    <Page title={`Service Approvals — ${pageTitle}`}>
      <div className="transition-content w-full pb-8">

        {/* ── Top bar ── */}
        <div className="px-(--margin-x) pb-5 pt-6">
          {/* Back button — uses project Button component */}
          <Button
            variant="outlined"
            className="mb-5 gap-2"
            onClick={() => navigate("/service-approvals/approval-requests")}
          >
            <ArrowLeftIcon className="size-4" />
            Back to Service Categories
          </Button>

          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
                <PageIcon className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Service Approval Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  {pageTitle}
                </p>
              </div>
            </div>
            <Button
              variant="outlined"
              className="gap-2"
              onClick={fetchData}
            >
              <ArrowPathIcon className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="px-(--margin-x) pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              sub="All categories"
              icon={BriefcaseIcon}
              color="primary"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              sub={stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% of total` : "0% of total"}
              icon={CheckCircleIcon}
              color="success"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              sub="Awaiting review"
              icon={ClockIcon}
              color="warning"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              sub="Not approved"
              icon={XCircleIcon}
              color="error"
            />
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="px-(--margin-x) pb-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-dark-100">
                Filter Services
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category filter — only shown for gym/salon/tech group */}
              {!isRealEstate && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400">
                    Category
                  </p>
                  <Listbox
                    data={CATEGORY_OPTIONS}
                    placeholder="All Categories"
                    value={
                      CATEGORY_OPTIONS.find((o) => o.id === filterCategory) ||
                      CATEGORY_OPTIONS[0]
                    }
                    onChange={(item: any) =>
                      setFilterCategory(item?.id ?? "all")
                    }
                    displayField="label"
                  />
                </div>
              )}
              {/* Status filter */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400">
                  Status
                </p>
                <Listbox
                  data={STATUS_OPTIONS}
                  placeholder="All Status"
                  value={
                    STATUS_OPTIONS.find((o) => o.id === filterStatus) ||
                    STATUS_OPTIONS[0]
                  }
                  onChange={(item: any) =>
                    setFilterStatus(
                      (item?.id as ServiceStatus | "all") ?? "all",
                    )
                  }
                  displayField="label"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="px-(--margin-x)">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-dark-100">
                {filteredData.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-dark-100">
                {data.length}
              </span>{" "}
              results
            </p>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading services..."
              : isRealEstate
                ? "Real Estate services coming soon."
                : "No services found."
          }
        />
      </div>

      {/* ── View Modal ── */}
      <ServiceViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        service={viewing}
        onReject={(s) => {
          setViewOpen(false);
          setRejectService(s);
          setRejectOpen(true);
        }}
      />

      {/* ── Reject Modal ── */}
      <RejectConfirmModal
        isOpen={rejectOpen}
        serviceName={rejectService?.businessName ?? ""}
        loading={rejectLoading}
        onConfirm={handleRejectConfirm}
        onClose={() => {
          if (!rejectLoading) {
            setRejectOpen(false);
            setRejectService(null);
          }
        }}
      />
    </Page>
  );
}
