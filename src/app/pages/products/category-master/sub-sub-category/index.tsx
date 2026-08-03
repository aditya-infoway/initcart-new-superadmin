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
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import { statusOptions } from "../../../master/shared/constants";
import { columns } from "./columns.tsx";
import {
  buildSubSubCategoryFormData,
  CategoryOption,
  emptySubSubCategory,
  mapApiCategoryOption,
  mapApiSubCategoryOption,
  mapApiSubSubCategory,
  SubCategoryOption,
  SubSubCategory,
  SubSubCategoryFormValues,
} from "./data";
import { SubSubCategoryDrawer } from "./SubSubCategoryDrawer";

export default function ProductSubSubCategoryPage() {
  const [data, setData] = useState<SubSubCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubSubCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");

  const fetchCategoryOptions = async () => {
    try {
      const response = await Get("ecommerce/category/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setCategoryOptions(rows.map(mapApiCategoryOption));
    } catch {
      toasterrormsg("Failed to fetch category options.");
    }
  };

  const fetchSubCategoryOptions = async () => {
    try {
      const response = await Get("ecommerce/subcategory/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setSubCategoryOptions(rows.map(mapApiSubCategoryOption));
    } catch {
      toasterrormsg("Failed to fetch sub category options.");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/subsubcategory/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiSubSubCategory));
    } catch {
      toasterrormsg("Something went wrong while fetching sub sub categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchCategoryOptions();
    fetchSubCategoryOptions();
  }, []);

  const filteredSubCategoryOptions = useMemo(() => {
    if (!filterCategory) return subCategoryOptions;
    return subCategoryOptions.filter((item) => item.categoryId === filterCategory);
  }, [filterCategory, subCategoryOptions]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterCategory && item.categoryId !== filterCategory) return false;
      if (filterSubCategory && item.subCategoryId !== filterSubCategory) return false;
      return true;
    });
  }, [data, filterName, filterStatus, filterCategory, filterSubCategory]);

  const handleSave = async (values: SubSubCategoryFormValues, subSubCategoryId?: string) => {
    const formData = buildSubSubCategoryFormData(values);
    try {
      if (subSubCategoryId) {
        await Put(`ecommerce/subsubcategory/${subSubCategoryId}/`, formData, true);
        toastsuccessmsg("Sub Sub Category updated successfully.");
      } else {
        await Post("ecommerce/subsubcategory/", formData, true);
        toastsuccessmsg("Sub Sub Category created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while saving the sub sub category.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDeleteOne = async (subSubCategory: SubSubCategory) => {
    try {
      await Delete(`ecommerce/subsubcategory/${subSubCategory.id}/`, {}, false);
      toastsuccessmsg("Sub Sub Category deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== subSubCategory.id));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while deleting the sub sub category.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: SubSubCategory }[]) => {
    try {
      await Promise.all(rows.map((row) => Delete(`ecommerce/subsubcategory/${row.original.id}/`, {}, false)));
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected sub sub categories deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected sub sub categories.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: SubSubCategory) => {
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
    <Page title="Sub Sub Category">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Sub Sub Category"
          createLabel="Add Sub Sub Category"
          searchPlaceholder="Search sub sub categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptySubSubCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-4">
              <Input
                label="Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by sub sub category"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...categoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...categoryOptions].find(
                    (item) => item.id === filterCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => {
                  setFilterCategory(item.id);
                  setFilterSubCategory("");
                }}
                label="Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...filteredSubCategoryOptions]}
                value={
                  [{ id: "", label: "All" }, ...filteredSubCategoryOptions].find(
                    (item) => item.id === filterSubCategory,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterSubCategory(item.id)}
                label="Sub Category"
                placeholder="All sub categories"
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
          emptyMessage={loading ? "Loading sub sub categories..." : "No sub sub categories found. Click Add Sub Sub Category to create one."}
        />
      </div>

      <SubSubCategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        subSubCategory={editing}
        categoryOptions={categoryOptions}
        subCategoryOptions={subCategoryOptions}
        onSave={handleSave}
      />
    </Page>
  );
}
