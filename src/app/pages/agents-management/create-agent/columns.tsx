// Import Dependencies
import { CellContext, ColumnDef, Getter } from "@tanstack/react-table";

// Local Imports
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { Highlight } from "@/components/shared/Highlight";
import { ensureString } from "@/utils/ensureString";
import { Agent, AGENT_TYPE_OPTIONS, AgentType } from "./data";
import { AgentRowActions } from "./AgentRowActions";

// ----------------------------------------------------------------------

function TextValue({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function StatusBadgeCell({ row }: CellContext<Agent, unknown>) {
  const { status } = row.original;
  const color =
    status === "approved" ? "success" : status === "rejected" ? "error" : "warning";
  return (
    <Badge color={color} variant="soft">
      {status ? status[0].toUpperCase() + status.slice(1) : "Pending"}
    </Badge>
  );
}

const TYPE_META: Record<AgentType, { color: "primary" | "success" | "info"; label: string }> = {
  normal: { color: "info", label: "Normal" },
  pos: { color: "primary", label: "POS" },
  society: { color: "success", label: "Society" },
};

function TypeBadgeCell({ row }: CellContext<Agent, unknown>) {
  const meta = TYPE_META[row.original.agentType as AgentType] || TYPE_META.normal;
  return (
    <Badge color={meta.color} variant="soft">
      {meta.label}
    </Badge>
  );
}

function CreatedByCell({ row }: CellContext<Agent, unknown>) {
  const username = row.original.createdBy?.username || "System";
  return (
    <span className="capitalize text-gray-800 dark:text-dark-100">{username}</span>
  );
}

function JoinedCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const value = getValue();
  if (!value) return <TextValue value="—" />;
  return (
    <span className="text-gray-800 dark:text-dark-100">
      <Highlight query={globalQuery}>{formatDateDDMMYYYY(value)}</Highlight>
    </span>
  );
}

function ActionCell({ row, table }: CellContext<Agent, unknown>) {
  return (
    <div className="flex items-center justify-center">
      <AgentRowActions row={row} table={table} />
    </div>
  );
}

export function getColumns(): ColumnDef<Agent>[] {
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
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => <TextValue value={String(getValue() || "")} />,
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
        if (!v || v === "—") return <TextValue value="—" />;
        return (
          <a
            href={`tel:${v}`}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {v}
          </a>
        );
      },
    },
    { id: "type", header: "Type", cell: TypeBadgeCell },
    { id: "createdBy", header: "Created By", cell: CreatedByCell },
    { id: "status", header: "Status", cell: StatusBadgeCell },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Joined",
      cell: JoinedCell as any,
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

export { AGENT_TYPE_OPTIONS };
