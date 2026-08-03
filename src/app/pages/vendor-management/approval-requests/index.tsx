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
import { MasterTable } from "../../master/shared/MasterTable";
import { ApprovalViewModal } from "./ApprovalViewModal";
import { ApproveVendorFormValues, ApproveVendorModal } from "./ApproveVendorModal";
import { getColumns } from "./columns";
import {
  mapApiVendorApprovalToApproval,
  VendorApproval,
} from "./data";

export default function ApprovalRequestsPage() {
  const [data, setData] = useState<VendorApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [viewing, setViewing] = useState<VendorApproval | null>(null);
  const [approving, setApproving] = useState<VendorApproval | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/vendor-approvals/pending/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.approval_requests)
          ? response.data.approval_requests
          : Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data?.data)
              ? response.data.data
              : [];

      setData(rows.map(mapApiVendorApprovalToApproval));
    } catch {
      toasterrormsg("Something went wrong while fetching vendor approval requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (
    payload: ApproveVendorFormValues,
    approval: VendorApproval,
  ) => {
    try {
      await Post(
        `ecommerce/vendor-approvals/${approval.id}/approve/`,
        {
          bank_name: payload.bankName.trim(),
          account_number: payload.accountNumber.trim(),
          ifsc_code: payload.ifscCode.trim(),
          upi_id: payload.upiId.trim(),
        },
        false,
      );
      toastsuccessmsg("Vendor approved successfully.");
      setData((prev) => prev.filter((item) => item.id !== approval.id));
      setRowSelection({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while approving vendor request.";
      toasterrormsg(message);
      throw error;
    }
  };

  const handleReject = async (approval: VendorApproval) => {
    try {
      await Post(`ecommerce/vendor-approvals/${approval.id}/reject/`, {}, false);
      toastsuccessmsg("Vendor request rejected successfully.");
      setData((prev) => prev.filter((item) => item.id !== approval.id));
      setRowSelection({});
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Something went wrong while rejecting vendor request.";
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
    <Page title="Vendor Approval Requests">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
            Vendor Approval Requests
          </h1>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading vendor approval requests..."
              : "No pending vendor approval requests found."
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
