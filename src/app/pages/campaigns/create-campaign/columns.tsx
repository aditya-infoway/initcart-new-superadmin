import { CellContext, ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge, Button } from "@/components/ui";
import { CampaignRowActions } from "./CampaignRowActions";
import { Campaign, CategoryOption } from "./data";

function TextValue({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function StatusCell({ row }: CellContext<Campaign, unknown>) {
  return (
    <Badge color={row.original.status === "active" ? "success" : "neutral"} variant="soft">
      {row.original.status === "active" ? "Active" : "Inactive"}
    </Badge>
  );
}

export function getColumns({
  onViewVendors,
}: {
  onViewVendors: (campaign: Campaign) => void;
}): ColumnDef<Campaign>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "campaignId", accessorKey: "campaignId", header: "Campaign ID", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "campaignName", accessorKey: "campaignName", header: "Campaign Name", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "type", accessorKey: "type", header: "Type", cell: ({ getValue }) => <TextValue value={String(getValue() || "").replaceAll("_", " ")} /> },
    {
      id: "categories",
      accessorKey: "categories",
      header: "Categories",
      cell: ({ getValue }) => {
        const categories = (getValue() as CategoryOption[] | undefined) || [];
        return <TextValue value={categories.map((item) => item.label).join(", ") || "—"} />;
      },
    },
    { id: "startDate", accessorKey: "startDate", header: "Start date", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "endDate", accessorKey: "endDate", header: "End date", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "maxVendors", accessorKey: "maxVendors", header: "Max vendors", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "minDiscount", accessorKey: "minDiscount", header: "Min Discount", cell: ({ getValue }) => <TextValue value={`${String(getValue() || "0")}%`} /> },
    { id: "minProducts", accessorKey: "minProducts", header: "Min Products", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "description", accessorKey: "description", header: "Description", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "status", header: "Status", cell: StatusCell },
    {
      id: "vendorSelection",
      header: "Vendor Selection",
      cell: ({ row }) => (
        <Button isIcon className="size-8 rounded-full" onClick={() => onViewVendors(row.original)}>
          <EyeIcon className="size-4.5" />
        </Button>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row, table }) => (
        <CampaignRowActions
          row={row}
          table={table}
          onViewVendors={onViewVendors}
        />
      ),
      enableSorting: false,
    },
  ];
}
