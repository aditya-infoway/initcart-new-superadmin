import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { DealOfTheDayRow } from "./data";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

function placementLabel(value: string) {
  if (value === "main_section") return "Main Section";
  if (value === "product_list") return "Product List";
  if (value === "hero_banner") return "Hero Banner";
  return "Unassigned";
}

export const columns: ColumnDef<DealOfTheDayRow>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
  { id: "productId", accessorKey: "productId", header: "ID", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "productName", accessorKey: "productName", header: "Product", cell: ({ row }) => <TextValue value={row.original.productName} subValue={row.original.productId} /> },
  { id: "vendor", header: "Vendor", cell: ({ row }) => <TextValue value={row.original.vendorName} subValue={row.original.vendorEmail || row.original.vendorPhone} /> },
  { id: "campaign", header: "Campaign", cell: ({ row }) => <TextValue value={row.original.campaignName} subValue={`#${row.original.campaignId}`} /> },
  { id: "startTime", accessorKey: "startTime", header: "Start Time", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "endTime", accessorKey: "endTime", header: "End time", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "pricing", accessorKey: "pricing", header: "Pricing", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  {
    id: "placement",
    accessorKey: "placement",
    header: "Placement",
    cell: ({ getValue }) => {
      const value = String(getValue() || "");
      const color = value === "hero_banner" ? "secondary" : value === "main_section" ? "info" : value === "product_list" ? "primary" : "neutral";
      return <Badge color={color} variant="soft">{placementLabel(value)}</Badge>;
    },
  },
  { id: "discountCheck", accessorKey: "discountCheck", header: "Discount Check", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = String(getValue() || "pending");
      return <Badge color={value === "approved" ? "success" : "warning"} variant="soft">{value === "approved" ? "Approved" : "Pending"}</Badge>;
    },
  },
  { id: "actions", header: "Action", cell: () => <span className="text-sm text-gray-400">—</span>, enableSorting: false },
];
