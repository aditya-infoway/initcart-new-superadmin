import { ColumnDef } from "@tanstack/react-table";
import { ArrowPathIcon, BanknotesIcon } from "@heroicons/react/24/outline";

import { Badge, Button } from "@/components/ui";
import {
  formatCurrency,
  formatDate,
  RefundItem,
  statusColor,
} from "./types";

function TextValue({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className ?? "text-gray-800 dark:text-dark-100"}>
      {value || "—"}
    </span>
  );
}

export function getColumns({
  onProcess,
}: {
  onProcess: (item: RefundItem) => void;
}): ColumnDef<RefundItem>[] {
  return [
    {
      id: "refund_id",
      accessorKey: "refund_id",
      header: "Refund ID",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-dark-50">
          {row.original.refund_id}
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
      id: "product_name",
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => <TextValue value={row.original.product_name} />,
    },
    {
      id: "customer_name",
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => <TextValue value={row.original.customer_name} />,
    },
    {
      id: "vendor_name",
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => <TextValue value={row.original.vendor_name} />,
    },
    {
      id: "refund_amount",
      accessorKey: "refund_amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 dark:text-dark-50">
          {formatCurrency(row.original.refund_amount)}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <Badge color={statusColor(item.status)} variant="soft" className="capitalize">
              {item.status}
            </Badge>
            {item.status === "failed" && item.failure_reason && (
              <p className="mt-1 max-w-[11rem] text-[11px] text-error">
                {item.failure_reason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <TextValue
          value={formatDate(row.original.created_at)}
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
        if (item.status === "processed") {
          return (
            <span className="text-xs text-gray-400 dark:text-dark-300">
              Done{item.processed_at ? ` · ${formatDate(item.processed_at)}` : ""}
            </span>
          );
        }
        const isFailed = item.status === "failed";
        return (
          <Button
            color={isFailed ? "warning" : "primary"}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
            onClick={() => onProcess(item)}
          >
            {isFailed ? (
              <ArrowPathIcon className="size-4" />
            ) : (
              <BanknotesIcon className="size-4" />
            )}
            {isFailed ? "Retry Refund" : "Process Refund"}
          </Button>
        );
      },
    },
  ];
}