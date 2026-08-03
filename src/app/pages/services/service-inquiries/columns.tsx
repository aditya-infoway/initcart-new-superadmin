import { ColumnDef, Getter, Row, Table } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "@/app/pages/master/shared/tableCells";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import { ServiceInquiry } from "./data";
import { Highlight } from "@/components/shared/Highlight";
import { ensureString } from "@/utils/ensureString";
import { Button } from "@/components/ui";

function DateTimeCell({
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

function MessageCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const value = getValue() || "—";
  const display =
    value.length > 40 ? value.slice(0, 40) + "…" : value;
  return (
    <span className="dark:text-dark-100 text-gray-800">
      <Highlight query={globalQuery}>{display}</Highlight>
    </span>
  );
}

function PhoneCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const value = getValue();
  if (!value) {
    return (
      <span className="dark:text-dark-300 text-gray-400">—</span>
    );
  }
  return (
    <a
      href={`tel:${value}`}
      className="dark:text-primary-400 text-primary-600 hover:underline"
    >
      <Highlight query={globalQuery}>{value}</Highlight>
    </a>
  );
}

function RowActions({
  row,
  table,
}: {
  row: Row<ServiceInquiry>;
  table: Table<ServiceInquiry>;
}) {
  return (
    <Button
      variant="outlined"
      isIcon
      className="size-8 rounded-full"
      onClick={() => table.options.meta?.openViewModal?.(row.original)}
      title="View details"
    >
      <EyeIcon className="size-4.5 stroke-1" />
    </Button>
  );
}

export const columns: ColumnDef<ServiceInquiry>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "serialNo",
    accessorKey: "serialNo",
    header: "SR No.",
    cell: TextCell,
    enableSorting: false,
  },
  {
    id: "id",
    accessorKey: "id",
    header: "Inquiry ID",
    cell: TextCell,
  },
  {
    id: "businessName",
    accessorKey: "businessName",
    header: "Business name",
    cell: TextCell,
  },
  {
    id: "serviceName",
    accessorKey: "serviceName",
    header: "Service",
    cell: TextCell,
  },
  {
    id: "customerName",
    accessorKey: "customerName",
    header: "Customer",
    cell: TextCell,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone",
    cell: PhoneCell,
  },
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    cell: TextCell,
  },
  {
    id: "message",
    accessorKey: "message",
    header: "Message",
    cell: MessageCell,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Date Time",
    cell: DateTimeCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "serialNo" as const, header: "SR No." },
  { key: "id" as const, header: "Inquiry ID" },
  { key: "businessName" as const, header: "Business name" },
  { key: "serviceName" as const, header: "Service" },
  { key: "serviceCategory" as const, header: "Service Category" },
  { key: "customerName" as const, header: "Customer" },
  { key: "phone" as const, header: "Phone" },
  { key: "email" as const, header: "Email" },
  { key: "city" as const, header: "City" },
  { key: "message" as const, header: "Message" },
  {
    key: "date" as const,
    header: "Date",
  },
  {
    key: "time" as const,
    header: "Time",
  },
];
