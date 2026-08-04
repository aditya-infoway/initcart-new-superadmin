// pages/ecommerce/admin/reports/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import {
  formatCurrency,
  formatDateTime,
} from "./data";
import { AdminOrderReportRow } from "./data";

function TextValue({ value }: { value: string }) {
  return (
    <div className="max-w-[160px] truncate text-gray-800 dark:text-dark-100">
      {value || "—"}
    </div>
  );
}

function StatusCell({ getValue }: { getValue: () => unknown }) {
  const status = String(getValue() || "");

  let color: "success" | "warning" | "info" | "danger" | "neutral" = "neutral";

  switch (status.toLowerCase()) {
    case "delivered":
      color = "success";
      break;
    case "pending":
      color = "warning";
      break;
    case "confirmed":
    case "processing":
    case "shipped":
      color = "info";
      break;
    case "cancelled":
      color = "danger";
      break;
    case "refunded":
      color = "warning";
      break;
    default:
      color = "neutral";
  }

  return (
    <Badge
     
      variant="soft"
      className="capitalize whitespace-nowrap"
    >
      {status}
    </Badge>
  );
}

function PaymentModeCell({ getValue }: { getValue: () => unknown }) {
  const mode = String(getValue() || "");

  return (
    <Badge
      color={mode === "razorpay" ? "info" : "warning"}
      variant="soft"
      className="whitespace-nowrap"
    >
      {mode === "razorpay" ? "Online" : "COD"}
    </Badge>
  );
}

export const getColumns = (): ColumnDef<AdminOrderReportRow>[] => [
  {
    accessorKey: "sr_no",
    header: "SR",
    size: 60,
    cell: ({ row }) => row.index + 1,
  },

  {
    accessorKey: "order_number",
    header: "Order ID",
    size: 140,
    cell: ({ getValue }) => (
      <span className="font-medium whitespace-nowrap">
        {String(getValue() || "")}
      </span>
    ),
  },

  {
    accessorKey: "order_time",
    header: "Order Time",
    size: 170,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDateTime(String(getValue() || ""))}
      </span>
    ),
  },

  {
    accessorKey: "order_status",
    header: "Status",
    size: 120,
    cell: StatusCell,
  },

  {
    accessorKey: "vendor_name",
    header: "Vendor",
    size: 180,
    cell: ({ row }) => (
      <div className="max-w-[170px]">
        <div className="truncate font-medium">
          {row.original.vendor_name}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "customer_name",
    header: "Customer",
    size: 170,
    cell: ({ getValue }) => (
      <TextValue value={String(getValue() || "")} />
    ),
  },

  {
    accessorKey: "payment_mode",
    header: "Payment",
    size: 110,
    cell: PaymentModeCell,
  },

  {
    accessorKey: "order_amount",
    header: "Amount",
    size: 130,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-medium">
        {formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "platform_charge",
    header: "Charge",
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-red-600 whitespace-nowrap">
        -{formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "received_amount",
    header: "Received",
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-green-600 whitespace-nowrap font-medium">
        {formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "order_age_days",
    header: "Age",
    size: 70,
    cell: ({ getValue }) => {
      const days = Number(getValue() || 0);

      return (
        <span className="whitespace-nowrap">
          {days === 0 ? "Today" : `${days}d`}
        </span>
      );
    },
  },
];