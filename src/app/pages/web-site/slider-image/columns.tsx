import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../../master/shared/createRowActions";
import { SliderImage } from "./data";

const RowActions = createRowActions<SliderImage>("slider image");

export const columns: ColumnDef<SliderImage>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "srNo",
    accessorKey: "srNo",
    header: "Sr No.",
    cell: ({ getValue }) => (
      <span className="dark:text-dark-100 text-gray-800">{(getValue() as number) || "—"}</span>
    ),
  },
  {
    id: "preview",
    accessorKey: "imageUrl",
    header: "Preview",
    cell: ({ getValue }) => {
      const imageUrl = getValue() as string | undefined;
      return imageUrl ? (
        <img src={imageUrl} alt="Slider preview" className="h-16 w-32 rounded object-cover" />
      ) : (
        <span className="dark:text-dark-100 text-gray-800">—</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "srNo" as const, header: "Sr No." },
  { key: "imageUrl" as const, header: "Image URL" },
];
