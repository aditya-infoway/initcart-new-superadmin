import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui";
import { ProfitOrderRow } from "./data";
import { OrderProfitRowActions } from "./OrderProfitRowActions";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="font-medium text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

function getStatusColor(status: ProfitOrderRow["status"]) {
  switch (status) {
    case "delivered":
      return "success" as const;
    case "confirmed":
      return "info" as const;
    case "pending":
      return "warning" as const;
    case "packaging":
      return "secondary" as const;
    case "out_for_delivery":
      return "primary" as const;
    case "canceled":
    case "failed":
      return "error" as const;
    case "returned":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function getColumns({ onOpenReport }: { onOpenReport: (row: ProfitOrderRow) => void }): ColumnDef<ProfitOrderRow>[] {
  return [
    {
      id: "orderId",
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => <TextValue value={row.original.orderId} />,
    },
    {
      id: "date",
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <TextValue value={row.original.date} />,
    },
    {
      id: "customer",
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <TextValue value={row.original.customer} />,
    },
    {
      id: "amount",
      accessorKey: "amountLabel",
      header: "Amount",
      cell: ({ row }) => <TextValue value={row.original.amountLabel} />,
    },
    {
      id: "status",
      accessorKey: "statusLabel",
      header: "Status",
      cell: ({ row }) => <Badge color={getStatusColor(row.original.status)} variant="soft">{row.original.statusLabel}</Badge>,
    },
    {
      id: "agent",
      accessorKey: "agentName",
      header: "Agent",
      cell: ({ row }) => <TextValue value={row.original.agentName} subValue={row.original.hasAgent ? row.original.agentType : "Direct sale"} />,
    },
    {
      id: "commission",
      accessorKey: "commissionAmountLabel",
      header: "Commission",
      cell: ({ row }) => (
        <TextValue
          value={row.original.commissionAmountLabel}
          subValue={row.original.commissionStatus === "distributed" ? "Distributed" : "Pending"}
        />
      ),
    },
    {
      id: "report",
      header: "Report",
      enableSorting: false,
      cell: ({ row }) => <OrderProfitRowActions row={row.original} onOpenReport={onOpenReport} />,
    },
  ];
}
