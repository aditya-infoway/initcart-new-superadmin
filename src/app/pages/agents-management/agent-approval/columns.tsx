// Import Dependencies
import { CellContext, ColumnDef, Getter } from "@tanstack/react-table";

// Local Imports
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { Highlight } from "@/components/shared/Highlight";
import { ensureString } from "@/utils/ensureString";
import { ApprovalAgent, AGENT_TYPE_LABEL } from "./data";
import { ApprovalRowActions } from "./ApprovalRowActions";

// ----------------------------------------------------------------------

function TextCell({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function StatusBadgeCell({ row }: CellContext<ApprovalAgent, unknown>) {
  const { status } = row.original;
  const color =
    status === "approved" ? "success" : status === "rejected" ? "error" : "warning";
  return (
    <Badge color={color} variant="soft">
      {status ? status[0].toUpperCase() + status.slice(1) : "Pending"}
    </Badge>
  );
}

function TypeBadgeCell({ row }: CellContext<ApprovalAgent, unknown>) {
  const type = row.original.agentType;
  const color =
    type === "pos" ? "primary" : type === "society" ? "success" : "info";
  const label = AGENT_TYPE_LABEL[type] ?? type;
  return (
    <Badge color={color} variant="soft">
      {label}
    </Badge>
  );
}

function AppliedOnCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const query = ensureString(table.getState().globalFilter);
  const value = getValue();
  if (!value) return <TextCell value="—" />;
  return (
    <span className="text-gray-800 dark:text-dark-100">
      <Highlight query={query}>{formatDateDDMMYYYY(value)}</Highlight>
    </span>
  );
}

function ActionCell({ row, table }: CellContext<ApprovalAgent, unknown>) {
  return (
    <div className="flex items-center justify-center">
      <ApprovalRowActions row={row} table={table} />
    </div>
  );
}

export function getApprovalColumns(): ColumnDef<ApprovalAgent>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "srNo",
      header: "#",
      size: 60,
      cell: ({ row }) => (
        <span className="text-gray-800 dark:text-dark-100">{row.index + 1}</span>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "fullName",
      accessorKey: "fullName",
      header: "Name",
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {String(getValue() || "—")}
        </span>
      ),
    },
    {
      id: "contactNumber",
      accessorKey: "contactNumber",
      header: "Contact",
      cell: ({ getValue }) => {
        const v = String(getValue() || "");
        if (!v || v === "—") return <TextCell value="—" />;
        return (
          <a
            href={`tel:${v}`}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {v}
          </a>
        );
      },
    },
    {
      id: "agentType",
      header: "Type",
      cell: TypeBadgeCell,
    },
    {
      id: "societyOrBusinessName",
      accessorKey: "societyOrBusinessName",
      header: "Business / Society",
      cell: ({ getValue }) => <TextCell value={String(getValue() || "—")} />,
    },
    {
      id: "status",
      header: "Status",
      cell: StatusBadgeCell,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Applied On",
      cell: AppliedOnCell as any,
    },
    {
      id: "actions",
      header: "Action",
      cell: ActionCell,
      size: 60,
      enableSorting: false,
      enableGlobalFilter: false,
    },
  ];
}
