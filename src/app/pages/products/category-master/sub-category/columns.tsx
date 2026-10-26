import { CellContext, ColumnDef } from "@tanstack/react-table";
import { PhotoIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Avatar, Badge } from "@/components/ui";
import { SubCategoryRowActions } from "./SubCategoryRowActions";
import { SubCategory } from "./data";

function TextValue({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function DescriptionCell({ getValue }: CellContext<SubCategory, unknown>) {
  const value = String(getValue() || "");
  return (
    <span
      title={value}
      className="line-clamp-2 max-w-[16rem] text-sm text-gray-600 dark:text-dark-200"
    >
      {value || "—"}
    </span>
  );
}

function IconCell({ getValue, row }: CellContext<SubCategory, unknown>) {
  const icon = String(getValue() || "");
  const name = row.original.name || "Sub Category";
  if (icon) {
    return <Avatar size={10} src={icon} name={name} initialColor="primary" />;
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-200">
      <PhotoIcon className="size-5" />
    </div>
  );
}

function BannerCell({ getValue, row }: CellContext<SubCategory, unknown>) {
  const banner = String(getValue() || "");
  if (banner) {
    return (
      <img
        src={banner}
        alt={`${row.original.name} banner`}
        className="h-20 w-12 rounded border border-gray-200 object-cover dark:border-dark-500"
      />
    );
  }
  return <span className="text-xs text-gray-400 dark:text-dark-300">No Banner</span>;
}

function StatusCell({ row }: CellContext<SubCategory, unknown>) {
  return (
    <Badge color={row.original.isActive ? "success" : "neutral"} variant="soft">
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export const columns: ColumnDef<SubCategory>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
  { id: "icon", accessorKey: "icon", header: "Icon", cell: IconCell, enableSorting: false },
  { id: "banner", accessorKey: "banner", header: "Banner", cell: BannerCell, enableSorting: false },
  { id: "parentCategoryName", accessorKey: "parentCategoryName", header: "Parent Category", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "name", accessorKey: "name", header: "Name", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
  { id: "description", accessorKey: "description", header: "Description", cell: DescriptionCell },
  { id: "status", header: "Status", cell: StatusCell },
  { id: "actions", header: "Action", cell: SubCategoryRowActions, enableSorting: false },
];