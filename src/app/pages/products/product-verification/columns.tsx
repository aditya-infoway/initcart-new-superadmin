import { CellContext, ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { ProductRowActions } from "./ProductRowActions";
import { ProductVerification } from "./data";

function TextValue({ value, subValue }: { value: string; subValue?: string }) {
  return (
    <div>
      <div className="text-gray-800 dark:text-dark-100">{value || "—"}</div>
      {subValue ? <div className="text-xs text-gray-500 dark:text-dark-300">{subValue}</div> : null}
    </div>
  );
}

function PriceCell({ value }: { value: string }) {
  return <span className="text-gray-800 dark:text-dark-100">₹{value || "0"}</span>;
}

function StockCell({ row }: CellContext<ProductVerification, unknown>) {
  const stock = row.original.stocks[0];
  return (
    <div className="space-y-1 text-sm text-gray-800 dark:text-dark-100">
      <div>Qty: {stock?.stockQuantity ?? 0}</div>
      <div className="text-xs text-gray-500 dark:text-dark-300">Max Order: {stock?.maximumOrderQuantity ?? 0}</div>
    </div>
  );
}

function StatusCell({ row }: CellContext<ProductVerification, unknown>) {
  const status = row.original.status;
  const color = status === "approved" ? "success" : status === "rejected" ? "error" : "warning";
  return <Badge color={color} variant="soft">{status}</Badge>;
}

function SubmittedCell({ row }: CellContext<ProductVerification, unknown>) {
  return <TextValue value={new Date(row.original.submittedAt).toLocaleDateString()} subValue={new Date(row.original.submittedAt).toLocaleTimeString()} />;
}

export function getColumns({
  onView,
  onApprove,
  onReject,
}: {
  onView: (product: ProductVerification) => void;
  onApprove: (product: ProductVerification) => void;
  onReject: (product: ProductVerification) => void;
}): ColumnDef<ProductVerification>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "srNo", header: "#", cell: ({ row }) => row.index + 1, enableSorting: false },
    { id: "id", accessorKey: "id", header: "ID", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "vendor", header: "Vendor", cell: ({ row }) => <TextValue value={row.original.vendorName} subValue={row.original.vendorBusinessName} /> },
    { id: "vendorEmail", header: "Email", cell: ({ row }) => <TextValue value={row.original.vendorEmail} subValue={row.original.vendorPhone} /> },
    { id: "productName", accessorKey: "productName", header: "Product Name", cell: ({ row }) => <TextValue value={row.original.productName} subValue={row.original.productType} /> },
    { id: "sku", accessorKey: "sku", header: "SKU", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "brand", accessorKey: "brand", header: "Brand", cell: ({ getValue }) => <TextValue value={String(getValue() || "")} /> },
    { id: "category", header: "Category", cell: ({ row }) => <TextValue value={row.original.category} subValue={[row.original.subCategory, row.original.subSubCategory].filter(Boolean).join(" / ")} /> },
    { id: "mrp", header: "MRP", cell: ({ row }) => <PriceCell value={row.original.stocks[0]?.mrp || "0"} /> },
    { id: "sellingPrice", header: "Selling", cell: ({ row }) => <PriceCell value={row.original.stocks[0]?.sellingPrice || "0"} /> },
    { id: "finalPrice", header: "Final", cell: ({ row }) => <PriceCell value={row.original.stocks[0]?.finalPrice || "0"} /> },
    { id: "stock", header: "Stock", cell: StockCell },
    { id: "status", header: "Status", cell: StatusCell },
    { id: "submitted", header: "Submitted", cell: SubmittedCell },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => <ProductRowActions product={row.original} onView={onView} onApprove={onApprove} onReject={onReject} />,
      enableSorting: false,
    },
  ];
}
