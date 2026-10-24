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

import { Delete, Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../../../master/shared/export";
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import { statusOptions } from "../../../master/shared/constants";
import { columns } from "./columns";
import {
  buildSubCategoryFormData,
  emptySubCategory,
  mapApiCategoryOption,
  mapApiSubCategory,
  ParentCategoryOption,
  SubCategory,
  SubCategoryFormValues,
} from "./data";
import { OverlayColorCard } from "./OverlayColorCard";
import { SubCategoryDrawer } from "./SubCategoryDrawer";

// message / detail / first field error from the API
const apiError = (error: any, fallback: string) => {
  const d = error?.response?.data;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  if (d.message) return String(d.message);
  if (d.detail) return String(d.detail);
  const first: any = Object.values(d)[0];
  return Array.isArray(first) ? String(first[0]) : first ? String(first) : fallback;
};

const toRows = (data: any) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.data)
        ? data.data
        : [];

export default function ProductSubCategoryPage() {
  const [data, setData] = useState<SubCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ParentCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchCategoryOptions = async () => {
    try {
      const response = await Get("ecommerce/category/", {}, false);
      setCategoryOptions(toRows(response.data).map(mapApiCategoryOption));
    } catch {
      toasterrormsg("Failed to fetch category options.");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/subcategory/", {}, false);
      setData(toRows(response.data).map(mapApiSubCategory));
    } catch {
      toasterrormsg("Something went wrong while fetching sub categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchCategoryOptions();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterCategory && item.parentCategoryId !== filterCategory) return false;
      return true;
    });
  }, [data, filterName, filterStatus, filterCategory]);

  // first sub category that has a banner (used in the colour preview card)
  const previewBanner = useMemo(() => data.find((item) => item.banner)?.banner, [data]);

  const handleSave = async (values: SubCategoryFormValues, subCategoryId?: string) => {
    const formData = buildSubCategoryFormData(values);
    try {
      if (subCategoryId) {
        await Put(`ecommerce/subcategory/${subCategoryId}/`, formData, true);
        toastsuccessmsg("Sub Category updated successfully.");
      } else {
        await Post("ecommerce/subcategory/", formData, true);
        toastsuccessmsg("Sub Category created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      toasterrormsg(apiError(error, "Something went wrong while saving the sub category."));
      throw error; // drawer stays open and shows field errors
    }
  };

  const handleDeleteOne = async (subCategory: SubCategory) => {
    try {
      await Delete(`ecommerce/subcategory/${subCategory.id}/`, {}, false);
      toastsuccessmsg("Sub Category deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== subCategory.id));
    } catch (error: any) {
      toasterrormsg(apiError(error, "Something went wrong while deleting the sub category."));
    }
  };

  const handleDeleteMany = async (rows: { original: SubCategory }[]) => {
    try {
      await Promise.all(rows.map((row) => Delete(`ecommerce/subcategory/${row.original.id}/`, {}, false)));
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected sub categories deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected sub categories.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: SubCategory) => {
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
    <Page title="Sub Category">
      <div className="transition-content w-full pb-5">
        <OverlayColorCard previewBanner={previewBanner} />

        <MasterToolbar
          title="Sub Category"
          createLabel="Add Sub Category"
          searchPlaceholder="Search sub categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptySubCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(filteredData, [], "sub-categories")}
          onExportPdf={() => exportToPdf(filteredData, [], "Sub Category List", "sub-categories")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by sub category"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...categoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...categoryOptions].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Category"
                placeholder="All categories"
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
          emptyMessage={loading ? "Loading sub categories..." : "No sub categories found. Click Add Sub Category to create one."}
        />
      </div>

      <SubCategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        subCategory={editing}
        categoryOptions={categoryOptions}
        onSave={handleSave}
      />
    </Page>
  );
}