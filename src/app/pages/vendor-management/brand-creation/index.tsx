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

import {
  Delete,
  Get,
  Patch,
  Post,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../../master/shared/export";
import { statusOptions } from "../../master/shared/constants";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";
import { BrandDrawer } from "./BrandDrawer";
import { columns, exportColumns } from "./columns";
import {
  Brand,
  BrandFormValues,
  buildBrandFormData,
  emptyBrand,
  mapApiBrandToBrand,
} from "./data";

export default function BrandCreationPage() {
  const [data, setData] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterBrandName, setFilterBrandName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/brands/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      setData(rows.map(mapApiBrandToBrand));
    } catch {
      toasterrormsg("Something went wrong while fetching brands.");
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
        filterBrandName &&
        !item.brandName.toLowerCase().includes(filterBrandName.toLowerCase())
      ) {
        return false;
      }
      if (filterStatus && item.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [data, filterBrandName, filterStatus]);

  const handleSave = async (values: BrandFormValues, brandId?: string) => {
    const formData = buildBrandFormData(values, brandId);

    try {
      if (brandId) {
        await Patch(`ecommerce/brands/${brandId}/`, formData, true);
        toastsuccessmsg("Brand updated successfully.");
      } else {
        await Post("ecommerce/brands/", formData, true);
        toastsuccessmsg("Brand created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while saving the brand.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDeleteOne = async (brand: Brand) => {
    try {
      await Delete(`ecommerce/brands/${brand.id}/`, {}, false);
      toastsuccessmsg("Brand deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== brand.id));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while deleting the brand.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: Brand }[]) => {
    try {
      await Promise.all(
        rows.map((row) => Delete(`ecommerce/brands/${row.original.id}/`, {}, false)),
      );
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected brands deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected brands.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Brand) => {
        setEditing(row);
        setDrawerOpen(true);
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
    <Page title="Brand Creation">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Brand Creation"
          createLabel="Add Brand"
          searchPlaceholder="Search brands..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptyBrand());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "brands")}
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Brand List", "brands")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Brand Name"
                value={filterBrandName}
                onChange={(e) => setFilterBrandName(e.target.value)}
                placeholder="Filter by brand name"
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
              ? "Loading brands..."
              : "No brands found. Click Add Brand to create one."
          }
        />
      </div>

      <BrandDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        brand={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
