// Import Dependencies
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MapPinIcon, PhoneIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Local Imports
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { Badge, Button } from "@/components/ui";
import { formatDateDDMMYYYY } from "@/ApiHelper";
import {
  ServiceApproval,
  getCategoryColor,
  getCategoryLabel,
} from "./data";

// ----------------------------------------------------------------------

function StatusBadge({ row }: CellContext<ServiceApproval, unknown>) {
  const { status } = row.original;
  const color =
    status === "approved" ? "success" : status === "rejected" ? "error" : "warning";
  return (
    <Badge color={color} variant="soft" className="capitalize">
      <span className="mr-1 inline-block size-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CategoryBadge({ row }: CellContext<ServiceApproval, unknown>) {
  const { subcategoryName, category } = row.original;
  return (
    <Badge color={getCategoryColor(category)} variant="soft">
      {subcategoryName || getCategoryLabel(category)}
    </Badge>
  );
}

function BusinessCell({ row }: CellContext<ServiceApproval, unknown>) {
  const { businessName, id } = row.original;
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">{businessName}</p>
      <p className="text-xs text-gray-400 dark:text-dark-300">#{id}</p>
    </div>
  );
}

function ContactCell({ row }: CellContext<ServiceApproval, unknown>) {
  const { contactNo, whatsappNo } = row.original;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-dark-100">
        <PhoneIcon className="size-3.5 shrink-0 text-gray-400" />
        <span>{contactNo || "—"}</span>
      </div>
      {whatsappNo && (
        <p className="text-xs font-semibold text-success">
          WA: {whatsappNo}
        </p>
      )}
    </div>
  );
}

function LocationCell({ row }: CellContext<ServiceApproval, unknown>) {
  const { city } = row.original;
  return (
    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-dark-200">
      <MapPinIcon className="size-4 shrink-0 text-gray-400" />
      <span>{city || "—"}</span>
    </div>
  );
}

function ActionCell({ row, table }: CellContext<ServiceApproval, unknown>) {
  const service = row.original;
  const meta = table.options.meta as any;

  return (
    <div className="flex items-center gap-2">
      {/* View */}
      <Button
        isIcon
        variant="outlined"
        color="primary"
        className="size-8 rounded-full border-primary/30 text-primary hover:bg-primary/10"
        onClick={() => meta?.onView?.(service)}
        title="View Details"
      >
        <EyeIcon className="size-4" />
      </Button>

      {/* Reject */}
      <Button
        isIcon
        variant="outlined"
        color="error"
        className="size-8 rounded-full border-error/30 text-error hover:bg-error/10"
        onClick={() => meta?.rejectRow?.(service)}
        title="Reject"
      >
        <XCircleIcon className="size-4" />
      </Button>
    </div>
  );
}

export function getServiceApprovalColumns(): ColumnDef<ServiceApproval>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "srNo",
      header: "#",
      size: 55,
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-dark-300">
          {row.index + 1}
        </span>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "subcategoryName",
      header: "Category",
      cell: CategoryBadge,
      enableSorting: false,
    },
    {
      id: "businessName",
      accessorKey: "businessName",
      header: "Business",
      cell: BusinessCell,
    },
    {
      id: "contactNo",
      accessorKey: "contactNo",
      header: "Contact",
      cell: ContactCell,
    },
    {
      id: "city",
      accessorKey: "city",
      header: "Location",
      cell: LocationCell,
    },
    {
      id: "status",
      header: "Status",
      cell: StatusBadge,
      enableSorting: false,
    },
    {
      id: "approvedDate",
      accessorKey: "approvedDate",
      header: "Approved On",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 dark:text-dark-300">
          {formatDateDDMMYYYY(String(getValue() || ""))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ActionCell,
      size: 100,
      enableSorting: false,
      enableGlobalFilter: false,
    },
  ];
}
