import { CellContext, ColumnDef } from "@tanstack/react-table";
import { PhotoIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Avatar, Badge } from "@/components/ui";
import { ExportColumn } from "../../master/shared/export";
import { TextCell } from "../../master/shared/tableCells";
import { BrandRowActions } from "./BrandRowActions";
import { Brand } from "./data";

function LogoCell({ getValue, row }: CellContext<Brand, unknown>) {
  const logo = String(getValue() || "");
  const name = row.original.brandName || "Brand";

  if (logo) {
    return <Avatar size={10} src={logo} name={name} initialColor="primary" />;
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-200">
      <PhotoIcon className="size-5" />
    </div>
  );
}

function NumberCell({ getValue }: CellContext<Brand, unknown>) {
  return <span className="text-gray-800 dark:text-dark-100">{Number(getValue() || 0)}</span>;
}

function StatusCell({ getValue }: CellContext<Brand, unknown>) {
  const value = String(getValue() || "").toLowerCase();
  return (
    <Badge color={value === "active" ? "success" : "neutral"} variant="soft">
      {value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A"}
    </Badge>
  );
}

export const columns: ColumnDef<Brand>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "srNo",
    header: "SR No",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    id: "brandName",
    accessorKey: "brandName",
    header: "Brand Name",
    cell: TextCell,
  },
  {
    id: "brandLogo",
    accessorKey: "brandLogo",
    header: "Brand Logo",
    cell: LogoCell,
    enableSorting: false,
  },
  {
    id: "totalProducts",
    accessorKey: "totalProducts",
    header: "Total Products",
    cell: NumberCell,
  },
  {
    id: "approvedProducts",
    accessorKey: "approvedProducts",
    header: "Approved Products",
    cell: NumberCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: BrandRowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Brand>[] = [
  { key: "brandName", header: "Brand Name" },
  { key: "description", header: "Description" },
  { key: "totalProducts", header: "Total Products" },
  { key: "approvedProducts", header: "Approved Products" },
  { key: "status", header: "Status" },
];
