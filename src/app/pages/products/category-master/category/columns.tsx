import { CellContext, ColumnDef } from "@tanstack/react-table";
import { EyeIcon, EyeSlashIcon, PhotoIcon, StarIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Avatar, Badge } from "@/components/ui";
import { CategoryRowActions } from "./CategoryRowActions";
import { ConfirmToggleCell } from "./confirmToggleCell";
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

function BannerCell({ getValue, row }: CellContext<Category, unknown>) {
  const banner = String(getValue() || "");
  if (banner) {
    return (
      <img
        src={banner}
        alt={`${row.original.name} banner`}
        style={{ aspectRatio: "8 / 5" }}
        className="w-24 rounded border border-gray-200 object-cover dark:border-dark-500"
      />
    );
  }
  return <span className="text-xs text-gray-400 dark:text-dark-300">No Banner</span>;
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
  onToggleFeatured: (category: Category) => Promise<boolean> | boolean;
  onToggleWebHome: (category: Category) => Promise<boolean> | boolean;
}): ColumnDef<Category>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "SR No", cell: ({ row }) => row.index + 1, enableSorting: false },
    { id: "name", accessorKey: "name", header: "Category", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "description", accessorKey: "description", header: "Description", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "platformCharge", accessorKey: "platformCharge", header: "Platform Charge", cell: ({ getValue }) => <TextValue value={`${String(getValue() || "0")}%`} /> },
    { id: "icon", accessorKey: "icon", header: "Icon", cell: IconCell, enableSorting: false },
    { id: "banner", accessorKey: "banner", header: "Banner", cell: BannerCell, enableSorting: false },
    { id: "status", header: "Status", cell: StatusCell },
    {
      id: "showOnHomepage",
      header: "Show on Homepage",
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <ConfirmToggleCell
            variant={c.showOnHomepage ? undefined : "outlined"}
            color={c.showOnHomepage ? "info" : "neutral"}
            description={
              c.showOnHomepage
                ? `Remove "${c.name}" from homepage sliders?`
                : `Show "${c.name}" category on homepage sliders?`
            }
            successTitle={
              c.showOnHomepage
                ? "Category removed from homepage"
                : "Category will now appear on homepage"
            }
            onConfirm={() => onToggleWebHome(c)}
          >
            <span className="flex items-center gap-1.5">
              {c.showOnHomepage ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="size-4" />}
              {c.showOnHomepage ? "Showing" : "Hidden"}
            </span>
          </ConfirmToggleCell>
        );
      },
    },
    {
      id: "featured",
      header: "Featured",
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <ConfirmToggleCell
            variant={c.featured ? undefined : "outlined"}
            color={c.featured ? "warning" : "neutral"}
            description={
              c.featured
                ? `Remove "${c.name}" from featured categories?`
                : `Mark "${c.name}" as featured category?`
            }
            successTitle={
              c.featured ? "Category removed from featured" : "Category marked as featured"
            }
            onConfirm={() => onToggleFeatured(c)}
          >
            <span className="flex items-center gap-1.5">
              <StarIcon className="size-4" />
              {c.featured ? "Featured" : "Mark Featured"}
            </span>
          </ConfirmToggleCell>
        );
      },
    },
    { id: "actions", header: "Action", cell: CategoryRowActions, enableSorting: false },
  ];
}