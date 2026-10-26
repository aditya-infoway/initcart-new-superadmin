import { ColumnDef } from "@tanstack/react-table";
import { BookOpenIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Badge, Button } from "@/components/ui";
import { formatCurrency } from "../../master/shared/refundUtils";
import { Account } from "./types";

function TextValue({ value, className }: { value: string; className?: string }) {
  return <span className={className ?? "text-gray-800 dark:text-dark-100"}>{value || "—"}</span>;
}

interface Args {
  onLedger: (a: Account) => void;
  onEdit: (a: Account) => void;
  onToggle: (a: Account) => void;
  onDelete: (a: Account) => void;
}

export function getColumns({ onLedger, onEdit, onToggle, onDelete }: Args): ColumnDef<Account>[] {
  return [
    { id: "srNo", header: "#", enableSorting: false, cell: ({ row }) => row.index + 1 },
    {
      id: "account_name", accessorKey: "account_name", header: "Account Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-dark-50">{row.original.account_name}</span>
      ),
    },
    { id: "bank_name", accessorKey: "bank_name", header: "Bank", cell: ({ row }) => <TextValue value={row.original.bank_name} /> },
    { id: "account_number", accessorKey: "account_number", header: "Account No.", cell: ({ row }) => <TextValue value={row.original.account_number} /> },
    { id: "ifsc_code", accessorKey: "ifsc_code", header: "IFSC", cell: ({ row }) => <TextValue value={row.original.ifsc_code} /> },
    { id: "opening_balance", accessorKey: "opening_balance", header: "Opening", cell: ({ row }) => <TextValue value={formatCurrency(row.original.opening_balance)} /> },
    {
      id: "total_paid", accessorKey: "total_paid", header: "Paid Out",
      cell: ({ row }) => <span className="text-error">{formatCurrency(row.original.total_paid)}</span>,
    },
    {
      id: "closing_balance", accessorKey: "closing_balance", header: "Balance",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 dark:text-dark-50">{formatCurrency(row.original.closing_balance)}</span>
      ),
    },
    { id: "payments_count", accessorKey: "payments_count", header: "Payments", cell: ({ row }) => <TextValue value={String(row.original.payments_count)} /> },
    {
      id: "status", header: "Status", enableSorting: false,
      cell: ({ row }) => (
        <Badge color={row.original.is_active ? "success" : "neutral"} variant="soft">
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions", header: "Actions", enableSorting: false,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex flex-wrap gap-2">
            <Button color="primary" variant="soft" className="h-8 gap-1.5 rounded-lg px-3 text-xs" onClick={() => onLedger(a)}>
              <BookOpenIcon className="size-4" /> Ledger
            </Button>
            <Button variant="soft" className="h-8 gap-1.5 rounded-lg px-3 text-xs" onClick={() => onEdit(a)}>
              <PencilIcon className="size-4" /> Edit
            </Button>
            <Button color="warning" variant="soft" className="h-8 rounded-lg px-3 text-xs" onClick={() => onToggle(a)}>
              {a.is_active ? "Deactivate" : "Activate"}
            </Button>
            {a.payments_count === 0 && (
              <Button color="error" variant="soft" className="h-8 gap-1.5 rounded-lg px-3 text-xs" onClick={() => onDelete(a)}>
                <TrashIcon className="size-4" /> Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}