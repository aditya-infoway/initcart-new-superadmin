import { CellContext, ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge } from "@/components/ui";
import { TextCell } from "@/app/pages/master/shared/tableCells";
import { ApprovalRowActions } from "./ApprovalRowActions";
import { VendorParticipationApproval } from "./data";

function StatusCell() {
  return (
    <Badge color="warning" variant="soft">
      Pending
    </Badge>
  );
}

function DateCell({ getValue }: CellContext<VendorParticipationApproval, unknown>) {
  const value = String(getValue() || "");
  return (
    <span className="text-gray-800 dark:text-dark-100">
      {value ? new Date(value).toLocaleDateString() : "—"}
    </span>
  );
}

export function getColumns({
  onView,
  onApprove,
  onReject,
}: {
  onView: (approval: VendorParticipationApproval) => void;
  onApprove: (approval: VendorParticipationApproval) => void;
  onReject: (approval: VendorParticipationApproval) => void;
}): ColumnDef<VendorParticipationApproval>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "requestId",
      accessorKey: "requestId",
      header: "Request ID",
      cell: TextCell,
    },
    {
      id: "campaignName",
      accessorKey: "campaignName",
      header: "Campaign",
      cell: TextCell,
    },
    {
      id: "vendorName",
      accessorKey: "vendorName",
      header: "Vendor Name",
      cell: TextCell,
    },
    {
      id: "businessName",
      accessorKey: "businessName",
      header: "Business Name",
      cell: TextCell,
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: TextCell,
    },
    {
      id: "requestDate",
      accessorKey: "requestDate",
      header: "Date",
      cell: DateCell,
    },
    {
      id: "status",
      header: "Status",
      cell: StatusCell,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <ApprovalRowActions
          approval={row.original}
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
        />
      ),
      enableSorting: false,
    },
  ];
}
