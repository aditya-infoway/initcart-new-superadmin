import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { MasterTable } from "@/app/pages/master/shared/MasterTable";
import { ApprovalViewModal } from "./ApprovalViewModal";
import {
  ApproveVendorFormValues,
  ApproveVendorModal,
} from "./ApproveVendorModal";
import { getColumns } from "./columns";
import {
  mapApiToParticipationApproval,
  VendorParticipationApproval,
} from "./data";

const LIST_API = "ecommerce/vendor-approvals/pending";
const APPROVAL_API = "ecommerce/vendor-approvals";

export default function VendorParticipationApprovalPage() {
  const [data, setData] = useState<VendorParticipationApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [viewing, setViewing] = useState<VendorParticipationApproval | null>(null);
  const [approving, setApproving] = useState<VendorParticipationApproval | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get(`${LIST_API}/`, {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.participations)
          ? response.data.participations
          : Array.isArray(response.data?.approval_requests)
            ? response.data.approval_requests
            : Array.isArray(response.data?.results)
              ? response.data.results
              : Array.isArray(response.data?.data)
                ? response.data.data
                : [];

      setData(rows.map(mapApiToParticipationApproval));
    } catch {
      toasterrormsg(
        "Something went wrong while fetching campaign vendor participation requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (
    payload: ApproveVendorFormValues,
    approval: VendorParticipationApproval,
  ) => {
    try {
      await Post(
        `${APPROVAL_API}/${approval.id}/approve/`,
        {
          bank_name: payload.bankName.trim(),
          account_number: payload.accountNumber.trim(),
          ifsc_code: payload.ifscCode.trim(),
          upi_id: payload.upiId.trim(),
        },
        false,
      );
      toastsuccessmsg("Vendor participation approved successfully.");
      setData((prev) => prev.filter((item) => item.id !== approval.id));
      setRowSelection({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while approving vendor participation.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleReject = async (approval: VendorParticipationApproval) => {
    try {
      await Post(`${APPROVAL_API}/${approval.id}/reject/`, {}, false);
      toastsuccessmsg("Vendor participation rejected successfully.");
      setData((prev) => prev.filter((item) => item.id !== approval.id));
      setRowSelection({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while rejecting vendor participation.";
      toasterrormsg(message);
    }
  };

  const columns = getColumns({
    onView: (approval) => {
      setViewing(approval);
      setViewOpen(true);
    },
    onApprove: (approval) => {
      setApproving(approval);
      setApproveOpen(true);
    },
    onReject: handleReject,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {},
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Vendor Participation Approval">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
            Vendor Participation Approval
          </h1>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading campaign vendor participation requests..."
              : "No pending campaign vendor participation requests found."
          }
        />
      </div>

      <ApprovalViewModal
        isOpen={viewOpen}
        close={() => setViewOpen(false)}
        approval={viewing}
      />

      <ApproveVendorModal
        isOpen={approveOpen}
        close={() => setApproveOpen(false)}
        approval={approving}
        onApprove={handleApprove}
      />
    </Page>
  );
}
