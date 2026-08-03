import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { ExportColumn } from "../../master/shared/export";
import { TextCell } from "../../master/shared/tableCells";
import { LogoCell, TypeCell } from "./cells";
import { VendorRowActions } from "./VendorRowActions";
import { Vendor } from "./data";

export const columns: ColumnDef<Vendor>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "srNo",
    header: "#",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    id: "logo",
    accessorKey: "logo",
    header: "Logo",
    cell: LogoCell,
    enableSorting: false,
  },
  {
    id: "businessName",
    accessorKey: "businessName",
    header: "Business Name",
    cell: TextCell,
  },
  {
    id: "ownerName",
    accessorKey: "ownerName",
    header: "Owner Name",
    cell: TextCell,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email ID",
    cell: TextCell,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone No.",
    cell: TextCell,
  },
  {
    id: "businessType",
    accessorKey: "businessType",
    header: "Type",
    cell: TypeCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: VendorRowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Vendor>[] = [
  { key: "businessName", header: "Business Name" },
  { key: "ownerName", header: "Owner Name" },
  { key: "email", header: "Email ID" },
  { key: "phone", header: "Phone No." },
  {
    key: "businessType",
    header: "Type",
    format: (_value: unknown, row?: Vendor) => {
      if (!row) return "";
      if (row.businessType === "product_vendor") {
        return `Product Vendor${row.productVendorType ? ` - ${row.productVendorType}` : ""}`;
      }
      if (row.businessType === "service_vendor") {
        return `Service Vendor${row.serviceCategory ? ` - ${row.serviceCategory}` : ""}`;
      }
      return "";
    },
  },
  { key: "status", header: "Status" },
];
