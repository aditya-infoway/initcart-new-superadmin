import {
  CheckBadgeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Get, Patch, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Input, Button } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../../master/shared/MasterTable";
import { ApproveProductModal } from "./ApproveProductModal";
import { getColumns } from "./columns";
import { mapApiProductVerification, ProductVerification } from "./data";
import { ProductViewModal } from "./ProductViewModal";
import { RejectProductModal } from "./RejectProductModal";

export default function ProductVerificationPage() {
  const [data, setData] = useState<ProductVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [viewing, setViewing] = useState<ProductVerification | null>(null);
  const [approving, setApproving] = useState<ProductVerification | null>(null);
  const [rejecting, setRejecting] = useState<ProductVerification | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("ecommerce/admin/products/", {}, false);
      const rows = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
      setData(rows.map(mapApiProductVerification));
    } catch {
      toasterrormsg("Something went wrong while fetching products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  const handleApprove = async (product: ProductVerification) => {
    try {
      await Patch(`ecommerce/admin/products/${product.id}/approve/`, { status: "approved" }, false);
      toastsuccessmsg("Product approved successfully.");
      setApproveOpen(false);
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while approving product.";
      toasterrormsg(message);
    }
  };

  const handleReject = async (product: ProductVerification, reason: string) => {
    try {
      await Patch(`ecommerce/admin/products/${product.id}/approve/`, { status: "rejected", reason }, false);
      toastsuccessmsg("Product rejected successfully.");
      setRejectOpen(false);
      await fetchAll();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || "Something went wrong while rejecting product.";
      toasterrormsg(message);
      throw error;
    }
  };

  const columns = getColumns({
    onView: (product) => {
      setViewing(product);
      setViewOpen(true);
    },
    onApprove: (product) => {
      setApproving(product);
      setApproveOpen(true);
    },
    onReject: (product) => {
      setRejecting(product);
      setRejectOpen(true);
    },
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const counts = useMemo(() => ({
    all: data.length,
    pending: data.filter((item) => item.status === "pending").length,
    approved: data.filter((item) => item.status === "approved").length,
    rejected: data.filter((item) => item.status === "rejected").length,
  }), [data]);

  return (
    <Page title="Product Verification">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
            Product Verification
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
            Review and manage product submissions from vendors
          </p>

          <div className="mt-4 max-w-xl">
            <Input
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              prefix={<MagnifyingGlassIcon className="size-4" />}
              placeholder="Search by product name, vendor, business name, SKU, brand, category..."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Products ({filteredData.length} of {data.length} total)
                </h2>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-dark-300">Filter by Status:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant={statusFilter === "all" ? undefined : "outlined"} color={statusFilter === "all" ? "primary" : "neutral"} className="h-9 rounded-full px-4" onClick={() => setStatusFilter("all")}>All Products ({counts.all})</Button>
                  <Button variant={statusFilter === "pending" ? undefined : "outlined"} color={statusFilter === "pending" ? "warning" : "neutral"} className="h-9 rounded-full px-4" onClick={() => setStatusFilter("pending")}>
                    <span className="flex items-center gap-2"><ClockIcon className="size-4" /> Pending: {counts.pending}</span>
                  </Button>
                  <Button variant={statusFilter === "approved" ? undefined : "outlined"} color={statusFilter === "approved" ? "success" : "neutral"} className="h-9 rounded-full px-4" onClick={() => setStatusFilter("approved")}>
                    <span className="flex items-center gap-2"><CheckBadgeIcon className="size-4" /> Approved: {counts.approved}</span>
                  </Button>
                  <Button variant={statusFilter === "rejected" ? undefined : "outlined"} color={statusFilter === "rejected" ? "error" : "neutral"} className="h-9 rounded-full px-4" onClick={() => setStatusFilter("rejected")}>
                    <span className="flex items-center gap-2"><XCircleIcon className="size-4" /> Rejected: {counts.rejected}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading products..." : "No products found."}
        />
      </div>

      <ProductViewModal isOpen={viewOpen} close={() => setViewOpen(false)} product={viewing} />
      <ApproveProductModal isOpen={approveOpen} close={() => setApproveOpen(false)} product={approving} onApprove={handleApprove} />
      <RejectProductModal isOpen={rejectOpen} close={() => setRejectOpen(false)} product={rejecting} onReject={handleReject} />
    </Page>
  );
}
