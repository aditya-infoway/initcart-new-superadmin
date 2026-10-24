import { ColumnDef } from "@tanstack/react-table";
import {
  CheckIcon,
  NoSymbolIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { Badge, Button } from "@/components/ui";
import { formatDate, ReturnItem, statusColor, statusLabel } from "./types";

function TextValue({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className ?? "text-gray-800 dark:text-dark-100"}>
      {value || "—"}
    </span>
  );
}

interface GetColumnsArgs {
  onAction: (item: ReturnItem, action: "approve" | "reject") => void;
  onViewImages: (item: ReturnItem) => void;
}

export function getColumns({
  onAction,
  onViewImages,
}: GetColumnsArgs): ColumnDef<ReturnItem>[] {
  return [
    {
      id: "return_id",
      accessorKey: "return_id",
      header: "Return ID",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-dark-50">
          {row.original.return_id}
        </span>
      ),
    },
    {
      id: "order_number",
      accessorKey: "order_number",
      header: "Order",
      cell: ({ row }) => <TextValue value={row.original.order_number} />,
    },
    {
      id: "vendor_name",
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => <TextValue value={row.original.vendor_name} />,
    },
    {
      id: "customer_name",
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => <TextValue value={row.original.customer_name} />,
    },
    {
      id: "vendor_remarks",
      accessorKey: "vendor_remarks",
      header: "Vendor Remarks",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm italic text-gray-500 dark:text-dark-300">
          {row.original.vendor_remarks || "-"}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          color={statusColor(row.original.status)}
          variant="soft"
          className="capitalize"
        >
          {statusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "re_requested_at",
      accessorKey: "re_requested_at",
      header: "Re-requested On",
      cell: ({ row }) => (
        <TextValue
          value={row.original.re_requested_at ? formatDate(row.original.re_requested_at) : "-"}
          className="text-gray-500 dark:text-dark-300"
        />
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const imageCount = item.images?.length || 0;
        return (
          <div className="flex flex-wrap gap-2">
            {item.status === "re_requested" && (
              <>
                <Button
                  color="success"
                  variant="soft"
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                  onClick={() => onAction(item, "approve")}
                >
                  <CheckIcon className="size-4" />
                  Approve
                </Button>
                <Button
                  color="error"
                  variant="soft"
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                  onClick={() => onAction(item, "reject")}
                >
                  <NoSymbolIcon className="size-4" />
                  Reject
                </Button>
              </>
            )}
            <Button
              color="primary"
              variant="soft"
              className="h-8 gap-1.5 rounded-lg px-3 text-xs"
              disabled={imageCount === 0}
              title={imageCount === 0 ? "Customer did not upload any images." : undefined}
              onClick={() => onViewImages(item)}
            >
              <PhotoIcon className="size-4" />
              View Images{imageCount > 0 ? ` (${imageCount})` : ""}
            </Button>
          </div>
        );
      },
    },
  ];
}