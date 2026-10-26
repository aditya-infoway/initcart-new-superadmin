import { ColumnDef } from "@tanstack/react-table";

import { Avatar, Badge, Input, Switch } from "@/components/ui";
import { TopSellerRowAction } from "./TopSellerRowAction";
import { formatDate, TopSellerRow } from "./types";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="font-medium text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? (
        <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div>
      ) : null}
    </div>
  );
}

interface GetColumnsArgs {
  pageIndex: number;
  pageSize: number;
  onView: (row: TopSellerRow) => void;
  onRemove: (row: TopSellerRow) => void;
  onToggle: (row: TopSellerRow) => void;
  onOrderSave: (row: TopSellerRow, input: HTMLInputElement) => void;
}

export function getColumns({
  pageIndex,
  pageSize,
  onView,
  onRemove,
  onToggle,
  onOrderSave,
}: GetColumnsArgs): ColumnDef<TopSellerRow>[] {
  return [
    {
      id: "srNo",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      id: "vendor",
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={10}
            name={row.original.vendor_name}
            src={row.original.vendor_logo || undefined}
            initialColor="auto"
          />
          <TextValue
            value={row.original.vendor_name}
            subValue={row.original.vendor_email || "-"}
          />
        </div>
      ),
    },
    {
      id: "request_id",
      accessorKey: "request_id",
      header: "Request ID",
      cell: ({ row }) => <TextValue value={row.original.request_id} />,
    },
    {
      id: "banner",
      header: "Banner",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.banner_url ? (
          <img
            src={row.original.banner_url}
            alt="Banner"
            style={{ aspectRatio: "2 / 1" }}
            className="w-24 rounded border border-gray-200 object-cover dark:border-dark-500"
          />
        ) : (
          <span className="text-xs text-gray-400 dark:text-dark-300">No banner</span>
        ),
    },
    {
      id: "location",
      header: "Location",
      enableSorting: false,
      cell: ({ row }) => (
        <TextValue
          value={
            [row.original.vendor_city, row.original.vendor_state]
              .filter(Boolean)
              .join(", ") || "-"
          }
        />
      ),
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Requested On",
      cell: ({ row }) => <TextValue value={formatDate(row.original.created_at)} />,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            color={s === "approved" ? "success" : s === "rejected" ? "error" : "warning"}
            variant="soft"
            className="capitalize"
          >
            {s}
          </Badge>
        );
      },
    },
    {
      id: "is_active",
      header: "Show on Website",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "approved" ? (
          <div className="flex items-center gap-2">
            <Switch
              color="success"
              checked={row.original.is_active}
              onChange={() => onToggle(row.original)}
            />
            <span
              className={`text-xs font-medium ${
                row.original.is_active
                  ? "text-success"
                  : "text-gray-400 dark:text-dark-300"
              }`}
            >
              {row.original.is_active ? "Live" : "Hidden"}
            </span>
          </div>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      id: "display_order",
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) =>
        row.original.status === "approved" ? (
          <Input
            key={`${row.original.id}-${row.original.display_order}`}
            type="number"
            min={0}
            defaultValue={row.original.display_order}
            onBlur={(e) => onOrderSave(row.original, e.target)}
            title="Lower number = appears first in slider"
            classNames={{ root: "w-20", input: "text-center" }}
          />
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <TopSellerRowAction row={row.original} onView={onView} onRemove={onRemove} />
      ),
    },
  ];
}