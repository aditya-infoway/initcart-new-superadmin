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
import { useEffect, useState } from "react";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Post, Put, Delete, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../master/shared/export";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";
import { SliderImageDrawer } from "./SliderImageDrawer";
import { columns, exportColumns } from "./columns";
import { SliderImage, emptySliderImage } from "./data";

interface ApiSliderImage {
  id: number | string;
  image: string;
  sr_no: number;
}

const mapToSliderImage = (item: ApiSliderImage, index: number): SliderImage => ({
  id: String(item.id),
  srNo: item.sr_no || index + 1,
  imageUrl: item.image,
});

export default function SliderImagePage() {
  const [data, setData] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SliderImage | null>(null);

  // ---------------- LIST ----------------
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await Get("banners/slider/", {}, false);
      const rawList = response.data?.data || response.data || [];
      const list = (Array.isArray(rawList) ? rawList : []).map(
        (item: ApiSliderImage, index: number) => mapToSliderImage(item, index)
      );
      setData(list);
    } catch (err) {
      toasterrormsg("Failed to load slider images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // ---------------- DELETE (single) ----------------
  const handleDeleteRow = async (row: Row<SliderImage>) => {
    try {
      await Delete(`banners/slider/${row.original.id}/`, {}, false);
      toastsuccessmsg("Slider image deleted successfully");
      setData((prev) => prev.filter((item) => item.id !== row.original.id));
    } catch {
      toasterrormsg("Failed to delete slider image");
    }
  };

  // ---------------- DELETE (bulk) ----------------
  const handleDeleteRows = async (rows: { original: SliderImage }[]) => {
    try {
      await Promise.all(
        rows.map((r) => Delete(`banners/slider/${r.original.id}/`, {}, false))
      );
      toastsuccessmsg("Selected slider images deleted successfully");
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
    } catch {
      toasterrormsg("Failed to delete slider images");
    }
  };

  // ---------------- CREATE / EDIT ----------------
  const handleSave = async (formData: FormData) => {
    try {
      const isEdit = Boolean(editing?.id);
      if (isEdit) {
        try {
          await Put("banners/slider/update", formData, true);
        } catch {
          await Post("banners/slider/update", formData, true);
        }
        toastsuccessmsg("Slider image updated successfully");
      } else {
        await Post("banners/slider/", formData, true);
        toastsuccessmsg("Slider image added successfully");
      }
      fetchList();
    } catch (err) {
      toasterrormsg("Failed to save slider image");
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: SliderImage) => {
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
    <Page title="Slider Image">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Slider Image"
          createLabel="Add Slider Image"
          searchPlaceholder="Search slider images..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => {
            setEditing(emptySliderImage());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "slider-images")
          }
          onExportPdf={() =>
            exportToPdf(
              data,
              exportColumns,
              "Slider Image List",
              "slider-images"
            )
          }
          filterPanel={<div />}
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading slider images..."
              : "No slider images found. Click Add Slider Image to add one."
          }
        />
      </div>

      <SliderImageDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        sliderImage={editing}
        onSave={handleSave}
      />
    </Page>
  );
}
