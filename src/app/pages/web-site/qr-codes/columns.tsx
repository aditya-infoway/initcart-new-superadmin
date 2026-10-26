import { CellContext, ColumnDef } from "@tanstack/react-table";
import { PhotoIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Avatar } from "@/components/ui";
import { QRCard } from "./data";
import { QRCardRowActions } from "./QRCardRowActions";

function TextValue({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">{value || "—"}</span>;
}

function LogoCell({ getValue, row }: CellContext<QRCard, unknown>) {
  const logo = String(getValue() || "");
  if (logo) {
    return <Avatar size={10} src={logo} name={row.original.name || "QR"} initialColor="primary" />;
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-dark-600 dark:text-dark-200">
      <PhotoIcon className="size-5" />
    </div>
  );
}

function QrCell({ getValue, row }: CellContext<QRCard, unknown>) {
  const qr = String(getValue() || "");
  if (!qr) return <span className="text-gray-400">—</span>;
  return (
    <img
      src={qr}
      alt={`${row.original.name} QR`}
      className="size-12 rounded border border-gray-200 bg-white object-contain dark:border-dark-500"
    />
  );
}

export function getColumns({
  onDownload,
}: {
  onDownload: (item: QRCard) => void;
}): ColumnDef<QRCard>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
    { id: "logo", accessorKey: "logo", header: "Logo", cell: LogoCell, enableSorting: false },
    { id: "name", accessorKey: "name", header: "Name", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "qrImage", accessorKey: "qrImage", header: "Generated QR", cell: QrCell, enableSorting: false },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row, table }) => (
        <QRCardRowActions row={row} table={table} onDownload={onDownload} />
      ),
    },
  ];
}