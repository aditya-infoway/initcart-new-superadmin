import { CellContext, ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { TextCell } from "../../master/shared/tableCells";
import { LogoCell, TypeCell } from "../create-vendor/cells";
import { VendorRowActions } from "../create-vendor/VendorRowActions";
import { Vendor } from "../create-vendor/data";

function StatusCell({ getValue }: CellContext<Vendor, unknown>) {
  const value = String(getValue() || "").toLowerCase();
  return (
    <Badge color={value === "active" ? "success" : "neutral"} variant="soft">
      {value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A"}
    </Badge>
  );
}

function VerificationCell({ row }: CellContext<Vendor, unknown>) {
  const status = (row.original.status || "").toLowerCase();

  const config =
    status === "active"
      ? { label: "Verified", color: "success" as const }
      : status === "pending"
        ? { label: "Pending", color: "warning" as const }
        : status === "rejected"
          ? { label: "Rejected", color: "error" as const }
          : { label: "Under Review", color: "neutral" as const };

  return (
    <Badge color={config.color} variant="soft">
      {config.label}
    </Badge>
  );
}

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
    header: "Email",
    cell: TextCell,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone",
    cell: TextCell,
  },
  {
    id: "businessType",
    accessorKey: "businessType",
    header: "Type",
    cell: TypeCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "verification",
    header: "Verification",
    cell: VerificationCell,
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Action",
    cell: VendorRowActions,
    enableSorting: false,
  },
];
