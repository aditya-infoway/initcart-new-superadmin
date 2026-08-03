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

import { Delete, Get, Patch, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../../../master/shared/export";
import { statusOptions } from "../../../master/shared/constants";
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import { CategoryDrawer } from "./CategoryDrawer";
import { getColumns } from "./columns";
import {
  buildCategoryFormData,
  Category,
  CategoryFormValues,
  emptyCategory,
  mapApiCategoryToCategory,
} from "./data";

export default function ProductCategoryPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/category/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiCategoryToCategory));
    } catch {
      toasterrormsg("Something went wrong while fetching categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterStatus]);

  const handleSave = async (values: CategoryFormValues, categoryId?: string) => {
    const formData = buildCategoryFormData(values);
    try {
      if (categoryId) {
        await Put(`ecommerce/category/${categoryId}/`, formData, true);
        toastsuccessmsg("Category updated successfully.");
      } else {
        await Post("ecommerce/category/", formData, true);
        toastsuccessmsg("Category created successfully.");
      }
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while saving the category.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleDeleteOne = async (category: Category) => {
    try {
      await Delete(`ecommerce/category/${category.id}/`, {}, false);
      toastsuccessmsg("Category deleted successfully.");
      setData((prev) => prev.filter((item) => item.id !== category.id));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while deleting the category.";
      toasterrormsg(message);
    }
  };

  const handleDeleteMany = async (rows: { original: Category }[]) => {
    try {
      await Promise.all(rows.map((row) => Delete(`ecommerce/category/${row.original.id}/`, {}, false)));
      const ids = new Set(rows.map((row) => row.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected categories deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected categories.");
    }
  };

  const handleToggleFeatured = async (category: Category) => {
    try {
      await Patch(`ecommerce/category/${category.id}/feature/`, {}, false);
      toastsuccessmsg(category.featured ? "Category unfeatured successfully." : "Category marked as featured.");
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while updating featured category.";
      toasterrormsg(message);
    }
  };

  const handleToggleWebHome = async (category: Category) => {
    try {
      const formData = new FormData();
      formData.append("web_home", category.showOnHomepage ? "false" : "true");
      await Put(`ecommerce/category/${category.id}/`, formData, true);
      toastsuccessmsg(category.showOnHomepage ? "Hidden from homepage." : "Now showing on homepage.");
      setData((prev) =>
        prev.map((item) =>
          item.id === category.id ? { ...item, showOnHomepage: !item.showOnHomepage } : item,
        ),
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while updating homepage visibility.";
      toasterrormsg(message);
    }
  };

  const columns = getColumns({ onToggleFeatured: handleToggleFeatured, onToggleWebHome: handleToggleWebHome });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Category) => {
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
    <Page title="Category">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Category"
          createLabel="Add Category"
          searchPlaceholder="Search categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onCreate={() => {
            setEditing(emptyCategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(filteredData, [], "categories")}
          onExportPdf={() => exportToPdf(filteredData, [], "Category List", "categories")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Category"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by category"
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
          emptyMessage={loading ? "Loading categories..." : "No categories found. Click Add Category to create one."}
        />
      </div>

      <CategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        category={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
