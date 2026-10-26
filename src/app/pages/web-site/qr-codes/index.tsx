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

import { Delete, Get, Patch, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";
import { getColumns } from "./columns";
import {
  buildQRCardFormData,
  emptyQRCard,
  mapApiQRCard,
  QRCard,
  QRCardFormValues,
} from "./data";
import { QRCardDrawer } from "./QRCardDrawer";

const BASE = "ecommerce/qrcards/";

const apiError = (error: any, fallback: string) => {
  const d = error?.response?.data;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  if (d.detail) return String(d.detail);
  if (d.message) return String(d.message);
  const first: any = Object.values(d)[0];
  return Array.isArray(first) ? String(first[0]) : first ? String(first) : fallback;
};

export default function QRCodesPage() {
  const [data, setData] = useState<QRCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<QRCard | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await Get(BASE, {}, false);
      const rows = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
      setData(rows.map(mapApiQRCard));
    } catch {
      toasterrormsg("QR cards could not load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) => !filterName || item.name.toLowerCase().includes(filterName.toLowerCase()),
      ),
    [data, filterName],
  );

  const handleSave = async (values: QRCardFormValues, id?: string) => {
    const formData = buildQRCardFormData(values);
    try {
      if (id) {
        await Patch(`${BASE}${id}/`, formData, true);
        toastsuccessmsg("QR Card updated.");
      } else {
        await Post(BASE, formData, true);
        toastsuccessmsg("QR Card generated.");
      }
      await fetchAll();
    } catch (error: any) {
      toasterrormsg(apiError(error, "Something went wrong, try again."));
      throw error; // drawer stays open
    }
  };

  const handleDeleteOne = async (item: QRCard) => {
    try {
      await Delete(`${BASE}${item.id}/`, {}, false);
      toastsuccessmsg("QR code deleted.");
      setData((prev) => prev.filter((c) => c.id !== item.id));
    } catch (error: any) {
      toasterrormsg(apiError(error, "Could not delete."));
    }
  };

  const handleDeleteMany = async (rows: { original: QRCard }[]) => {
    try {
      await Promise.all(rows.map((r) => Delete(`${BASE}${r.original.id}/`, {}, false)));
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((c) => !ids.has(c.id)));
      setRowSelection({});
      toastsuccessmsg("Selected QR codes deleted.");
    } catch {
      toasterrormsg("Something went wrong while deleting selected QR codes.");
    }
  };

  const handleDownload = (item: QRCard) => {
    if (!item.qrImage) {
      toasterrormsg("No QR image found.");
      return;
    }
    const link = document.createElement("a");
    link.href = item.qrImage;
    link.download = `${item.slug || "qr"}_qr.png`;
    link.target = "_blank";
    link.click();
  };

  const columns = getColumns({ onDownload: handleDownload });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: QRCard) => {
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
    <Page title="QR Codes">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="QR Codes"
          createLabel="Add QR"
          searchPlaceholder="Search QR codes..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(emptyQRCard());
            setDrawerOpen(true);
          }}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading QR codes..." : "No QR found. Click Add QR to create one."}
        />
      </div>

      <QRCardDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        card={editing}
        onSave={handleSave}
      />
    </Page>
  );
}