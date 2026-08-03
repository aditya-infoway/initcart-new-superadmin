import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Get,
  Post,
  Patch,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../../master/shared/export";
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import { statusOptions } from "../../../master/shared/constants";
import { SubCategoryDrawer } from "./SubCategoryDrawer";
import { columns, exportColumns } from "./columns";
import {
  ServiceSubcategory,
  emptyServiceSubcategory,
  parentServiceOptions,
} from "./data";

interface ApiServiceSubcategory {
  subcategoryId?: string;
  id?: string;
  parentServiceId?: string;
  parent_service?: string;
  parentService?: string;
  parentServiceName?: string;
  serviceCategoryId?: string;
  serviceCategoryName?: string;
  subcategoryName?: string;
  subcategory_name?: string;
  name?: string;
  description?: string;
  image?: string;
  image_url?: string;
  status?: string;
  createdAt?: string;
  createdOn?: string;
  created_at?: string;
}

const mapToServiceSubcategory = (
  item: ApiServiceSubcategory
): ServiceSubcategory => {
  const parentServiceName =
    item.parentServiceName ||
    item.parentService ||
    item.parent_service ||
    item.serviceCategoryName ||
    "";
  const parentServiceId =
    item.parentServiceId ||
    item.serviceCategoryId ||
    parentServiceOptions.find(
      (opt) => opt.label.toLowerCase() === parentServiceName.toLowerCase()
    )?.id ||
    "";
  const rawStatus = item.status || "active";
  return {
    id: String(item.subcategoryId || item.id || ""),
    parentServiceId: String(parentServiceId),
    parentServiceName,
    subcategoryName:
      item.subcategoryName || item.subcategory_name || item.name || "",
    description: item.description || "",
    image: item.image || item.image_url || "",
    status: rawStatus.toLowerCase(),
    createdOn: item.createdOn || item.createdAt || item.created_at || "",
  };
};

export default function ServiceSubCategoriesPage() {
  const [data, setData] = useState<ServiceSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceSubcategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterParentService, setFilterParentService] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const API_BASE = "services/service-subcategories";

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await Get(API_BASE + "/", {}, false);
      const data = (response as any)?.data;
      const raw =
        data?.results || data?.data || (Array.isArray(data) ? data : []);
      const list = (Array.isArray(raw) ? raw : []).map(mapToServiceSubcategory);
      setData(list);
    } catch (err) {
      toasterrormsg("Failed to load service subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterParentService &&
        item.parentServiceId !== filterParentService &&
        !item.parentServiceName
          .toLowerCase()
          .includes(filterParentService.toLowerCase())
      )
        return false;
      if (
        filterName &&
        !item.subcategoryName
          .toLowerCase()
          .includes(filterName.toLowerCase())
      )
        return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterParentService, filterName, filterStatus]);

  const handleDeleteRow = async (row: Row<ServiceSubcategory>) => {
    try {
      await Delete(
        `${API_BASE}/${row.original.id}/`,
        {},
        false
      );
      toastsuccessmsg("Service subcategory deleted successfully");
      fetchList();
    } catch {
      toasterrormsg("Failed to delete service subcategory");
    }
  };

  const handleDeleteRows = async (rows: { original: ServiceSubcategory }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(`${API_BASE}/${r.original.id}/`, {}, false)
        )
      );
      toastsuccessmsg("Service subcategories deleted successfully");
      setRowSelection({});
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to delete service subcategories");
    }
  };

  const buildPayload = (item: ServiceSubcategory, isEdit: boolean) => {
    const payload: Record<string, unknown> = {
      parentServiceId: item.parentServiceId,
      subcategoryName: item.subcategoryName,
      description: item.description,
      status: item.status,
    };
    if (item.imageFile) {
      payload.image = item.imageFile;
    } else if (item.image) {
      payload.image = item.image;
    }
    if (isEdit) {
      payload.id = item.id;
    }
    return payload;
  };

  const handleSave = async (item: ServiceSubcategory) => {
    try {
      if (item.id) {
        await Patch(
          `${API_BASE}/${item.id}/`,
          buildPayload(item, true),
          !!item.imageFile
        );
        toastsuccessmsg("Service subcategory updated successfully");
      } else {
        await Post(
          API_BASE + "/",
          buildPayload(item, false),
          !!item.imageFile
        );
        toastsuccessmsg("Service subcategory created successfully");
      }
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to save service subcategory");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: ServiceSubcategory) => {
        setEditing(row);
        setDrawerOpen(true);
      },
      deleteRow: handleDeleteRow,
      deleteRows: handleDeleteRows,
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
    <Page title="Service Sub Categories">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Service Sub Categories"
          createLabel="Add Subcategory"
          searchPlaceholder="Search service subcategories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyServiceSubcategory());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "service-subcategories")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Service Sub Categories List",
              "service-subcategories"
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Listbox
                data={[
                  { id: "", label: "All" },
                  ...parentServiceOptions,
                ]}
                value={
                  [
                    { id: "", label: "All" },
                    ...parentServiceOptions,
                  ].find((item) => item.id === filterParentService) || {
                    id: "",
                    label: "All",
                  }
                }
                onChange={(item) => setFilterParentService(item.id)}
                label="Parent Service"
                placeholder="All parent services"
                displayField="label"
              />
              <Input
                label="Subcategory Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...statusOptions]}
                value={
                  [{ id: "", label: "All" }, ...statusOptions].find(
                    (item) => item.id === filterStatus
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
              ? "Loading..."
              : "No service subcategories found. Click Add Subcategory to add one."
          }
        />
      </div>

      <SubCategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        subcategory={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
