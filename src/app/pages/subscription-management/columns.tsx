import { ColumnDef } from "@tanstack/react-table";

import { Switch } from "@/components/ui";
import { SubscriptionPlan } from "./data";
import { SubscriptionRowActions } from "./SubscriptionRowActions";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="font-medium text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}



export function getColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  onEdit: (row: SubscriptionPlan) => void;
  onDelete: (row: SubscriptionPlan) => void;
  onToggleStatus: (row: SubscriptionPlan, checked: boolean) => void;
}): ColumnDef<SubscriptionPlan>[] {
  return [
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "id",
      accessorKey: "numericId",
      header: "ID",
      cell: ({ row }) => <TextValue value={String(row.original.numericId)} />,
    },
    {
      id: "serviceType",
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => <TextValue value={row.original.serviceType} />,
    },
    {
      id: "subscriptionType",
      accessorKey: "subscriptionType",
      header: "Subscription Type",
      cell: ({ row }) => <TextValue value={row.original.subscriptionType} />,
    },
    {
      id: "amount",
      accessorKey: "amountLabel",
      header: "Amount",
      cell: ({ row }) => <TextValue value={row.original.amountLabel} />,
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <TextValue value={row.original.description} />,
    },
    {
      id: "status",
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onChange={(e) => onToggleStatus(row.original, e.target.checked)}
          color="primary"
        />
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <SubscriptionRowActions row={row.original} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}
