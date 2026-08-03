import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { OrderRow } from "./data";
import { OrderRowActions } from "./OrderRowActions";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="font-medium text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

function getStatusBadgeColor(status: OrderRow["orderStatus"]) {
  switch (status) {
    case "pending":
      return "warning" as const;
    case "confirmed":
      return "info" as const;
    case "packaging":
      return "secondary" as const;
    case "out_for_delivery":
      return "primary" as const;
    case "delivered":
      return "success" as const;
    case "canceled":
      return "error" as const;
    case "returned":
      return "warning" as const;
    case "failed":
      return "error" as const;
    default:
      return "neutral" as const;
  }
}

interface ColumnOptions {
  onView: (order: OrderRow) => void;
  onOpenPdf: (order: OrderRow) => void;
  onMail: (order: OrderRow) => void;
}

export function getColumns({ onView, onOpenPdf, onMail }: ColumnOptions): ColumnDef<OrderRow>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "SL", cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return pageIndex * pageSize + row.index + 1;
      }, enableSorting: false },
    {
      id: "orderId",
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <TextValue value={row.original.orderId} subValue={`${row.original.itemCount} item${row.original.itemCount === 1 ? "" : "s"}`} />
      ),
    },
    {
      id: "orderDate",
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => <TextValue value={row.original.orderDate} subValue={`Payment ${row.original.paymentStatus}`} />,
    },
    {
      id: "customerInfo",
      accessorKey: "customerName",
      header: "Customer Info",
      cell: ({ row }) => (
        <TextValue value={row.original.customerName} subValue={`${row.original.customerPhone} • ${row.original.customerEmail}`} />
      ),
    },
    {
      id: "store",
      accessorKey: "storeName",
      header: "Store",
      cell: ({ row }) => <TextValue value={row.original.storeName} />,
    },
    {
      id: "totalAmount",
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => <TextValue value={row.original.totalAmountLabel} subValue={row.original.paymentStatus === "completed" ? "Paid" : "Pending Payment"} />,
    },
    {
      id: "orderStatus",
      accessorKey: "orderStatusLabel",
      header: "Order Status",
      cell: ({ row }) => (
        <Badge color={getStatusBadgeColor(row.original.orderStatus)} variant="soft">
          {row.original.orderStatusLabel}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <OrderRowActions
          order={row.original}
          onView={onView}
          onOpenPdf={onOpenPdf}
          onMail={onMail}
        />
      ),
    },
  ];
}
