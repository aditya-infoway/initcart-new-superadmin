import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { FeaturedCampaign } from "./data";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

export const columns: ColumnDef<FeaturedCampaign>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
  { id: "campaignId", accessorKey: "campaignId", header: "ID", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "campaignName", accessorKey: "campaignName", header: "Campaign Name", cell: ({ row }) => <TextValue value={row.original.campaignName} subValue={`#${row.original.campaignId}`} /> },
  { id: "type", accessorKey: "type", header: "Type", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "duration", accessorKey: "duration", header: "Duration", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "vendors", accessorKey: "vendors", header: "Vendors", cell: ({ row }) => <TextValue value={row.original.vendors} subValue={row.original.vendorsSubtext} /> },
  { id: "approved", accessorKey: "approved", header: "Approved", cell: ({ row }) => <TextValue value={row.original.approved} subValue={row.original.approvedSubtext} /> },
  { id: "requirements", accessorKey: "requirements", header: "Requirements", cell: ({ row }) => <TextValue value={row.original.requirements} subValue={row.original.requirementsSubtext} /> },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = String(getValue() || "inactive");
      return <Badge color={value === "active" ? "success" : "neutral"} variant="soft">{value === "active" ? "Active" : "Inactive"}</Badge>;
    },
  },
  { id: "actions", header: "Action", cell: () => <span className="text-sm text-gray-400">—</span>, enableSorting: false },
];
