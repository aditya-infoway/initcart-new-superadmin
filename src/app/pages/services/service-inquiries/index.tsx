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
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { exportToExcel, exportToPdf } from "@/app/pages/master/shared/export";
import { Button, Input } from "@/components/ui";
import {
  Get,
  toasterrormsg,
} from "@/ApiHelper";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { columns, exportColumns } from "./columns";
import { InquiryViewModal } from "./InquiryViewModal";
import { ServiceInquiry, serviceOptions } from "./data";

interface ApiServiceInquiry {
  id?: string;
  inquiry_id?: string;
  serial_no?: number;
  sr_no?: number;
  business_name?: string;
  businessName?: string;
  vendor_name?: string;
  vendorName?: string;
  service_name?: string;
  serviceName?: string;
  service_category?: string;
  serviceCategory?: string;
  customer_name?: string;
  customerName?: string;
  user_name?: string;
  phone?: string;
  phone_number?: string;
  number?: string;
  email?: string;
  customer_email?: string;
  city?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  create_date?: string;
  create_time?: string;
  date?: string;
  time?: string;
}

const formatDateDisplay = (iso: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
};

const formatTimeDisplay = (iso: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-GB", { hour12: false });
  } catch {
    return "";
  }
};

const mapToServiceInquiry = (
  item: ApiServiceInquiry,
  index: number
): ServiceInquiry => {
  const date =
    item.date || item.create_date ||
    formatDateDisplay(item.createdAt || item.created_at || "");
  const time =
    item.time || item.create_time ||
    formatTimeDisplay(item.createdAt || item.created_at || "");
  const createdAt =
    item.createdAt || item.created_at ||
    (date && time ? `${date}T${time}` : date);
  return {
    id: String(item.inquiry_id || item.id || ""),
    serialNo: item.sr_no || item.serial_no || index + 1,
    businessName:
      item.businessName || item.business_name || item.vendor_name || item.vendorName || "",
    vendorName:
      item.vendorName || item.vendor_name || item.business_name || item.businessName || "",
    serviceName: item.serviceName || item.service_name || "",
    serviceCategory: item.serviceCategory || item.service_category || "",
    customerName:
      item.customerName || item.customer_name || item.user_name || "",
    phone: item.phone || item.phone_number || item.number || "",
    email: item.email || item.customer_email || "",
    city: item.city || "",
    message: item.message || "",
    createdAt,
    date,
    time,
  };
};

export default function ServiceInquiriesPage() {
  const [data, setData] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterService, setFilterService] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<ServiceInquiry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "services/admin/inquiries/super_admin_list";

  const fetchList = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const response = await Get(API_BASE + "/", {}, false);
      const body = (response as any)?.data;
      let raw: unknown =
        body?.results || body?.data || (Array.isArray(body) ? body : null);
      if (!Array.isArray(raw) && Array.isArray(response)) {
        raw = response;
      }
      if (!Array.isArray(raw)) raw = [];
      const list = (raw as ApiServiceInquiry[]).map((it, i) =>
        mapToServiceInquiry(it, i)
      );
      setData(list);
    } catch (err) {
      if (!quiet) toasterrormsg("Failed to load service inquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => d.city && set.add(d.city));
    return Array.from(set)
      .sort()
      .map((c) => ({ id: c, label: c }));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterService &&
        !(
          item.serviceName
            .toLowerCase()
            .includes(filterService.toLowerCase()) ||
          item.serviceCategory
            .toLowerCase()
            .includes(filterService.toLowerCase())
        )
      )
        return false;
      if (
        filterCustomer &&
        !item.customerName
          .toLowerCase()
          .includes(filterCustomer.toLowerCase())
      )
        return false;
      if (filterCity && item.city !== filterCity) return false;
      return true;
    });
  }, [data, filterService, filterCustomer, filterCity]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id || String(row.serialNo),
    meta: {
      openViewModal: (row: ServiceInquiry) => {
        setViewing(row);
        setViewOpen(true);
      },
    },
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

  return (
    <Page title="Service Inquiries">
      <div className="transition-content w-full pb-5">
        <div className="table-toolbar px-(--margin-x) pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
                Service Inquiries
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                Showing {filteredData.length} inquiries
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outlined"
                className="h-9 gap-2 rounded-md px-3 text-sm"
                onClick={() => setShowFilters((v) => !v)}
              >
                <FunnelIcon
                  className={clsx(
                    "size-4",
                    showFilters && "text-primary-600",
                  )}
                />
                <span>Filters</span>
              </Button>
              <Button
                variant="outlined"
                className="h-9 gap-2 rounded-md px-3 text-sm"
                onClick={() =>
                  exportToExcel(filteredData, exportColumns, "service-inquiries")
                }
              >
                <ArrowDownTrayIcon className="size-4 text-success-600" />
                <span>Export</span>
              </Button>
              <Button
                variant="outlined"
                className="h-9 gap-2 rounded-md px-3 text-sm hidden sm:inline-flex"
                onClick={() =>
                  exportToPdf(
                    filteredData,
                    exportColumns,
                    "Service Inquiries",
                    "service-inquiries",
                  )
                }
              >
                <DocumentArrowDownIcon className="size-4 text-error-600" />
                <span>PDF</span>
              </Button>
              <Button
                variant="outlined"
                className="h-9 gap-2 rounded-md px-3 text-sm"
                disabled={refreshing || loading}
                onClick={() => {
                  setRefreshing(true);
                  fetchList(true);
                }}
              >
                <ArrowPathIcon
                  className={clsx(
                    "size-4",
                    (refreshing || loading) && "animate-spin",
                  )}
                />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 max-w-sm">
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              prefix={<MagnifyingGlassIcon className="size-4" />}
              classNames={{
                input: "ring-primary-500/50 h-9 text-sm focus:ring-3",
              }}
              placeholder="Search inquiries..."
            />
          </div>

          {showFilters ? (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-600">
              <div className="grid gap-4 sm:grid-cols-3">
                <Listbox
                  data={[
                    { id: "", label: "All Services" },
                    ...serviceOptions,
                  ]}
                  value={
                    [{ id: "", label: "All Services" }, ...serviceOptions].find(
                      (o) => o.id === filterService,
                    ) || { id: "", label: "All Services" }
                  }
                  onChange={(item) => setFilterService(item.id)}
                  label="Service"
                  placeholder="All services"
                  displayField="label"
                />
                <Input
                  label="Customer"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  placeholder="Filter by customer name"
                />
                <Listbox
                  data={[{ id: "", label: "All Cities" }, ...cityOptions]}
                  value={
                    [{ id: "", label: "All Cities" }, ...cityOptions].find(
                      (o) => o.id === filterCity,
                    ) || { id: "", label: "All Cities" }
                  }
                  onChange={(item) => setFilterCity(item.id)}
                  label="City"
                  placeholder="All cities"
                  displayField="label"
                />
              </div>
            </div>
          ) : null}
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading..."
              : "No service inquiries found."
          }
        />
      </div>

      <InquiryViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        inquiry={viewing}
      />
    </Page>
  );
}
