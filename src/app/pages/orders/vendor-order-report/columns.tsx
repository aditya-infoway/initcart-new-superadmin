// pages/ecommerce/admin/reports/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import {
  AdminOrderReportRow,
  formatCurrency,
  formatDateTime,
  orderAgeLabel,
} from "./data";

function TextValue({ value }: { value: string }) {
  return (
    <div className="max-w-[180px] truncate text-gray-800 dark:text-dark-100">
      {value || "—"}
    </div>
  );
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "processing":
      return "secondary";
    case "shipped":
      return "primary";
    case "cancelled":
      return "error";
    case "refunded":
      return "warning";
    default:
      return "neutral";
  }
}

function StatusCell({ getValue }: { getValue: () => unknown }) {
  const status = String(getValue() || "");

  return (
    <Badge
      color={statusColor(status) as any}
      variant="soft"
      className="capitalize whitespace-nowrap"
    >
      {status || "—"}
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

// Same thresholds as old software: >=7 gray, >=3 orange, else green
function orderAgeClass(days: number) {
  if (days >= 7) return "text-gray-700 dark:text-dark-200";
  if (days >= 3) return "font-medium text-orange-600";
  return "font-medium text-green-600";
}

export const getColumns = (): ColumnDef<AdminOrderReportRow>[] => [
  {
    accessorKey: "sr_no",
    header: "SR",
    size: 60,
    cell: ({ getValue }) => (
      <span className="text-gray-600 dark:text-dark-200">
        {String(getValue() ?? "")}
      </span>
    ),
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
    // accessorFn includes the email so the table search also matches vendor email
    id: "vendor_name",
    header: "Vendor",
    size: 200,
    accessorFn: (row) => `${row.vendor_name} ${row.vendor_email}`,
    cell: ({ row }) => (
      <div className="max-w-[190px]">
        <div className="truncate font-medium text-gray-800 dark:text-dark-100">
          {row.original.vendor_name || "—"}
        </div>
        <div className="truncate text-xs text-gray-500 dark:text-dark-300">
          {row.original.vendor_email}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "customer_name",
    header: "Customer Name",
    size: 170,
    cell: ({ getValue }) => <TextValue value={String(getValue() || "")} />,
  },

  {
    accessorKey: "customer_phone",
    header: "Mobile",
    size: 130,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-gray-600 dark:text-dark-200">
        {String(getValue() || "—")}
      </span>
    ),
  },

  {
    accessorKey: "customer_city",
    header: "City",
    size: 130,
    cell: ({ getValue }) => <TextValue value={String(getValue() || "")} />,
  },

  {
    accessorKey: "customer_email",
    header: "Email",
    size: 200,
    cell: ({ getValue }) => <TextValue value={String(getValue() || "")} />,
  },

  {
    accessorKey: "payment_mode",
    header: "Payment Mode",
    size: 120,
    cell: PaymentModeCell,
  },

  {
    accessorKey: "order_amount",
    header: "Order Amount",
    size: 140,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-medium">
        {formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "platform_charge",
    header: "Platform Charge",
    size: 150,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-red-600">
        -{formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "received_amount",
    header: "Received Amount",
    size: 150,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-medium text-green-600">
        {formatCurrency(Number(getValue() || 0))}
      </span>
    ),
  },

  {
    accessorKey: "order_age_days",  
    header: "Order Age",
    size: 100,
    cell: ({ getValue }) => {
      const days = Number(getValue() || 0);
      return (
        <span className={`whitespace-nowrap ${orderAgeClass(days)}`}>
          {orderAgeLabel(days)}
        </span>
      );
    },
  },
];