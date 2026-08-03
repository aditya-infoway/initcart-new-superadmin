import { ColumnDef, Getter } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../../../master/shared/createRowActions";
import { StatusCell, TextCell } from "../../../master/shared/tableCells";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { ServiceSubcategory } from "./data";
import { Highlight } from "@/components/shared/Highlight";
import { ensureString } from "@/utils/ensureString";

function DateCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const formatted = formatDateDDMMYYYY(getValue());
  return (
    <span className="dark:text-dark-100 text-gray-800">
      <Highlight query={globalQuery}>{formatted}</Highlight>
    </span>
  );
}

function ImageCell({ getValue }: { getValue: Getter<string> }) {
  const value = getValue();
  if (!value) {
    return (
      <div className="h-10 w-10 flex items-center justify-center rounded-md bg-gray-100 dark:bg-dark-600 text-gray-400 text-xs">
        —
      </div>
    );
  }
  return (
    <img
      src={value}
      alt="Subcategory"
      className="h-10 w-10 rounded-md object-cover"
    />
  );
}

const RowActions = createRowActions<ServiceSubcategory>("service-subcategory");

export const columns: ColumnDef<ServiceSubcategory>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "id",
    accessorKey: "id",
    header: "Subcategory ID",
    cell: TextCell,
  },
  {
    id: "parentServiceName",
    accessorKey: "parentServiceName",
    header: "Parent Service",
    cell: TextCell,
  },
  {
    id: "subcategoryName",
    accessorKey: "subcategoryName",
    header: "Subcategory Name",
    cell: TextCell,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: TextCell,
  },
  {
    id: "image",
    accessorKey: "image",
    header: "Image",
    cell: ImageCell,
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: StatusCell,
  },
  {
    id: "createdOn",
    accessorKey: "createdOn",
    header: "Created On",
    cell: DateCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "id" as const, header: "Subcategory ID" },
  { key: "parentServiceName" as const, header: "Parent Service" },
  { key: "subcategoryName" as const, header: "Subcategory Name" },
  { key: "description" as const, header: "Description" },
  { key: "status" as const, header: "Status", format: (value: unknown) => value === "active" ? "Active" : "Inactive" },
  { key: "createdOn" as const, header: "Created On", format: (value: unknown) => formatDateDDMMYYYY(value as string) },
];
