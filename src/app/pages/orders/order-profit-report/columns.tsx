import { ColumnDef } from "@tanstack/react-table";
import { ChartPieIcon } from "@heroicons/react/24/outline";

import { Badge, Button } from "@/components/ui";
import {
  agentTypeColor,
  fmt,
  fmtDate,
  orderStatusColor,
  ProfitOrderRow,
} from "./data";

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

export function getColumns({
  pageIndex,
  pageSize,
  onOpenReport,
}: {
  pageIndex: number;
  pageSize: number;
  onOpenReport: (row: ProfitOrderRow) => void;
}): ColumnDef<ProfitOrderRow>[] {
  return [
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      id: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-300">
          {row.original.orderId}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-gray-500 dark:text-dark-300">
          {fmtDate(row.original.orderDate)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <TextValue value={row.original.customerName} subValue={row.original.customerPhone} />
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const paid = row.original.paymentStatus === "completed";
        return (
          <div>
            <div className="font-semibold text-gray-800 dark:text-dark-100">
              {fmt(row.original.finalAmount)}
            </div>
            <div className={`text-[11px] font-medium ${paid ? "text-success" : "text-error"}`}>
              {paid ? "Paid" : "Unpaid"}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge color={orderStatusColor(row.original.orderStatus)} variant="soft" className="capitalize">
          {row.original.orderStatus}
        </Badge>
      ),
    },
    {
      id: "agent",
      header: "Agent",
      cell: ({ row }) => {
        const a = row.original.agentInfo;
        if (!a) {
          return <span className="text-xs italic text-gray-400 dark:text-dark-300">Direct Sale</span>;
        }
        return (
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-dark-100">{a.full_name}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge color={agentTypeColor(a.agent_type)} variant="soft" className="capitalize">
                {a.agent_type}
              </Badge>
              <span className={`text-[11px] ${a.is_active ? "text-success" : "text-error"}`}>
                {a.is_active ? "● Active" : "● Inactive"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "commission",
      header: "Commission",
      cell: ({ row }) => {
        const s = row.original.commissionStatus;
        return (
          <Badge
            color={s === "distributed" ? "success" : s === "pending" ? "warning" : "neutral"}
            variant="soft"
          >
            {s === "distributed" ? "Distributed" : s === "pending" ? "Pending" : "No Agent"}
          </Badge>
        );
      },
    },
    {
      id: "report",
      header: "Report",
      cell: ({ row }) => (
        <Button
          color="primary"
          variant="soft"
          className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          onClick={() => onOpenReport(row.original)}
        >
          <ChartPieIcon className="size-4" />
          Report
        </Button>
      ),
    },
  ];
}