import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Delete, Get, Patch, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { EnquirySourceDrawer as VendorDrawer } from "./CategoryDrawer";
import { VendorViewModal } from "./VendorViewModal";
import { columns, exportColumns } from "./columns";
import {
  buildVendorFormData,
  emptyVendor,
  mapApiVendorToVendor,
  productVendorTypeOptions,
  serviceCategoryOptions,
  Vendor,
  VendorBusinessType,
  VendorFormValues,
  vendorBusinessTypeOptions,
} from "./data";
import { exportToExcel, exportToPdf } from "../../master/shared/export";
import { statusOptions } from "../../master/shared/constants";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";

export default function CreateVendorPage() {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [viewing, setViewing] = useState<Vendor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterBusinessName, setFilterBusinessName] = useState("");
  const [filterBusinessType, setFilterBusinessType] = useState("");
  const [filterSubtype, setFilterSubtype] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/vendors/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      setData(rows.map(mapApiVendorToVendor));
    } catch {
      toasterrormsg("Something went wrong while fetching vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterBusinessName &&
        !item.businessName.toLowerCase().includes(filterBusinessName.toLowerCase())
      ) {
        return false;
      }

      if (filterBusinessType && item.businessType !== filterBusinessType) {
        return false;
      }

      if (filterSubtype) {
        if (item.businessType === "product_vendor") {
          if (item.productVendorType !== filterSubtype) return false;
        } else if (item.businessType === "service_vendor") {
          if (item.serviceCategory !== filterSubtype) return false;
        } else {
          return false;
        }
      }

      if (filterStatus && item.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [data, filterBusinessName, filterBusinessType, filterSubtype, filterStatus]);

  const handleSave = async (values: VendorFormValues, vendorId?: string) => {
    const formData = buildVendorFormData(values, vendorId);

    try {
      if (vendorId) {
        await Patch(`ecommerce/vendors/${vendorId}/`, formData, true);
        toastsuccessmsg("Vendor updated successfully.");
      } else {
        await Post("ecommerce/vendors/create_by_admin/", formData, true);
        toastsuccessmsg("Vendor created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while saving the vendor.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleEdit = async (row: Vendor) => {
    try {
      const response = await Get(`ecommerce/vendors/${row.id}/`, {}, false);
      const details = mapApiVendorToVendor(response.data);
      setEditing(details);
      setDrawerOpen(true);
    } catch {
      toasterrormsg("Failed to load vendor details.");
    }
  };

  const handleDeleteOne = async (vendor: Vendor) => {
    try {
      await Delete(`ecommerce/vendors/${vendor.id}/`, {}, false);
      toastsuccessmsg("Vendor deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== vendor.id));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while deleting the vendor.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: Vendor }[]) => {
    try {
      await Promise.all(
        rows.map((row) => Delete(`ecommerce/vendors/${row.original.id}/`, {}, false)),
      );
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected vendors deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected vendors.");
    }
  };

  const subtypeOptions = useMemo(() => {
    if (filterBusinessType === "product_vendor") {
      return productVendorTypeOptions;
    }
    if (filterBusinessType === "service_vendor") {
      return serviceCategoryOptions;
    }
    return [];
  }, [filterBusinessType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Vendor) => {
        handleEdit(row);
      },
      openViewModal: (row: Vendor) => {
        setViewing(row);
        setViewOpen(true);
      },
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
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
    <Page title="Create Vendor">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Create Vendor"
          createLabel="Add Vendor"
          searchPlaceholder="Search vendors..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptyVendor());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "vendors")}
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Vendor List", "vendors")
          }
          filterPanel={
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input
                label="Business Name"
                value={filterBusinessName}
                onChange={(e) => setFilterBusinessName(e.target.value)}
                placeholder="Filter by business name"
              />

              <Listbox
                data={[{ id: "", label: "All" }, ...vendorBusinessTypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...vendorBusinessTypeOptions].find(
                    (item) => item.id === filterBusinessType,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => {
                  setFilterBusinessType(item.id as VendorBusinessType | "");
                  setFilterSubtype("");
                }}
                label="Business Type"
                placeholder="All business types"
                displayField="label"
              />

              <Listbox
                data={[{ id: "", label: "All" }, ...subtypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...subtypeOptions].find(
                    (item) => item.id === filterSubtype,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterSubtype(item.id)}
                label={
                  filterBusinessType === "product_vendor"
                    ? "Product Vendor Type"
                    : filterBusinessType === "service_vendor"
                      ? "Service Category"
                      : "Sub Type"
                }
                placeholder="All"
                displayField="label"
              />

              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={
                  [{ id: "", label: "All" }, ...statusOptions].find(
                    (item) => item.id === filterStatus,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading vendors..."
              : "No vendors found. Click Add Vendor to create one."
          }
        />
      </div>

      <VendorDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        vendor={editing}
        onSave={handleSave}
      />

      <VendorViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        vendor={viewing}
      />
    </Page>
  );
}
