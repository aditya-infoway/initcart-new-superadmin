import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { MasterTable } from "../../master/shared/MasterTable";
import { getColumns } from "./columns";
import { salesReportRows, SalesReportVendorRow } from "./data";
import { SalesReportViewModal } from "./SalesReportViewModal";

export default function SalesReportPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewingVendor, setViewingVendor] = useState<SalesReportVendorRow | null>(null);

  const data = useMemo(() => salesReportRows, []);

  const columns = getColumns({
    onView: (row) => setViewingVendor(row),
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Sales Report">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
              Sales Report
            </h1>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No sales report data found."
        />
      </div>

      <SalesReportViewModal
        isOpen={Boolean(viewingVendor)}
        close={() => setViewingVendor(null)}
        vendor={viewingVendor}
      />
    </Page>
  );
}
