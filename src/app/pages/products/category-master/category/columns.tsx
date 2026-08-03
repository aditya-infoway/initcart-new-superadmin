import { CellContext, ColumnDef } from "@tanstack/react-table";
import { EyeIcon, EyeSlashIcon, PhotoIcon, StarIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Avatar, Badge, Button } from "@/components/ui";
import { CategoryRowActions } from "./CategoryRowActions";
import { Category } from "./data";

function TextValue({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function IconCell({ getValue, row }: CellContext<Category, unknown>) {
  const icon = String(getValue() || "");
  const name = row.original.name || "Category";
  if (icon) {
    return <Avatar size={10} src={icon} name={name} initialColor="primary" />;
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-200">
      <PhotoIcon className="size-5" />
    </div>
  );
}

function StatusCell({ row }: CellContext<Category, unknown>) {
  return (
    <Badge color={row.original.isActive ? "success" : "neutral"} variant="soft">
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export function getColumns({
  onToggleFeatured,
  onToggleWebHome,
}: {
  onToggleFeatured: (category: Category) => Promise<void> | void;
  onToggleWebHome: (category: Category) => Promise<void> | void;
}): ColumnDef<Category>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "SR No", cell: ({ row }) => row.index + 1, enableSorting: false },
    { id: "name", accessorKey: "name", header: "Category", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "description", accessorKey: "description", header: "Description", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "platformCharge", accessorKey: "platformCharge", header: "Platform Charge", cell: ({ getValue }) => <TextValue value={`${String(getValue() || "0")}%`} /> },
    { id: "icon", accessorKey: "icon", header: "Icon", cell: IconCell, enableSorting: false },
    { id: "status", header: "Status", cell: StatusCell },
    {
      id: "showOnHomepage",
      header: "Show on Homepage",
      cell: ({ row }) => (
        <Button
          variant={row.original.showOnHomepage ? undefined : "outlined"}
          color={row.original.showOnHomepage ? "info" : "neutral"}
          className="h-8 rounded-full px-3 text-xs"
          onClick={() => onToggleWebHome(row.original)}
        >
          <span className="flex items-center gap-1.5">
            {row.original.showOnHomepage ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeSlashIcon className="size-4" />
            )}
            {row.original.showOnHomepage ? "Showing" : "Hidden"}
          </span>
        </Button>
      ),
      enableSorting: false,
    },
    {
      id: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <Button
          variant={row.original.featured ? undefined : "outlined"}
          color={row.original.featured ? "warning" : "neutral"}
          className="h-8 rounded-full px-3 text-xs"
          onClick={() => onToggleFeatured(row.original)}
        >
          <span className="flex items-center gap-1.5">
            <StarIcon className="size-4" />
            {row.original.featured ? "Featured" : "Mark Featured"}
          </span>
        </Button>
      ),
      enableSorting: false,
    },
    { id: "actions", header: "Action", cell: CategoryRowActions, enableSorting: false },
  ];
}
