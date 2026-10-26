//reports/sales-report/columns.tsx
import { ColumnDef } from "@tanstack/react-table";

import { SalesReportVendorRow } from "./data";
import { SalesReportRowAction } from "./SalesReportRowAction";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="font-medium text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

export function getColumns({ onView }: { onView: (row: SalesReportVendorRow) => void }): ColumnDef<SalesReportVendorRow>[] {
  return [
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "vendorId",
      accessorKey: "vendorId",
      header: "Vendor ID",
      cell: ({ row }) => <TextValue value={row.original.vendorId} />,
    },
    {
      id: "vendorName",
      accessorKey: "vendorName",
      header: "Vendor Name",
      cell: ({ row }) => <TextValue value={row.original.vendorName} />,
    },
    {
      id: "contact",
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => <TextValue value={row.original.contact} />,
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <TextValue value={row.original.category} />,
    },
    {
      id: "totalOrders",
      accessorKey: "totalOrders",
      header: "Total Orders",
      cell: ({ row }) => <TextValue value={String(row.original.totalOrders)} />,
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => <SalesReportRowAction row={row.original} onView={onView} />,
    },
  ];
}
