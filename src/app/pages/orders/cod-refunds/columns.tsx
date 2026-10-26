import { ColumnDef } from "@tanstack/react-table";
import { BanknotesIcon, EyeIcon } from "@heroicons/react/24/outline";

import { Badge, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "../../master/shared/refundUtils";
import { CodRefundItem } from "./types";

function TextValue({ value, className }: { value: string; className?: string }) {
  return <span className={className ?? "text-gray-800 dark:text-dark-100"}>{value || "—"}</span>;
}

interface Args {
  onPay: (item: CodRefundItem) => void;
  onView: (item: CodRefundItem) => void;
}

export function getColumns({ onPay, onView }: Args): ColumnDef<CodRefundItem>[] {
  return [
    {
      id: "refund_id", accessorKey: "refund_id", header: "Refund ID",
      cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-dark-50">{row.original.refund_id}</span>,
    },
    { id: "voucher_no", accessorKey: "voucher_no", header: "Voucher", cell: ({ row }) => <TextValue value={row.original.voucher_no || "-"} /> },
    { id: "order_number", accessorKey: "order_number", header: "Order", cell: ({ row }) => <TextValue value={row.original.order_number} /> },
    { id: "product_name", accessorKey: "product_name", header: "Product", cell: ({ row }) => <TextValue value={row.original.product_name} /> },
    { id: "customer_name", accessorKey: "customer_name", header: "Customer", cell: ({ row }) => <TextValue value={row.original.customer_name} /> },
    { id: "vendor_name", accessorKey: "vendor_name", header: "Vendor", cell: ({ row }) => <TextValue value={row.original.vendor_name} /> },
    {
      id: "refund_amount", accessorKey: "refund_amount", header: "Refund Amt",
      cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-dark-50">{formatCurrency(row.original.refund_amount)}</span>,
    },
    {
      id: "paid_amount", accessorKey: "paid_amount", header: "Paid",
      cell: ({ row }) => <TextValue value={row.original.paid_amount != null ? formatCurrency(row.original.paid_amount) : "-"} />,
    },
    {
      id: "paid_from", header: "Paid From", enableSorting: false,
      cell: ({ row }) => {
        const i = row.original;
        return <TextValue value={i.bank_account_name ? `${i.bank_account_name}${i.payment_mode_display ? ` · ${i.payment_mode_display}` : ""}` : "-"} />;
      },
    },
    {
      id: "status", accessorKey: "status", header: "Status", enableSorting: false,
      cell: ({ row }) => {
        const i = row.original;
        const paid = i.status === "processed";
        return (
          <div>
            <Badge color={paid ? "success" : i.status === "failed" ? "error" : "warning"} variant="soft" className="capitalize">
              {paid ? "paid" : i.status}
            </Badge>
            {!paid && i.has_bank_details === false && (
              <p className="mt-1 text-[11px] text-error">No bank details</p>
            )}
          </div>
        );
      },
    },
    {
      id: "date", header: "Date",
      cell: ({ row }) => (
        <TextValue value={formatDate(row.original.processed_at || row.original.created_at)} className="text-gray-500 dark:text-dark-300" />
      ),
    },
    {
      id: "action", header: "Action", enableSorting: false,
      cell: ({ row }) => {
        const i = row.original;
        return i.status !== "processed" ? (
          <Button color="primary" className="h-8 gap-1.5 rounded-lg px-3 text-xs" onClick={() => onPay(i)}>
            <BanknotesIcon className="size-4" /> Pay Refund
          </Button>
        ) : (
          <Button color="success" variant="soft" className="h-8 gap-1.5 rounded-lg px-3 text-xs" onClick={() => onView(i)}>
            <EyeIcon className="size-4" /> View
          </Button>
        );
      },
    },
  ];
}