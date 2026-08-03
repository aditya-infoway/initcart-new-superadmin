import { CellContext, ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { LoyaltyRuleRowActions } from "./LoyaltyRuleRowActions";
import { LoyaltyRule } from "./data";

function StatusCell({ row }: CellContext<LoyaltyRule, unknown>) {
  return (
    <Badge color={row.original.isActive ? "success" : "neutral"} variant="soft">
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function TextValue({ value }: { value: string | number }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

export function getColumns({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  onView: (rule: LoyaltyRule) => void;
  onEdit: (rule: LoyaltyRule) => void;
  onDelete: (rule: LoyaltyRule) => Promise<void> | void;
  onToggleStatus: (rule: LoyaltyRule) => Promise<void> | void;
}): ColumnDef<LoyaltyRule>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
    { id: "status", header: "Status", cell: StatusCell },
    { id: "ruleName", accessorKey: "ruleName", header: "Rule Name", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    {
      id: "points",
      header: "Points",
      cell: ({ row }) => (
        <TextValue
          value={
            row.original.pointsType === "percentage"
              ? `${row.original.percentageRate || 0}%`
              : row.original.pointsType === "fixed"
                ? row.original.fixedPoints || 0
                : row.original.tieredValue || "—"
          }
        />
      ),
    },
    { id: "minOrderAmount", accessorKey: "minOrderAmount", header: "Min Order", cell: ({ getValue }) => <TextValue value={`₹${String(getValue() || 0)}`} /> },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => (
        <div className="text-gray-800 dark:text-dark-100 leading-5">
          {row.original.validTo ? (
            <>
              <div>{row.original.validFrom}</div>
              <div>to {row.original.validTo}</div>
            </>
          ) : (
            <div>{row.original.validFrom || "No expiry"}</div>
          )}
        </div>
      ),
    },
    { id: "priority", accessorKey: "priority", header: "Priority", cell: ({ getValue }) => <TextValue value={Number(getValue() || 0)} /> },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <LoyaltyRuleRowActions
          rule={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ),
      enableSorting: false,
    },
  ];
}
